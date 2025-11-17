package com.transport.itineraire.service;

import com.fasterxml.jackson.databind.*;
import com.transport.itineraire.entity.RouteEntity;
import com.transport.itineraire.model.*;
import com.transport.itineraire.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.locationtech.jts.geom.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service @Slf4j @RequiredArgsConstructor
public class RouteService {

    private final RouteRepository repository;
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;
    private final GeometryFactory geometryFactory = new GeometryFactory();

    @Value("${external.api.nominatim.base-url}") private String nominatimUrl;
    @Value("${external.api.osrm.base-url}") private String osrmUrl;

    public RouteResponse calculateRouteFromCoordinates(RouteRequest request) {
        try {
            String url = String.format("%s/route/v1/car/%f,%f;%f,%f?overview=full&geometries=geojson&steps=true",
                    osrmUrl, request.getOrigin().getLongitude(), request.getOrigin().getLatitude(),
                    request.getDestination().getLongitude(), request.getDestination().getLatitude());

            log.debug("Appel OSRM: {}", url);
            String response = restTemplate.getForObject(url, String.class);

            RouteResponse routeResponse = parseOsrmResponse(response, request);

            // CORRECTION: Calcul du retour si demandé
            if (Boolean.TRUE.equals(request.getIncludeReturn())) {
                RouteRequest returnRequest = RouteRequest.builder()
                        .origin(request.getDestination())
                        .destination(request.getOrigin())
                        .includeReturn(false)
                        .build();

                RouteResponse returnRoute = calculateRouteFromCoordinates(returnRequest);
                routeResponse.setReturnDistanceKm(returnRoute.getDistanceKm());
                routeResponse.setReturnDurationMin(returnRoute.getDurationMin());
                routeResponse.setTotalDistanceKm(
                        Math.round((routeResponse.getDistanceKm() + returnRoute.getDistanceKm()) * 100.0) / 100.0
                );
                routeResponse.setTotalDurationMin(
                        routeResponse.getDurationMin() + returnRoute.getDurationMin()
                );
            } else {
                routeResponse.setTotalDistanceKm(routeResponse.getDistanceKm());
                routeResponse.setTotalDurationMin(routeResponse.getDurationMin());
            }

            // CORRECTION: Sauvegarde et récupération du routeId
            saveRoute(request, routeResponse);

            return routeResponse;

        } catch (Exception e) {
            log.error("Erreur calcul itinéraire: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, e.getMessage());
        }
    }

    public RouteResponse calculateRouteFromAddress(RouteRequest request) {
        try {
            Waypoint origin = geocodeAddress(request.getOriginAddress());
            origin.setAddress(request.getOriginAddress());

            Waypoint destination = geocodeAddress(request.getDestinationAddress());
            destination.setAddress(request.getDestinationAddress());

            request.setOrigin(origin);
            request.setDestination(destination);

            return calculateRouteFromCoordinates(request);
        } catch (Exception e) {
            log.error("Erreur géocodage: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Cacheable("geocoding")
    public Waypoint geocodeAddress(String address) {
        try {
            String url = String.format("%s/search?q=%s&format=json&limit=1&addressdetails=1",
                    nominatimUrl, address.replace(" ", "+"));

            String response = restTemplate.getForObject(url, String.class);
            JsonNode node = objectMapper.readTree(response);

            if (node.isEmpty()) {
                throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Adresse non trouvée: " + address);
            }

            JsonNode first = node.get(0);
            JsonNode addressNode = first.path("address");

            String city = extractCity(addressNode);

            return Waypoint.builder()
                    .latitude(first.get("lat").asDouble())
                    .longitude(first.get("lon").asDouble())
                    .address(first.get("display_name").asText())
                    .city(city)
                    .build();
        } catch (Exception e) {
            log.error("Erreur géocodage: {}", e.getMessage(), e);
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, e.getMessage());
        }
    }

    @Cacheable("reverseGeocoding")
    public Waypoint reverseGeocode(double latitude, double longitude) {
        try {
            String url = String.format("%s/reverse?lat=%f&lon=%f&format=json&addressdetails=1",
                    nominatimUrl, latitude, longitude);

            String response = restTemplate.getForObject(url, String.class);
            JsonNode node = objectMapper.readTree(response);

            if (node.isMissingNode() || node.isNull()) {
                log.warn("Reverse geocoding failed for coordinates: {}, {}", latitude, longitude);
                return Waypoint.builder()
                        .latitude(latitude)
                        .longitude(longitude)
                        .address("Coordonnées: " + latitude + ", " + longitude)
                        .city("Ville inconnue")
                        .build();
            }

            JsonNode addressNode = node.path("address");
            String city = extractCity(addressNode);
            String displayName = node.path("display_name").asText();

            return Waypoint.builder()
                    .latitude(latitude)
                    .longitude(longitude)
                    .address(displayName)
                    .city(city)
                    .build();
        } catch (Exception e) {
            log.warn("Erreur reverse geocoding pour {}, {}: {}", latitude, longitude, e.getMessage());
            return Waypoint.builder()
                    .latitude(latitude)
                    .longitude(longitude)
                    .address("Coordonnées: " + latitude + ", " + longitude)
                    .city("Ville inconnue")
                    .build();
        }
    }

    private String extractCity(JsonNode addressNode) {
        if (addressNode.isMissingNode() || addressNode.isNull()) {
            return null;
        }

        // Try different fields that might contain city name
        if (addressNode.has("city")) {
            return addressNode.get("city").asText();
        }
        if (addressNode.has("town")) {
            return addressNode.get("town").asText();
        }
        if (addressNode.has("village")) {
            return addressNode.get("village").asText();
        }
        if (addressNode.has("municipality")) {
            return addressNode.get("municipality").asText();
        }
        if (addressNode.has("county")) {
            return addressNode.get("county").asText();
        }
        if (addressNode.has("state")) {
            return addressNode.get("state").asText();
        }

        return null;
    }

    /**
     * CORRECTION: Enrichir intelligemment les étapes avec géolocalisation
     * Enrichit des étapes clés et propage les informations aux étapes voisines
     */
    private void enrichStepsWithLocationData(List<Waypoint> steps) {
        if (steps == null || steps.isEmpty()) {
            return;
        }

        try {
            int totalSteps = steps.size();

            // Étape 1: Enrichir le premier waypoint
            if (totalSteps > 0) {
                Waypoint first = steps.get(0);
                Waypoint enriched = reverseGeocode(first.getLatitude(), first.getLongitude());
                first.setAddress(enriched.getAddress());
                first.setCity(enriched.getCity());
                Thread.sleep(1100); // Respect Nominatim rate limit
            }

            // Étape 2: Enrichir le dernier waypoint
            if (totalSteps > 1) {
                Waypoint last = steps.get(totalSteps - 1);
                Waypoint enriched = reverseGeocode(last.getLatitude(), last.getLongitude());
                last.setAddress(enriched.getAddress());
                last.setCity(enriched.getCity());
                Thread.sleep(1100);
            }

            // Étape 3: Enrichir des waypoints intermédiaires espacés (tous les 10 étapes max)
            int interval = Math.max(1, totalSteps / 5); // Max 5 requêtes intermédiaires
            for (int i = interval; i < totalSteps - 1; i += interval) {
                Waypoint waypoint = steps.get(i);
                Waypoint enriched = reverseGeocode(waypoint.getLatitude(), waypoint.getLongitude());
                waypoint.setAddress(enriched.getAddress());
                waypoint.setCity(enriched.getCity());
                Thread.sleep(1100);
            }

            // Étape 4: Propager les informations de ville aux waypoints non enrichis
            propagateCityInfo(steps);

        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.warn("Enrichment interrupted: {}", e.getMessage());
        } catch (Exception e) {
            log.warn("Error during step enrichment: {}", e.getMessage());
        }
    }

    /**
     * CORRECTION: Propager les informations de ville des waypoints enrichis aux non-enrichis
     */
    private void propagateCityInfo(List<Waypoint> steps) {
        if (steps == null || steps.isEmpty()) {
            return;
        }

        // Parcourir et propager la ville du waypoint enrichi le plus proche
        String currentCity = null;
        String currentAddress = null;

        for (Waypoint step : steps) {
            if (step.getCity() != null) {
                currentCity = step.getCity();
                currentAddress = step.getAddress();
            } else if (currentCity != null) {
                // Propager la ville actuelle aux waypoints sans ville
                step.setCity(currentCity);
                // Pour l'adresse, utiliser le nom de la rue si disponible, sinon l'adresse de référence
                if (step.getName() != null && !step.getName().isEmpty()) {
                    step.setAddress(step.getName() + ", " + currentCity);
                } else {
                    step.setAddress(currentAddress);
                }
            }
        }

        // Parcourir en sens inverse pour remplir les premiers éléments si nécessaire
        currentCity = null;
        currentAddress = null;

        for (int i = steps.size() - 1; i >= 0; i--) {
            Waypoint step = steps.get(i);
            if (step.getCity() != null) {
                currentCity = step.getCity();
                currentAddress = step.getAddress();
            } else if (currentCity != null && step.getCity() == null) {
                step.setCity(currentCity);
                if (step.getName() != null && !step.getName().isEmpty()) {
                    step.setAddress(step.getName() + ", " + currentCity);
                } else {
                    step.setAddress(currentAddress);
                }
            }
        }
    }

    private RouteResponse parseOsrmResponse(String osrmResponse, RouteRequest request) throws Exception {
        JsonNode root = objectMapper.readTree(osrmResponse);

        if (!"Ok".equals(root.get("code").asText())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Erreur OSRM: " + root.path("message").asText("Erreur inconnue"));
        }

        JsonNode route = root.get("routes").get(0);
        Double distance = route.get("distance").asDouble() / 1000.0;
        Integer duration = (int) (route.get("duration").asDouble() / 60.0);

        // CORRECTION: Extraction des étapes détaillées
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

        // CORRECTION: Enrichir les étapes avec reverse geocoding de manière intelligente
        enrichStepsWithLocationData(steps);

        // CORRECTION: Enrichir origin et destination avec reverse geocoding si nécessaire
        if (request.getOrigin() != null && request.getOrigin().getAddress() == null) {
            try {
                Waypoint enrichedOrigin = reverseGeocode(
                    request.getOrigin().getLatitude(),
                    request.getOrigin().getLongitude()
                );
                request.getOrigin().setAddress(enrichedOrigin.getAddress());
                request.getOrigin().setCity(enrichedOrigin.getCity());
            } catch (Exception e) {
                log.debug("Skip origin enrichment: {}", e.getMessage());
            }
        }

        if (request.getDestination() != null && request.getDestination().getAddress() == null) {
            try {
                Waypoint enrichedDest = reverseGeocode(
                    request.getDestination().getLatitude(),
                    request.getDestination().getLongitude()
                );
                request.getDestination().setAddress(enrichedDest.getAddress());
                request.getDestination().setCity(enrichedDest.getCity());
            } catch (Exception e) {
                log.debug("Skip destination enrichment: {}", e.getMessage());
            }
        }

        // CORRECTION: Génération de la polyline
        String polyline = generatePolyline(steps);

        // CORRECTION: Génération des instructions
        List<String> instructions = generateInstructions(steps, request);

        return RouteResponse.builder()
                .routeId(UUID.randomUUID().toString()) // CORRECTION: Génération temporaire d'ID
                .distanceKm(Math.round(distance * 100.0) / 100.0)
                .durationMin(duration)
                .steps(steps)
                .routePolyline(polyline)
                .instructions(instructions)
                .calculatedAt(LocalDateTime.now())
                .status("SUCCESS")
                .build();
    }

    /**
     * CORRECTION: Génération de la polyline à partir des étapes
     */
    private String generatePolyline(List<Waypoint> steps) {
        if (steps == null || steps.isEmpty()) {
            return "";
        }

        StringBuilder polyline = new StringBuilder();
        for (int i = 0; i < steps.size(); i++) {
            if (i > 0) polyline.append("|");
            polyline.append(steps.get(i).getLatitude())
                    .append(",")
                    .append(steps.get(i).getLongitude());
        }
        return polyline.toString();
    }

    /**
     * CORRECTION: Génération des instructions de navigation
     */
    private List<String> generateInstructions(List<Waypoint> steps, RouteRequest request) {
        List<String> instructions = new ArrayList<>();

        if (steps == null || steps.size() < 2) {
            return instructions;
        }

        String originName = request.getOrigin().getName() != null
                ? request.getOrigin().getName()
                : request.getOrigin().getCity();

        String destName = request.getDestination().getName() != null
                ? request.getDestination().getName()
                : request.getDestination().getCity();

        instructions.add(String.format("Départ de %s", originName));

        // Instructions intermédiaires
        for (int i = 1; i < steps.size() - 1; i++) {
            String stepName = steps.get(i).getName();
            if (stepName != null && !stepName.isEmpty()) {
                instructions.add(String.format("Continuer sur %s", stepName));
            }
        }

        instructions.add(String.format("Arrivée à %s", destName));

        return instructions;
    }

    @Transactional
    private void saveRoute(RouteRequest request, RouteResponse response) {
        try {
            Point originPoint = geometryFactory.createPoint(
                    new Coordinate(request.getOrigin().getLongitude(), request.getOrigin().getLatitude())
            );
            originPoint.setSRID(4326);

            Point destPoint = geometryFactory.createPoint(
                    new Coordinate(request.getDestination().getLongitude(), request.getDestination().getLatitude())
            );
            destPoint.setSRID(4326);

            RouteEntity entity = RouteEntity.builder()
                    .userId(request.getUserId())
                    .requestId(request.getRequestId())
                    .originPoint(originPoint)
                    .originAddress(request.getOrigin().getAddress())
                    .originCity(request.getOrigin().getCity())
                    .originLatitude(request.getOrigin().getLatitude())
                    .originLongitude(request.getOrigin().getLongitude())
                    .destinationPoint(destPoint)
                    .destinationAddress(request.getDestination().getAddress())
                    .destinationCity(request.getDestination().getCity())
                    .destinationLatitude(request.getDestination().getLatitude())
                    .destinationLongitude(request.getDestination().getLongitude())
                    .distanceKm(response.getDistanceKm())
                    .durationMin(response.getDurationMin())
                    .returnDistanceKm(response.getReturnDistanceKm())
                    .returnDurationMin(response.getReturnDurationMin())
                    .totalDistanceKm(response.getTotalDistanceKm())
                    .totalDurationMin(response.getTotalDurationMin())
                    .routePolyline(response.getRoutePolyline())
                    .stepsJson(objectMapper.writeValueAsString(response.getSteps()))
                    .instructionsJson(objectMapper.writeValueAsString(response.getInstructions()))
                    .includeReturn(request.getIncludeReturn())
                    .isOptimized(false)
                    .createdAt(LocalDateTime.now())
                    .status("SUCCESS")
                    .calculatedBy("OSRM")
                    .build();

            RouteEntity saved = repository.save(entity);
            response.setRouteId(saved.getId());

            log.info("Route sauvegardée: {}", saved.getId());

        } catch (Exception e) {
            log.error("Erreur sauvegarde: {}", e.getMessage(), e);
        }
    }

    public Page<RouteEntity> getRouteHistory(String userId, Pageable pageable) {
        return repository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public RouteEntity getRouteById(String id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Route non trouvée"));
    }
}