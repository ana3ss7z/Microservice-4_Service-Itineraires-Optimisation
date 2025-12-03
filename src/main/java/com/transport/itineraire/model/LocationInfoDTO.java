package com.transport.itineraire.model;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * DTO contenant les informations de localisation
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LocationInfoDTO {

    // Informations IP
    private String ipAddress;
    private String clientIp;
    private String forwardedFor;

    // Localisation géographique (via IP)
    private String country;
    private String countryCode;
    private String region;
    private String regionName;
    private String city;
    private String zip;
    private Double latitude;
    private Double longitude;
    private String timezone;
    private String isp;
    private String org;

    // Informations serveur
    private String serverHostname;
    private String serverIp;
    private Integer serverPort;

    // Informations système
    private String osName;
    private String osVersion;
    private String javaVersion;

    // Métadonnées
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime timestamp;

    private String status;
    private String message;
}
