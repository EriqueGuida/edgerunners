package com.guidaerique.edgerunners.model;

/**
 * Estados possíveis do ciclo de vida de um contrato de recompensa.
 */
public enum ContractStatus {
    /** Contrato publicado no feed e livre para aceitação. */
    AVAILABLE,
    /** Contrato assumido por um Hunter e em andamento. */
    ACCEPTED,
    /** Contrato finalizado com sucesso e recompensa paga. */
    COMPLETED,
    /** Contrato encerrado sem sucesso pelo Hunter responsável. */
    FAILED
}
