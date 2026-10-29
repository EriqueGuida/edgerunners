package com.guidaerique.edgerunners.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Representa a execução de um contrato aceito por um operador (Seção 15.4 e RF-060 a RF-069).
 * Registra também os dados da submissão de conclusão validada no servidor.
 */
@Entity
@Table(name = "operations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Operation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "operator_id", nullable = false)
    private Hunter operator;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OperationStatus status = OperationStatus.IN_PROGRESS;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime acceptedAt = LocalDateTime.now();

    private LocalDateTime completedAt;

    /** Código/hash de telemetria ou protocolo informado na submissão (RF-063). */
    @Column(length = 255)
    private String submissionHash;

    /** Relatório operacional submetido pelo operador ao encerrar a operação. */
    @Column(length = 1000)
    private String submissionNotes;

    @Builder.Default
    private Double rewardPaid = 0.0;

    @Builder.Default
    private Integer reputationEarned = 0;

    @Version
    private Long version;
}
