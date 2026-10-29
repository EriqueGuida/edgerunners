package com.guidaerique.edgerunners.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Registro histórico de evolução da reputação do operador (RF-081 e Seção 15.7).
 */
@Entity
@Table(name = "reputation_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReputationEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "operator_id", nullable = false)
    private Hunter operator;

    @Column(nullable = false)
    private Integer delta;

    @Column(nullable = false)
    private Integer reputationAfter;

    @Column(nullable = false, length = 500)
    private String reason;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
