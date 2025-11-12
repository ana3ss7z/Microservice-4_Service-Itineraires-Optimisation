package com.transport.itineraire.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.locationtech.jts.geom.Point;
import java.time.LocalDateTime;

/**
 * Entité JPA pour stocker l'historique des itinéraires calculés
 * CORRECTION: Ajout de @JsonIgnore sur les Points pour éviter la sérialisation infinie
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

    // CORRECTION: Ajout @JsonIgnore pour éviter la sérialisation des géométries PostGIS
    @JsonIgnore
    @Column(columnDefinition = "geometry(Point,4326)")
    private Point originPoint;

    private String originAddress;
    private String originCity;

    @JsonIgnore
    @Column(columnDefinition = "geometry(Point,4326)")
    private Point destinationPoint;

    private String destinationAddress;
    private String destinationCity;

    // Coordonnées stockées séparément pour la sérialisation JSON
    private Double originLatitude;
    private Double originLongitude;
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
    private LocalDateTime createdAt = LocalDateTime.now();

    private String calculatedBy;
    private String status;

    @Column(length = 1000)
    private String errorMessage;

    @Version
    private Long version;
}