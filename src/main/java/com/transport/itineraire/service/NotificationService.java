package com.transport.itineraire.service;

import com.transport.itineraire.entity.NotificationEntity;
import com.transport.itineraire.entity.NotificationType;
import com.transport.itineraire.model.NotificationDTO;
import com.transport.itineraire.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public NotificationEntity createNotification(String userId, String title, String message, NotificationType type) {
        NotificationEntity notification = NotificationEntity.builder()
                .userId(userId)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        NotificationEntity saved = notificationRepository.save(notification);
        sendRealTimeNotification(saved);
        return saved;
    }

    @Transactional
    public NotificationEntity createRouteNotification(String userId, String routeId, String chauffeurId,
                                                     String title, String message, NotificationType type) {
        NotificationEntity notification = NotificationEntity.builder()
                .userId(userId)
                .routeId(routeId)
                .chauffeurId(chauffeurId)
                .title(title)
                .message(message)
                .type(type)
                .read(false)
                .createdAt(LocalDateTime.now())
                .build();
        NotificationEntity saved = notificationRepository.save(notification);
        sendRealTimeNotification(saved);
        return saved;
    }

    private void sendRealTimeNotification(NotificationEntity entity) {
        try {
            NotificationDTO dto = NotificationDTO.builder()
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

            // Send to specific user
            messagingTemplate.convertAndSendToUser(entity.getUserId(), "/queue/notifications", dto);
            log.info("Sent real-time notification to user: {}, title: {}", entity.getUserId(), entity.getTitle());
        } catch (Exception e) {
            log.error("Error sending real-time notification to user: {}", entity.getUserId(), e);
        }
    }

    public Page<NotificationEntity> getUserNotifications(String userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
    }

    public List<NotificationEntity> getUnreadUserNotifications(String userId) {
        return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
    }

    public Long getUnreadCount(String userId) {
        return notificationRepository.countUnreadByUserId(userId);
    }

    @Transactional
    public void markAsRead(Long id) {
        NotificationEntity notification = notificationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Notification not found: " + id));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String userId) {
        List<NotificationEntity> unread = notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        for (NotificationEntity notification : unread) {
            notification.setRead(true);
        }
        notificationRepository.saveAll(unread);
    }

    public Page<NotificationEntity> getUserRouteNotifications(String userId, String routeId, Pageable pageable) {
        return notificationRepository.findByUserIdAndRouteId(userId, routeId, pageable);
    }
}