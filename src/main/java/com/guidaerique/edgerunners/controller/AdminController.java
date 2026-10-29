package com.guidaerique.edgerunners.controller;

import com.guidaerique.edgerunners.model.Contract;
import com.guidaerique.edgerunners.model.ContractStatus;
import com.guidaerique.edgerunners.model.ThreatLevel;
import com.guidaerique.edgerunners.repository.ContractRepository;
import com.guidaerique.edgerunners.repository.HunterRepository;
import com.guidaerique.edgerunners.repository.OperationRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Controlador REST exclusivo para Administração da plataforma AFTERHOURS (Seção 6.12, RF-110 a RF-116).
 * Protegido por ROLE_ADMIN no SecurityConfig.
 */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Administração", description = "Gerenciamento restrito de contratos, disponibilidade, operações e indicadores (ROLE_ADMIN)")
public class AdminController {

    private final ContractRepository contractRepository;
    private final HunterRepository hunterRepository;
    private final OperationRepository operationRepository;

    @GetMapping("/metrics")
    @Operation(summary = "Indicadores administrativos agregados", description = "Retorna estatísticas globais de operadores, contratos e operações (RF-116).")
    public ResponseEntity<Map<String, Object>> getAdminMetrics() {
        List<Contract> allContracts = contractRepository.findAll();
        long availableCount = allContracts.stream().filter(c -> c.getStatus() == ContractStatus.AVAILABLE).count();
        long activeCount = allContracts.stream().filter(c -> c.getStatus() == ContractStatus.ACCEPTED).count();
        long completedCount = allContracts.stream().filter(c -> c.getStatus() == ContractStatus.COMPLETED).count();
        long failedCount = allContracts.stream().filter(c -> c.getStatus() == ContractStatus.FAILED).count();

        double totalVolumeCompleted = allContracts.stream()
                .filter(c -> c.getStatus() == ContractStatus.COMPLETED && c.getReward() != null)
                .mapToDouble(Contract::getReward)
                .sum();

        Map<String, Object> metrics = new HashMap<>();
        metrics.put("totalOperators", hunterRepository.count());
        metrics.put("totalContracts", allContracts.size());
        metrics.put("availableContracts", availableCount);
        metrics.put("activeOperations", activeCount);
        metrics.put("completedOperations", completedCount);
        metrics.put("failedOperations", failedCount);
        metrics.put("totalCreditsDistributed", totalVolumeCompleted);

        return ResponseEntity.ok(metrics);
    }

    @GetMapping("/contracts")
    @Operation(summary = "Listar todos os contratos (Visão Admin)", description = "Retorna todos os contratos do sistema independentemente do status.")
    public ResponseEntity<List<Contract>> listAllContracts() {
        return ResponseEntity.ok(contractRepository.findAll());
    }

    @PostMapping("/contracts")
    @Transactional
    @Operation(summary = "Criar contrato (Admin)", description = "Cria um novo contrato completo com coordenadas geográficas e briefing (RF-110).")
    public ResponseEntity<Contract> createContract(@RequestBody ContractController.CreateContractRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O título do contrato é obrigatório.");
        }
        if (request.getReward() == null || request.getReward() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A recompensa deve ser maior que zero.");
        }

        Contract contract = Contract.builder()
                .title(request.getTitle().trim())
                .targetName(request.getTargetName() != null ? request.getTargetName().trim() : "Alvo Classificado")
                .faction(request.getFaction() != null ? request.getFaction().trim() : "Consórcio Independente")
                .reward(request.getReward())
                .threatLevel(request.getThreatLevel() != null ? request.getThreatLevel() : ThreatLevel.MEDIUM)
                .status(ContractStatus.AVAILABLE)
                .summary(request.getSummary())
                .briefing(request.getBriefing())
                .objectives(request.getObjectives())
                .requirements(request.getRequirements())
                .minReputation(request.getMinReputation() != null ? request.getMinReputation() : 1)
                .reputationReward(request.getReputationReward() != null ? request.getReputationReward() : 10)
                .locationName(request.getLocationName())
                .region(request.getRegion())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .verificationPrompt(request.getVerificationPrompt())
                .createdAt(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(contractRepository.save(contract));
    }

    @PutMapping("/contracts/{id}")
    @Transactional
    @Operation(summary = "Editar contrato existente (Admin)", description = "Atualiza dados de briefing, coordenadas, risco e recompensa de um contrato (RF-111).")
    public ResponseEntity<Contract> updateContract(
            @PathVariable Long id,
            @RequestBody ContractController.CreateContractRequest request
    ) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado."));

        if (request.getTitle() != null && !request.getTitle().isBlank()) contract.setTitle(request.getTitle().trim());
        if (request.getTargetName() != null && !request.getTargetName().isBlank()) contract.setTargetName(request.getTargetName().trim());
        if (request.getFaction() != null && !request.getFaction().isBlank()) contract.setFaction(request.getFaction().trim());
        if (request.getReward() != null && request.getReward() > 0) contract.setReward(request.getReward());
        if (request.getThreatLevel() != null) contract.setThreatLevel(request.getThreatLevel());
        if (request.getSummary() != null) contract.setSummary(request.getSummary().trim());
        if (request.getBriefing() != null) contract.setBriefing(request.getBriefing().trim());
        if (request.getObjectives() != null) contract.setObjectives(request.getObjectives().trim());
        if (request.getRequirements() != null) contract.setRequirements(request.getRequirements().trim());
        if (request.getMinReputation() != null && request.getMinReputation() > 0) contract.setMinReputation(request.getMinReputation());
        if (request.getReputationReward() != null && request.getReputationReward() > 0) contract.setReputationReward(request.getReputationReward());
        if (request.getLocationName() != null) contract.setLocationName(request.getLocationName().trim());
        if (request.getRegion() != null) contract.setRegion(request.getRegion().trim());
        if (request.getLatitude() != null) contract.setLatitude(request.getLatitude());
        if (request.getLongitude() != null) contract.setLongitude(request.getLongitude());
        if (request.getVerificationPrompt() != null) contract.setVerificationPrompt(request.getVerificationPrompt().trim());

        return ResponseEntity.ok(contractRepository.save(contract));
    }

    @PatchMapping("/contracts/{id}/status")
    @Transactional
    @Operation(summary = "Alterar disponibilidade/status do contrato (Admin)", description = "Permite disponibilizar, reabrir ou encerrar administrativamente um contrato (RF-112).")
    public ResponseEntity<Contract> updateContractStatus(
            @PathVariable Long id,
            @RequestBody StatusUpdateRequest request
    ) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado."));

        if (request.getStatus() == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O novo status é obrigatório.");
        }

        if (contract.getStatus() == ContractStatus.COMPLETED && request.getStatus() != ContractStatus.COMPLETED) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Contratos já liquidados (COMPLETED) possuem recompensas processadas e não podem ser reabertos."
            );
        }

        contract.setStatus(request.getStatus());
        if (request.getStatus() == ContractStatus.AVAILABLE) {
            contract.setHunter(null);
        }

        return ResponseEntity.ok(contractRepository.save(contract));
    }

    @GetMapping("/operations")
    @Operation(summary = "Consultar todas as operações registradas (Admin)", description = "Lista todas as operações executadas ou em andamento na plataforma (RF-113).")
    public ResponseEntity<List<com.guidaerique.edgerunners.model.Operation>> listAllOperations() {
        return ResponseEntity.ok(operationRepository.findAll());
    }

    @Data
    public static class StatusUpdateRequest {
        private ContractStatus status;
    }
}
