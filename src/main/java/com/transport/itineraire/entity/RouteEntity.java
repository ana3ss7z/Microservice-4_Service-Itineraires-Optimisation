package com.transport.itineraire.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

/**
 * Entité JPA pour stocker l'historique des itinéraires calculés
 */
@Entity
@Table(name = "routes")
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RouteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String userId;
    private String requestId;

    private String originAddress;
    private String originCity;
    private Double originLatitude;
    private Double originLongitude;

    private String destinationAddress;
    private String destinationCity;
    private Double destinationLatitude;
    private Double destinationLongitude;

    private Double distanceKm;
    private Integer durationMin;
    private Double returnDistanceKm;
    private Integer returnDurationMin;
    private Double totalDistanceKm;
    private Integer totalDurationMin;

    @Column(columnDefinition = "TEXT")
    private String routePolyline;

    @Column(columnDefinition = "TEXT")
    private String stepsJson;

    @Column(columnDefinition = "TEXT")
    private String instructionsJson;

    private Boolean includeReturn;
    private String preference;
    private Boolean isOptimized;
    private String optimizationType;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private String calculatedBy;
    private String status;

    @Column(length = 1000)
    private String errorMessage;

    @Version
    private Long version;
}