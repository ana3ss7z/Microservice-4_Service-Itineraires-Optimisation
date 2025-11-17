package com.transport.itineraire.repository;

import com.transport.itineraire.entity.VilleEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface VilleRepository extends JpaRepository<VilleEntity, Long> {

    Optional<VilleEntity> findByName(String name);

    boolean existsByName(String name);
}
