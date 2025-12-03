package com.transport.itineraire.controller;

import com.transport.itineraire.entity.RouteEntity;
import com.transport.itineraire.entity.VilleEntity;
import com.transport.itineraire.model.*;
import com.transport.itineraire.service.*;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/routes")
@RequiredArgsConstructor
@Tag(name = "Routes", description = "Endpoints pour le calcul et la gestion des itinéraires")
public class RouteController {

    private final RouteService routeService;
    private final OptimizationService optimizationService;
    private final VilleService villeService;

    @PostMapping("/coordinates")
    public ResponseEntity<RouteResponse> calculateFromCoordinates(@RequestBody RouteRequest request) {
        return ResponseEntity.ok(routeService.calculateRouteFromCoordinates(request));
    }

    @PostMapping("/address")
    public ResponseEntity<RouteResponse> calculateFromAddress(@RequestBody RouteRequest request) {
        return ResponseEntity.ok(routeService.calculateRouteFromAddress(request));
    }

    @PostMapping("/optimize")
    public ResponseEntity<RouteResponse> optimize(@RequestBody RouteRequest request) {
        return ResponseEntity.ok(optimizationService.optimizeRoute(request));
    }

    /**
     * CORRECTION: Retourner des DTOs au lieu des entités avec Points PostGIS
     */
    @GetMapping("/history")
    public ResponseEntity<Page<RouteDTO>> getHistory(
            @RequestParam String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<RouteEntity> entities = routeService.getRouteHistory(userId, PageRequest.of(page, size));

        // CORRECTION: Conversion en DTOs pour éviter la sérialisation des Points
        Page<RouteDTO> dtos = entities.map(this::convertToDTO);

        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RouteDTO> getById(@PathVariable String id) {
        RouteEntity entity = routeService.getRouteById(id);
        return ResponseEntity.ok(convertToDTO(entity));
    }

    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Service opérationnel");
    }

    @GetMapping("/ville")
    public ResponseEntity<List<VilleEntity>> getAllCities() {
        return ResponseEntity.ok(villeService.getAllCities());
    }

