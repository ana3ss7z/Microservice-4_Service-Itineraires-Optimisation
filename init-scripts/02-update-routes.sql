-- Script de mise à jour pour ajouter les nouveaux champs à la table routes
-- Exécutez ce script sur une base de données existante

-- Ajouter la colonne chauffeur_id
ALTER TABLE routes ADD COLUMN IF NOT EXISTS chauffeur_id VARCHAR(255);

-- Ajouter les colonnes de date et temps
ALTER TABLE routes ADD COLUMN IF NOT EXISTS date_depart TIMESTAMP;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS estimated_arrival_time TIMESTAMP;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS notification_time TIMESTAMP;

-- Ajouter les colonnes de statut de démarrage
ALTER TABLE routes ADD COLUMN IF NOT EXISTS started BOOLEAN DEFAULT FALSE;
ALTER TABLE routes ADD COLUMN IF NOT EXISTS started_at TIMESTAMP;

-- Créer les index pour améliorer les performances des requêtes
CREATE INDEX IF NOT EXISTS idx_routes_started ON routes(started);
CREATE INDEX IF NOT EXISTS idx_routes_user_id ON routes(user_id);
CREATE INDEX IF NOT EXISTS idx_routes_chauffeur_id ON routes(chauffeur_id);
CREATE INDEX IF NOT EXISTS idx_routes_user_chauffeur ON routes(user_id, chauffeur_id);

-- Afficher les colonnes ajoutées
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'routes'
AND column_name IN ('chauffeur_id', 'date_depart', 'estimated_arrival_time', 'notification_time', 'started', 'started_at')
ORDER BY ordinal_position;
