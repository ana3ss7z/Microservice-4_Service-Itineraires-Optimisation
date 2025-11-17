
# API Itinéraires & Optimisation de tournées - Transport Maroc

API REST Spring Boot permettant de :
- Calculer un itinéraire à partir de coordonnées ou d’adresses
- Optimiser une tournée multi-points (problème du voyageur de commerce - heuristique du plus proche voisin)
- Récupérer l’historique des trajets par utilisateur
- Gérer les villes marocaines

Base URL : `/routes`

> **Note importante** : L’optimisation utilise Nominatim (OpenStreetMap) pour le reverse geocoding → respect d’1 requête/seconde maximum.

## Sommaire
- [Endpoints](#endpoints)
- [Modèles (DTOs)](#modèles-dtos)
- [Exemples de requêtes](#exemples-de-requêtes)
- [Health Check](#health-check)
- [Limitations](#limitations)

---

## Endpoints

| Méthode | Endpoint                    | Description                                 | Authentification |
|---------|-----------------------------|---------------------------------------------|------------------|
| POST    | `/routes/coordinates`       | Calcul d’itinéraire depuis coordonnées GPS  | Non              |
| POST    | `/routes/address`           | Calcul depuis adresses textuelles           | Non              |
| POST    | `/routes/optimize`          | **Optimisation de tournée multi-points**    | Non              |
| GET     | `/routes/history`           | Historique des trajets d’un utilisateur     | Non (userId requis) |
| GET     | `/routes/{id}`              | Détail d’un trajet par ID                   | Non              |
| GET     | `/routes/ville`             | Liste de toutes les villes connues         | Non              |
| GET     | `/routes/health`            | Vérification que le service est vivant      | Non              |

---

## Modèles (DTOs)

### `RouteRequest` (utilisé pour tous les POST)
```json
{
  "userId": "user_123",
  "requestId": "req_456",                 // optionnel
  "waypoints": [
    {
      "latitude": 33.5731,
      "longitude": -7.5898,
      "name": "Siège Casablanca",         // optionnel
      "address": "Bd Mohammed V",         // optionnel (sera enrichi si absent)
      "city": "Casablanca"                // optionnel (sera enrichi si absent)
    },
    { ... },
    { ... }
  ],
  "includeReturn": true                   // ajoute le retour au point de départ
}
```

### `RouteResponse` (réponse commune)
```json
{
  "routeId": "550e8400-e29b-41d4-a716-446655440000",
  "distanceKm": 245.67,
  "durationMin": 220,
  "returnDistanceKm": 245.67,       // si includeReturn = true
  "returnDurationMin": 220,
  "totalDistanceKm": 491.34,
  "totalDurationMin": 440,
  "steps": [ /* Waypoint avec ordre */ ],
  "instructions": [
    "De Casablanca à Rabat: 92.45 km",
    "De Rabat à Marrakech: 320.10 km",
    "Retour de Marrakech à Casablanca: 245.67 km"
  ],
  "routePolyline": "33.5731,-7.5898|34.0209,-6.8410|31.6295,-7.9811",
  "calculatedAt": "2025-11-17T17:40:22",
  "status": "SUCCESS"
}
```

### `RouteDTO` (historique et détail)
Contient les mêmes champs que l’entité sauvegardée (sans géométrie PostGIS).

---

## Exemples de requêtes

### 1. Optimisation de tournée (recommandé)
```http
POST /routes/optimize
Content-Type: application/json

{
  "userId": "driver_007",
  "waypoints": [
    { "latitude": 33.5731, "longitude": -7.5898, "name": "Casablanca" },
    { "latitude": 34.0209, "longitude": -6.8410, "name": "Rabat" },
    { "latitude": 31.6295, "longitude": -7.9811, "name": "Marrakech" },
    { "latitude": 33.9716, "longitude": -6.8498, "name": "Fès" }
  ],
  "includeReturn": true
}
```

### 2. Calcul simple depuis adresses (non implémenté dans le code actuel)
> Fonctionne si le service `calculateRouteFromAddress` est complet

```json
{
  "userId": "client_99",
  "waypoints": [
    { "address": "Place Mohammed V, Casablanca" },
    { "address": "Avenue Hassan II, Rabat" }
  ]
}
```

### 3. Récupérer l’historique
```http
GET /routes/history?userId=driver_007&page=0&size=10
```

### 4. Détail d’un trajet
```http
GET /routes/550e8400-e29b-41d4-a716-446655440000
```

### 5. Liste des villes
```http
GET /routes/ville
```

Retourne toutes les villes sauvegardées (normalisées : Casablanca, Rabat, Marrakech…).

### 6. Health check
```http
GET /routes/health
→ "Service opérationnel"
```

---

## Limitations actuelles

| Limite                             | Valeur par défaut         | Configurable via `application.yml` |
|------------------------------------|---------------------------|------------------------------------|
| Nombre max de waypoints            | 15                        | `optimization.max-waypoints`       |
| Reverse geocoding                  | Nominatim (1 req/s)       | Delay de 1.1s entre chaque appel  |
| Calcul de distance                 | Formule Haversine (à vol d’oiseau) | Pas d’API routière (OSRM/Mapbox) |
| Vitesse moyenne estimée            | 60 km/h                   | Hardcodée                          |

---


