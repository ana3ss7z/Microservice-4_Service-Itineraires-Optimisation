package com.transport.itineraire.controller;

import com.transport.itineraire.entity.RouteEntity;
import com.transport.itineraire.entity.VilleEntity;
import com.transport.itineraire.model.*;
import com.transport.itineraire.service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/routes")
@RequiredArgsConstructor
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
}