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

### Routes

| Méthode | Endpoint               | Description                                | Authentification    |
| ------- | ---------------------- | ------------------------------------------ | ------------------- |
| POST    | `/routes/coordinates`  | Calcul d'itinéraire depuis coordonnées GPS | Non                 |
| POST    | `/routes/address`      | Calcul depuis adresses textuelles          | Non                 |
| POST    | `/routes/optimize`     | **Optimisation de tournée multi-points**   | Non                 |
| POST    | `/routes/demande-info` | Calcul d'itinéraire avec infos de demande  | Non                 |
| GET     | `/routes/history`      | Historique des trajets d'un utilisateur    | Non (userId requis) |
| GET     | `/routes/user-info`    | Infos complètes utilisateur avec volume    | Non (userId requis) |
| GET     | `/routes/{id}`         | Détail d'un trajet par ID                  | Non                 |
| GET     | `/routes/ville`        | Liste de toutes les villes connues         | Non                 |
| GET     | `/routes/health`       | Vérification que le service est vivant     | Non                 |

### Localisation

| Méthode | Endpoint                   | Description                                      | Authentification |
| ------- | -------------------------- | ------------------------------------------------ | ---------------- |
| GET     | `/location/current`        | Localisation actuelle (auto-détection IP client) | Non              |
| GET     | `/location/ip/{ipAddress}` | Localisation pour une IP spécifique              | Non              |
| GET     | `/location/lookup?ip=`     | Recherche localisation par query param           | Non              |
| POST    | `/location/refresh`        | Forcer mise à jour de la localisation            | Non              |
| GET     | `/location/server-info`    | Informations du serveur                          | Non              |

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

Contient les mêmes champs que l'entité sauvegardée (sans géométrie PostGIS).

### `DemandeRequestDTO` (création de demande avec volume)

```json
{
  "userId": "user123",
  "username": "ahmed_benali",
  "email": "ahmed.benali@email.com",
  "fullName": "Ahmed Ben Ali",
  "phone": "+212 6 12 34 56 78",
  "volume": 15.5,
  "natureMarchandise": "Meubles de salon",
  "dateDepart": "2025-12-15T10:00:00",
  "adresseDepart": "123 Rue Mohammed V, Casablanca",
  "adresseDestination": "456 Avenue Hassan II, Rabat"
}
```

### `UserRouteInfoDTO` (réponse complète avec volume)

```json
{
  "routeId": "550e8400-e29b-41d4-a716-446655440000",
  "userId": "user123",
  "username": "ahmed_benali",
  "email": "ahmed.benali@email.com",
  "fullName": "Ahmed Ben Ali",
  "phone": "+212 6 12 34 56 78",
  "adresseDepart": "123 Rue Mohammed V, Casablanca",
  "adresseDestination": "456 Avenue Hassan II, Rabat",
  "originLatitude": 33.5731,
  "originLongitude": -7.5898,
  "originCity": "Casablanca",
  "destinationLatitude": 34.0209,
  "destinationLongitude": -6.8416,
  "destinationCity": "Rabat",
  "totalDistanceKm": 133.7,
  "totalDurationMin": 102,
  "distanceKm": 66.85,
  "durationMin": 51,
  "returnDistanceKm": 66.85,
  "returnDurationMin": 51,
  "volume": 15.5,
  "natureMarchandise": "Meubles de salon",
  "dateDepart": "2025-12-15T10:00:00",
  "includeReturn": true,
  "isOptimized": false,
  "optimizationType": null,
  "createdAt": "2025-12-03 14:30:00",
  "status": "SUCCESS",
  "calculatedBy": "COORDINATES"
}
```

### `LocationInfoDTO` (réponse localisation)

```json
{
  "ipAddress": "41.140.0.1",
  "clientIp": "192.168.1.100",
  "forwardedFor": null,
  "country": "Morocco",
  "countryCode": "MA",
  "region": "Casablanca-Settat",
  "regionName": "Casablanca-Settat",
  "city": "Casablanca",
  "zip": "20000",
  "latitude": 33.5731,
  "longitude": -7.5898,
  "timezone": "Africa/Casablanca",
  "isp": "Maroc Telecom",
  "org": "IAM",
  "serverHostname": "server-prod",
  "serverIp": "172.30.80.11",
  "serverPort": 8082,
  "osName": "Linux",
  "osVersion": "5.15.0",
  "javaVersion": "21.0.1",
  "timestamp": "2025-12-03 16:30:00",
  "status": "SUCCESS",
  "message": "Localisation récupérée avec succès"
}
```

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

### 7. Calcul d'itinéraire avec demande et volume

```http
POST /routes/demande-info
Content-Type: application/json

{
  "userId": "user123",
  "username": "ahmed_benali",
  "email": "ahmed.benali@email.com",
  "fullName": "Ahmed Ben Ali",
  "phone": "+212 6 12 34 56 78",
  "volume": 15.5,
  "natureMarchandise": "Meubles de salon",
  "dateDepart": "2025-12-15T10:00:00",
  "adresseDepart": "123 Rue Mohammed V, Casablanca",
  "adresseDestination": "456 Avenue Hassan II, Rabat"
}
```

**Réponse** : `UserRouteInfoDTO` contenant `totalDistanceKm`, `totalDurationMin`, les informations de volume et les détails utilisateur (email, username, fullName, phone).

### 8. Récupérer les informations complètes d'un utilisateur

```http
GET /routes/user-info?userId=user123&page=0&size=10
```

Retourne une liste de `UserRouteInfoDTO` avec toutes les informations de routes incluant `totalDistanceKm`, `totalDurationMin`, les détails de volume/marchandise et les informations utilisateur.

