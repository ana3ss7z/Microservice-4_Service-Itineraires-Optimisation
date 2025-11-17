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

- API: http://localhost:31030/api
- Swagger: http://localhost:31030/api/swagger-ui.html
- Health: http://localhost:31030/api/routes/health

## Test

```bash
curl -X POST http://localhost:31030/api/routes/coordinates \
  -H "Content-Type: application/json" \
  -d '{"origin":{"lat":33.8959,"lon":-5.5544},"destination":{"lat":34.0181,"lon":-5.0078}}'
```