    /**
     * Endpoint pour calculer un itinéraire avec les informations de demande (volume, marchandise)
     * Retourne totalDistanceKm, totalDurationMin avec les détails de la demande
     */
    @PostMapping("/demande-info")
    @Operation(summary = "Calcul d'itinéraire avec informations de demande",
               description = "Calcule l'itinéraire et retourne les informations complètes incluant volume et nature de marchandise")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Calcul effectué avec succès"),
        @ApiResponse(responseCode = "400", description = "Requête invalide")
    })
    public ResponseEntity<UserRouteInfoDTO> calculateRouteWithDemandeInfo(
            @RequestBody DemandeRequestDTO demandeRequest,
            @RequestParam(defaultValue = "user_default") String userId) {

        // Créer la requête de route à partir des adresses de la demande
        RouteRequest routeRequest = RouteRequest.builder()
                .originAddress(demandeRequest.getAdresseDepart())
                .destinationAddress(demandeRequest.getAdresseDestination())
                .includeReturn(true)
                .userId(userId)
                .build();

        // Calculer la route
        RouteResponse routeResponse = routeService.calculateRouteFromAddress(routeRequest);

        // Construire la réponse complète avec les informations de demande
        UserRouteInfoDTO userRouteInfo = UserRouteInfoDTO.builder()
                .routeId(routeResponse.getRouteId())
                .userId(userId)
                .adresseDepart(demandeRequest.getAdresseDepart())
                .adresseDestination(demandeRequest.getAdresseDestination())
                .totalDistanceKm(routeResponse.getTotalDistanceKm())
                .totalDurationMin(routeResponse.getTotalDurationMin())
                .distanceKm(routeResponse.getDistanceKm())
                .durationMin(routeResponse.getDurationMin())
                .returnDistanceKm(routeResponse.getReturnDistanceKm())
                .returnDurationMin(routeResponse.getReturnDurationMin())
                .volume(demandeRequest.getVolume())
                .natureMarchandise(demandeRequest.getNatureMarchandise())
                .dateDepart(demandeRequest.getDateDepart())
                .includeReturn(true)
                .createdAt(routeResponse.getCalculatedAt())
                .status(routeResponse.getStatus())
                .build();

        return ResponseEntity.ok(userRouteInfo);
    }

    /**
     * Endpoint pour obtenir toutes les informations d'un utilisateur avec volume
     * Récupère l'historique des routes avec les détails de demande
     */
    @GetMapping("/user-info")
    @Operation(summary = "Récupérer toutes les informations utilisateur",
               description = "Retourne les informations complètes incluant totalDistanceKm, totalDurationMin et volume")
    public ResponseEntity<List<UserRouteInfoDTO>> getUserInfo(
            @RequestParam String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Page<RouteEntity> entities = routeService.getRouteHistory(userId, PageRequest.of(page, size));

        List<UserRouteInfoDTO> userInfoList = entities.getContent().stream()
                .map(this::convertToUserRouteInfo)
                .collect(Collectors.toList());

        return ResponseEntity.ok(userInfoList);
    }

    /**
     * CORRECTION: Méthode de conversion Entity -> DTO
     */
    private RouteDTO convertToDTO(RouteEntity entity) {
        return RouteDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .originLatitude(entity.getOriginLatitude())
                .originLongitude(entity.getOriginLongitude())
                .originAddress(entity.getOriginAddress())
                .originCity(entity.getOriginCity())
                .destinationLatitude(entity.getDestinationLatitude())
                .destinationLongitude(entity.getDestinationLongitude())
                .destinationAddress(entity.getDestinationAddress())
                .destinationCity(entity.getDestinationCity())
                .distanceKm(entity.getDistanceKm())
                .durationMin(entity.getDurationMin())
                .returnDistanceKm(entity.getReturnDistanceKm())
                .returnDurationMin(entity.getReturnDurationMin())
                .totalDistanceKm(entity.getTotalDistanceKm())
                .totalDurationMin(entity.getTotalDurationMin())
                .includeReturn(entity.getIncludeReturn())
                .isOptimized(entity.getIsOptimized())
                .optimizationType(entity.getOptimizationType())
                .createdAt(entity.getCreatedAt())
                .status(entity.getStatus())
                .calculatedBy(entity.getCalculatedBy())
                .build();
    }

    /**
     * Méthode de conversion Entity -> UserRouteInfoDTO
     */
    private UserRouteInfoDTO convertToUserRouteInfo(RouteEntity entity) {
        return UserRouteInfoDTO.builder()
                .routeId(entity.getId())
                .userId(entity.getUserId())
                .adresseDepart(entity.getOriginAddress())
                .adresseDestination(entity.getDestinationAddress())
                .originLatitude(entity.getOriginLatitude())
                .originLongitude(entity.getOriginLongitude())
                .originCity(entity.getOriginCity())
                .destinationLatitude(entity.getDestinationLatitude())
                .destinationLongitude(entity.getDestinationLongitude())
                .destinationCity(entity.getDestinationCity())
                .totalDistanceKm(entity.getTotalDistanceKm())
                .totalDurationMin(entity.getTotalDurationMin())
                .distanceKm(entity.getDistanceKm())
                .durationMin(entity.getDurationMin())
                .returnDistanceKm(entity.getReturnDistanceKm())
                .returnDurationMin(entity.getReturnDurationMin())
                .includeReturn(entity.getIncludeReturn())
                .isOptimized(entity.getIsOptimized())
                .optimizationType(entity.getOptimizationType())
                .createdAt(entity.getCreatedAt())
                .status(entity.getStatus())
                .calculatedBy(entity.getCalculatedBy())
                .build();
    }
}