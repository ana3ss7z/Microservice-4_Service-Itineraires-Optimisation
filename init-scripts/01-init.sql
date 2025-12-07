-- Create routes table
CREATE TABLE IF NOT EXISTS routes (
    id VARCHAR(255) PRIMARY KEY,
    user_id VARCHAR(255),
    request_id VARCHAR(255),
    origin_address TEXT,
    origin_city VARCHAR(255),
    origin_latitude DOUBLE PRECISION,
    origin_longitude DOUBLE PRECISION,
    destination_address TEXT,
    destination_city VARCHAR(255),
    destination_latitude DOUBLE PRECISION,
    destination_longitude DOUBLE PRECISION,
    distance_km DOUBLE PRECISION,
    duration_min INTEGER,
    return_distance_km DOUBLE PRECISION,
    return_duration_min INTEGER,
    total_distance_km DOUBLE PRECISION,
    total_duration_min INTEGER,
    route_polyline TEXT,
    steps_json TEXT,
    instructions_json TEXT,
    include_return BOOLEAN,
    preference VARCHAR(255),
    is_optimized BOOLEAN,
    optimization_type VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    calculated_by VARCHAR(255),
    status VARCHAR(255),
    error_message VARCHAR(1000),
    version BIGINT DEFAULT 0
);

-- Create villes table with auto-increment id
CREATE TABLE IF NOT EXISTS villes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Grant permissions on tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO itineraire_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO itineraire_user;
