package com.guidaerique.edgerunners.controller;

import com.guidaerique.edgerunners.model.*;
import com.guidaerique.edgerunners.repository.*;
import com.guidaerique.edgerunners.service.AfterhoursDomainService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST para Perfil do Operador, Carteira Fictícia, Histórico de Reputação,
 * Operações e Notificações internas (Seções 6.3, 6.7, 6.8, 6.9 e 6.10).
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Operador, Carteira & Notificações", description = "Gestão de perfil, submissão de operações, extrato da carteira e notificações")
public class OperatorController {

    private final HunterRepository hunterRepository;
    private final ContractRepository contractRepository;
    private final OperationRepository operationRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final ReputationEventRepository reputationEventRepository;
    private final NotificationRepository notificationRepository;
    private final AfterhoursDomainService domainService;

    @GetMapping("/operators/me")
    @Operation(summary = "Consultar perfil do Operador autenticado", description = "Retorna dados de identidade, saldo fictício, reputação e indicadores operacionais (RF-020 a RF-024).")
    public ResponseEntity<Map<String, Object>> getMyProfile(Authentication authentication) {
        Hunter operator = getAuthenticatedHunter(authentication);
        List<Contract> myContracts = contractRepository.findByHunterId(operator.getId());

        long activeCount = myContracts.stream().filter(c -> c.getStatus() == ContractStatus.ACCEPTED).count();
        long completedCount = myContracts.stream().filter(c -> c.getStatus() == ContractStatus.COMPLETED).count();
        long failedCount = myContracts.stream().filter(c -> c.getStatus() == ContractStatus.FAILED).count();
        long unreadNotifications = notificationRepository.countByOperatorIdAndIsReadFalse(operator.getId());

        Map<String, Object> profile = new HashMap<>();
        profile.put("id", operator.getId());
        profile.put("username", operator.getUsername());
        profile.put("callsign", operator.getCallsign() != null ? operator.getCallsign() : operator.getUsername().toUpperCase());
        profile.put("role", operator.getRole() != null ? operator.getRole().name() : Role.OPERATOR.name());
        profile.put("specialization", operator.getSpecialization());
        profile.put("bio", operator.getBio());
        profile.put("avatarCode", operator.getAvatarCode());
        profile.put("streetCred", operator.getStreetCred());
        profile.put("eddies", operator.getEddies());
        profile.put("reputation", operator.getReputation());
        profile.put("balance", operator.getBalance());
        profile.put("activeOperationsCount", activeCount);
        profile.put("completedOperationsCount", completedCount);
        profile.put("failedOperationsCount", failedCount);
        profile.put("unreadNotificationsCount", unreadNotifications);
        profile.put("createdAt", operator.getCreatedAt());

        return ResponseEntity.ok(profile);
    }

    @PatchMapping("/operators/me")
    @Transactional
    @Operation(summary = "Atualizar apresentação do perfil do Operador", description = "Permite personalizar codinome público, especialização, biografia e insígnia sem alterar saldo ou reputação (RF-023 / Seção 7.4).")
    public ResponseEntity<Hunter> updateMyProfile(
            @RequestBody UpdateProfileRequest request,
            Authentication authentication
    ) {
        Hunter operator = getAuthenticatedHunter(authentication);

        if (request.getCallsign() != null && !request.getCallsign().isBlank()) {
            operator.setCallsign(request.getCallsign().trim().toUpperCase());
        }
        if (request.getSpecialization() != null && !request.getSpecialization().isBlank()) {
            operator.setSpecialization(request.getSpecialization().trim());
        }
        if (request.getBio() != null) {
            operator.setBio(request.getBio().trim());
        }
        if (request.getAvatarCode() != null && !request.getAvatarCode().isBlank()) {
            operator.setAvatarCode(request.getAvatarCode().trim());
        }

        return ResponseEntity.ok(hunterRepository.save(operator));
    }

