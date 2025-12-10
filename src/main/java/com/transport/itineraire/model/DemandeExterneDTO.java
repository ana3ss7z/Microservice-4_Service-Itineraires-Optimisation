package com.transport.itineraire.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour recevoir les données du Microservice Demandes (MS externe)
 * Endpoint: GET /api/v1/demandes/{id}
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@JsonIgnoreProperties(ignoreUnknown = true)
public class DemandeExterneDTO {

    private Long id;
    private Long clientId;
    private Double volume;
    private String natureMarchandise;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateDepart;

    private String adresseDepart;
    private String adresseDestination;
    private String statutValidation;
    private Double devisEstime;
    private Long itineraireAssocieId;
    private Double distanceKm;
    private Integer dureeEstimeeMin;
    private Long groupeId;
    private String categorie;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS")
    private LocalDateTime dateCreation;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss.SSSSSS")
    private LocalDateTime dateModification;
}
