package com.transport.itineraire.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.transport.itineraire.entity.RouteEntity;
import com.transport.itineraire.model.*;
import com.transport.itineraire.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Service @Slf4j
public class OptimizationService {

    private final RouteRepository repository;
    private final RouteService routeService;
    private final ObjectMapper objectMapper;
    private final GeometryFactory geometryFactory = new GeometryFactory();

    @Value("${optimization.max-waypoints}") private Integer maxWaypoints;

    public OptimizationService(RouteRepository repository,
                               @Lazy RouteService routeService,
                               ObjectMapper objectMapper) {
        this.repository = repository;
        this.routeService = routeService;
        this.objectMapper = objectMapper;
    }

    public RouteResponse optimizeRoute(RouteRequest request) {
        validateRequest(request);

        // CORRECTION: Enrichir les waypoints avec reverse geocoding
        enrichWaypoints(request.getWaypoints());

        List<Waypoint> optimized = nearestNeighborOptimization(request.getWaypoints());
        RouteResponse response = calculateDetails(optimized);

        // CORRECTION: Calcul du retour si demandé
        if (Boolean.TRUE.equals(request.getIncludeReturn())) {
            Waypoint lastPoint = optimized.get(optimized.size() - 1);
            Waypoint firstPoint = optimized.get(0);
            double returnDist = calculateDistance(lastPoint, firstPoint);
            int returnDuration = estimateDuration(returnDist);

            response.setReturnDistanceKm(Math.round(returnDist * 100.0) / 100.0);
            response.setReturnDurationMin(returnDuration);
            response.setTotalDistanceKm(
                    Math.round((response.getDistanceKm() + returnDist) * 100.0) / 100.0
            );
            response.setTotalDurationMin(response.getDurationMin() + returnDuration);

            // CORRECTION: Ajout de l'instruction de retour
            List<String> instructions = new ArrayList<>(response.getInstructions());
            String lastName = lastPoint.getName() != null && !lastPoint.getName().isEmpty()
                    ? lastPoint.getName() : lastPoint.getCity();
            String firstName = firstPoint.getName() != null && !firstPoint.getName().isEmpty()
                    ? firstPoint.getName() : firstPoint.getCity();
            instructions.add("Retour de %s à %s: %.2f km".formatted(lastName, firstName, returnDist));
            response.setInstructions(instructions);
        } else {
            response.setTotalDistanceKm(response.getDistanceKm());
            response.setTotalDurationMin(response.getDurationMin());
        }

        saveOptimizedRoute(request, response, optimized);
        return response;
    }

    /**
     * CORRECTION: Enrichir les waypoints avec des informations de localisation
     */
    private void enrichWaypoints(List<Waypoint> waypoints) {
        if (waypoints == null || waypoints.isEmpty()) {
            return;
        }

        for (Waypoint waypoint : waypoints) {
            // Skip if already has address and city
            if (waypoint.getAddress() != null && waypoint.getCity() != null) {
                continue;
            }

            try {
                Waypoint enriched = routeService.reverseGeocode(
                    waypoint.getLatitude(),
                    waypoint.getLongitude()
                );

                if (waypoint.getAddress() == null) {
                    waypoint.setAddress(enriched.getAddress());
                }
                if (waypoint.getCity() == null) {
                    waypoint.setCity(enriched.getCity());
                }
                if (waypoint.getName() == null || waypoint.getName().isEmpty()) {
                    waypoint.setName(enriched.getCity());
                }

                // Small delay to respect Nominatim usage policy (max 1 request/second)
                Thread.sleep(1100);
            } catch (Exception e) {
                log.warn("Failed to enrich waypoint {}, {}: {}",
                    waypoint.getLatitude(), waypoint.getLongitude(), e.getMessage());
            }
        }
    }

    private List<Waypoint> nearestNeighborOptimization(List<Waypoint> points) {
        if (points == null || points.size() <= 2) {
            if (points != null) {
                for (int i = 0; i < points.size(); i++) {
                    points.get(i).setOrder(i + 1);
                }
            }
            return points;
        }

        List<Waypoint> result = new ArrayList<>();
        Set<Integer> visited = new HashSet<>();

        Waypoint current = points.get(0);
        result.add(current);
        visited.add(0);

        while (visited.size() < points.size()) {
            int nearest = -1;
            double minDist = Double.MAX_VALUE;

            for (int i = 0; i < points.size(); i++) {
                if (!visited.contains(i)) {
                    double dist = calculateDistance(current, points.get(i));
                    if (dist < minDist) {
                        minDist = dist;
                        nearest = i;
                    }
                }
            }

            if (nearest != -1) {
                current = points.get(nearest);
                result.add(current);
                visited.add(nearest);
            }
        }

        for (int i = 0; i < result.size(); i++) {
            result.get(i).setOrder(i + 1);
        }

        return result;
    }

