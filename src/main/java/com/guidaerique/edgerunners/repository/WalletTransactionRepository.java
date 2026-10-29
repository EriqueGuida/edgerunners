package com.guidaerique.edgerunners.repository;

import com.guidaerique.edgerunners.model.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByOperatorIdOrderByCreatedAtDesc(Long operatorId);
    boolean existsByOperatorIdAndContractIdAndType(Long operatorId, Long contractId, String type);
}
