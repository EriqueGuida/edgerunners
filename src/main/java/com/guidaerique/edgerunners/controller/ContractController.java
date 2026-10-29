package com.guidaerique.edgerunners.controller;

import com.guidaerique.edgerunners.model.Contract;
import com.guidaerique.edgerunners.model.ContractStatus;
import com.guidaerique.edgerunners.model.Hunter;
import com.guidaerique.edgerunners.model.ThreatLevel;
import com.guidaerique.edgerunners.repository.ContractRepository;
import com.guidaerique.edgerunners.repository.HunterRepository;
import com.guidaerique.edgerunners.service.AfterhoursDomainService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Controlador REST para descoberta, consulta de briefing, vinculação e conclusão de contratos (Seção 6.5 a 6.7).
 */
@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Contratos", description = "Catálogo, briefing geolocalizado e ciclo de vida de contratos no AFTERHOURS")
public class ContractController {

    private final ContractRepository contractRepository;
    private final HunterRepository hunterRepository;
    private final AfterhoursDomainService domainService;

    @GetMapping
    @Operation(summary = "Listar todos os contratos", description = "Retorna todos os contratos cadastrados no sistema.")
    public ResponseEntity<List<Contract>> listAllContracts() {
        return ResponseEntity.ok(contractRepository.findAll());
    }

    @GetMapping("/public-preview")
    @Operation(summary = "Demonstração pública de contratos (Landing Page)", description = "Retorna até 6 contratos disponíveis para exibição na Landing Page pública (RF-006).")
    public ResponseEntity<List<Contract>> listPublicPreview() {
        List<Contract> available = contractRepository.findByStatus(ContractStatus.AVAILABLE);
        return ResponseEntity.ok(available.stream().limit(6).toList());
    }

    @GetMapping("/available")
    @Operation(summary = "Listar contratos disponíveis", description = "Retorna todos os contratos com status AVAILABLE.")
    public ResponseEntity<List<Contract>> listAvailableContracts() {
        return ResponseEntity.ok(contractRepository.findByStatus(ContractStatus.AVAILABLE));
    }

