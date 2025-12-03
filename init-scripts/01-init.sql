-- Drop PostGIS extension if causing issues (optional)
-- CREATE EXTENSION IF NOT EXISTS postgis;

-- Drop old geometry columns if they exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'origin_point') THEN
        ALTER TABLE routes DROP COLUMN origin_point;
    END IF;
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routes' AND column_name = 'destination_point') THEN
        ALTER TABLE routes DROP COLUMN destination_point;
    END IF;
END $$;

-- Grant permissions on tables
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO itineraire_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO itineraire_user;
