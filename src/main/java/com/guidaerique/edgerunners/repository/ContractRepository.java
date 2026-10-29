package com.guidaerique.edgerunners.repository;

import com.guidaerique.edgerunners.model.Contract;
import com.guidaerique.edgerunners.model.ContractStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repositório para operações de persistência e filtragem da entidade {@link Contract}.
 */
@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {
    List<Contract> findByStatus(ContractStatus status);
    List<Contract> findByHunterId(Long hunterId);
}
