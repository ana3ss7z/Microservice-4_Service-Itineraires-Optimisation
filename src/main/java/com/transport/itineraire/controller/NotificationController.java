package com.transport.itineraire.controller;

import com.transport.itineraire.model.NotificationDTO;
import com.transport.itineraire.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;

    @GetMapping
    public ResponseEntity<Page<NotificationDTO>> getUserNotifications(
            @RequestParam String userId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {

        Pageable pageable = PageRequest.of(page, size);
        Page<com.transport.itineraire.entity.NotificationEntity> notifications =
            notificationService.getUserNotifications(userId, pageable);

        // Convert to DTO
        Page<NotificationDTO> dtoPage = notifications.map(this::convertToDTO);
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/unread")
    public ResponseEntity<Integer> getUnreadNotificationCount(@RequestParam String userId) {
        Long count = notificationService.getUnreadCount(userId);
        return ResponseEntity.ok(count.intValue());
    }

    @GetMapping("/unread-list")
    public ResponseEntity<java.util.List<NotificationDTO>> getUnreadNotifications(@RequestParam String userId) {
        java.util.List<com.transport.itineraire.entity.NotificationEntity> notifications =
            notificationService.getUnreadUserNotifications(userId);

        java.util.List<NotificationDTO> dtoList = notifications.stream()
            .map(this::convertToDTO)
            .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(dtoList);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/mark-all-read")
    public ResponseEntity<Void> markAllAsRead(@RequestParam String userId) {
        notificationService.markAllAsRead(userId);
        return ResponseEntity.ok().build();
    }

    // Method to send notification to specific user
    public void sendNotificationToUser(String userId, NotificationDTO notification) {
        messagingTemplate.convertAndSendToUser(userId, "/queue/notifications", notification);
    }

    private NotificationDTO convertToDTO(com.transport.itineraire.entity.NotificationEntity entity) {
        return NotificationDTO.builder()
                .id(entity.getId())
                .userId(entity.getUserId())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .type(entity.getType().name())
                .read(entity.getRead())
                .createdAt(entity.getCreatedAt())
                .routeId(entity.getRouteId())
                .chauffeurId(entity.getChauffeurId())
                .build();
    }
}