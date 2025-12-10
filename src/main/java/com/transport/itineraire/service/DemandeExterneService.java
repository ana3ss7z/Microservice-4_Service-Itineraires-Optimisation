package com.transport.itineraire.service;

import com.transport.itineraire.model.DemandeExterneDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.client.HttpClientErrorException;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.server.ResponseStatusException;

/**
 * Service pour communiquer avec le Microservice Demandes
 * URL: http://172.30.80.11:31029/api/v1/demandes
 */
@Service
@Slf4j
@RequiredArgsConstructor
public class DemandeExterneService {

    private final RestTemplate restTemplate;

    @Value("${external.api.demandes.base-url:http://172.30.80.11:31029}")
    private String demandesBaseUrl;

    /**
     * Récupérer une demande par son ID depuis le microservice externe
     * @param demandeId ID de la demande
     * @return DemandeExterneDTO avec les informations de la demande
     */
    public DemandeExterneDTO getDemandeById(Long demandeId) {
        String url = demandesBaseUrl + "/api/v1/demandes/" + demandeId;
        log.info("Appel du microservice Demandes: {}", url);

        try {
            DemandeExterneDTO demande = restTemplate.getForObject(url, DemandeExterneDTO.class);
            log.info("Demande récupérée avec succès: id={}, volume={}",
                    demande != null ? demande.getId() : null,
                    demande != null ? demande.getVolume() : null);
            return demande;
        } catch (HttpClientErrorException.NotFound e) {
            log.error("Demande non trouvée: {}", demandeId);
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,
                    "Demande non trouvée avec l'ID: " + demandeId);
        } catch (RestClientException e) {
            log.error("Erreur lors de l'appel au microservice Demandes: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE,
                    "Le service Demandes est indisponible: " + e.getMessage());
        }
    }

    /**
     * Récupérer uniquement le volume d'une demande
     * @param demandeId ID de la demande
     * @return Volume de la demande
     */
    public Double getVolumeByDemandeId(Long demandeId) {
        DemandeExterneDTO demande = getDemandeById(demandeId);
        return demande != null ? demande.getVolume() : null;
    }

    /**
     * Vérifier si le service Demandes est disponible
     * @return true si le service est accessible
     */
    public boolean isServiceAvailable() {
        try {
            String url = demandesBaseUrl + "/api/v1/demandes/1";
            restTemplate.getForObject(url, String.class);
            return true;
        } catch (Exception e) {
            log.warn("Service Demandes non disponible: {}", e.getMessage());
            return false;
        }
    }
}
