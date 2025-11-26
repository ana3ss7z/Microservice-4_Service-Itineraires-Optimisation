package com.transport.itineraire.controller;

import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.*;

@RestController
public class ApiDocsController {

    @GetMapping(value = "/", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getApiDocs() {
        Map<String, Object> apiDocs = new LinkedHashMap<>();

        // Info
        Map<String, Object> info = new LinkedHashMap<>();
        info.put("title", "Microservice 4 - Service Itinéraires & Optimisation API");
        info.put("description", "API de calcul d'itinéraires et d'optimisation de routes pour le système de transport");
        info.put("version", "1.0.0");
        info.put("baseUrl", "/api");
        apiDocs.put("info", info);

        // Endpoints
        List<Map<String, Object>> endpoints = new ArrayList<>();

        // POST /routes/coordinates
        Map<String, Object> coordinatesEndpoint = new LinkedHashMap<>();
        coordinatesEndpoint.put("method", "POST");
        coordinatesEndpoint.put("path", "/routes/coordinates");
        coordinatesEndpoint.put("summary", "Calculer un itinéraire à partir de coordonnées GPS");
        coordinatesEndpoint.put("description", "Calcule un itinéraire entre un point d'origine et une destination en utilisant les coordonnées GPS");
        coordinatesEndpoint.put("authentication", "Bearer JWT Token");
        Map<String, Object> coordExample = new LinkedHashMap<>();
        coordExample.put("origin", Map.of("name", "Gare Casa Voyageurs", "latitude", 33.5883, "longitude", -7.6114, "city", "Casablanca"));
        coordExample.put("destination", Map.of("name", "Gare Rabat Ville", "latitude", 34.0181, "longitude", -6.8326, "city", "Rabat"));
        coordExample.put("includeReturn", true);
        coordExample.put("userId", "user123");
        coordinatesEndpoint.put("requestBody", coordExample);
        Map<String, String> coordTests = new LinkedHashMap<>();
        coordTests.put("powershell", "$headers = @{'Content-Type'='application/json'; 'Authorization'='Bearer YOUR_JWT_TOKEN'}; $body = '{\"origin\":{\"latitude\":33.5883,\"longitude\":-7.6114},\"destination\":{\"latitude\":34.0181,\"longitude\":-6.8326},\"includeReturn\":true,\"userId\":\"user123\"}'; Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/coordinates' -Method POST -Headers $headers -Body $body");
        coordTests.put("curl", "curl -X POST 'http://172.30.80.11:31030/api/routes/coordinates' -H 'Content-Type: application/json' -H 'Authorization: Bearer YOUR_JWT_TOKEN' -d '{\"origin\":{\"latitude\":33.5883,\"longitude\":-7.6114},\"destination\":{\"latitude\":34.0181,\"longitude\":-6.8326},\"includeReturn\":true,\"userId\":\"user123\"}'");
        coordTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/coordinates', {method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer YOUR_JWT_TOKEN'}, body:JSON.stringify({origin:{latitude:33.5883,longitude:-7.6114},destination:{latitude:34.0181,longitude:-6.8326},includeReturn:true,userId:'user123'})}).then(r=>r.json()).then(console.log)");
        coordinatesEndpoint.put("testExamples", coordTests);
        endpoints.add(coordinatesEndpoint);

        // POST /routes/address
        Map<String, Object> addressEndpoint = new LinkedHashMap<>();
        addressEndpoint.put("method", "POST");
        addressEndpoint.put("path", "/routes/address");
        addressEndpoint.put("summary", "Calculer un itinéraire à partir d'adresses");
        addressEndpoint.put("description", "Calcule un itinéraire en utilisant des adresses textuelles (géocodage automatique)");
        addressEndpoint.put("authentication", "Bearer JWT Token");
        Map<String, Object> addrExample = new LinkedHashMap<>();
        addrExample.put("originAddress", "Avenue Mohammed V, Casablanca, Maroc");
        addrExample.put("destinationAddress", "Avenue Hassan II, Rabat, Maroc");
        addrExample.put("includeReturn", false);
        addrExample.put("userId", "user123");
        addressEndpoint.put("requestBody", addrExample);
        Map<String, String> addrTests = new LinkedHashMap<>();
        addrTests.put("powershell", "$headers = @{'Content-Type'='application/json'; 'Authorization'='Bearer YOUR_JWT_TOKEN'}; $body = '{\"originAddress\":\"Avenue Mohammed V, Casablanca\",\"destinationAddress\":\"Avenue Hassan II, Rabat\",\"userId\":\"user123\"}'; Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/address' -Method POST -Headers $headers -Body $body");
        addrTests.put("curl", "curl -X POST 'http://172.30.80.11:31030/api/routes/address' -H 'Content-Type: application/json' -H 'Authorization: Bearer YOUR_JWT_TOKEN' -d '{\"originAddress\":\"Avenue Mohammed V, Casablanca\",\"destinationAddress\":\"Avenue Hassan II, Rabat\",\"userId\":\"user123\"}'");
        addrTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/address', {method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer YOUR_JWT_TOKEN'}, body:JSON.stringify({originAddress:'Avenue Mohammed V, Casablanca',destinationAddress:'Avenue Hassan II, Rabat',userId:'user123'})}).then(r=>r.json()).then(console.log)");
        addressEndpoint.put("testExamples", addrTests);
        endpoints.add(addressEndpoint);

        // POST /routes/optimize
        Map<String, Object> optimizeEndpoint = new LinkedHashMap<>();
        optimizeEndpoint.put("method", "POST");
        optimizeEndpoint.put("path", "/routes/optimize");
        optimizeEndpoint.put("summary", "Optimiser un itinéraire avec plusieurs waypoints");
        optimizeEndpoint.put("description", "Optimise un itinéraire passant par plusieurs waypoints pour minimiser la distance ou le temps");
        optimizeEndpoint.put("authentication", "Bearer JWT Token");
        Map<String, Object> optExample = new LinkedHashMap<>();
        optExample.put("origin", Map.of("latitude", 33.5883, "longitude", -7.6114, "city", "Casablanca"));
        optExample.put("destination", Map.of("latitude", 34.0181, "longitude", -6.8326, "city", "Rabat"));
        optExample.put("waypoints", List.of(Map.of("latitude", 33.8, "longitude", -7.2, "city", "Mohammedia")));
        optExample.put("includeReturn", true);
        optExample.put("userId", "user123");
        optimizeEndpoint.put("requestBody", optExample);
        Map<String, String> optTests = new LinkedHashMap<>();
        optTests.put("powershell", "Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/optimize' -Method POST -Headers @{'Content-Type'='application/json';'Authorization'='Bearer YOUR_JWT_TOKEN'} -Body '{\"origin\":{\"latitude\":33.5883,\"longitude\":-7.6114},\"destination\":{\"latitude\":34.0181,\"longitude\":-6.8326},\"waypoints\":[{\"latitude\":33.8,\"longitude\":-7.2}],\"userId\":\"user123\"}'");
        optTests.put("curl", "curl -X POST 'http://172.30.80.11:31030/api/routes/optimize' -H 'Content-Type: application/json' -H 'Authorization: Bearer YOUR_JWT_TOKEN' -d '{\"origin\":{\"latitude\":33.5883,\"longitude\":-7.6114},\"destination\":{\"latitude\":34.0181,\"longitude\":-6.8326},\"waypoints\":[{\"latitude\":33.8,\"longitude\":-7.2}],\"userId\":\"user123\"}'");
        optTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/optimize', {method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer YOUR_JWT_TOKEN'}, body:JSON.stringify({origin:{latitude:33.5883,longitude:-7.6114},destination:{latitude:34.0181,longitude:-6.8326},waypoints:[{latitude:33.8,longitude:-7.2}],userId:'user123'})}).then(r=>r.json()).then(console.log)");
        optimizeEndpoint.put("testExamples", optTests);
        endpoints.add(optimizeEndpoint);

        // GET /routes/history
        Map<String, Object> historyEndpoint = new LinkedHashMap<>();
        historyEndpoint.put("method", "GET");
        historyEndpoint.put("path", "/routes/history");
        historyEndpoint.put("summary", "Récupérer l'historique des itinéraires");
        historyEndpoint.put("description", "Retourne une liste paginée des itinéraires calculés pour un utilisateur");
        historyEndpoint.put("authentication", "Bearer JWT Token");
        historyEndpoint.put("parameters", List.of(
            Map.of("name", "userId", "type", "string", "required", true, "description", "Identifiant de l'utilisateur"),
            Map.of("name", "page", "type", "integer", "required", false, "default", 0, "description", "Numéro de page"),
            Map.of("name", "size", "type", "integer", "required", false, "default", 20, "description", "Éléments par page")
        ));
        Map<String, String> histTests = new LinkedHashMap<>();
        histTests.put("powershell", "Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/history?userId=user123&page=0&size=20' -Method GET -Headers @{'Authorization'='Bearer YOUR_JWT_TOKEN'}");
        histTests.put("curl", "curl -X GET 'http://172.30.80.11:31030/api/routes/history?userId=user123&page=0&size=20' -H 'Authorization: Bearer YOUR_JWT_TOKEN'");
        histTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/history?userId=user123&page=0&size=20', {headers:{'Authorization':'Bearer YOUR_JWT_TOKEN'}}).then(r=>r.json()).then(console.log)");
        historyEndpoint.put("testExamples", histTests);
        endpoints.add(historyEndpoint);

        // GET /routes/{id}
        Map<String, Object> getByIdEndpoint = new LinkedHashMap<>();
        getByIdEndpoint.put("method", "GET");
        getByIdEndpoint.put("path", "/routes/{id}");
        getByIdEndpoint.put("summary", "Récupérer un itinéraire par ID");
        getByIdEndpoint.put("description", "Retourne les détails complets d'un itinéraire spécifique");
        getByIdEndpoint.put("authentication", "Bearer JWT Token");
        getByIdEndpoint.put("parameters", List.of(Map.of("name", "id", "type", "string", "required", true, "description", "ID de l'itinéraire")));
        Map<String, String> idTests = new LinkedHashMap<>();
        idTests.put("powershell", "Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/YOUR_ROUTE_ID' -Method GET -Headers @{'Authorization'='Bearer YOUR_JWT_TOKEN'}");
        idTests.put("curl", "curl -X GET 'http://172.30.80.11:31030/api/routes/YOUR_ROUTE_ID' -H 'Authorization: Bearer YOUR_JWT_TOKEN'");
        idTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/YOUR_ROUTE_ID', {headers:{'Authorization':'Bearer YOUR_JWT_TOKEN'}}).then(r=>r.json()).then(console.log)");
        getByIdEndpoint.put("testExamples", idTests);
        endpoints.add(getByIdEndpoint);

        // GET /routes/health
        Map<String, Object> healthEndpoint = new LinkedHashMap<>();
        healthEndpoint.put("method", "GET");
        healthEndpoint.put("path", "/routes/health");
        healthEndpoint.put("summary", "Vérifier l'état du service");
        healthEndpoint.put("description", "Health check - vérifie si le service est opérationnel");
        healthEndpoint.put("authentication", "None");
        Map<String, String> healthTests = new LinkedHashMap<>();
        healthTests.put("powershell", "Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/health' -Method GET");
        healthTests.put("curl", "curl -X GET 'http://172.30.80.11:31030/api/routes/health'");
        healthTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/health').then(r=>r.text()).then(console.log)");
        healthEndpoint.put("testExamples", healthTests);
        endpoints.add(healthEndpoint);

        // GET /routes/ville
        Map<String, Object> villeEndpoint = new LinkedHashMap<>();
        villeEndpoint.put("method", "GET");
        villeEndpoint.put("path", "/routes/ville");
        villeEndpoint.put("summary", "Récupérer toutes les villes");
        villeEndpoint.put("description", "Retourne la liste de toutes les villes disponibles");
        villeEndpoint.put("authentication", "Bearer JWT Token");
        Map<String, String> villeTests = new LinkedHashMap<>();
        villeTests.put("powershell", "Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/ville' -Method GET -Headers @{'Authorization'='Bearer YOUR_JWT_TOKEN'}");
        villeTests.put("curl", "curl -X GET 'http://172.30.80.11:31030/api/routes/ville' -H 'Authorization: Bearer YOUR_JWT_TOKEN'");
        villeTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/ville', {headers:{'Authorization':'Bearer YOUR_JWT_TOKEN'}}).then(r=>r.json()).then(console.log)");
        villeEndpoint.put("testExamples", villeTests);
        endpoints.add(villeEndpoint);

        apiDocs.put("endpoints", endpoints);

        // Schemas
        Map<String, Object> schemas = new LinkedHashMap<>();

        schemas.put("Waypoint", Map.of(
            "type", "object",
            "properties", Map.of(
                "name", "string - Nom du point",
                "address", "string - Adresse complète",
                "latitude", "number - Latitude GPS",
                "longitude", "number - Longitude GPS",
                "city", "string - Ville"
            )
        ));

        schemas.put("RouteRequest", Map.of(
            "type", "object",
            "properties", Map.of(
                "origin", "Waypoint - Point d'origine",
                "destination", "Waypoint - Point de destination",
                "originAddress", "string - Adresse d'origine (pour calcul par adresse)",
                "destinationAddress", "string - Adresse de destination",
                "waypoints", "array[Waypoint] - Points intermédiaires (max 25)",
                "includeReturn", "boolean - Inclure le trajet retour",
                "userId", "string - ID de l'utilisateur"
            )
        ));

        schemas.put("RouteResponse", Map.of(
            "type", "object",
            "properties", Map.of(
                "routeId", "string - ID de l'itinéraire",
                "distanceKm", "number - Distance en km",
                "durationMin", "integer - Durée en minutes",
                "returnDistanceKm", "number - Distance retour en km",
                "returnDurationMin", "integer - Durée retour en minutes",
                "totalDistanceKm", "number - Distance totale en km",
                "totalDurationMin", "integer - Durée totale en minutes",
                "status", "string - Statut du calcul",
                "calculatedAt", "datetime - Date du calcul"
            )
        ));

        apiDocs.put("schemas", schemas);

        return ResponseEntity.ok(apiDocs);
    }
}