    @GetMapping("/wallet")
    @Operation(summary = "Consultar carteira e histórico de movimentações", description = "Retorna saldo atual, histórico rastreável de transações e eventos de reputação (RF-070 a RF-074).")
    public ResponseEntity<Map<String, Object>> getWalletAndHistory(Authentication authentication) {
        Hunter operator = getAuthenticatedHunter(authentication);
        List<WalletTransaction> transactions = walletTransactionRepository.findByOperatorIdOrderByCreatedAtDesc(operator.getId());
        List<ReputationEvent> reputationEvents = reputationEventRepository.findByOperatorIdOrderByCreatedAtDesc(operator.getId());

        Map<String, Object> response = new HashMap<>();
        response.put("balance", operator.getBalance());
        response.put("reputation", operator.getReputation());
        response.put("transactions", transactions);
        response.put("reputationEvents", reputationEvents);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/operations")
    @Operation(summary = "Listar operações do Operador", description = "Retorna todas as execuções de contratos vinculadas ao Operador com datas e submissões (RF-060 a RF-067).")
    public ResponseEntity<List<com.guidaerique.edgerunners.model.Operation>> getMyOperations(Authentication authentication) {
        Hunter operator = getAuthenticatedHunter(authentication);
        return ResponseEntity.ok(operationRepository.findByOperatorIdOrderByAcceptedAtDesc(operator.getId()));
    }

    @PostMapping("/operations/{contractId}/submissions")
    @Operation(summary = "Submeter comprovante de conclusão de operação", description = "Valida o relatório/hash de conclusão e liquida a recompensa de forma idempotente (RF-063 a RF-066).")
    public ResponseEntity<Contract> submitOperationResult(
            @PathVariable Long contractId,
            @RequestBody ContractController.SubmissionRequest request,
            Authentication authentication
    ) {
        Hunter operator = getAuthenticatedHunter(authentication);
        String hash = request != null ? request.getSubmissionHash() : null;
        String notes = request != null ? request.getSubmissionNotes() : null;
        return ResponseEntity.ok(domainService.completeContract(contractId, operator, hash, notes));
    }

    @GetMapping("/notifications")
    @Operation(summary = "Listar notificações do Operador", description = "Retorna notificações associadas a eventos reais da conta (RF-090 a RF-092).")
    public ResponseEntity<List<Notification>> getMyNotifications(Authentication authentication) {
        Hunter operator = getAuthenticatedHunter(authentication);
        return ResponseEntity.ok(notificationRepository.findByOperatorIdOrderByCreatedAtDesc(operator.getId()));
    }

    @PatchMapping("/notifications/{id}/read")
    @Transactional
    @Operation(summary = "Marcar notificação como lida", description = "Atualiza o estado de leitura de uma notificação do Operador.")
    public ResponseEntity<Notification> markNotificationRead(@PathVariable Long id, Authentication authentication) {
        Hunter operator = getAuthenticatedHunter(authentication);
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Notificação não encontrada."));

        if (!notification.getOperator().getId().equals(operator.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado a esta notificação.");
        }

        notification.setIsRead(true);
        return ResponseEntity.ok(notificationRepository.save(notification));
    }

    @PatchMapping("/notifications/read-all")
    @Transactional
    @Operation(summary = "Marcar todas as notificações como lidas", description = "Marca todas as notificações não lidas do Operador como lidas.")
    public ResponseEntity<Map<String, Object>> markAllNotificationsRead(Authentication authentication) {
        Hunter operator = getAuthenticatedHunter(authentication);
        List<Notification> list = notificationRepository.findByOperatorIdOrderByCreatedAtDesc(operator.getId());
        list.forEach(n -> n.setIsRead(true));
        notificationRepository.saveAll(list);
        return ResponseEntity.ok(Map.of("status", "OK", "updated", list.size()));
    }

    private Hunter getAuthenticatedHunter(Authentication authentication) {
        return hunterRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Operador não autenticado."));
    }

    @Data
    public static class UpdateProfileRequest {
        private String callsign;
        private String specialization;
        private String bio;
        private String avatarCode;
    }
}
