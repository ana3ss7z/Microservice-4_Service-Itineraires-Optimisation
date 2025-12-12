-- Create notifications table for the notification system
CREATE TABLE IF NOT EXISTS notifications (
    id BIGSERIAL PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL,
    read BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP NOT NULL,
    route_id VARCHAR(255),
    chauffeur_id VARCHAR(255)
);

-- Create index for faster queries on user notifications
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON notifications(user_id, read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
CREATE INDEX IF NOT EXISTS idx_notifications_route_id ON notifications(route_id);

-- Grant permissions on the new table
GRANT ALL PRIVILEGES ON TABLE notifications TO itineraire_user;
GRANT ALL PRIVILEGES ON SEQUENCE notifications_id_seq TO itineraire_user;