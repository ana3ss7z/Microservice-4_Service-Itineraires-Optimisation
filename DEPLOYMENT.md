# 🚀 Deployment Configuration

## Port Mappings

This microservice is configured as **API2** in the deployment infrastructure:

- **Internal Port**: `8081`
- **External Port**: `31030`
- **Access URL**: `http://172.30.80.11:31030/api`

### Port Mapping Summary

```
API1 → 8080 internal : http://172.30.80.11:31021/
API2 → 8081 internal : http://172.30.80.11:31030/ ← This Service
```

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

### Access Endpoints

- **Health Check**: `http://172.30.80.11:31030/api/routes/health`
- **Swagger UI**: `http://172.30.80.11:31030/api/swagger-ui.html`
- **OpenAPI Docs**: `http://172.30.80.11:31030/api/v3/api-docs`

## Environment Variables

Key environment variables:

- `TZ=Africa/Casablanca` - Moroccan timezone (GMT+1)
- `SPRING_DATASOURCE_URL` - PostgreSQL connection
- `SPRING_DATASOURCE_USERNAME` - Database user
- `SPRING_DATASOURCE_PASSWORD` - Database password
