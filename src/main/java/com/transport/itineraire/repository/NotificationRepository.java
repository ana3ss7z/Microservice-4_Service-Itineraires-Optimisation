package com.transport.itineraire.repository;

import com.transport.itineraire.entity.NotificationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends JpaRepository<NotificationEntity, Long> {
    
    Page<NotificationEntity> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
    
    List<NotificationEntity> findByUserIdAndReadFalseOrderByCreatedAtDesc(String userId);
    
    @Query("SELECT COUNT(n) FROM NotificationEntity n WHERE n.userId = :userId AND n.read = false")
    Long countUnreadByUserId(String userId);
    
    Page<NotificationEntity> findByUserIdAndRouteId(String userId, String routeId, Pageable pageable);
    
    // Find notifications that should be sent based on notification time and user
    @Query("SELECT n FROM NotificationEntity n WHERE n.routeId IS NOT NULL AND n.chauffeurId IS NOT NULL")
    List<NotificationEntity> findRouteRelatedNotifications();
}