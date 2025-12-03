package com.transport.itineraire.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO pour la création de demande avec informations de volume
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DemandeRequestDTO {

    private Double volume;
    private String natureMarchandise;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime dateDepart;

    private String adresseDepart;
    private String adresseDestination;
}
