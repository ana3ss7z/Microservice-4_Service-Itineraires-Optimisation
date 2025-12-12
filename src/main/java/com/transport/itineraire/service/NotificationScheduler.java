package com.transport.itineraire.service;

import com.transport.itineraire.entity.NotificationType;
import com.transport.itineraire.entity.RouteEntity;
import com.transport.itineraire.repository.RouteRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationScheduler {

    private final RouteRepository routeRepository;
    private final NotificationService notificationService;

    /**
     * Scheduled task to check for notifications that should be sent
     * Runs every minute to check for upcoming notifications
     */
    @Scheduled(fixedRate = 60000) // Every 1 minute
    public void checkAndSendNotifications() {
        log.info("Checking for notifications to send...");

        try {
            // Get all routes that have a notification time in the past (notifications that should have been sent)
            List<RouteEntity> routesWithNotifications = routeRepository.findRoutesWithPendingNotifications(LocalDateTime.now());

            for (RouteEntity route : routesWithNotifications) {
                // Check if we've already sent the notification by checking if it exists
                if (shouldSendEstimatedArrivalNotification(route)) {
                    sendEstimatedArrivalNotification(route);
                }
            }

            log.info("Notification check completed. Processed {} routes", routesWithNotifications.size());
        } catch (Exception e) {
            log.error("Error in notification scheduler", e);
        }
    }

    private boolean shouldSendEstimatedArrivalNotification(RouteEntity route) {
        // Check if the notification time has passed and we haven't already sent the notification
        if (route.getNotificationTime() != null &&
            route.getNotificationTime().isBefore(LocalDateTime.now())) {

            // Check if we already sent this notification by looking for a matching notification
            // For now, we'll just send if the notification time has passed
            // In production, you might want to track sent notifications more carefully
            return true;
        }
        return false;
    }

    private void sendEstimatedArrivalNotification(RouteEntity route) {
        if (route.getUserId() != null) {
            String title = "Arrivée estimée imminente";
            String message = String.format(
                "Votre itinéraire vers %s devrait arriver à destination dans environ 10 minutes. " +
                "Distance restante: %.1f km, Durée estimée: %d min.",
                route.getDestinationCity() != null ? route.getDestinationCity() : "destination inconnue",
                route.getDistanceKm() != null ? route.getDistanceKm() : 0.0,
                route.getDurationMin() != null ? route.getDurationMin() : 0
            );

            notificationService.createRouteNotification(
                route.getUserId(),
                route.getId(),
                route.getChauffeurId(),
                title,
                message,
                NotificationType.ESTIMATED_ARRIVAL
            );

            log.info("Sent estimated arrival notification for route: {}", route.getId());
        }
    }
}