    @GetMapping("/my-contracts")
    @Operation(summary = "Listar contratos do Operador autenticado", description = "Retorna todos os contratos vinculados ao Operador autenticado.")
    public ResponseEntity<List<Contract>> listMyContracts(Authentication authentication) {
        Hunter operator = getAuthenticatedHunter(authentication);
        return ResponseEntity.ok(contractRepository.findByHunterId(operator.getId()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Consultar briefing detalhado do contrato", description = "Retorna todos os metadados, objetivos, coordenadas e requisitos de um contrato específico (RF-050).")
    public ResponseEntity<Contract> getContractById(@PathVariable Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado."));
        return ResponseEntity.ok(contract);
    }

    @PostMapping
    @Operation(summary = "Publicar novo contrato", description = "Cadastra um novo contrato validando recompensas e coordenadas geográficas.")
    public ResponseEntity<Contract> createContract(@RequestBody CreateContractRequest request) {
        validateContractRequest(request);

        Contract contract = Contract.builder()
                .title(request.getTitle().trim())
                .targetName(request.getTargetName().trim())
                .faction(request.getFaction().trim())
                .reward(request.getReward())
                .threatLevel(request.getThreatLevel() != null ? request.getThreatLevel() : ThreatLevel.MEDIUM)
                .status(ContractStatus.AVAILABLE)
                .summary(request.getSummary() != null && !request.getSummary().isBlank()
                        ? request.getSummary().trim()
                        : "Operação tática solicitada por " + request.getFaction().trim() + " visando " + request.getTargetName().trim() + ".")
                .briefing(request.getBriefing() != null && !request.getBriefing().isBlank()
                        ? request.getBriefing().trim()
                        : "Dossiê operacional classificado. O operador designado deverá infiltrar-se no perímetro indicado, cumprir os protocolos técnicos e transmitir o hash de verificação sem exposição da rede AFTERHOURS.")
                .objectives(request.getObjectives() != null && !request.getObjectives().isBlank()
                        ? request.getObjectives().trim()
                        : "Estabelecer acesso seguro ao perímetro;Executar protocolo sobre " + request.getTargetName().trim() + ";Transmitir telemetria de verificação e evadir do local")
                .requirements(request.getRequirements() != null && !request.getRequirements().isBlank()
                        ? request.getRequirements().trim()
                        : "Operação sob sigilo estrito. Proibido acionamento de alertas locais.")
                .minReputation(request.getMinReputation() != null && request.getMinReputation() > 0 ? request.getMinReputation() : 1)
                .reputationReward(request.getReputationReward() != null && request.getReputationReward() > 0 ? request.getReputationReward() : 10)
                .locationName(request.getLocationName() != null && !request.getLocationName().isBlank()
                        ? request.getLocationName().trim()
                        : "Perímetro Urbano Classificado")
                .region(request.getRegion() != null && !request.getRegion().isBlank()
                        ? request.getRegion().trim()
                        : "GLOBAL")
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .verificationPrompt(request.getVerificationPrompt() != null && !request.getVerificationPrompt().isBlank()
                        ? request.getVerificationPrompt().trim()
                        : "Informe o hash de telemetria ou código de protocolo obtido no local.")
                .hunter(null)
                .createdAt(LocalDateTime.now())
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(contractRepository.save(contract));
    }

    @PatchMapping("/{id}/accept")
    @Operation(summary = "Aceitar um contrato", description = "Valida disponibilidade e reputação no servidor, vincula ao Operador e inicia a Operação (RF-054).")
    public ResponseEntity<Contract> acceptContract(@PathVariable Long id, Authentication authentication) {
        Hunter operator = getAuthenticatedHunter(authentication);
        return ResponseEntity.ok(domainService.acceptContract(id, operator));
    }

    @PatchMapping("/{id}/complete")
    @Operation(summary = "Concluir contrato e liquidar recompensa", description = "Valida a conclusão de forma idempotente, credita saldo na carteira e atualiza reputação.")
    public ResponseEntity<Contract> completeContract(
            @PathVariable Long id,
            @RequestBody(required = false) SubmissionRequest submission,
            Authentication authentication
    ) {
        Hunter operator = getAuthenticatedHunter(authentication);
        String hash = submission != null ? submission.getSubmissionHash() : null;
        String notes = submission != null ? submission.getSubmissionNotes() : null;
        return ResponseEntity.ok(domainService.completeContract(id, operator, hash, notes));
    }

    @PatchMapping("/{id}/fail")
    @Operation(summary = "Reportar falha em contrato", description = "Encerra o contrato do Operador autenticado com status FAILED.")
    public ResponseEntity<Contract> failContract(
            @PathVariable Long id,
            @RequestBody(required = false) SubmissionRequest submission,
            Authentication authentication
    ) {
        Hunter operator = getAuthenticatedHunter(authentication);
        String notes = submission != null ? submission.getSubmissionNotes() : null;
        return ResponseEntity.ok(domainService.failContract(id, operator, notes));
    }

    private Hunter getAuthenticatedHunter(Authentication authentication) {
        return hunterRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Operador não autenticado."));
    }

    private void validateContractRequest(CreateContractRequest request) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O título do contrato é obrigatório.");
        }
        if (request.getTargetName() == null || request.getTargetName().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O alvo/objetivo do contrato é obrigatório.");
        }
        if (request.getFaction() == null || request.getFaction().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A organização contratante é obrigatória.");
        }
        if (request.getReward() == null || request.getReward() <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A recompensa deve ser maior que zero.");
        }
        if (request.getLatitude() != null && (request.getLatitude() < -90 || request.getLatitude() > 90)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Latitude inválida (deve estar entre -90 e +90).");
        }
        if (request.getLongitude() != null && (request.getLongitude() < -180 || request.getLongitude() > 180)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Longitude inválida (deve estar entre -180 e +180).");
        }
    }

    @Data
    public static class CreateContractRequest {
        private String title;
        private String targetName;
        private String faction;
        private Double reward;
        private ThreatLevel threatLevel;
        private String summary;
        private String briefing;
        private String objectives;
        private String requirements;
        private Integer minReputation;
        private Integer reputationReward;
        private String locationName;
        private String region;
        private Double latitude;
        private Double longitude;
        private String verificationPrompt;
    }

    @Data
    public static class SubmissionRequest {
        private String submissionHash;
        private String submissionNotes;
    }
}
