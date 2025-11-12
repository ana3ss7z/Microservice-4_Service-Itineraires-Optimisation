package com.transport.itineraire.model;

import lombok.*;
import java.time.LocalDateTime;

/**
 * DTO pour l'historique des routes (évite la sérialisation des Points PostGIS)
 */
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RouteDTO {

    private String id;
    private String userId;

    // Coordonnées d'origine
    private Double originLatitude;
    private Double originLongitude;
    private String originAddress;
    private String originCity;

    // Coordonnées de destination
    private Double destinationLatitude;
    private Double destinationLongitude;
    private String destinationAddress;
    private String destinationCity;

    // Détails de la route
    private Double distanceKm;
    private Integer durationMin;
    private Double returnDistanceKm;
    private Integer returnDurationMin;
    private Double totalDistanceKm;
    private Integer totalDurationMin;

    private Boolean includeReturn;
    private Boolean isOptimized;
    private String optimizationType;

    private LocalDateTime createdAt;
    private String status;
    private String calculatedBy;
}