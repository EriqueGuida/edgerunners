package com.guidaerique.edgerunners.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Arrays;
import java.util.Date;
import java.util.function.Function;

/**
 * Serviço responsável pela geração, assinatura, extração de claims e validação de tokens JWT.
 */
@Service
@RequiredArgsConstructor
public class JwtService {

    private static final String DEFAULT_DEV_SECRET =
            "NDI2MTY1NjQ2NzY1NzI3NTZlNmU2NTcyM2E0ZTY5NjY2ODc0NDI2MTY0NDM3OTYyNjU3MjIwNzc=";

    private final Environment environment;

    @Value("${jwt.secret:}")
    private String secretKey;

    @Value("${jwt.expiration}")
    private long jwtExpiration;

    @PostConstruct
    public void validateSecretConfiguration() {
        boolean isStrictProfile = Arrays.stream(environment.getActiveProfiles())
                .anyMatch(p -> p.equalsIgnoreCase("prod")
                        || p.equalsIgnoreCase("production")
                        || p.equalsIgnoreCase("staging")
                        || p.equalsIgnoreCase("secure"));

        if (secretKey == null || secretKey.isBlank()) {
            throw new IllegalStateException(
                    "[AFTERHOURS SECURITY] A propriedade jwt.secret (JWT_SECRET) não foi configurada."
            );
        }

        if (isStrictProfile && DEFAULT_DEV_SECRET.equals(secretKey.trim())) {
            throw new IllegalStateException(
                    "[AFTERHOURS SECURITY] Inicialização abortada: segredo JWT padrão de desenvolvimento detectado em perfil restrito ("
                            + String.join(",", environment.getActiveProfiles())
                            + "). Configure uma chave criptográfica exclusiva via variável de ambiente JWT_SECRET."
            );
        }

        try {
            byte[] keyBytes = Decoders.BASE64.decode(secretKey.trim());
            if (keyBytes.length < 32) {
                throw new IllegalStateException(
                        "[AFTERHOURS SECURITY] A chave JWT_SECRET decodificada possui menos de 256 bits (32 bytes)."
                );
            }
        } catch (IllegalArgumentException ex) {
            throw new IllegalStateException(
                    "[AFTERHOURS SECURITY] A propriedade jwt.secret deve estar codificada em Base64 válido com pelo menos 256 bits.",
                    ex
            );
        }
    }

    /**
     * Gera um token JWT assinado contendo o codinome do Hunter como subject.
     */
    public String generateToken(String username) {
        return Jwts.builder()
                .subject(username)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + jwtExpiration))
                .signWith(getSignInKey())
                .compact();
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    /**
     * Verifica se o token pertence ao usuário informado e se permanece dentro do prazo de validade.
     */
    public boolean isTokenValid(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        return (username.equals(userDetails.getUsername())) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    private Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSignInKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    /**
     * Decodifica a chave secreta em Base64 e gera a chave criptográfica HMAC-SHA para assinatura.
     */
    private SecretKey getSignInKey() {
        byte[] keyBytes = Decoders.BASE64.decode(secretKey);
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
