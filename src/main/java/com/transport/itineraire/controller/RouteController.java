package com.transport.itineraire.controller;

import com.transport.itineraire.entity.RouteEntity;
import com.transport.itineraire.entity.VilleEntity;
import com.transport.itineraire.model.*;
import com.transport.itineraire.service.*;
import com.transport.itineraire.repository.RouteRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/routes")
@RequiredArgsConstructor
@Tag(name = "Routes", description = "Endpoints pour le calcul et la gestion des itinéraires")
public class RouteController {

    private final RouteService routeService;
    private final OptimizationService optimizationService;
    private final VilleService villeService;
    private final RouteRepository routeRepository;
    private final DemandeExterneService demandeExterneService;

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

    // ============== ENDPOINTS POUR INTÉGRATION MICROSERVICE DEMANDES ==============

    /**
     * Récupérer les informations d'une demande depuis le microservice externe
     * @param demandeId ID de la demande
     * @return DemandeExterneDTO avec toutes les informations de la demande
     */
    @GetMapping("/demande-externe/{demandeId}")
    @Operation(summary = "Récupérer une demande externe",
               description = "Appelle le microservice Demandes pour récupérer les informations d'une demande par son ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Demande récupérée avec succès"),
        @ApiResponse(responseCode = "404", description = "Demande non trouvée"),
        @ApiResponse(responseCode = "503", description = "Service Demandes indisponible")
    })
    public ResponseEntity<DemandeExterneDTO> getDemandeExterne(@PathVariable Long demandeId) {
        return ResponseEntity.ok(demandeExterneService.getDemandeById(demandeId));
    }

    /**
     * Récupérer uniquement le volume d'une demande depuis le microservice externe
     * @param demandeId ID de la demande
     * @return Map contenant le volume
     */
    @GetMapping("/demande-externe/{demandeId}/volume")
    @Operation(summary = "Récupérer le volume d'une demande",
               description = "Appelle le microservice Demandes pour récupérer uniquement le volume d'une demande")
    public ResponseEntity<Map<String, Object>> getVolumeFromDemande(@PathVariable Long demandeId) {
        Double volume = demandeExterneService.getVolumeByDemandeId(demandeId);
        Map<String, Object> response = new HashMap<>();
        response.put("demandeId", demandeId);
        response.put("volume", volume);
        return ResponseEntity.ok(response);
    }

    /**
     * Calculer un itinéraire à partir d'une demande externe
     * Récupère automatiquement les informations depuis le microservice Demandes
     * @param demandeId ID de la demande dans le microservice externe
     * @param userId ID de l'utilisateur (optionnel)
     * @param chauffeurId ID du chauffeur (optionnel)
     * @return UserRouteInfoDTO avec les informations de route calculées
     */
    @PostMapping("/calculate-from-demande/{demandeId}")
    @Operation(summary = "Calculer itinéraire depuis demande externe",
               description = "Récupère les données d'une demande externe et calcule l'itinéraire automatiquement")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Itinéraire calculé avec succès"),
        @ApiResponse(responseCode = "404", description = "Demande non trouvée"),
        @ApiResponse(responseCode = "503", description = "Service Demandes indisponible")
    })
    public ResponseEntity<UserRouteInfoDTO> calculateRouteFromDemande(
            @PathVariable Long demandeId,
            @RequestParam(required = false) String userId,
            @RequestParam(required = false) String chauffeurId) {

        // Récupérer la demande depuis le microservice externe
        DemandeExterneDTO demande = demandeExterneService.getDemandeById(demandeId);

        // Convertir en DemandeRequestDTO pour réutiliser la logique existante
        DemandeRequestDTO demandeRequest = DemandeRequestDTO.builder()
                .userId(userId != null ? userId : "client_" + demande.getClientId())
                .chauffeurId(chauffeurId)
                .volume(demande.getVolume())
                .natureMarchandise(demande.getNatureMarchandise())
                .dateDepart(demande.getDateDepart())
                .adresseDepart(demande.getAdresseDepart())
                .adresseDestination(demande.getAdresseDestination())
                .build();

        // Créer la requête de route
        RouteRequest routeRequest = RouteRequest.builder()
                .originAddress(demande.getAdresseDepart())
                .destinationAddress(demande.getAdresseDestination())
                .includeReturn(true)
                .userId(demandeRequest.getUserId())
                .build();

        // Calculer la route
        RouteResponse routeResponse = routeService.calculateRouteFromAddress(routeRequest);

        // Calculer l'heure d'arrivée estimée et l'heure de notification (10 min avant)
        LocalDateTime dateDepart = demande.getDateDepart();
        final LocalDateTime estimatedArrivalTime;
        final LocalDateTime notificationTime;

        if (dateDepart != null && routeResponse.getDurationMin() != null) {
            estimatedArrivalTime = dateDepart.plusMinutes(routeResponse.getDurationMin());
            notificationTime = estimatedArrivalTime.minusMinutes(10);
        } else {
            estimatedArrivalTime = null;
            notificationTime = null;
        }

        // Construire la réponse
        UserRouteInfoDTO userRouteInfo = UserRouteInfoDTO.builder()
                .routeId(routeResponse.getRouteId())
                .userId(demandeRequest.getUserId())
                .chauffeurId(chauffeurId)
                .adresseDepart(demande.getAdresseDepart())
                .adresseDestination(demande.getAdresseDestination())
                .totalDistanceKm(routeResponse.getTotalDistanceKm())
                .totalDurationMin(routeResponse.getTotalDurationMin())
                .distanceKm(routeResponse.getDistanceKm())
                .durationMin(routeResponse.getDurationMin())
                .returnDistanceKm(routeResponse.getReturnDistanceKm())
                .returnDurationMin(routeResponse.getReturnDurationMin())
                .volume(demande.getVolume())
                .natureMarchandise(demande.getNatureMarchandise())
                .dateDepart(dateDepart)
                .estimatedArrivalTime(estimatedArrivalTime)
                .notificationTime(notificationTime)
                .started(false)
                .startedAt(null)
                .includeReturn(true)
                .createdAt(routeResponse.getCalculatedAt())
                .status(routeResponse.getStatus())
                .build();

        // Sauvegarder l'entité avec les informations
        if (routeResponse.getRouteId() != null) {
            routeRepository.findById(routeResponse.getRouteId()).ifPresent(entity -> {
                entity.setChauffeurId(chauffeurId);
                entity.setDateDepart(dateDepart);
                entity.setEstimatedArrivalTime(estimatedArrivalTime);
                entity.setNotificationTime(notificationTime);
                entity.setStarted(false);
                routeRepository.save(entity);
            });
        }

        return ResponseEntity.ok(userRouteInfo);
    }

    /**
     * Vérifier la disponibilité du service Demandes
     */
    @GetMapping("/demande-service/health")
    @Operation(summary = "Vérifier le service Demandes",
               description = "Vérifie si le microservice Demandes est disponible")
    public ResponseEntity<Map<String, Object>> checkDemandeServiceHealth() {
        boolean available = demandeExterneService.isServiceAvailable();
        Map<String, Object> response = new HashMap<>();
        response.put("service", "demandes");
        response.put("available", available);
        response.put("url", "http://172.30.80.11:31029/api/v1/demandes");
        return ResponseEntity.ok(response);
    }

    // ============== FIN ENDPOINTS MICROSERVICE DEMANDES ==============

    /**
     * Endpoint pour calculer un itinéraire avec les informations de demande (volume, marchandise)
     * Retourne totalDistanceKm, totalDurationMin avec les détails de la demande
     * Inclut la relation userId - chauffeurId
     */
    @PostMapping("/demande-info")
    @Operation(summary = "Calcul d'itinéraire avec informations de demande",
               description = "Calcule l'itinéraire et retourne les informations complètes incluant volume, nature de marchandise et relation userId-chauffeurId")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Calcul effectué avec succès"),
        @ApiResponse(responseCode = "400", description = "Requête invalide")
    })
    public ResponseEntity<UserRouteInfoDTO> calculateRouteWithDemandeInfo(
            @RequestBody DemandeRequestDTO demandeRequest) {

        // Utiliser userId du body ou valeur par défaut
        String userId = demandeRequest.getUserId() != null ? demandeRequest.getUserId() : "user_default";
        String chauffeurId = demandeRequest.getChauffeurId();

        // Créer la requête de route à partir des adresses de la demande
        RouteRequest routeRequest = RouteRequest.builder()
                .originAddress(demandeRequest.getAdresseDepart())
                .destinationAddress(demandeRequest.getAdresseDestination())
                .includeReturn(true)
                .userId(userId)
                .build();

        // Calculer la route
        RouteResponse routeResponse = routeService.calculateRouteFromAddress(routeRequest);

        // Calculer l'heure d'arrivée estimée et l'heure de notification (10 min avant)
        LocalDateTime dateDepart = demandeRequest.getDateDepart();
        final LocalDateTime estimatedArrivalTime;
        final LocalDateTime notificationTime;

        if (dateDepart != null && routeResponse.getDurationMin() != null) {
            estimatedArrivalTime = dateDepart.plusMinutes(routeResponse.getDurationMin());
            // Notification 10 minutes avant l'arrivée
            notificationTime = estimatedArrivalTime.minusMinutes(10);
        } else {
            estimatedArrivalTime = null;
            notificationTime = null;
        }

        // Construire la réponse complète avec les informations de demande et utilisateur
        UserRouteInfoDTO userRouteInfo = UserRouteInfoDTO.builder()
                .routeId(routeResponse.getRouteId())
                .userId(userId)
                .chauffeurId(chauffeurId)
                .username(demandeRequest.getUsername())
                .email(demandeRequest.getEmail())
                .fullName(demandeRequest.getFullName())
                .phone(demandeRequest.getPhone())
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
                .dateDepart(dateDepart)
                .estimatedArrivalTime(estimatedArrivalTime)
                .notificationTime(notificationTime)
                .started(false)
                .startedAt(null)
                .includeReturn(true)
                .createdAt(routeResponse.getCalculatedAt())
                .status(routeResponse.getStatus())
                .build();

        // Mettre à jour l'entité avec les nouvelles informations
        if (routeResponse.getRouteId() != null) {
            routeRepository.findById(routeResponse.getRouteId()).ifPresent(entity -> {
                entity.setChauffeurId(chauffeurId);
                entity.setDateDepart(dateDepart);
                entity.setEstimatedArrivalTime(estimatedArrivalTime);
                entity.setNotificationTime(notificationTime);
                entity.setStarted(false);
                routeRepository.save(entity);
            });
        }

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
                .chauffeurId(entity.getChauffeurId())
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
                .dateDepart(entity.getDateDepart())
                .estimatedArrivalTime(entity.getEstimatedArrivalTime())
                .notificationTime(entity.getNotificationTime())
                .started(entity.getStarted())
                .startedAt(entity.getStartedAt())
                .includeReturn(entity.getIncludeReturn())
                .isOptimized(entity.getIsOptimized())
                .optimizationType(entity.getOptimizationType())
                .createdAt(entity.getCreatedAt())
                .status(entity.getStatus())
                .calculatedBy(entity.getCalculatedBy())
                .build();
    }

    /**
     * Endpoint pour démarrer une route (bouton start)
     * Met à jour le champ started à true et enregistre l'heure de départ réelle
     */
    @PutMapping("/{id}/start")
    @Operation(summary = "Démarrer une route",
               description = "Met le statut started à true et enregistre l'heure de départ effective")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Route démarrée avec succès"),
        @ApiResponse(responseCode = "404", description = "Route non trouvée")
    })
    public ResponseEntity<UserRouteInfoDTO> startRoute(@PathVariable String id) {
        RouteEntity entity = routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Route non trouvée: " + id));

        entity.setStarted(true);
        entity.setStartedAt(LocalDateTime.now());

        // Recalculer l'heure d'arrivée estimée basée sur l'heure de départ réelle
        if (entity.getDurationMin() != null) {
            LocalDateTime newEstimatedArrival = LocalDateTime.now().plusMinutes(entity.getDurationMin());
            entity.setEstimatedArrivalTime(newEstimatedArrival);
            entity.setNotificationTime(newEstimatedArrival.minusMinutes(10));
        }

        RouteEntity savedEntity = routeRepository.save(entity);
        return ResponseEntity.ok(convertToUserRouteInfo(savedEntity));
    }

    /**
     * Endpoint pour récupérer toutes les routes qui ont démarré
     * Permet de calculer la distance totale des routes en cours
     */
    @GetMapping("/started")
    @Operation(summary = "Récupérer toutes les routes démarrées",
               description = "Retourne toutes les routes avec started=true pour calculer les distances")
    public ResponseEntity<List<UserRouteInfoDTO>> getStartedRoutes() {
        List<RouteEntity> startedRoutes = routeRepository.findByStartedTrue();

        List<UserRouteInfoDTO> routeInfoList = startedRoutes.stream()
                .map(this::convertToUserRouteInfo)
                .collect(Collectors.toList());

        return ResponseEntity.ok(routeInfoList);
    }

    /**
     * Endpoint pour récupérer les routes démarrées d'un chauffeur
     */
    @GetMapping("/chauffeur/{chauffeurId}/started")
    @Operation(summary = "Récupérer les routes démarrées d'un chauffeur",
               description = "Retourne les routes en cours pour un chauffeur spécifique")
    public ResponseEntity<List<UserRouteInfoDTO>> getStartedRoutesByChauffeur(@PathVariable String chauffeurId) {
        List<RouteEntity> startedRoutes = routeRepository.findByChauffeurIdAndStartedTrue(chauffeurId);

        List<UserRouteInfoDTO> routeInfoList = startedRoutes.stream()
                .map(this::convertToUserRouteInfo)
                .collect(Collectors.toList());

        return ResponseEntity.ok(routeInfoList);
    }

    /**
     * Endpoint pour récupérer les routes par relation userId et chauffeurId
     */
    @GetMapping("/user-chauffeur")
    @Operation(summary = "Récupérer les routes par userId et chauffeurId",
               description = "Retourne les routes associées à un utilisateur et un chauffeur")
    public ResponseEntity<List<UserRouteInfoDTO>> getRoutesByUserAndChauffeur(
            @RequestParam String userId,
            @RequestParam String chauffeurId) {

        List<RouteEntity> routes = routeRepository.findByUserIdAndChauffeurId(userId, chauffeurId);

        List<UserRouteInfoDTO> routeInfoList = routes.stream()
                .map(this::convertToUserRouteInfo)
                .collect(Collectors.toList());

        return ResponseEntity.ok(routeInfoList);
    }

    /**
     * Endpoint pour calculer la distance totale des routes démarrées
     */
    @GetMapping("/started/total-distance")
    @Operation(summary = "Calculer la distance totale des routes démarrées",
               description = "Retourne la somme des distances de toutes les routes en cours")
    public ResponseEntity<Map<String, Object>> getTotalDistanceOfStartedRoutes() {
        List<RouteEntity> startedRoutes = routeRepository.findByStartedTrue();

        double totalDistance = startedRoutes.stream()
                .filter(r -> r.getDistanceKm() != null)
                .mapToDouble(RouteEntity::getDistanceKm)
                .sum();

        int totalDuration = startedRoutes.stream()
                .filter(r -> r.getDurationMin() != null)
                .mapToInt(RouteEntity::getDurationMin)
                .sum();

        Map<String, Object> result = new HashMap<>();
        result.put("totalStartedRoutes", startedRoutes.size());
        result.put("totalDistanceKm", Math.round(totalDistance * 100.0) / 100.0);
        result.put("totalDurationMin", totalDuration);

        return ResponseEntity.ok(result);
    }

    /**
     * Endpoint pour arrêter une route
     */
    @PutMapping("/{id}/stop")
    @Operation(summary = "Arrêter une route",
               description = "Met le statut started à false")
    public ResponseEntity<UserRouteInfoDTO> stopRoute(@PathVariable String id) {
        RouteEntity entity = routeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Route non trouvée: " + id));

        entity.setStarted(false);
        entity.setStatus("COMPLETED");

        RouteEntity savedEntity = routeRepository.save(entity);
        return ResponseEntity.ok(convertToUserRouteInfo(savedEntity));
    }
}