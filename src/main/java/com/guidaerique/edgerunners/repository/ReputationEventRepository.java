package com.guidaerique.edgerunners.repository;

import com.guidaerique.edgerunners.model.ReputationEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReputationEventRepository extends JpaRepository<ReputationEvent, Long> {
    List<ReputationEvent> findByOperatorIdOrderByCreatedAtDesc(Long operatorId);
}
