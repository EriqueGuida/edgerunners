package com.guidaerique.edgerunners.service;

import com.guidaerique.edgerunners.model.*;
import com.guidaerique.edgerunners.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;

/**
 * Serviço de domínio transacional que centraliza as invariantes e regras de negócio do AFTERHOURS (Seção 7).
 * Garante atomicidade entre Contratos, Operações, Carteira Fictícia, Reputação e Notificações.
 */
@Service
@RequiredArgsConstructor
public class AfterhoursDomainService {

    private final ContractRepository contractRepository;
    private final HunterRepository hunterRepository;
    private final OperationRepository operationRepository;
    private final WalletTransactionRepository walletTransactionRepository;
    private final ReputationEventRepository reputationEventRepository;
    private final NotificationRepository notificationRepository;

    @Transactional
    public Contract acceptContract(Long contractId, Hunter operator) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não localizado."));

        if (contract.getStatus() != ContractStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Este contrato não está mais disponível para vinculação.");
        }

        int requiredRep = contract.getMinReputation() != null ? contract.getMinReputation() : 1;
        if (operator.getStreetCred() < requiredRep) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Reputação insuficiente para este contrato. Exigido: Nível " + requiredRep + " (Atual: " + operator.getStreetCred() + ")."
            );
        }

        contract.setHunter(operator);
        contract.setStatus(ContractStatus.ACCEPTED);
        Contract savedContract = contractRepository.save(contract);

        Operation operation = Operation.builder()
                .contract(savedContract)
                .operator(operator)
                .status(OperationStatus.IN_PROGRESS)
                .acceptedAt(LocalDateTime.now())
                .rewardPaid(0.0)
                .reputationEarned(0)
                .build();
        operationRepository.save(operation);

        notificationRepository.save(Notification.builder()
                .operator(operator)
                .title("OPERAÇÃO VINCULADA // CTR #" + String.format("%04d", savedContract.getId()))
                .message("Você assumiu a operação '" + savedContract.getTitle() + "'. Verifique os requisitos no dossiê e submeta o relatório após a execução.")
                .type("INFO")
                .isRead(false)
                .build());

        return savedContract;
    }

    @Transactional
    public Contract completeContract(Long contractId, Hunter operator, String submissionHash, String submissionNotes) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não localizado."));

        validateOwnershipAndAccepted(contract, operator);

        // Proteção contra processamento duplicado de recompensas (RF-073)
        if (walletTransactionRepository.existsByOperatorIdAndContractIdAndType(
                operator.getId(), contract.getId(), "CONTRACT_REWARD")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "A recompensa desta operação já foi processada anteriormente.");
        }

        double reward = contract.getReward() != null ? contract.getReward() : 0.0;
        int repGain = contract.getReputationReward() != null ? contract.getReputationReward() : 10;

        double newBalance = operator.getEddies() + reward;
        int newReputation = operator.getStreetCred() + repGain;

        contract.setStatus(ContractStatus.COMPLETED);
        operator.setEddies(newBalance);
        operator.setStreetCred(newReputation);

        hunterRepository.save(operator);
        Contract savedContract = contractRepository.save(contract);

        // Atualiza ou cria o registro da Operação e Submissão
        Operation operation = operationRepository
                .findFirstByContractIdAndOperatorIdOrderByAcceptedAtDesc(contract.getId(), operator.getId())
                .orElseGet(() -> Operation.builder()
                        .contract(savedContract)
                        .operator(operator)
                        .acceptedAt(LocalDateTime.now().minusMinutes(15))
                        .build());

        operation.setStatus(OperationStatus.COMPLETED);
        operation.setCompletedAt(LocalDateTime.now());
        operation.setSubmissionHash(
                submissionHash != null && !submissionHash.isBlank()
                        ? submissionHash.trim()
                        : "AH-RECEIPT-" + String.format("%04d", savedContract.getId())
        );
        operation.setSubmissionNotes(
                submissionNotes != null && !submissionNotes.isBlank()
                        ? submissionNotes.trim()
                        : "Relatório operacional registrado via terminal AFTERHOURS."
        );
        operation.setRewardPaid(reward);
        operation.setReputationEarned(repGain);
        operationRepository.save(operation);

        // Registra transação rastreável na carteira (RF-072)
        walletTransactionRepository.save(WalletTransaction.builder()
                .operator(operator)
                .contractId(savedContract.getId())
                .contractTitle(savedContract.getTitle())
                .amount(reward)
                .balanceAfter(newBalance)
                .type("CONTRACT_REWARD")
                .description("Liquidação de contrato #" + String.format("%04d", savedContract.getId()) + ": " + savedContract.getTitle())
                .createdAt(LocalDateTime.now())
                .build());

        // Registra evento de progressão de reputação (RF-081)
        reputationEventRepository.save(ReputationEvent.builder()
                .operator(operator)
                .delta(repGain)
                .reputationAfter(newReputation)
                .reason("Conclusão registrada da operação: " + savedContract.getTitle())
                .createdAt(LocalDateTime.now())
                .build());

        // Registra notificação real do evento (RF-090)
        notificationRepository.save(Notification.builder()
                .operator(operator)
                .title("RECOMPENSA LIQUIDADA // +CR¢ " + String.format("%.0f", reward))
                .message("Submissão aprovada para '" + savedContract.getTitle() + "'. Saldo atualizado e +" + repGain + " pontos de Reputação registrados.")
                .type("SUCCESS")
                .isRead(false)
                .build());

        return savedContract;
    }

    @Transactional
    public Contract failContract(Long contractId, Hunter operator, String reasonNotes) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Contrato não localizado."));

        validateOwnershipAndAccepted(contract, operator);

        contract.setStatus(ContractStatus.FAILED);
        Contract savedContract = contractRepository.save(contract);

        operationRepository
                .findFirstByContractIdAndOperatorIdOrderByAcceptedAtDesc(contract.getId(), operator.getId())
                .ifPresent(op -> {
                    op.setStatus(OperationStatus.FAILED);
                    op.setCompletedAt(LocalDateTime.now());
                    if (reasonNotes != null && !reasonNotes.isBlank()) {
                        op.setSubmissionNotes(reasonNotes.trim());
                    }
                    operationRepository.save(op);
                });

        notificationRepository.save(Notification.builder()
                .operator(operator)
                .title("OPERAÇÃO ENCERRADA SEM SUCESSO // CTR #" + String.format("%04d", savedContract.getId()))
                .message("A operação '" + savedContract.getTitle() + "' foi registrada com status FALHOU.")
                .type("WARNING")
                .isRead(false)
                .build());

        return savedContract;
    }

    private void validateOwnershipAndAccepted(Contract contract, Hunter operator) {
        if (contract.getHunter() == null || !contract.getHunter().getId().equals(operator.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Acesso negado: esta operação não está vinculada ao seu perfil de operador.");
        }
        if (contract.getStatus() != ContractStatus.ACCEPTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A operação precisa estar em andamento (ACCEPTED) para ser finalizada.");
        }
    }
}
