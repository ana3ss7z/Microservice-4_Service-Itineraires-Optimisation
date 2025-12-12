-- Fix column lengths to prevent "value too long for type character varying(255)" error
-- Increase VARCHAR sizes to accommodate longer text values

-- Update origin city to allow longer names
ALTER TABLE routes ALTER COLUMN origin_city TYPE TEXT;

-- Update destination city to allow longer names  
ALTER TABLE routes ALTER COLUMN destination_city TYPE TEXT;

-- Update preference field to allow longer values
ALTER TABLE routes ALTER COLUMN preference TYPE TEXT;

-- Update calculated_by field to allow longer values
ALTER TABLE routes ALTER COLUMN calculated_by TYPE TEXT;

-- Update status field to allow longer values
ALTER TABLE routes ALTER COLUMN status TYPE TEXT;

-- Update user_id field to allow longer values (though UUID is typically shorter)
ALTER TABLE routes ALTER COLUMN user_id TYPE VARCHAR(500);

-- Update chauffeur_id field to allow longer values
ALTER TABLE routes ALTER COLUMN chauffeur_id TYPE VARCHAR(500);

-- Update request_id field to allow longer values
ALTER TABLE routes ALTER COLUMN request_id TYPE VARCHAR(500);

-- Also handle address fields in case they somehow aren't already TEXT
ALTER TABLE routes ALTER COLUMN origin_address TYPE TEXT;
ALTER TABLE routes ALTER COLUMN destination_address TYPE TEXT;

COMMIT;