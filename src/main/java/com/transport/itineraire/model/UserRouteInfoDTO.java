package com.transport.itineraire.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO complet contenant les informations de route et de demande
 * Combine les données d'itinéraire avec les informations de volume/marchandise
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRouteInfoDTO {

    // Route identification
    private String routeId;
    private String userId;

    // Adresses
    private String adresseDepart;
    private String adresseDestination;

    // Coordonnées d'origine
    private Double originLatitude;
    private Double originLongitude;
    private String originCity;

    // Coordonnées de destination
    private Double destinationLatitude;
    private Double destinationLongitude;
    private String destinationCity;

    // Distances et durées totales
    private Double totalDistanceKm;
    private Integer totalDurationMin;

    // Détails aller
    private Double distanceKm;
    private Integer durationMin;

    // Détails retour
    private Double returnDistanceKm;
    private Integer returnDurationMin;

    // Informations de la demande (volume/marchandise)
    private Double volume;
    private String natureMarchandise;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateDepart;

    // Métadonnées
    private Boolean includeReturn;
    private Boolean isOptimized;
    private String optimizationType;

    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;

    private String status;
    private String calculatedBy;
}
