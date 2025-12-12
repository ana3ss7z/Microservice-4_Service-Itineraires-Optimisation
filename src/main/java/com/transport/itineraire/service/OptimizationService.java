package com.transport.itineraire.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.transport.itineraire.entity.RouteEntity;
import com.transport.itineraire.model.*;
import com.transport.itineraire.repository.RouteRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.*;

@Service @Slf4j
public class OptimizationService {

    private final RouteRepository repository;
    private final RouteService routeService;
    private final ObjectMapper objectMapper;

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

        // CORRECTION: Construire la liste complète des points incluant origin et destination
        List<Waypoint> allPoints = buildCompletePointsList(request);

        // CORRECTION: Enrichir les waypoints avec reverse geocoding
        enrichWaypoints(allPoints);

        // CORRECTION: Optimiser uniquement les waypoints intermédiaires, pas origin/destination
        List<Waypoint> optimized = optimizeWithOriginAndDestination(allPoints, request.getOrigin(), request.getDestination());
        RouteResponse response = calculateDetails(optimized);

        // CORRECTION: Calcul du retour si demandé (retour vers l'origin)
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
            String lastName = getWaypointDisplayName(lastPoint);
            String firstName = getWaypointDisplayName(firstPoint);
            instructions.add("Retour de %s à %s: %.2f km".formatted(lastName, firstName, returnDist));
            response.setInstructions(instructions);
        } else {
            response.setReturnDistanceKm(0.0);
            response.setReturnDurationMin(0);
            response.setTotalDistanceKm(response.getDistanceKm());
            response.setTotalDurationMin(response.getDurationMin());
        }

        saveOptimizedRoute(request, response, optimized);
        return response;
    }

    /**
     * Construit la liste complète des points: origin + waypoints + destination
     */
    private List<Waypoint> buildCompletePointsList(RouteRequest request) {
        List<Waypoint> allPoints = new ArrayList<>();

        // Ajouter l'origin si présent
        if (request.getOrigin() != null) {
            Waypoint origin = request.getOrigin();
            if (origin.getName() == null || origin.getName().isEmpty()) {
                origin.setName("Origin");
            }
            allPoints.add(origin);
        }

        // Ajouter les waypoints intermédiaires
        if (request.getWaypoints() != null) {
            allPoints.addAll(request.getWaypoints());
        }

        // Ajouter la destination si présente et différente de l'origin
        if (request.getDestination() != null) {
            Waypoint destination = request.getDestination();
            if (destination.getName() == null || destination.getName().isEmpty()) {
                destination.setName("Destination");
            }
            // Vérifier si la destination est différente de l'origin
            if (request.getOrigin() == null ||
                !isSameLocation(request.getOrigin(), destination)) {
                allPoints.add(destination);
            }
        }

        return allPoints;
    }

    /**
     * Vérifie si deux waypoints sont au même endroit
     */
    private boolean isSameLocation(Waypoint w1, Waypoint w2) {
        if (w1 == null || w2 == null) return false;
        double tolerance = 0.001; // ~111 mètres
        return Math.abs(w1.getLatitude() - w2.getLatitude()) < tolerance &&
               Math.abs(w1.getLongitude() - w2.getLongitude()) < tolerance;
    }

    /**
     * Optimise le trajet en gardant l'origin au début et la destination à la fin
     * Les waypoints intermédiaires sont optimisés avec l'algorithme nearest neighbor
     */
    private List<Waypoint> optimizeWithOriginAndDestination(List<Waypoint> allPoints, Waypoint origin, Waypoint destination) {
        // Si pas d'origin/destination spécifiés, utiliser l'ancien algorithme
        if (origin == null && destination == null) {
            return nearestNeighborOptimization(allPoints);
        }

        // Si on a 2 points ou moins, pas besoin d'optimiser
        if (allPoints.size() <= 2) {
            for (int i = 0; i < allPoints.size(); i++) {
                allPoints.get(i).setOrder(i + 1);
            }
            return allPoints;
        }

        List<Waypoint> result = new ArrayList<>();

        // Si origin est spécifié, commencer par lui
        Waypoint startPoint = null;
        Waypoint endPoint = null;
        List<Waypoint> intermediatePoints = new ArrayList<>();

        for (Waypoint point : allPoints) {
            if (origin != null && isSameLocation(point, origin)) {
                startPoint = point;
            } else if (destination != null && isSameLocation(point, destination)) {
                endPoint = point;
            } else {
                intermediatePoints.add(point);
            }
        }

        // Si origin et destination sont identiques (circuit), on optimise différemment
        boolean isCircuit = origin != null && destination != null && isSameLocation(origin, destination);

        if (isCircuit) {
            // Circuit: origin -> waypoints optimisés -> retour à origin
            if (startPoint != null) {
                result.add(startPoint);
            }

            // Optimiser les points intermédiaires à partir du point de départ
            if (!intermediatePoints.isEmpty()) {
                List<Waypoint> optimizedMiddle = nearestNeighborFromStart(
                    intermediatePoints,
                    startPoint != null ? startPoint : intermediatePoints.get(0)
                );
                result.addAll(optimizedMiddle);
            }
            // Pour un circuit, on ne rajoute pas la destination car c'est le même que l'origin
            // Le retour sera calculé séparément si includeReturn est true
        } else {
            // Trajet linéaire: origin -> waypoints optimisés -> destination
            if (startPoint != null) {
                result.add(startPoint);
            }

            // Optimiser les points intermédiaires
            if (!intermediatePoints.isEmpty()) {
                Waypoint fromPoint = startPoint != null ? startPoint : intermediatePoints.get(0);
                List<Waypoint> optimizedMiddle = nearestNeighborBetweenPoints(
                    intermediatePoints,
                    fromPoint,
                    endPoint
                );
                result.addAll(optimizedMiddle);
            }

            if (endPoint != null) {
                result.add(endPoint);
            }
        }

        // Assigner les ordres
        for (int i = 0; i < result.size(); i++) {
            result.get(i).setOrder(i + 1);
        }

        return result;
    }

    /**
     * Optimisation nearest neighbor à partir d'un point de départ
     */
    private List<Waypoint> nearestNeighborFromStart(List<Waypoint> points, Waypoint startFrom) {
        if (points == null || points.isEmpty()) {
            return new ArrayList<>();
        }

        List<Waypoint> result = new ArrayList<>();
        Set<Integer> visited = new HashSet<>();
        Waypoint current = startFrom;

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

        return result;
    }

    /**
     * Optimisation nearest neighbor entre deux points fixes (start et end)
     */
    private List<Waypoint> nearestNeighborBetweenPoints(List<Waypoint> points, Waypoint start, Waypoint end) {
        if (points == null || points.isEmpty()) {
            return new ArrayList<>();
        }

        // Simple nearest neighbor depuis le point de départ
        return nearestNeighborFromStart(points, start);
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
        if (points.size() < 2) {
            // Handle case with fewer than 2 points
            String polyline = generatePolyline(points);
            return RouteResponse.builder()
                    .distanceKm(0.0)
                    .durationMin(0)
                    .steps(points)
                    .routePolyline(polyline)
                    .instructions(new ArrayList<>())
                    .calculatedAt(LocalDateTime.now())
                    .status("SUCCESS")
                    .build();
        }

        // For optimization, we can create the route using a single OSRM call with all points
        // if the number of points is reasonable (less than typical OSRM limit)
        if (points.size() <= 10) { // OSRM typically supports up to 150 coordinates but performance degrades
            return calculateOptimizedRouteWithAllPoints(points);
        } else {
            // For many points, use segments approach but with timeout handling
            return calculateOptimizedRouteWithSegments(points);
        }
    }

    /**
     * Calculate optimized route using a single request with all points
     */
    private RouteResponse calculateOptimizedRouteWithAllPoints(List<Waypoint> points) {
        try {
            // Build a single OSRM request with all optimized points
            StringBuilder urlBuilder = new StringBuilder();
            urlBuilder.append(routeService.getOsrmUrl()).append("/route/v1/driving/");

            // Add all lon,lat coordinates to the URL
            for (int i = 0; i < points.size(); i++) {
                Waypoint wp = points.get(i);
                if (i > 0) urlBuilder.append(";");
                urlBuilder.append(wp.getLongitude()).append(",").append(wp.getLatitude());
            }

            urlBuilder.append("?overview=full&geometries=geojson&steps=true");

            String url = urlBuilder.toString();
            log.debug("Appel OSRM optimisé: {}", url);

            // Use restTemplate from routeService
            org.springframework.http.ResponseEntity<String> responseEntity =
                routeService.getRestTemplate().getForEntity(url, String.class);
            String response = responseEntity.getBody();

            // Create a temporary request to re-use the existing parsing logic
            RouteRequest tempRequest = RouteRequest.builder()
                    .origin(points.get(0))
                    .destination(points.get(points.size() - 1))
                    .includeReturn(false)
                    .build();

            // Parse the response using the existing method from RouteService
            // We'll need to temporarily call this on the full route data
            ObjectMapper mapper = objectMapper; // Use the local ObjectMapper
            JsonNode root = mapper.readTree(response);

            if (!"Ok".equals(root.get("code").asText())) {
                throw new RuntimeException("Erreur OSRM: " + root.path("message").asText("Erreur inconnue"));
            }

            JsonNode route = root.get("routes").get(0);
            Double distance = route.get("distance").asDouble() / 1000.0;
            Integer duration = (int) (route.get("duration").asDouble() / 60.0);

            // Extract detailed steps
            List<Waypoint> steps = new ArrayList<>();
            JsonNode legs = route.path("legs");
            int stepOrder = 1;

            if (legs.isArray() && legs.size() > 0) {
                for (JsonNode leg : legs) {
                    JsonNode stepsNode = leg.path("steps");
                    if (stepsNode.isArray()) {
                        for (JsonNode step : stepsNode) {
                            JsonNode maneuver = step.path("maneuver");
                            JsonNode location = maneuver.path("location");

                            if (location.isArray() && location.size() == 2) {
                                double longitude = location.get(0).asDouble();
                                double latitude = location.get(1).asDouble();
                                String name = step.path("name").asText("");

                                Waypoint waypoint = Waypoint.builder()
                                        .longitude(longitude)
                                        .latitude(latitude)
                                        .name(name)
                                        .order(stepOrder++)
                                        .build();

                                steps.add(waypoint);
                            }
                        }
                    }
                }
            }

            // Extract geometry for polyline
            List<Waypoint> fullRouteGeometry = new ArrayList<>();
            JsonNode geometry = route.path("geometry");
            if (geometry != null && !geometry.isNull()) {
                JsonNode coordinates = geometry.path("coordinates");
                if (coordinates.isArray()) {
                    for (JsonNode coord : coordinates) {
                        if (coord.isArray() && coord.size() >= 2) {
                            double longitude = coord.get(0).asDouble();
                            double latitude = coord.get(1).asDouble();

                            Waypoint wp = Waypoint.builder()
                                    .longitude(longitude)
                                    .latitude(latitude)
                                    .name("Route Point")
                                    .order(0) // Geometry points don't have step order
                                    .build();
                            fullRouteGeometry.add(wp);
                        }
                    }
                }
            }

            // Generate instructions
            List<String> instructions = new ArrayList<>();
            for (int i = 0; i < points.size() - 1; i++) {
                String fromName = getWaypointDisplayName(points.get(i));
                String toName = getWaypointDisplayName(points.get(i + 1));
                instructions.add("De %s à %s".formatted(fromName, toName));
            }

            String polyline = generatePolyline(fullRouteGeometry);

            return RouteResponse.builder()
                    .distanceKm(Math.round(distance * 100.0) / 100.0)
                    .durationMin(duration)
                    .steps(points) // Include original optimized sequence
                    .routePolyline(polyline) // Use actual route geometry
                    .instructions(instructions)
                    .calculatedAt(LocalDateTime.now())
                    .status("SUCCESS")
                    .build();

        } catch (Exception e) {
            log.warn("Failed to get detailed route with all points: {}", e.getMessage());
            // Fall back to segment approach if single request fails
            return calculateOptimizedRouteWithSegments(points);
        }
    }

    /**
     * Calculate optimized route by processing segments one by one
     */
    private RouteResponse calculateOptimizedRouteWithSegments(List<Waypoint> points) {
        double totalDist = 0;
        int totalDuration = 0;
        List<String> allInstructions = new ArrayList<>();
        List<Waypoint> fullRouteGeometry = new ArrayList<>();

        for (int i = 0; i < points.size() - 1; i++) {
            Waypoint from = points.get(i);
            Waypoint to = points.get(i + 1);

            try {
                // Use the helper method from RouteService to get the actual route between points
                RouteResponse segmentResponse = routeService.calculateRouteBetweenPoints(from, to);

                // Accumulate the actual route geometry for visualization
                if (i == 0) {
                    // For the first segment, add all points
                    fullRouteGeometry.addAll(segmentResponse.getSteps());
                } else {
                    // For subsequent segments, skip the first point to avoid duplicate connections
                    if (!segmentResponse.getSteps().isEmpty()) {
                        fullRouteGeometry.addAll(segmentResponse.getSteps().subList(1, segmentResponse.getSteps().size()));
                    }
                }

                // Add the distance and duration for this segment
                totalDist += segmentResponse.getDistanceKm();
                totalDuration += segmentResponse.getDurationMin();

                // Add the instructions from this segment
                if (segmentResponse.getInstructions() != null) {
                    allInstructions.addAll(segmentResponse.getInstructions());
                }

                // Add a summary instruction
                String fromName = getWaypointDisplayName(from);
                String toName = getWaypointDisplayName(to);
                allInstructions.add("Segment %d: De %s à %s: %.2f km".formatted(i+1, fromName, toName, segmentResponse.getDistanceKm()));

            } catch (Exception e) {
                log.warn("Failed to get detailed route from {} to {}: {}",
                    getWaypointDisplayName(from), getWaypointDisplayName(to), e.getMessage());

                // Fallback to straight line calculation if actual route calculation fails
                double segmentDist = calculateDistance(from, to);
                int segmentDuration = estimateDuration(segmentDist);

                totalDist += segmentDist;
                totalDuration += segmentDuration;

                String fromName = getWaypointDisplayName(from);
                String toName = getWaypointDisplayName(to);
                allInstructions.add("Segment %d: De %s à %s: %.2f km (calcul estimé)".formatted(i+1, fromName, toName, segmentDist));

                // For fallback, add both waypoints to maintain the path
                if (i == 0) {
                    fullRouteGeometry.add(from);
                }
                fullRouteGeometry.add(to);
            }
        }

        // If no geometry was retrieved, fall back to using the waypoint points
        if (fullRouteGeometry.isEmpty() && !points.isEmpty()) {
            fullRouteGeometry.addAll(points);
        }

        // Generate the polyline from the actual route geometry
        String polyline = generatePolyline(fullRouteGeometry);

        return RouteResponse.builder()
                .distanceKm(Math.round(totalDist * 100.0) / 100.0)
                .durationMin(totalDuration)
                .steps(points) // Still include the optimized sequence as steps
                .routePolyline(polyline) // Use the actual route geometry for visualization
                .instructions(allInstructions)
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
        // Compter le nombre total de points (origin + waypoints + destination)
        int totalPoints = 0;

        if (request.getOrigin() != null &&
            request.getOrigin().getLatitude() != null &&
            request.getOrigin().getLongitude() != null) {
            totalPoints++;
        }

        if (request.getWaypoints() != null) {
            totalPoints += request.getWaypoints().size();
        }

        if (request.getDestination() != null &&
            request.getDestination().getLatitude() != null &&
            request.getDestination().getLongitude() != null) {
            // Ne pas compter si destination = origin (circuit)
            if (request.getOrigin() == null || !isSameLocation(request.getOrigin(), request.getDestination())) {
                totalPoints++;
            }
        }

        // Validation: minimum 2 points pour calculer une route
        if (totalPoints < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Au moins 2 points sont requis (origin + destination ou waypoints)");
        }

        // Validation: maximum de waypoints
        if (totalPoints > maxWaypoints) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    String.format("Trop de points: %d (max: %d)", totalPoints, maxWaypoints));
        }

        // Validation des coordonnées de l'origin
        if (request.getOrigin() != null) {
            if (request.getOrigin().getLatitude() == null || request.getOrigin().getLongitude() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coordonnées de l'origin manquantes");
            }
        }

        // Validation des coordonnées de la destination
        if (request.getDestination() != null) {
            if (request.getDestination().getLatitude() == null || request.getDestination().getLongitude() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coordonnées de la destination manquantes");
            }
        }

        // Validation des waypoints
        if (request.getWaypoints() != null) {
            for (Waypoint wp : request.getWaypoints()) {
                if (wp.getLatitude() == null || wp.getLongitude() == null) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Coordonnées manquantes dans les waypoints");
                }
            }
        }
    }

    @Transactional
    protected void saveOptimizedRoute(RouteRequest request, RouteResponse response, List<Waypoint> optimized) {
        try {
            Waypoint first = optimized.get(0);
            Waypoint last = optimized.get(optimized.size() - 1);

            RouteEntity entity = RouteEntity.builder()
                    .userId(request.getUserId())
                    .requestId(request.getRequestId())
                    .originAddress(first.getAddress())
                    .originCity(first.getCity())
                    .originLatitude(first.getLatitude())
                    .originLongitude(first.getLongitude())
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
            // Generate a temporary ID if saving fails, so service still returns a consistent response
            if (response.getRouteId() == null) {
                response.setRouteId(java.util.UUID.randomUUID().toString());
            }
        }
    }
}