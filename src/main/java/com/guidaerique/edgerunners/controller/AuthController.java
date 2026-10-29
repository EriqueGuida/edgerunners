package com.guidaerique.edgerunners.controller;

import com.guidaerique.edgerunners.model.Hunter;
import com.guidaerique.edgerunners.repository.HunterRepository;
import com.guidaerique.edgerunners.security.JwtService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Controlador REST responsável pelo registro de novos Hunters e emissão de credenciais JWT.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
@Tag(name = "Autenticação", description = "Registro de novos Hunters e geração de credenciais JWT")
public class AuthController {

    private final HunterRepository hunterRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;

    /**
     * Registra um novo Hunter no sistema após validar a unicidade do codinome e aplicar hash à senha.
     */
    @PostMapping("/register")
    @Operation(summary = "Registrar um novo Hunter", description = "Cria um novo caçador de recompensas com Street Cred inicial 1 e 0 Eddies.")
    public ResponseEntity<?> register(@RequestBody AuthRequest request) {
        if (hunterRepository.existsByUsername(request.getUsername())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("error", "Este codinome de Hunter já está registrado na Net."));
        }

        Hunter hunter = Hunter.builder()
                .username(request.getUsername())
                .password(passwordEncoder.encode(request.getPassword()))
                .streetCred(1)
                .eddies(0.0)
                .build();

        hunterRepository.save(hunter);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(Map.of(
                        "message", "Hunter registrado com sucesso. Bem-vindo a Night City!",
                        "username", hunter.getUsername(),
                        "streetCred", hunter.getStreetCred(),
                        "eddies", hunter.getEddies()
                ));
    }

    /**
     * Autentica as credenciais via Spring Security e retorna um token JWT assinado.
     */
    @PostMapping("/login")
    @Operation(summary = "Autenticar Hunter", description = "Valida as credenciais e retorna o Bearer Token JWT.")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );

        String token = jwtService.generateToken(request.getUsername());
        return ResponseEntity.ok(Map.of("token", token));
    }

    /**
     * Objeto de transferência de dados para requisições de registro e login.
     */
    @Data
    public static class AuthRequest {
        private String username;
        private String password;
    }
}
