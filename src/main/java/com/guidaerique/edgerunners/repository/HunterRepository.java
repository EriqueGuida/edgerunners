package com.guidaerique.edgerunners.repository;

import com.guidaerique.edgerunners.model.Hunter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositório para operações de persistência e consulta da entidade {@link Hunter}.
 */
@Repository
public interface HunterRepository extends JpaRepository<Hunter, Long> {
    Optional<Hunter> findByUsername(String username);
    boolean existsByUsername(String username);
}
