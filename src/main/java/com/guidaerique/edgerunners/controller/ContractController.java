package com.guidaerique.edgerunners.controller;

import com.guidaerique.edgerunners.model.Contract;
import com.guidaerique.edgerunners.model.ContractStatus;
import com.guidaerique.edgerunners.model.Hunter;
import com.guidaerique.edgerunners.model.ThreatLevel;
import com.guidaerique.edgerunners.repository.ContractRepository;
import com.guidaerique.edgerunners.repository.HunterRepository;
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

import java.util.List;

/**
 * Controlador REST para gerenciamento do ciclo de vida dos contratos de recompensa (Gigs).
 */
@RestController
@RequestMapping("/api/contracts")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Contratos (Gigs)", description = "Gerenciamento de contratos de recompensa em Night City")
public class ContractController {

    private final ContractRepository contractRepository;
    private final HunterRepository hunterRepository;

    @PostMapping
    @Operation(summary = "Publicar novo contrato", description = "Cadastra um novo contrato no feed com status AVAILABLE.")
    public ResponseEntity<Contract> createContract(@RequestBody CreateContractRequest request) {
        Contract contract = Contract.builder()
                .title(request.getTitle())
                .targetName(request.getTargetName())
                .faction(request.getFaction())
                .reward(request.getReward())
                .threatLevel(request.getThreatLevel())
                .status(ContractStatus.AVAILABLE)
                .hunter(null)
                .build();

        return ResponseEntity.status(HttpStatus.CREATED).body(contractRepository.save(contract));
    }

    @GetMapping("/available")
    @Operation(summary = "Listar contratos disponíveis", description = "Retorna todos os contratos no feed com status AVAILABLE.")
    public ResponseEntity<List<Contract>> listAvailableContracts() {
        return ResponseEntity.ok(contractRepository.findByStatus(ContractStatus.AVAILABLE));
    }

    @GetMapping("/my-contracts")
    @Operation(summary = "Listar contratos do Hunter autenticado", description = "Retorna todos os contratos atrelados ao Hunter logado.")
    public ResponseEntity<List<Contract>> listMyContracts(Authentication authentication) {
        Hunter hunter = getAuthenticatedHunter(authentication);
        return ResponseEntity.ok(contractRepository.findByHunterId(hunter.getId()));
    }

    @PatchMapping("/{id}/accept")
    @Operation(summary = "Aceitar um contrato", description = "Atrela o contrato disponível ao Hunter autenticado e altera seu status para ACCEPTED.")
    public ResponseEntity<Contract> acceptContract(@PathVariable Long id, Authentication authentication) {
        Hunter hunter = getAuthenticatedHunter(authentication);
        Contract contract = getContractOrThrow(id);

        if (contract.getStatus() != ContractStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este contrato não está mais disponível no feed.");
        }

        contract.setHunter(hunter);
        contract.setStatus(ContractStatus.ACCEPTED);

        return ResponseEntity.ok(contractRepository.save(contract));
    }

    /**
     * Conclui o contrato, creditando o valor da recompensa em Eddies e 10 pontos fixos de Street Cred ao Hunter.
     */
    @PatchMapping("/{id}/complete")
    @Operation(summary = "Concluir contrato", description = "Marca o contrato como COMPLETED e transfere os Eddies e Street Cred para o Hunter.")
    public ResponseEntity<Contract> completeContract(@PathVariable Long id, Authentication authentication) {
        Hunter hunter = getAuthenticatedHunter(authentication);
        Contract contract = getContractOrThrow(id);

        validateContractOwnershipAndAcceptedStatus(contract, hunter);

        contract.setStatus(ContractStatus.COMPLETED);
        hunter.setEddies(hunter.getEddies() + contract.getReward());
        hunter.setStreetCred(hunter.getStreetCred() + 10);

        hunterRepository.save(hunter);
        return ResponseEntity.ok(contractRepository.save(contract));
    }

    @PatchMapping("/{id}/fail")
    @Operation(summary = "Falhar contrato", description = "Marca o contrato do Hunter autenticado como FAILED.")
    public ResponseEntity<Contract> failContract(@PathVariable Long id, Authentication authentication) {
        Hunter hunter = getAuthenticatedHunter(authentication);
        Contract contract = getContractOrThrow(id);

        validateContractOwnershipAndAcceptedStatus(contract, hunter);

        contract.setStatus(ContractStatus.FAILED);
        return ResponseEntity.ok(contractRepository.save(contract));
    }

    private Hunter getAuthenticatedHunter(Authentication authentication) {
        return hunterRepository.findByUsername(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Hunter não encontrado."));
    }

    private Contract getContractOrThrow(Long id) {
        return contractRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não encontrado."));
    }

    /**
     * Garante que apenas o Hunter responsável pelo contrato e com status em andamento (ACCEPTED) possa finalizá-lo.
     */
    private void validateContractOwnershipAndAcceptedStatus(Contract contract, Hunter hunter) {
        if (contract.getHunter() == null || !contract.getHunter().getId().equals(hunter.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Este contrato não pertence a você, choom.");
        }
        if (contract.getStatus() != ContractStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "O contrato precisa estar com status ACCEPTED para ser finalizado.");
        }
    }

    /**
     * Dados necessários para publicação de um novo contrato no feed.
     */
    @Data
    public static class CreateContractRequest {
        private String title;
        private String targetName;
        private String faction;
        private Double reward;
        private ThreatLevel threatLevel;
    }
}