### 9. Localisation actuelle (auto-détection IP)

```http
GET /location/current
```

Détecte automatiquement l'IP du client et retourne les informations de géolocalisation.

### 10. Localisation par adresse IP spécifique

```http
GET /location/ip/41.140.0.1
```

Retourne les informations de localisation pour l'IP marocaine spécifiée.

### 11. Recherche de localisation (query param)

```http
GET /location/lookup?ip=8.8.8.8
```

Recherche la localisation pour l'IP Google DNS (USA).

### 12. Rafraîchir / Mise à jour localisation

```http
POST /location/refresh
```

Force une mise à jour des informations de localisation.

### 13. Informations serveur

```http
GET /location/server-info
```

Retourne les informations du serveur (hostname, IP, OS, version Java).

---

## Limitations actuelles

| Limite                  | Valeur par défaut                  | Configurable via `application.yml` |
| ----------------------- | ---------------------------------- | ---------------------------------- |
| Nombre max de waypoints | 15                                 | `optimization.max-waypoints`       |
| Reverse geocoding       | Nominatim (1 req/s)                | Delay de 1.1s entre chaque appel   |
| Calcul de distance      | Formule Haversine (à vol d'oiseau) | Pas d'API routière (OSRM/Mapbox)   |
| Vitesse moyenne estimée | 60 km/h                            | Hardcodée                          |

---

## Build et déploiement sur serveur Linux

### Prérequis

- Java 21+ installé
- Accès SSH au serveur (sans droits admin)
- Maven wrapper (`./mvnw`) inclus dans le projet

### Étapes de build et déploiement

#### 1. Nettoyer le build précédent

```bash
# Supprimer le dossier target
rm -rf target

# Si erreur de permissions, forcer les droits
chmod -R u+w target 2>/dev/null && rm -rf target
```

#### 2. Compiler et packager l'application

```bash
# Build avec Maven wrapper (sans tests)
./mvnw clean package -DskipTests

# Build avec mise à jour des dépendances
./mvnw clean package -DskipTests -U

# Vérifier que le JAR est créé
ls -lh target/*.jar
```

#### 3. Arrêter l'application en cours (si elle tourne)

```bash
# Trouver le PID du processus Java
ps aux | grep java | grep itineraire

# Arrêter le processus (remplacer PID par le numéro trouvé)
kill <PID>

# Ou forcer l'arrêt si nécessaire
kill -9 <PID>
```

#### 4. Démarrer la nouvelle version

```bash
# Lancer en arrière-plan avec nohup
nohup java -jar target/itineraire-optimisation-service-1.0.0.jar > app.log 2>&1 &

# Vérifier que l'application démarre
tail -f app.log

# Ou lancer avec Spring profiles
nohup java -jar -Dspring.profiles.active=prod target/itineraire-optimisation-service-1.0.0.jar > app.log 2>&1 &
```

#### 5. Vérifier que l'application fonctionne

```bash
# Health check
curl http://localhost:8081/api/routes/health

# Depuis l'extérieur (remplacer par votre IP)
curl http://172.30.80.11:31030/api/routes/health

# Voir les logs en temps réel
tail -f app.log
```

### Commandes rapides (tout-en-un)

```bash
# Build, arrêt et redémarrage complet
rm -rf target && \
./mvnw clean package -DskipTests && \
kill $(ps aux | grep 'itineraire-optimisation-service' | grep -v grep | awk '{print $2}') 2>/dev/null ; \
nohup java -jar target/itineraire-optimisation-service-1.0.0.jar > app.log 2>&1 & \
sleep 5 && tail -f app.log
```

### Gestion des logs

```bash
# Voir les 100 dernières lignes
tail -n 100 app.log

# Suivre les logs en temps réel
tail -f app.log

# Rechercher des erreurs
grep -i error app.log
grep -i exception app.log

# Nettoyer les anciens logs
> app.log  # Vider le fichier
```

### Troubleshooting

#### Erreur de permissions sur target/

```bash
# Donner les permissions d'écriture
chmod -R u+w target
rm -rf target
./mvnw clean package -DskipTests
```

#### Port déjà utilisé

```bash
# Trouver quel processus utilise le port 8081
lsof -i :8081
netstat -tulpn | grep 8081

# Arrêter le processus
kill $(lsof -t -i:8081)
```

#### Mémoire insuffisante

```bash
# Lancer avec plus de mémoire
nohup java -Xmx1024m -Xms512m -jar target/itineraire-optimisation-service-1.0.0.jar > app.log 2>&1 &
```

#### Vérifier la version Java

```bash
java -version
# Doit afficher Java 21 ou supérieur
```

### Automatisation avec script de déploiement

Créez un fichier `deploy.sh`:

```bash
#!/bin/bash

echo "🔨 Building application..."
rm -rf target
./mvnw clean package -DskipTests -U

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

echo "🛑 Stopping old application..."
PID=$(ps aux | grep 'itineraire-optimisation-service' | grep -v grep | awk '{print $2}')
if [ ! -z "$PID" ]; then
    kill $PID
    sleep 3
fi

echo "🚀 Starting new application..."
nohup java -jar target/itineraire-optimisation-service-1.0.0.jar > app.log 2>&1 &

sleep 5

echo "✅ Checking health..."
curl -s http://localhost:8081/api/routes/health

echo ""
echo "📋 Application started! View logs with: tail -f app.log"
```

Rendre le script exécutable:

```bash
chmod +x deploy.sh
./deploy.sh
```

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
  -e SPRING_DATASOURCE_USERNAME=itineraire_user \
  -e SPRING_DATASOURCE_PASSWORD=itineraire_password \
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