    private RouteResponse calculateDetails(List<Waypoint> points) {
        double totalDist = 0;
        int totalDuration = 0;
        List<String> instructions = new ArrayList<>();

        for (int i = 0; i < points.size() - 1; i++) {
            Waypoint from = points.get(i);
            Waypoint to = points.get(i + 1);

            double segmentDist = calculateDistance(from, to);
            int segmentDuration = estimateDuration(segmentDist);

            totalDist += segmentDist;
            totalDuration += segmentDuration;

            // CORRECTION: Utiliser name ou city, jamais null
            String fromName = getWaypointDisplayName(from);
            String toName = getWaypointDisplayName(to);

            instructions.add("De %s à %s: %.2f km".formatted(fromName, toName, segmentDist));
        }

        // CORRECTION: Génération de la polyline
        String polyline = generatePolyline(points);

        return RouteResponse.builder()
                .distanceKm(Math.round(totalDist * 100.0) / 100.0)
                .durationMin(totalDuration)
                .steps(points)
                .routePolyline(polyline)
                .instructions(instructions)
                .calculatedAt(LocalDateTime.now())
                .status("SUCCESS")
                .build();
    }

    /**
     * CORRECTION: Obtenir le nom d'affichage d'un waypoint (jamais null)
     */
    private String getWaypointDisplayName(Waypoint waypoint) {
        if (waypoint.getName() != null && !waypoint.getName().isEmpty()) {
            return waypoint.getName();
        }
        if (waypoint.getCity() != null && !waypoint.getCity().isEmpty()) {
            return waypoint.getCity();
        }
        if (waypoint.getAddress() != null && !waypoint.getAddress().isEmpty()) {
            return waypoint.getAddress();
        }
        return String.format("Point (%.4f, %.4f)", waypoint.getLatitude(), waypoint.getLongitude());
    }

    /**
     * CORRECTION: Génération de la polyline
     */
    private String generatePolyline(List<Waypoint> points) {
        if (points == null || points.isEmpty()) {
            return "";
        }

        StringBuilder polyline = new StringBuilder();
        for (int i = 0; i < points.size(); i++) {
            if (i > 0) polyline.append("|");
            polyline.append(points.get(i).getLatitude())
                    .append(",")
                    .append(points.get(i).getLongitude());
        }
        return polyline.toString();
    }

    private double calculateDistance(Waypoint p1, Waypoint p2) {
        double R = 6371;
        double lat1 = Math.toRadians(p1.getLatitude());
        double lat2 = Math.toRadians(p2.getLatitude());
        double dLat = Math.toRadians(p2.getLatitude() - p1.getLatitude());
        double dLon = Math.toRadians(p2.getLongitude() - p1.getLongitude());

        double a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(lat1) * Math.cos(lat2) *
                        Math.sin(dLon/2) * Math.sin(dLon/2);

        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    }

    private int estimateDuration(double distanceKm) {
        double avgSpeedKmh = 60.0;
        return (int) Math.ceil((distanceKm / avgSpeedKmh) * 60);
    }

    private void validateRequest(RouteRequest request) {
        if (request.getWaypoints() == null || request.getWaypoints().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Waypoints vides");
        }
        if (request.getWaypoints().size() > maxWaypoints) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Trop de points: %d (max: %d)", request.getWaypoints().size(), maxWaypoints));
        }
        for (Waypoint wp : request.getWaypoints()) {
            if (wp.getLatitude() == null || wp.getLongitude() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coordonnées manquantes");
            }
        }
    }

    @Transactional
    protected void saveOptimizedRoute(RouteRequest request, RouteResponse response, List<Waypoint> optimized) {
        try {
            Waypoint first = optimized.get(0);
            Waypoint last = optimized.get(optimized.size() - 1);

            Point originPoint = geometryFactory.createPoint(
                    new Coordinate(first.getLongitude(), first.getLatitude())
            );
            originPoint.setSRID(4326);

            Point destPoint = geometryFactory.createPoint(
                    new Coordinate(last.getLongitude(), last.getLatitude())
            );
            destPoint.setSRID(4326);

            RouteEntity entity = RouteEntity.builder()
                    .userId(request.getUserId())
                    .requestId(request.getRequestId())
                    .originPoint(originPoint)
                    .originAddress(first.getAddress())
                    .originCity(first.getCity())
                    .originLatitude(first.getLatitude())
                    .originLongitude(first.getLongitude())
                    .destinationPoint(destPoint)
                    .destinationAddress(last.getAddress())
                    .destinationCity(last.getCity())
                    .destinationLatitude(last.getLatitude())
                    .destinationLongitude(last.getLongitude())
                    .distanceKm(response.getDistanceKm())
                    .durationMin(response.getDurationMin())
                    .returnDistanceKm(response.getReturnDistanceKm())
                    .returnDurationMin(response.getReturnDurationMin())
                    .totalDistanceKm(response.getTotalDistanceKm())
                    .totalDurationMin(response.getTotalDurationMin())
                    .routePolyline(response.getRoutePolyline())
                    .stepsJson(objectMapper.writeValueAsString(optimized))
                    .instructionsJson(objectMapper.writeValueAsString(response.getInstructions()))
                    .includeReturn(request.getIncludeReturn())
                    .isOptimized(true)
                    .optimizationType("heuristic")
                    .createdAt(LocalDateTime.now())
                    .status("SUCCESS")
                    .calculatedBy("OPTIMIZATION")
                    .build();

            RouteEntity saved = repository.save(entity);
            response.setRouteId(saved.getId());

            log.info("Route optimisée sauvegardée: {}", saved.getId());

        } catch (Exception e) {
            log.error("Erreur sauvegarde optimisation: {}", e.getMessage(), e);
        }
    }
}