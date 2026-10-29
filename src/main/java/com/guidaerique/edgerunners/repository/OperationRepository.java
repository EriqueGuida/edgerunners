package com.guidaerique.edgerunners.repository;

import com.guidaerique.edgerunners.model.Operation;
import com.guidaerique.edgerunners.model.OperationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OperationRepository extends JpaRepository<Operation, Long> {
    List<Operation> findByOperatorIdOrderByAcceptedAtDesc(Long operatorId);
    List<Operation> findByOperatorIdAndStatusOrderByAcceptedAtDesc(Long operatorId, OperationStatus status);
    Optional<Operation> findFirstByContractIdAndOperatorIdOrderByAcceptedAtDesc(Long contractId, Long operatorId);
}
