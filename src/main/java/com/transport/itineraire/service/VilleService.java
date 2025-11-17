package com.transport.itineraire.service;

import com.transport.itineraire.entity.VilleEntity;
import com.transport.itineraire.repository.VilleRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class VilleService {

    private final VilleRepository villeRepository;

    @Transactional
    public void saveCityIfNotExists(String cityName, Double latitude, Double longitude) {
        if (cityName == null || cityName.trim().isEmpty()) {
            return;
        }

        String normalizedName = normalizeCityName(cityName);

        if (!villeRepository.existsByName(normalizedName)) {
            VilleEntity ville = VilleEntity.builder()
                    .name(normalizedName)
                    .latitude(latitude)
                    .longitude(longitude)
                    .build();

            villeRepository.save(ville);
            log.info("Saved new city: {}", normalizedName);
        }
    }

    @Transactional(readOnly = true)
    public List<VilleEntity> getAllCities() {
        return villeRepository.findAll();
    }

    private String normalizeCityName(String cityName) {
        // Remove country suffix and trim
        String normalized = cityName.replaceAll(",\\s*Morocco.*$", "")
                                    .replaceAll(",\\s*Maroc.*$", "")
                                    .trim();

        // Capitalize first letter of each word
        String[] words = normalized.split("\\s+");
        StringBuilder result = new StringBuilder();
        for (String word : words) {
            if (!word.isEmpty()) {
                result.append(Character.toUpperCase(word.charAt(0)))
                      .append(word.substring(1).toLowerCase())
                      .append(" ");
            }
        }

        return result.toString().trim();
    }
}
