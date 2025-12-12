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

        // PUT /routes/{id}/start
        Map<String, Object> startEndpoint = new LinkedHashMap<>();
        startEndpoint.put("method", "PUT");
        startEndpoint.put("path", "/routes/{id}/start");
        startEndpoint.put("summary", "Démarrer une route");
        startEndpoint.put("description", "Met le statut started à true et enregistre l'heure de départ effective");
        startEndpoint.put("authentication", "Bearer JWT Token");
        startEndpoint.put("parameters", List.of(Map.of("name", "id", "type", "string", "required", true, "description", "ID de l'itinéraire")));
        Map<String, String> startTests = new LinkedHashMap<>();
        startTests.put("powershell", "Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/YOUR_ROUTE_ID/start' -Method PUT -Headers @{'Authorization'='Bearer YOUR_JWT_TOKEN'}");
        startTests.put("curl", "curl -X PUT 'http://172.30.80.11:31030/api/routes/YOUR_ROUTE_ID/start' -H 'Authorization: Bearer YOUR_JWT_TOKEN'");
        startTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/YOUR_ROUTE_ID/start', {method:'PUT', headers:{'Authorization':'Bearer YOUR_JWT_TOKEN'}}).then(r=>r.json()).then(console.log)");
        startEndpoint.put("testExamples", startTests);
        endpoints.add(startEndpoint);

        // PUT /routes/{id}/stop
        Map<String, Object> stopEndpoint = new LinkedHashMap<>();
        stopEndpoint.put("method", "PUT");
        stopEndpoint.put("path", "/routes/{id}/stop");
        stopEndpoint.put("summary", "Arrêter une route");
        stopEndpoint.put("description", "Met le statut started à false");
        stopEndpoint.put("authentication", "Bearer JWT Token");
        stopEndpoint.put("parameters", List.of(Map.of("name", "id", "type", "string", "required", true, "description", "ID de l'itinéraire")));
        Map<String, String> stopTests = new LinkedHashMap<>();
        stopTests.put("powershell", "Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/YOUR_ROUTE_ID/stop' -Method PUT -Headers @{'Authorization'='Bearer YOUR_JWT_TOKEN'}");
        stopTests.put("curl", "curl -X PUT 'http://172.30.80.11:31030/api/routes/YOUR_ROUTE_ID/stop' -H 'Authorization: Bearer YOUR_JWT_TOKEN'");
        stopTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/YOUR_ROUTE_ID/stop', {method:'PUT', headers:{'Authorization':'Bearer YOUR_JWT_TOKEN'}}).then(r=>r.json()).then(console.log)");
        stopEndpoint.put("testExamples", stopTests);
        endpoints.add(stopEndpoint);

        // GET /routes/started
        Map<String, Object> startedEndpoint = new LinkedHashMap<>();
        startedEndpoint.put("method", "GET");
        startedEndpoint.put("path", "/routes/started");
        startedEndpoint.put("summary", "Récupérer toutes les routes démarrées");
        startedEndpoint.put("description", "Retourne toutes les routes avec started=true pour calculer les distances");
        startedEndpoint.put("authentication", "Bearer JWT Token");
        Map<String, String> startedTests = new LinkedHashMap<>();
        startedTests.put("powershell", "Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/started' -Method GET -Headers @{'Authorization'='Bearer YOUR_JWT_TOKEN'}");
        startedTests.put("curl", "curl -X GET 'http://172.30.80.11:31030/api/routes/started' -H 'Authorization: Bearer YOUR_JWT_TOKEN'");
        startedTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/started', {headers:{'Authorization':'Bearer YOUR_JWT_TOKEN'}}).then(r=>r.json()).then(console.log)");
        startedEndpoint.put("testExamples", startedTests);
        endpoints.add(startedEndpoint);

        // GET /routes/chauffeur/{chauffeurId}/started
        Map<String, Object> chauffeurStartedEndpoint = new LinkedHashMap<>();
        chauffeurStartedEndpoint.put("method", "GET");
        chauffeurStartedEndpoint.put("path", "/routes/chauffeur/{chauffeurId}/started");
        chauffeurStartedEndpoint.put("summary", "Récupérer les routes démarrées d'un chauffeur");
        chauffeurStartedEndpoint.put("description", "Retourne les routes en cours pour un chauffeur spécifique");
        chauffeurStartedEndpoint.put("authentication", "Bearer JWT Token");
        chauffeurStartedEndpoint.put("parameters", List.of(Map.of("name", "chauffeurId", "type", "string", "required", true, "description", "ID du chauffeur")));
        Map<String, String> chauffeurTests = new LinkedHashMap<>();
        chauffeurTests.put("powershell", "Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/chauffeur/YOUR_CHAUFFEUR_ID/started' -Method GET -Headers @{'Authorization'='Bearer YOUR_JWT_TOKEN'}");
        chauffeurTests.put("curl", "curl -X GET 'http://172.30.80.11:31030/api/routes/chauffeur/YOUR_CHAUFFEUR_ID/started' -H 'Authorization: Bearer YOUR_JWT_TOKEN'");
        chauffeurTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/chauffeur/YOUR_CHAUFFEUR_ID/started', {headers:{'Authorization':'Bearer YOUR_JWT_TOKEN'}}).then(r=>r.json()).then(console.log)");
        chauffeurStartedEndpoint.put("testExamples", chauffeurTests);
        endpoints.add(chauffeurStartedEndpoint);

        // GET /routes/user-chauffeur
        Map<String, Object> userChauffeurEndpoint = new LinkedHashMap<>();
        userChauffeurEndpoint.put("method", "GET");
        userChauffeurEndpoint.put("path", "/routes/user-chauffeur");
        userChauffeurEndpoint.put("summary", "Récupérer les routes par userId et chauffeurId");
        userChauffeurEndpoint.put("description", "Retourne les routes associées à un utilisateur et un chauffeur");
        userChauffeurEndpoint.put("authentication", "Bearer JWT Token");
        userChauffeurEndpoint.put("parameters", List.of(
            Map.of("name", "userId", "type", "string", "required", true, "description", "ID de l'utilisateur"),
            Map.of("name", "chauffeurId", "type", "string", "required", true, "description", "ID du chauffeur")
        ));
        Map<String, String> userChauffeurTests = new LinkedHashMap<>();
        userChauffeurTests.put("powershell", "Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/user-chauffeur?userId=user123&chauffeurId=chauffeur456' -Method GET -Headers @{'Authorization'='Bearer YOUR_JWT_TOKEN'}");
        userChauffeurTests.put("curl", "curl -X GET 'http://172.30.80.11:31030/api/routes/user-chauffeur?userId=user123&chauffeurId=chauffeur456' -H 'Authorization: Bearer YOUR_JWT_TOKEN'");
        userChauffeurTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/user-chauffeur?userId=user123&chauffeurId=chauffeur456', {headers:{'Authorization':'Bearer YOUR_JWT_TOKEN'}}).then(r=>r.json()).then(console.log)");
        userChauffeurEndpoint.put("testExamples", userChauffeurTests);
        endpoints.add(userChauffeurEndpoint);

        // GET /routes/started/total-distance
        Map<String, Object> totalDistanceEndpoint = new LinkedHashMap<>();
        totalDistanceEndpoint.put("method", "GET");
        totalDistanceEndpoint.put("path", "/routes/started/total-distance");
        totalDistanceEndpoint.put("summary", "Calculer la distance totale des routes démarrées");
        totalDistanceEndpoint.put("description", "Retourne la somme des distances de toutes les routes en cours");
        totalDistanceEndpoint.put("authentication", "Bearer JWT Token");
        Map<String, String> totalDistTests = new LinkedHashMap<>();
        totalDistTests.put("powershell", "Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/started/total-distance' -Method GET -Headers @{'Authorization'='Bearer YOUR_JWT_TOKEN'}");
        totalDistTests.put("curl", "curl -X GET 'http://172.30.80.11:31030/api/routes/started/total-distance' -H 'Authorization: Bearer YOUR_JWT_TOKEN'");
        totalDistTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/started/total-distance', {headers:{'Authorization':'Bearer YOUR_JWT_TOKEN'}}).then(r=>r.json()).then(console.log)");
        totalDistanceEndpoint.put("testExamples", totalDistTests);
        endpoints.add(totalDistanceEndpoint);

        // POST /routes/demande-info
        Map<String, Object> demandeInfoEndpoint = new LinkedHashMap<>();
        demandeInfoEndpoint.put("method", "POST");
        demandeInfoEndpoint.put("path", "/routes/demande-info");
        demandeInfoEndpoint.put("summary", "Calcul d'itinéraire avec informations de demande");
        demandeInfoEndpoint.put("description", "Calcule l'itinéraire et retourne les informations complètes incluant volume, nature de marchandise et relation userId-chauffeurId");
        demandeInfoEndpoint.put("authentication", "Bearer JWT Token");
        Map<String, Object> demandeExample = new LinkedHashMap<>();
        demandeExample.put("userId", "user123");
        demandeExample.put("chauffeurId", "chauffeur456");
        demandeExample.put("username", "ahmed_benali");
        demandeExample.put("email", "ahmed.benali@email.com");
        demandeExample.put("fullName", "Ahmed Ben Ali");
        demandeExample.put("phone", "+212 6 12 34 56 78");
        demandeExample.put("volume", 15.5);
        demandeExample.put("natureMarchandise", "Meubles de salon");
        demandeExample.put("dateDepart", "2025-12-15T10:00:00");
        demandeExample.put("adresseDepart", "123 Rue Mohammed V, Casablanca");
        demandeExample.put("adresseDestination", "456 Avenue Hassan II, Rabat");
        demandeInfoEndpoint.put("requestBody", demandeExample);
        Map<String, String> demandeTests = new LinkedHashMap<>();
        demandeTests.put("powershell", "Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/demande-info' -Method POST -Headers @{'Content-Type'='application/json';'Authorization'='Bearer YOUR_JWT_TOKEN'} -Body '{\"userId\":\"user123\",\"chauffeurId\":\"chauffeur456\",\"volume\":15.5,\"natureMarchandise\":\"Meubles de salon\",\"adresseDepart\":\"123 Rue Mohammed V, Casablanca\",\"adresseDestination\":\"456 Avenue Hassan II, Rabat\"}'");
        demandeTests.put("curl", "curl -X POST 'http://172.30.80.11:31030/api/routes/demande-info' -H 'Content-Type: application/json' -H 'Authorization: Bearer YOUR_JWT_TOKEN' -d '{\"userId\":\"user123\",\"chauffeurId\":\"chauffeur456\",\"volume\":15.5,\"natureMarchandise\":\"Meubles de salon\",\"adresseDepart\":\"123 Rue Mohammed V, Casablanca\",\"adresseDestination\":\"456 Avenue Hassan II, Rabat\"}'");
        demandeTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/demande-info', {method:'POST', headers:{'Content-Type':'application/json','Authorization':'Bearer YOUR_JWT_TOKEN'}, body:JSON.stringify({userId:'user123',chauffeurId:'chauffeur456',volume:15.5,natureMarchandise:'Meubles de salon',adresseDepart:'123 Rue Mohammed V, Casablanca',adresseDestination:'456 Avenue Hassan II, Rabat'})}).then(r=>r.json()).then(console.log)");
        demandeInfoEndpoint.put("testExamples", demandeTests);
        endpoints.add(demandeInfoEndpoint);

        // GET /routes/user-info
        Map<String, Object> userInfoEndpoint = new LinkedHashMap<>();
        userInfoEndpoint.put("method", "GET");
        userInfoEndpoint.put("path", "/routes/user-info");
        userInfoEndpoint.put("summary", "Récupérer toutes les informations utilisateur");
        userInfoEndpoint.put("description", "Retourne les informations complètes incluant totalDistanceKm, totalDurationMin et volume");
        userInfoEndpoint.put("authentication", "Bearer JWT Token");
        userInfoEndpoint.put("parameters", List.of(
            Map.of("name", "userId", "type", "string", "required", true, "description", "ID de l'utilisateur"),
            Map.of("name", "page", "type", "integer", "required", false, "default", 0, "description", "Numéro de page"),
            Map.of("name", "size", "type", "integer", "required", false, "default", 20, "description", "Éléments par page")
        ));
        Map<String, String> userInfoTests = new LinkedHashMap<>();
        userInfoTests.put("powershell", "Invoke-RestMethod -Uri 'http://172.30.80.11:31030/api/routes/user-info?userId=user123&page=0&size=20' -Method GET -Headers @{'Authorization'='Bearer YOUR_JWT_TOKEN'}");
        userInfoTests.put("curl", "curl -X GET 'http://172.30.80.11:31030/api/routes/user-info?userId=user123&page=0&size=20' -H 'Authorization: Bearer YOUR_JWT_TOKEN'");
        userInfoTests.put("fetch", "fetch('http://172.30.80.11:31030/api/routes/user-info?userId=user123&page=0&size=20', {headers:{'Authorization':'Bearer YOUR_JWT_TOKEN'}}).then(r=>r.json()).then(console.log)");
        userInfoEndpoint.put("testExamples", userInfoTests);
        endpoints.add(userInfoEndpoint);


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
                "city", "string - Ville",
                "order", "integer - Ordre dans l'itinéraire (pour les waypoints optimisés)"
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
                "userId", "string - ID de l'utilisateur",
                "requestId", "string - ID de la requête (optionnel)"
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
                "steps", "array[Waypoint] - Étapes de l'itinéraire",
                "instructions", "array[string] - Instructions de navigation",
                "routePolyline", "string - Chemin encodé pour la visualisation sur carte"
            )
        ));

        schemas.put("DemandeRequestDTO", Map.of(
            "type", "object",
            "properties", Map.of(
                "userId", "string - ID de l'utilisateur",
                "chauffeurId", "string - ID du chauffeur",
                "username", "string - Nom d'utilisateur",
                "email", "string - Adresse email de l'utilisateur",
                "fullName", "string - Nom complet de l'utilisateur",
                "phone", "string - Numéro de téléphone de l'utilisateur",
                "volume", "number - Volume de la marchandise (m³)",
                "natureMarchandise", "string - Description de la nature de la marchandise",
                "dateDepart", "datetime - Date et heure de départ prévue",
                "adresseDepart", "string - Adresse de départ"
            )
        ));


        Map<String, Object> userRouteInfoProperties = new LinkedHashMap<>();
        userRouteInfoProperties.put("routeId", "string - ID de l'itinéraire");
        userRouteInfoProperties.put("userId", "string - ID de l'utilisateur");
        userRouteInfoProperties.put("chauffeurId", "string - ID du chauffeur");
        userRouteInfoProperties.put("username", "string - Nom d'utilisateur");
        userRouteInfoProperties.put("email", "string - Email de l'utilisateur");
        userRouteInfoProperties.put("fullName", "string - Nom complet de l'utilisateur");
        userRouteInfoProperties.put("phone", "string - Téléphone de l'utilisateur");
        userRouteInfoProperties.put("adresseDepart", "string - Adresse de départ");
        userRouteInfoProperties.put("adresseDestination", "string - Adresse de destination");
        userRouteInfoProperties.put("originLatitude", "number - Latitude d'origine");
        userRouteInfoProperties.put("originLongitude", "number - Longitude d'origine");
        userRouteInfoProperties.put("originCity", "string - Ville d'origine");
        userRouteInfoProperties.put("destinationLatitude", "number - Latitude de destination");
        userRouteInfoProperties.put("destinationLongitude", "number - Longitude de destination");
        userRouteInfoProperties.put("destinationCity", "string - Ville de destination");
        userRouteInfoProperties.put("totalDistanceKm", "number - Distance totale en km");
        userRouteInfoProperties.put("totalDurationMin", "integer - Durée totale en minutes");
        userRouteInfoProperties.put("distanceKm", "number - Distance aller en km");
        userRouteInfoProperties.put("durationMin", "integer - Durée aller en minutes");
        userRouteInfoProperties.put("returnDistanceKm", "number - Distance retour en km");
        userRouteInfoProperties.put("returnDurationMin", "integer - Durée retour en minutes");
        userRouteInfoProperties.put("volume", "number - Volume de la marchandise");
        userRouteInfoProperties.put("natureMarchandise", "string - Nature de la marchandise");
        userRouteInfoProperties.put("dateDepart", "datetime - Date de départ");
        userRouteInfoProperties.put("estimatedArrivalTime", "datetime - Heure d'arrivée estimée");
        userRouteInfoProperties.put("started", "boolean - Statut de démarrage");
        userRouteInfoProperties.put("startedAt", "datetime - Heure de démarrage réelle");
        userRouteInfoProperties.put("includeReturn", "boolean - Inclure le retour");
        userRouteInfoProperties.put("isOptimized", "boolean - Si l'itinéraire est optimisé");
        userRouteInfoProperties.put("optimizationType", "string - Type d'optimisation");
        userRouteInfoProperties.put("createdAt", "datetime - Date de création");
        userRouteInfoProperties.put("status", "string - Statut de l'itinéraire");
        userRouteInfoProperties.put("calculatedBy", "string - Méthode de calcul");
        userRouteInfoProperties.put("steps", "array[Waypoint] - Points de passage (pour itinéraires optimisés)");

        Map<String, Object> userRouteInfoSchema = new LinkedHashMap<>();
        userRouteInfoSchema.put("type", "object");
        userRouteInfoSchema.put("properties", userRouteInfoProperties);
        schemas.put("UserRouteInfoDTO", userRouteInfoSchema);

        Map<String, Object> routeDTOProperties = new LinkedHashMap<>();
        routeDTOProperties.put("id", "string - ID de l'itinéraire");
        routeDTOProperties.put("userId", "string - ID de l'utilisateur");
        routeDTOProperties.put("originLatitude", "number - Latitude d'origine");
        routeDTOProperties.put("originLongitude", "number - Longitude d'origine");
        routeDTOProperties.put("originAddress", "string - Adresse d'origine");
        routeDTOProperties.put("originCity", "string - Ville d'origine");
        routeDTOProperties.put("destinationLatitude", "number - Latitude de destination");
        routeDTOProperties.put("destinationLongitude", "number - Longitude de destination");
        routeDTOProperties.put("destinationAddress", "string - Adresse de destination");
        routeDTOProperties.put("destinationCity", "string - Ville de destination");
        routeDTOProperties.put("distanceKm", "number - Distance en km");
        routeDTOProperties.put("durationMin", "integer - Durée en minutes");
        routeDTOProperties.put("returnDistanceKm", "number - Distance retour en km");
        routeDTOProperties.put("returnDurationMin", "integer - Durée retour en minutes");
        routeDTOProperties.put("totalDistanceKm", "number - Distance totale en km");
        routeDTOProperties.put("totalDurationMin", "integer - Durée totale en minutes");
        routeDTOProperties.put("includeReturn", "boolean - Inclure le retour");
        routeDTOProperties.put("isOptimized", "boolean - Si l'itinéraire est optimisé");
        routeDTOProperties.put("optimizationType", "string - Type d'optimisation");
        routeDTOProperties.put("createdAt", "datetime - Date de création");
        routeDTOProperties.put("status", "string - Statut de l'itinéraire");
        routeDTOProperties.put("calculatedBy", "string - Méthode de calcul");
        routeDTOProperties.put("steps", "array[Waypoint] - Points de passage (pour itinéraires optimisés)");

        Map<String, Object> routeDTOSchema = new LinkedHashMap<>();
        routeDTOSchema.put("type", "object");
        routeDTOSchema.put("properties", routeDTOProperties);
        schemas.put("RouteDTO", routeDTOSchema);

        Map<String, Object> villeEntityProperties = new LinkedHashMap<>();
        villeEntityProperties.put("id", "integer - ID de la ville");
        villeEntityProperties.put("name", "string - Nom de la ville");
        villeEntityProperties.put("latitude", "number - Latitude GPS");
        villeEntityProperties.put("longitude", "number - Longitude GPS");
        villeEntityProperties.put("createdAt", "datetime - Date de création");

        Map<String, Object> villeEntitySchema = new LinkedHashMap<>();
        villeEntitySchema.put("type", "object");
        villeEntitySchema.put("properties", villeEntityProperties);
        schemas.put("VilleEntity", villeEntitySchema);

        apiDocs.put("schemas", schemas);

        return ResponseEntity.ok(apiDocs);
    }
}
