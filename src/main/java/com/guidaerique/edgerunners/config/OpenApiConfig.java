package com.guidaerique.edgerunners.config;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeIn;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import org.springframework.context.annotation.Configuration;

/**
 * Configuração da documentação OpenAPI (Swagger) e do esquema de autenticação Bearer JWT do AFTERHOURS.
 */
@Configuration
@OpenAPIDefinition(
        info = @Info(
                title = "AFTERHOURS // Operational Contract Network API",
                version = "1.0",
                description = "API RESTful para gestão de contratos, operações táticas, carteira fictícia, reputação e administração da rede AFTERHOURS."
        )
)
@SecurityScheme(
        name = "bearerAuth",
        description = "Insira o token JWT obtido no endpoint /api/auth/login",
        scheme = "bearer",
        type = SecuritySchemeType.HTTP,
        bearerFormat = "JWT",
        in = SecuritySchemeIn.HEADER
)
public class OpenApiConfig {
}
