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

| Méthode | Endpoint              | Description                                | Authentification    |
| ------- | --------------------- | ------------------------------------------ | ------------------- |
| POST    | `/routes/coordinates` | Calcul d’itinéraire depuis coordonnées GPS | Non                 |
| POST    | `/routes/address`     | Calcul depuis adresses textuelles          | Non                 |
| POST    | `/routes/optimize`    | **Optimisation de tournée multi-points**   | Non                 |
| GET     | `/routes/history`     | Historique des trajets d’un utilisateur    | Non (userId requis) |
| GET     | `/routes/{id}`        | Détail d’un trajet par ID                  | Non                 |
| GET     | `/routes/ville`       | Liste de toutes les villes connues         | Non                 |
| GET     | `/routes/health`      | Vérification que le service est vivant     | Non                 |

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
  "returnDistanceKm": 245.67, // si includeReturn = true
  "returnDurationMin": 220,
  "totalDistanceKm": 491.34,
  "totalDurationMin": 440,
  "steps": [
    /* Waypoint avec ordre */
  ],
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

| Limite                  | Valeur par défaut                  | Configurable via `application.yml` |
| ----------------------- | ---------------------------------- | ---------------------------------- |
| Nombre max de waypoints | 15                                 | `optimization.max-waypoints`       |
| Reverse geocoding       | Nominatim (1 req/s)                | Delay de 1.1s entre chaque appel   |
| Calcul de distance      | Formule Haversine (à vol d'oiseau) | Pas d'API routière (OSRM/Mapbox)   |
| Vitesse moyenne estimée | 60 km/h                            | Hardcodée                          |

---

## Docker

### Prérequis

- Docker et Docker Compose installés sur votre machine

### Commandes Docker Compose

#### Construire les images

```bash
docker-compose build
```

#### Démarrer les services (avec build si nécessaire)

```bash
docker-compose up -d --build
```

#### Démarrer les services (sans rebuild)

```bash
docker-compose up -d
```

#### Voir les logs

```bash
# Tous les services
docker-compose logs -f

# Service spécifique
docker-compose logs -f itineraire-service
docker-compose logs -f postgres
```

#### Arrêter les services

```bash
docker-compose stop
```

#### Redémarrer les services

```bash
docker-compose restart

# Redémarrer un service spécifique
docker-compose restart itineraire-service
```

#### Arrêter et supprimer les conteneurs

```bash
docker-compose down

# Avec suppression des volumes (données PostgreSQL)
docker-compose down -v
```

### Commandes Docker (conteneurs individuels)

#### Construire l'image du service

```bash
docker build -t itineraire-service:latest .
```

#### Exécuter le conteneur manuellement

```bash
docker run -d \
  --name itineraire_service_ms4 \
  -p 8082:8081 \
  -e SPRING_DATASOURCE_URL=jdbc:postgresql://host.docker.internal:5434/itineraire_db \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=anass2002 \
  itineraire-service:latest
```

#### Arrêter un conteneur

```bash
docker stop itineraire_service_ms4
docker stop itineraire_db_ms4
```

#### Redémarrer un conteneur

```bash
docker restart itineraire_service_ms4
docker restart itineraire_db_ms4
```

#### Supprimer un conteneur

```bash
docker rm itineraire_service_ms4
docker rm itineraire_db_ms4
```

### Ports exposés

| Service            | Port interne | Port externe |
| ------------------ | ------------ | ------------ |
| itineraire-service | 8081         | 8082         |
| PostgreSQL/PostGIS | 5432         | 5434         |

### Vérifier le statut des services

```bash
# Voir les conteneurs en cours d'exécution
docker-compose ps

# Vérifier la santé du service
curl http://localhost:8082/api/routes/health
```

---

## Postman

Les collections Postman sont disponibles dans le projet :

- **`Postman_Collection.json`** : Collection pour les tests en local (`http://localhost:8082`)
- **`Postman_Collection_Server.json`** : Collection pour le serveur de production (`http://172.30.80.11:8082`)

### Variables Postman

Les collections utilisent des variables pour faciliter le changement d'environnement :

| Variable     | Local                   | Server                     |
| ------------ | ----------------------- | -------------------------- |
| `base_url`   | `http://localhost:8082` | `http://172.30.80.11:8082` |
| `api_prefix` | `/api`                  | `/api`                     |

Pour changer l'URL, modifiez simplement la variable `base_url` dans Postman.

---
