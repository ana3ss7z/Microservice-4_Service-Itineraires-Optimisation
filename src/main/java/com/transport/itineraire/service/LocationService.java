package com.transport.itineraire.service;

import com.transport.itineraire.model.LocationInfoDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import jakarta.servlet.http.HttpServletRequest;
import java.net.InetAddress;
import java.time.LocalDateTime;
import java.util.Map;

/**
 * Service pour récupérer les informations de localisation
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class LocationService {

    private final RestTemplate restTemplate;

    /**
     * Récupère les informations de localisation à partir de l'IP du client
     */
    public LocationInfoDTO getLocationInfo(HttpServletRequest request) {
        String clientIp = getClientIpAddress(request);

        LocationInfoDTO.LocationInfoDTOBuilder builder = LocationInfoDTO.builder()
                .clientIp(clientIp)
                .forwardedFor(request.getHeader("X-Forwarded-For"))
                .timestamp(LocalDateTime.now());

        // Informations système
        try {
            InetAddress localhost = InetAddress.getLocalHost();
            builder.serverHostname(localhost.getHostName())
                   .serverIp(localhost.getHostAddress())
                   .serverPort(request.getServerPort());
        } catch (Exception e) {
            log.warn("Impossible de récupérer les informations du serveur: {}", e.getMessage());
        }

        builder.osName(System.getProperty("os.name"))
               .osVersion(System.getProperty("os.version"))
               .javaVersion(System.getProperty("java.version"));

        // Récupérer la géolocalisation via API externe (ip-api.com - gratuit)
        try {
            String ipToLookup = clientIp;
            // Si IP locale, utiliser l'IP publique du serveur
            if (isLocalIp(clientIp)) {
                ipToLookup = getPublicIp();
            }

            if (ipToLookup != null && !ipToLookup.isEmpty()) {
                fetchGeoLocation(builder, ipToLookup);
            }
            builder.status("SUCCESS")
                   .message("Localisation récupérée avec succès");
        } catch (Exception e) {
            log.error("Erreur lors de la récupération de la géolocalisation: {}", e.getMessage());
            builder.status("PARTIAL")
                   .message("Informations de géolocalisation non disponibles: " + e.getMessage());
        }

        return builder.build();
    }

    /**
     * Récupère les informations de localisation pour une IP spécifique
     */
    public LocationInfoDTO getLocationByIp(String ipAddress) {
        LocationInfoDTO.LocationInfoDTOBuilder builder = LocationInfoDTO.builder()
                .ipAddress(ipAddress)
                .timestamp(LocalDateTime.now());

        // Informations système serveur
        builder.osName(System.getProperty("os.name"))
               .osVersion(System.getProperty("os.version"))
               .javaVersion(System.getProperty("java.version"));

        try {
            InetAddress localhost = InetAddress.getLocalHost();
            builder.serverHostname(localhost.getHostName())
                   .serverIp(localhost.getHostAddress());
        } catch (Exception e) {
            log.warn("Impossible de récupérer les informations du serveur: {}", e.getMessage());
        }

        // Récupérer la géolocalisation
        try {
            fetchGeoLocation(builder, ipAddress);
            builder.status("SUCCESS")
                   .message("Localisation récupérée avec succès pour IP: " + ipAddress);
        } catch (Exception e) {
            log.error("Erreur lors de la récupération de la géolocalisation: {}", e.getMessage());
            builder.status("ERROR")
                   .message("Erreur: " + e.getMessage());
        }

        return builder.build();
    }

    /**
     * Récupère l'adresse IP du client
     */
    private String getClientIpAddress(HttpServletRequest request) {
        String[] headerNames = {
            "X-Forwarded-For",
            "X-Real-IP",
            "Proxy-Client-IP",
            "WL-Proxy-Client-IP",
            "HTTP_X_FORWARDED_FOR",
            "HTTP_X_FORWARDED",
            "HTTP_X_CLUSTER_CLIENT_IP",
            "HTTP_CLIENT_IP",
            "HTTP_FORWARDED_FOR",
            "HTTP_FORWARDED"
        };

        for (String header : headerNames) {
            String ip = request.getHeader(header);
            if (ip != null && !ip.isEmpty() && !"unknown".equalsIgnoreCase(ip)) {
                // X-Forwarded-For peut contenir plusieurs IPs, prendre la première
                if (ip.contains(",")) {
                    ip = ip.split(",")[0].trim();
                }
                return ip;
            }
        }

        return request.getRemoteAddr();
    }

    /**
     * Vérifie si l'IP est locale
     */
    private boolean isLocalIp(String ip) {
        return ip == null ||
               ip.equals("127.0.0.1") ||
               ip.equals("0:0:0:0:0:0:0:1") ||
               ip.startsWith("192.168.") ||
               ip.startsWith("10.") ||
               ip.startsWith("172.16.") ||
               ip.startsWith("172.17.") ||
               ip.startsWith("172.18.") ||
               ip.startsWith("172.19.") ||
               ip.startsWith("172.2") ||
               ip.startsWith("172.30.") ||
               ip.startsWith("172.31.");
    }

    /**
     * Récupère l'IP publique du serveur
     */
    private String getPublicIp() {
        try {
            String response = restTemplate.getForObject("https://api.ipify.org", String.class);
            return response;
        } catch (Exception e) {
            log.warn("Impossible de récupérer l'IP publique: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Récupère les informations de géolocalisation via ip-api.com
     */
    @SuppressWarnings("unchecked")
    private void fetchGeoLocation(LocationInfoDTO.LocationInfoDTOBuilder builder, String ip) {
        try {
            String url = "http://ip-api.com/json/" + ip + "?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,query";
            Map<String, Object> response = restTemplate.getForObject(url, Map.class);

            if (response != null && "success".equals(response.get("status"))) {
                builder.ipAddress((String) response.get("query"))
                       .country((String) response.get("country"))
                       .countryCode((String) response.get("countryCode"))
                       .region((String) response.get("region"))
                       .regionName((String) response.get("regionName"))
                       .city((String) response.get("city"))
                       .zip((String) response.get("zip"))
                       .latitude(response.get("lat") != null ? ((Number) response.get("lat")).doubleValue() : null)
                       .longitude(response.get("lon") != null ? ((Number) response.get("lon")).doubleValue() : null)
                       .timezone((String) response.get("timezone"))
                       .isp((String) response.get("isp"))
                       .org((String) response.get("org"));
            }
        } catch (Exception e) {
            log.error("Erreur API géolocalisation: {}", e.getMessage());
            throw e;
        }
    }
}
