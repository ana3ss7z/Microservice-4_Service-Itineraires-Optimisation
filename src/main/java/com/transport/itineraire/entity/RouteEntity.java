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

    @Column(length = 500)
    private String userId;

    @Column(length = 500)
    private String chauffeurId;

    @Column(length = 500)
    private String requestId;

    @Column(columnDefinition = "TEXT")
    private String originAddress;

    @Column(columnDefinition = "TEXT")
    private String originCity;

    private Double originLatitude;
    private Double originLongitude;

    @Column(columnDefinition = "TEXT")
    private String destinationAddress;

    @Column(columnDefinition = "TEXT")
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

    @Column(columnDefinition = "TEXT")
    private String preference;

    private Boolean isOptimized;

    @Column(length = 500)
    private String optimizationType;

    @Column(updatable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    private LocalDateTime dateDepart;
    private LocalDateTime estimatedArrivalTime;

    @Builder.Default
    private Boolean started = false;

    private LocalDateTime startedAt;

    @Column(columnDefinition = "TEXT")
    private String calculatedBy;

    @Column(columnDefinition = "TEXT")
    private String status;

    @Column(length = 1000)
    private String errorMessage;

    @Version
    private Long version;
}