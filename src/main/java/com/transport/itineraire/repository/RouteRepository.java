package com.transport.itineraire.repository;
import com.transport.itineraire.entity.RouteEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
@Repository
public interface RouteRepository extends JpaRepository<RouteEntity, String> {
    Page<RouteEntity> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);
}
