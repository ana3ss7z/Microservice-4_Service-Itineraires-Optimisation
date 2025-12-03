package com.transport.itineraire.controller;

import com.transport.itineraire.model.LocationInfoDTO;
import com.transport.itineraire.service.LocationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.servlet.http.HttpServletRequest;

@RestController
@RequestMapping("/location")
@RequiredArgsConstructor
@Tag(name = "Location", description = "Endpoints pour la mise à jour et récupération de la localisation")
public class LocationController {

    private final LocationService locationService;

    /**
     * Récupère les informations de localisation du client actuel
     */
    @GetMapping("/current")
    @Operation(summary = "Localisation actuelle",
               description = "Récupère les informations de localisation basées sur l'IP du client et les informations serveur")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Localisation récupérée avec succès"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<LocationInfoDTO> getCurrentLocation(HttpServletRequest request) {
        return ResponseEntity.ok(locationService.getLocationInfo(request));
    }

    /**
     * Récupère les informations de localisation pour une IP spécifique
     */
    @GetMapping("/ip/{ipAddress}")
    @Operation(summary = "Localisation par IP",
               description = "Récupère les informations de localisation pour une adresse IP spécifique")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Localisation récupérée avec succès"),
        @ApiResponse(responseCode = "400", description = "Adresse IP invalide"),
        @ApiResponse(responseCode = "500", description = "Erreur serveur")
    })
    public ResponseEntity<LocationInfoDTO> getLocationByIp(
            @Parameter(description = "Adresse IP à localiser", example = "8.8.8.8")
            @PathVariable String ipAddress) {
        return ResponseEntity.ok(locationService.getLocationByIp(ipAddress));
    }

    /**
     * Récupère les informations de localisation via query param
     */
    @GetMapping("/lookup")
    @Operation(summary = "Recherche de localisation",
               description = "Récupère les informations de localisation pour une adresse IP donnée en paramètre")
    public ResponseEntity<LocationInfoDTO> lookupLocation(
            @Parameter(description = "Adresse IP à rechercher", example = "41.140.0.0")
            @RequestParam String ip) {
        return ResponseEntity.ok(locationService.getLocationByIp(ip));
    }

    /**
     * Mise à jour / Rafraîchissement de la localisation
     */
    @PostMapping("/refresh")
    @Operation(summary = "Rafraîchir la localisation",
               description = "Force une mise à jour des informations de localisation")
    public ResponseEntity<LocationInfoDTO> refreshLocation(HttpServletRequest request) {
        return ResponseEntity.ok(locationService.getLocationInfo(request));
    }

    /**
     * Informations du serveur uniquement
     */
    @GetMapping("/server-info")
    @Operation(summary = "Informations serveur",
               description = "Récupère les informations du serveur (hostname, IP, OS, Java version)")
    public ResponseEntity<LocationInfoDTO> getServerInfo(HttpServletRequest request) {
        return ResponseEntity.ok(locationService.getLocationInfo(request));
    }
}
