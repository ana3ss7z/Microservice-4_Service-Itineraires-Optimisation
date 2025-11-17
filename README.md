# Microservice Itinéraires & Optimisation

## Démarrage

```bash
docker-compose up --build -d
```

## Restart

```bash
docker-compose down
docker-compose up --build -d
```

## Accès

- API: http://localhost:8082/api
- Swagger: http://localhost:8082/api/swagger-ui.html
- Health: http://localhost:8082/api/routes/health

## Test

```bash
curl -X POST http://localhost:8082/api/routes/coordinates \
  -H "Content-Type: application/json" \
  -d '{"origin":{"latitude":33.8959,"longitude":-5.5544},"destination":{"latitude":34.0181,"longitude":-5.0078},"userId":"user123","requestId":"req001"}'
```

## Database Access

```bash
# Connect to PostgreSQL
docker exec -it itineraire_db_ms4 psql -U postgres -d itineraire_db

# Check tables
\dt

# Query routes
SELECT id, user_id, origin_city, destination_city, distance_km FROM routes;

# Query cities
SELECT * FROM villes ORDER BY created_at DESC;
```
