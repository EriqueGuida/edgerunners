package com.guidaerique.edgerunners.controller;

import com.guidaerique.edgerunners.model.Hunter;
import com.guidaerique.edgerunners.model.Notification;
import com.guidaerique.edgerunners.model.ReputationEvent;
import com.guidaerique.edgerunners.model.Role;
import com.guidaerique.edgerunners.repository.HunterRepository;
import com.guidaerique.edgerunners.repository.NotificationRepository;
import com.guidaerique.edgerunners.repository.ReputationEventRepository;
import com.guidaerique.edgerunners.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;

/**
 * Controlador REST responsável pelo registro de novos Operadores e emissão de credenciais JWT (RF-010 a RF-015).
 * Atende tanto em /auth quanto em /api/auth.
 */
@RestController
@RequestMapping({"/auth", "/api/auth"})
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Registro de Operadores e emissão de credenciais JWT na rede AFTERHOURS")
public class AuthController {

    private final HunterRepository hunterRepository;
    private final ReputationEventRepository reputationEventRepository;
    private final NotificationRepository notificationRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    @PostMapping("/register")
    @Transactional
    @Operation(summary = "Registrar um novo Operador", description = "Cria uma conta de Operador com Reputação inicial 1 e saldo CR¢ 0.")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (request.getUsername() == null || request.getUsername().trim().length() < 3) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "O identificador do operador deve possuir pelo menos 3 caracteres."));
        }
        if (request.getPassword() == null || request.getPassword().length() < 4) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "A chave de acesso deve possuir pelo menos 4 caracteres."));
        }

        String normalizedUsername = request.getUsername().trim();
        if (hunterRepository.existsByUsername(normalizedUsername)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Este identificador de Operador já está registrado na rede AFTERHOURS."));
        }

        String defaultCallsign = request.getCallsign() != null && !request.getCallsign().isBlank()
                ? request.getCallsign().trim().toUpperCase()
                : "OP_" + normalizedUsername.toUpperCase();

        Hunter hunter = Hunter.builder()
                .username(normalizedUsername)
                .password(passwordEncoder.encode(request.getPassword()))
                .role(Role.OPERATOR)
                .callsign(defaultCallsign)
                .specialization(request.getSpecialization() != null && !request.getSpecialization().isBlank()
                        ? request.getSpecialization().trim()
                        : "INFILTRAÇÃO & EXTRAÇÃO DE DADOS")
                .bio("Operador independente credenciado na rede global AFTERHOURS.")
                .avatarCode("VANGUARD_01")
                .streetCred(1)
                .eddies(0.0)
                .createdAt(LocalDateTime.now())
                .build();

        Hunter saved = hunterRepository.save(hunter);

        reputationEventRepository.save(ReputationEvent.builder()
                .operator(saved)
                .delta(1)
                .reputationAfter(1)
                .reason("Credenciamento inicial aprovado na rede AFTERHOURS.")
                .createdAt(LocalDateTime.now())
                .build());

        notificationRepository.save(Notification.builder()
                .operator(saved)
                .title("CREDENCIAL ATIVA // BEM-VINDO AO AFTERHOURS")
                .message("Terminal operacional liberado para " + saved.getCallsign() + ". Explore o Catálogo ou o Mapa Global para avaliar contratos disponíveis.")
                .type("INFO")
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build());

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "Operador registrado com sucesso na rede AFTERHOURS.",
                        "username", saved.getUsername(),
                        "callsign", saved.getCallsign(),
                        "role", saved.getRole().name(),
                        "streetCred", saved.getStreetCred(),
                        "eddies", saved.getEddies(),
                        "reputation", saved.getReputation(),
                        "balance", saved.getBalance()
                ));
    }

    @PostMapping("/login")
    @Operation(summary = "Autenticar Operador", description = "Valida as credenciais e retorna o Bearer Token JWT e os metadados do perfil.")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        if (request.getUsername() == null || request.getPassword() == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Informe o identificador e a chave de acesso."));
        }

        String normalizedUsername = request.getUsername().trim();
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(normalizedUsername, request.getPassword())
            );
        } catch (AuthenticationException ex) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", "Credenciais operacionais inválidas."));
        }

        Hunter hunter = hunterRepository.findByUsername(normalizedUsername).orElseThrow();
        String token = jwtService.generateToken(hunter.getUsername());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "username", hunter.getUsername(),
                "callsign", hunter.getCallsign() != null ? hunter.getCallsign() : hunter.getUsername(),
                "role", hunter.getRole() != null ? hunter.getRole().name() : Role.OPERATOR.name(),
                "streetCred", hunter.getStreetCred(),
                "eddies", hunter.getEddies(),
                "reputation", hunter.getReputation(),
                "balance", hunter.getBalance()
        ));
    }

    @Data
    public static class AuthRequest {
        private String username;
        private String password;
        private String callsign;
        private String specialization;
    }
}
