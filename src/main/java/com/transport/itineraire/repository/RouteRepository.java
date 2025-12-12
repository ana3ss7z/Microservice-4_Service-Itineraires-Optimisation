package com.transport.itineraire.repository;
import com.transport.itineraire.entity.RouteEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RouteRepository extends JpaRepository<RouteEntity, String> {
    Page<RouteEntity> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

    // Récupérer toutes les routes qui ont démarré
    List<RouteEntity> findByStartedTrue();

    // Récupérer les routes démarrées pour un utilisateur
    List<RouteEntity> findByUserIdAndStartedTrue(String userId);

    // Récupérer les routes démarrées pour un chauffeur
    List<RouteEntity> findByChauffeurIdAndStartedTrue(String chauffeurId);

    // Récupérer les routes par chauffeur
    Page<RouteEntity> findByChauffeurIdOrderByCreatedAtDesc(String chauffeurId, Pageable pageable);

    // Récupérer les routes par userId et chauffeurId
    List<RouteEntity> findByUserIdAndChauffeurId(String userId, String chauffeurId);

    // Find routes with pending notifications
    @Query("SELECT r FROM RouteEntity r WHERE r.notificationTime IS NOT NULL AND r.notificationTime <= :currentTime AND r.started = true")
    List<RouteEntity> findRoutesWithPendingNotifications(LocalDateTime currentTime);
}
