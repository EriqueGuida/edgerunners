package com.guidaerique.edgerunners.model;

/**
 * Classificação do nível de periculosidade do alvo de um contrato.
 */
public enum ThreatLevel {
    LOW,
    MEDIUM,
    HIGH,
    /** Risco extremo, geralmente associado a alvos com ciberpsicose ou alto poder bélico. */
    PSYCHO
}
