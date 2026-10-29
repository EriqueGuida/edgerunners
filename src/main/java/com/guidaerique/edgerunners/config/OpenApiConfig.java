package com.guidaerique.edgerunners.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração da documentação OpenAPI (Swagger) e do esquema de autenticação Bearer JWT.
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "Edgerunner Bounty System API",
                version = "1.0",
                description = "Sistema Cyberpunk de gerenciamento de contratos de recompensa para Mercenários e Fixers em Night City."
        )
)
@SecurityScheme(
        name = "bearerAuth",
        description = "Insira o token JWT obtido no endpoint /auth/login",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}
