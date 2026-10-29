package com.guidaerique.edgerunners.model;

/**
 * Estados permitidos do ciclo de vida de uma Operação (RF-061).
 */
public enum OperationStatus {
    /** Operação vinculada ao operador e em execução. */
    IN_PROGRESS,
    /** Submissão validada com sucesso e recompensa liquidada. */
    COMPLETED,
    /** Operação encerrada com falha operacional. */
    FAILED,
    /** Operação abortada/abandonada pelo operador antes da conclusão. */
    ABANDONED
}
