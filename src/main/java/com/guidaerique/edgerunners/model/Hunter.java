package com.guidaerique.edgerunners.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

/**
 * Entidade que representa um caçador de recompensas (Hunter) registrado no sistema.
 */
@Entity
@Table(name = "hunters")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Hunter {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String username;

    // Oculta o hash da senha na serialização JSON para evitar exposição de credenciais nas respostas da API.
    @JsonIgnore
    @Column(nullable = false)
    private String password;

    // Reputação inicial padrão atribuída a novos caçadores.
    @Builder.Default
    @Column(nullable = false)
    private Integer streetCred = 1;

    // Saldo monetário inicial em Eurodólares (Eddies).
    @Builder.Default
    @Column(nullable = false)
    private Double eddies = 0.0;
}
