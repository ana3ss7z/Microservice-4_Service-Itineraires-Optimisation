# 🚀 Deployment Configuration

## Development Environment

This microservice runs inside the **projet2-ms4-devbox** container.

- **Container Host**: `172.30.80.11`
- **Devbox Port (8081)**: `31030` (already allocated to devbox)
- **Application Port**: `8082` (local within devbox)

## Local Access (Inside Devbox)

- **API**: `http://172.30.80.11:8082/api`
- **Swagger UI**: `http://172.30.80.11:8082/api/swagger-ui.html`
- **Health Check**: `http://172.30.80.11:8082/api/routes/health`
- **OpenAPI Docs**: `http://172.30.80.11:8082/api/v3/api-docs`
- **Cities Endpoint**: `http://172.30.80.11:8082/api/routes/ville`

## Database Configuration

- **PostgreSQL Port**: `5434` (to avoid conflict with system port 5432)
- **Database Name**: `itineraire_db`
- **Username**: `postgres`
- **Container**: `itineraire_db_ms4`

## Persistent Volumes

The container mounts two persistent directories:

- **~/apps/** - Project files and applications
- **~/workspace/** - Development workspace

These volumes ensure data persistence across container restarts.

## Deployment Commands

### Build and Start

```bash
docker-compose down
docker-compose up --build -d
```

### Check Status

```bash
docker-compose ps
docker-compose logs -f itineraire-service
```

## Testing

### Quick Health Check

```bash
curl http://172.30.80.11:8082/api/routes/health
```

### Calculate Route

```bash
curl -X POST http://172.30.80.11:8082/api/routes/coordinates \
  -H "Content-Type: application/json" \
  -d '{
    "origin": {"latitude": 33.8959, "longitude": -5.5544},
    "destination": {"latitude": 34.0181, "longitude": -5.0078},
    "userId": "user123",
    "requestId": "req001"
  }'
```

### Get All Cities

```bash
curl http://172.30.80.11:8082/api/routes/ville
```

### Access Endpoints

- **Health Check**: `http://172.30.80.11:8082/api/routes/health`
- **Swagger UI**: `http://172.30.80.11:8082/api/swagger-ui.html`
- **OpenAPI Docs**: `http://172.30.80.11:8082/api/v3/api-docs`

## Environment Variables

Key environment variables:

- `TZ=Africa/Casablanca` - Moroccan timezone (GMT+1)
- `SPRING_DATASOURCE_URL` - PostgreSQL connection
- `SPRING_DATASOURCE_USERNAME` - Database user
- `SPRING_DATASOURCE_PASSWORD` - Database password
