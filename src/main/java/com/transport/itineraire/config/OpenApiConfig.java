package com.transport.itineraire.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Microservice 4 - Service Itinéraires & Optimisation API")
                        .description("API de calcul d'itinéraires et d'optimisation de routes pour le système de transport")
                        .version("1.0.0")
                        .contact(new Contact()
                                .email("contact@transport.com")))
                .servers(List.of(
                        new Server()
                                .url("http://172.30.80.11:31030/api")
                                .description("Serveur de développement")))
                .components(new Components()
                        .addSecuritySchemes("bearerAuth",
                                new SecurityScheme()
                                        .type(SecurityScheme.Type.HTTP)
                                        .scheme("bearer")
                                        .bearerFormat("JWT")
                                        .description("Token JWT pour l'authentification")))
                .addSecurityItem(new SecurityRequirement().addList("bearerAuth"));
    }
}
