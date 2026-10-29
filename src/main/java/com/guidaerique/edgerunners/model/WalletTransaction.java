package com.guidaerique.edgerunners.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Registro auditável e rastreável de movimentação na carteira fictícia do operador (RF-072 e Seção 15.6).
 */
@Entity
@Table(name = "wallet_transactions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WalletTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id", nullable = false)
    private Hunter operator;

    private Long contractId;

    private String contractTitle;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private Double balanceAfter;

    /** Tipo da movimentação: CONTRACT_REWARD, INITIAL_GRANT, ADMIN_ADJUSTMENT */
    @Column(nullable = false, length = 60)
    private String type;

    @Column(nullable = false, length = 500)
    private String description;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
