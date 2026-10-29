package com.guidaerique.edgerunners.model;

import jakarta.persistence.*;
import lombok.*;

/**
 * Entidade que representa um contrato de recompensa (Gig) disponibilizado no sistema.
 */
@Entity
@Table(name = "contracts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String targetName;

    @Column(nullable = false)
    private String faction;

    @Column(nullable = false)
    private Double reward;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ThreatLevel threatLevel;

    // Todo contrato recém-publicado inicia disponível para aceitação no feed.
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContractStatus status = ContractStatus.AVAILABLE;

    // Permanece nulo enquanto o contrato estiver disponível e sem um Hunter atribuído.
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hunter_id", nullable = true)
    private Hunter hunter;
}
