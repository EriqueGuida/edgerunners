package com.guidaerique.edgerunners.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

/**
 * Entidade que representa um Operador ou Administrador registrado no sistema AFTERHOURS (Seção 15.1 e 15.2).
 * Mantém compatibilidade com esquemas MySQL pré-existentes.
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
    @Column(length = 25)
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
    private LocalDateTime createdAt = LocalDateTime.now();

    @PrePersist
    public void ensureDefaults() {
        if (this.role == null) this.role = Role.OPERATOR;
        if (this.streetCred == null) this.streetCred = 1;
        if (this.eddies == null) this.eddies = 0.0;
        if (this.createdAt == null) this.createdAt = LocalDateTime.now();
        if (this.callsign == null || this.callsign.isBlank()) {
            this.callsign = "OP_" + (this.username != null ? this.username.toUpperCase() : "AGENT");
        }
        if (this.specialization == null || this.specialization.isBlank()) {
            this.specialization = "INFILTRAÇÃO & EXTRAÇÃO DE DADOS";
        }
        if (this.avatarCode == null || this.avatarCode.isBlank()) {
            this.avatarCode = "VANGUARD_01";
        }
    }

    /** Alias semântico AFTERHOURS para reputação. */
    public Integer getReputation() {
        return this.streetCred != null ? this.streetCred : 1;
    }

    /** Alias semântico AFTERHOURS para saldo da carteira fictícia. */
    public Double getBalance() {
        return this.eddies != null ? this.eddies : 0.0;
    }
}
