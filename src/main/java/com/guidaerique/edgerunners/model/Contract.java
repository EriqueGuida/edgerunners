package com.guidaerique.edgerunners.model;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidade que representa um Contrato operacional no sistema AFTERHOURS (Seção 15.3).
 * Suporta briefing narrativo completo, requisitos, coordenadas geográficas reais (WGS84) e controle de concorrência.
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

    @Column(nullable = false, length = 180)
    private String title;

    @Column(nullable = false, length = 140)
    private String targetName;

    @Column(nullable = false, length = 140)
    private String faction;

    @Column(nullable = false)
    private Double reward;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ThreatLevel threatLevel;

    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ContractStatus status = ContractStatus.AVAILABLE;

    /** Resumo executivo exibido no catálogo e nos marcadores do mapa (RF-041). */
    @Column(length = 400)
    private String summary;

    /** Dossiê detalhado de briefing da missão (RF-051). */
    @Column(length = 2500)
    private String briefing;

    /** Lista de objetivos primários separados por ponto-e-vírgula (RF-051). */
    @Column(length = 1200)
    private String objectives;

    /** Condições e requisitos operacionais de execução (RF-051). */
    @Column(length = 800)
    private String requirements;

    /** Reputação mínima recomendada/exigida para aceitar o contrato. */
    @Builder.Default
    @Column(nullable = false)
    private Integer minReputation = 1;

    /** Ganho de reputação determinístico ao concluir a operação com sucesso. */
    @Builder.Default
    @Column(nullable = false)
    private Integer reputationReward = 10;

    /** Localização legível (Ex: "Shinjuku, Tóquio — Japão"). */
    @Column(length = 160)
    private String locationName;

    /** Macro-região geográfica para filtragem (Ex: "ÁSIA-PACÍFICO", "AMÉRICA LATINA", "EUROPA"). */
    @Column(length = 80)
    private String region;

    /** Coordenada real de latitude (WGS84: -90 a +90) para renderização no MapLibre GL JS (RF-102). */
    private Double latitude;

    /** Coordenada real de longitude (WGS84: -180 a +180) para renderização no MapLibre GL JS (RF-102). */
    private Double longitude;

    /** Instrução para submissão de comprovante de conclusão (RF-063). */
    @Builder.Default
    @Column(length = 300)
    private String verificationPrompt = "Informe o hash de telemetria ou código de protocolo obtido no local.";

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "hunter_id", nullable = true)
    private Hunter hunter;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Version
    private Long version;
}
