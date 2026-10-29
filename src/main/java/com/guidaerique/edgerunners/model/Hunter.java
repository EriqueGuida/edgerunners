package com.guidaerique.edgerunners.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidade que representa um Operador ou Administrador registrado no sistema AFTERHOURS (Seção 15.1 e 15.2).
 * Mantém os atributos streetCred e eddies sincronizados com reputation e balance para compatibilidade total.
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

    @JsonIgnore
    @Column(nullable = false)
    private String password;

    /** Papel de autorização do usuário (OPERATOR ou ADMIN - RF-014). */
    @Builder.Default
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 25)
    private Role role = Role.OPERATOR;

    /** Codinome público de apresentação no perfil (RF-021). */
    @Column(length = 80)
    private String callsign;

    /** Especialização tática do operador (RF-023). */
    @Builder.Default
    @Column(length = 120)
    private String specialization = "INFILTRAÇÃO & EXTRAÇÃO DE DADOS";

    /** Biografia operacional / histórico resumido (RF-023). */
    @Builder.Default
    @Column(length = 600)
    private String bio = "Operador independente credenciado na rede global AFTERHOURS.";

    /** Código de insígnia visual do perfil (RF-023). */
    @Builder.Default
    @Column(length = 40)
    private String avatarCode = "VANGUARD_01";

    /** Indicador de reputação do operador (RF-080). */
    @Builder.Default
    @Column(nullable = false)
    private Integer streetCred = 1;

    /** Saldo da carteira de créditos fictícios (RF-070). */
    @Builder.Default
    @Column(nullable = false)
    private Double eddies = 0.0;

    @Builder.Default
    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Version
    private Long version;

    /** Alias semântico AFTERHOURS para reputação. */
    public Integer getReputation() {
        return this.streetCred;
    }

    /** Alias semântico AFTERHOURS para saldo da carteira fictícia. */
    public Double getBalance() {
        return this.eddies;
    }
}
