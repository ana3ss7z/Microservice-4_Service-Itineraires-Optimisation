package com.transport.itineraire.service;

import com.transport.itineraire.entity.VilleEntity;
import com.transport.itineraire.repository.VilleRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class VilleService {

    private final VilleRepository villeRepository;

    // All Moroccan cities with their coordinates (comprehensive list)
    private static final Map<String, double[]> MOROCCAN_CITIES = new java.util.HashMap<>();

    static {
        // Major Cities
        MOROCCAN_CITIES.put("Casablanca", new double[]{33.5731, -7.5898});
        MOROCCAN_CITIES.put("Rabat", new double[]{34.0209, -6.8416});
        MOROCCAN_CITIES.put("Marrakech", new double[]{31.6295, -7.9811});
        MOROCCAN_CITIES.put("Fès", new double[]{33.8959, -5.5544});
        MOROCCAN_CITIES.put("Tanger", new double[]{35.7595, -5.8340});
        MOROCCAN_CITIES.put("Agadir", new double[]{30.4278, -9.5981});
        MOROCCAN_CITIES.put("Meknès", new double[]{34.0181, -5.0078});
        MOROCCAN_CITIES.put("Oujda", new double[]{34.6814, -1.9086});
        MOROCCAN_CITIES.put("Kenitra", new double[]{34.2610, -6.5802});
        MOROCCAN_CITIES.put("Tétouan", new double[]{35.5889, -5.3626});

        // Regional Capitals & Important Cities
        MOROCCAN_CITIES.put("El Jadida", new double[]{33.2316, -8.5007});
        MOROCCAN_CITIES.put("Safi", new double[]{32.3008, -9.2275});
        MOROCCAN_CITIES.put("Mohammedia", new double[]{33.6861, -7.3828});
        MOROCCAN_CITIES.put("Khouribga", new double[]{32.8811, -6.9063});
        MOROCCAN_CITIES.put("Beni Mellal", new double[]{32.3373, -6.3498});
        MOROCCAN_CITIES.put("Nador", new double[]{35.1681, -2.9335});
        MOROCCAN_CITIES.put("Taza", new double[]{34.2133, -4.0103});
        MOROCCAN_CITIES.put("Settat", new double[]{33.0017, -7.6166});
        MOROCCAN_CITIES.put("Larache", new double[]{35.1932, -6.1561});
        MOROCCAN_CITIES.put("Guelmim", new double[]{28.9870, -10.0574});
        MOROCCAN_CITIES.put("Errachidia", new double[]{31.9314, -4.4267});
        MOROCCAN_CITIES.put("Ouarzazate", new double[]{30.9189, -6.8936});
        MOROCCAN_CITIES.put("Essaouira", new double[]{31.5085, -9.7595});
        MOROCCAN_CITIES.put("Ifrane", new double[]{33.5228, -5.1109});
        MOROCCAN_CITIES.put("Chefchaouen", new double[]{35.1688, -5.2636});
        MOROCCAN_CITIES.put("Dakhla", new double[]{23.6848, -15.9570});
        MOROCCAN_CITIES.put("Laâyoune", new double[]{27.1536, -13.2034});
        MOROCCAN_CITIES.put("Al Hoceima", new double[]{35.2517, -3.9372});
        MOROCCAN_CITIES.put("Berkane", new double[]{34.9200, -2.3200});
        MOROCCAN_CITIES.put("Khemisset", new double[]{33.8242, -6.0664});

        // Casablanca-Settat Region
        MOROCCAN_CITIES.put("Berrechid", new double[]{33.2654, -7.5876});
        MOROCCAN_CITIES.put("Benslimane", new double[]{33.6181, -7.1306});
        MOROCCAN_CITIES.put("Médiouna", new double[]{33.4536, -7.5139});
        MOROCCAN_CITIES.put("Nouaceur", new double[]{33.3669, -7.5731});
        MOROCCAN_CITIES.put("Aïn Harrouda", new double[]{33.6369, -7.4514});
        MOROCCAN_CITIES.put("Bouskoura", new double[]{33.4489, -7.6528});
        MOROCCAN_CITIES.put("Dar Bouazza", new double[]{33.5069, -7.8331});

        // Rabat-Salé-Kénitra Region
        MOROCCAN_CITIES.put("Salé", new double[]{34.0531, -6.7985});
        MOROCCAN_CITIES.put("Témara", new double[]{33.9269, -6.9067});
        MOROCCAN_CITIES.put("Skhirat", new double[]{33.8531, -7.0328});
        MOROCCAN_CITIES.put("Sidi Slimane", new double[]{34.2650, -5.9225});
        MOROCCAN_CITIES.put("Sidi Kacem", new double[]{34.2217, -5.7081});
        MOROCCAN_CITIES.put("Souk El Arbaa", new double[]{34.6853, -5.5856});
        MOROCCAN_CITIES.put("Tiflet", new double[]{33.8947, -6.3067});

        // Marrakech-Safi Region
        MOROCCAN_CITIES.put("Kelaa des Sraghna", new double[]{32.0522, -7.4069});
        MOROCCAN_CITIES.put("Chichaoua", new double[]{31.5389, -8.7650});
        MOROCCAN_CITIES.put("Youssoufia", new double[]{32.2456, -8.5300});
        MOROCCAN_CITIES.put("Ben Guerir", new double[]{32.2294, -7.9511});
        MOROCCAN_CITIES.put("Tahannaout", new double[]{31.3583, -7.9478});
        MOROCCAN_CITIES.put("Amizmiz", new double[]{31.2167, -8.2333});
        MOROCCAN_CITIES.put("Ait Ourir", new double[]{31.5650, -7.6656});

        // Fès-Meknès Region
        MOROCCAN_CITIES.put("Sefrou", new double[]{33.8311, -4.8356});
        MOROCCAN_CITIES.put("Moulay Yacoub", new double[]{34.0867, -5.1794});
        MOROCCAN_CITIES.put("El Hajeb", new double[]{33.6869, -5.3706});
        MOROCCAN_CITIES.put("Azrou", new double[]{33.4342, -5.2208});
        MOROCCAN_CITIES.put("Boulemane", new double[]{33.3625, -4.7306});
        MOROCCAN_CITIES.put("Missour", new double[]{33.0478, -3.9942});
        MOROCCAN_CITIES.put("Taounate", new double[]{34.5369, -4.6397});

        // Tanger-Tétouan-Al Hoceïma Region
        MOROCCAN_CITIES.put("Asilah", new double[]{35.4650, -6.0344});
        MOROCCAN_CITIES.put("Fnideq", new double[]{35.8503, -5.3572});
        MOROCCAN_CITIES.put("M'diq", new double[]{35.6833, -5.3333});
        MOROCCAN_CITIES.put("Martil", new double[]{35.6167, -5.2667});
        MOROCCAN_CITIES.put("Ouazzane", new double[]{34.7956, -5.5806});
        MOROCCAN_CITIES.put("Ksar El Kebir", new double[]{35.0000, -5.9000});
        MOROCCAN_CITIES.put("Chaouen", new double[]{35.1714, -5.2697});
        MOROCCAN_CITIES.put("Targuist", new double[]{34.9394, -4.3100});
        MOROCCAN_CITIES.put("Imzouren", new double[]{35.1453, -3.8550});
        MOROCCAN_CITIES.put("Bni Bouayach", new double[]{35.1036, -3.8594});

        // Oriental Region
        MOROCCAN_CITIES.put("Taourirt", new double[]{34.4167, -2.9000});
        MOROCCAN_CITIES.put("Jerada", new double[]{34.3117, -2.1606});
        MOROCCAN_CITIES.put("Figuig", new double[]{32.1108, -1.2289});
        MOROCCAN_CITIES.put("Bouarfa", new double[]{32.5308, -1.9650});
        MOROCCAN_CITIES.put("Driouch", new double[]{34.9792, -3.3861});
        MOROCCAN_CITIES.put("Zaio", new double[]{35.0000, -2.7333});
        MOROCCAN_CITIES.put("Saïdia", new double[]{35.0869, -2.2339});
        MOROCCAN_CITIES.put("Ahfir", new double[]{34.9539, -2.1022});

        // Béni Mellal-Khénifra Region
        MOROCCAN_CITIES.put("Khénifra", new double[]{32.9394, -5.6678});
        MOROCCAN_CITIES.put("Fquih Ben Salah", new double[]{32.5000, -6.6833});
        MOROCCAN_CITIES.put("Azilal", new double[]{31.9653, -6.5700});
        MOROCCAN_CITIES.put("Kasba Tadla", new double[]{32.5989, -6.2681});
        MOROCCAN_CITIES.put("Oued Zem", new double[]{32.8628, -6.5731});
        MOROCCAN_CITIES.put("Demnate", new double[]{31.7333, -6.9500});
        MOROCCAN_CITIES.put("El Ksiba", new double[]{32.5667, -6.0333});

        // Drâa-Tafilalet Region
        MOROCCAN_CITIES.put("Midelt", new double[]{32.6800, -4.7333});
        MOROCCAN_CITIES.put("Tinghir", new double[]{31.5147, -5.5328});
        MOROCCAN_CITIES.put("Zagora", new double[]{30.3306, -5.8381});
        MOROCCAN_CITIES.put("Rissani", new double[]{31.2833, -4.2667});
        MOROCCAN_CITIES.put("Merzouga", new double[]{31.0801, -4.0145});
        MOROCCAN_CITIES.put("Erfoud", new double[]{31.4314, -4.2286});
        MOROCCAN_CITIES.put("Goulmima", new double[]{31.6833, -4.9667});
        MOROCCAN_CITIES.put("Tinjdad", new double[]{31.5167, -5.0333});
        MOROCCAN_CITIES.put("Alnif", new double[]{31.1167, -5.1667});
        MOROCCAN_CITIES.put("M'hamid El Ghizlane", new double[]{29.8250, -5.7250});

        // Souss-Massa Region
        MOROCCAN_CITIES.put("Inezgane", new double[]{30.3550, -9.5333});
        MOROCCAN_CITIES.put("Aït Melloul", new double[]{30.3342, -9.4978});
        MOROCCAN_CITIES.put("Taroudant", new double[]{30.4700, -8.8769});
        MOROCCAN_CITIES.put("Tiznit", new double[]{29.6972, -9.7319});
        MOROCCAN_CITIES.put("Chtouka Aït Baha", new double[]{30.0667, -9.1500});
        MOROCCAN_CITIES.put("Biougra", new double[]{30.2167, -9.3667});
        MOROCCAN_CITIES.put("Ouled Teima", new double[]{30.4000, -9.2167});
        MOROCCAN_CITIES.put("Oulad Berhil", new double[]{30.5333, -8.4500});
        MOROCCAN_CITIES.put("Tafraout", new double[]{29.7233, -8.9753});
        MOROCCAN_CITIES.put("Sidi Ifni", new double[]{29.3833, -10.1667});

        // Guelmim-Oued Noun Region
        MOROCCAN_CITIES.put("Tan-Tan", new double[]{28.4378, -11.1028});
        MOROCCAN_CITIES.put("Assa", new double[]{28.6167, -9.4333});
        MOROCCAN_CITIES.put("Zag", new double[]{28.0167, -9.3333});
        MOROCCAN_CITIES.put("Sidi Ifni", new double[]{29.3797, -10.1731});

        // Laâyoune-Sakia El Hamra Region
        MOROCCAN_CITIES.put("Boujdour", new double[]{26.1267, -14.4850});
        MOROCCAN_CITIES.put("Smara", new double[]{26.7389, -11.6722});
        MOROCCAN_CITIES.put("Tarfaya", new double[]{27.9386, -12.9267});
        MOROCCAN_CITIES.put("El Marsa", new double[]{27.1167, -13.4167});

        // Dakhla-Oued Ed-Dahab Region
        MOROCCAN_CITIES.put("Bir Gandouz", new double[]{22.0333, -14.7000});
        MOROCCAN_CITIES.put("Aousserd", new double[]{22.5500, -14.3333});
        MOROCCAN_CITIES.put("Lagouira", new double[]{20.9833, -17.1000});

        // Additional Notable Towns - North
        MOROCCAN_CITIES.put("Moulay Bousselham", new double[]{34.8750, -6.2917});
        MOROCCAN_CITIES.put("Bab Taza", new double[]{35.0667, -5.1833});
        MOROCCAN_CITIES.put("Jebha", new double[]{35.2167, -4.6667});
        MOROCCAN_CITIES.put("Kétama", new double[]{34.9167, -4.5833});
        MOROCCAN_CITIES.put("Bab Berred", new double[]{34.9000, -4.8833});

        // Additional Notable Towns - Center
        MOROCCAN_CITIES.put("Rommani", new double[]{33.5333, -6.6000});
        MOROCCAN_CITIES.put("Oulmès", new double[]{33.4333, -6.0167});
        MOROCCAN_CITIES.put("Boujniba", new double[]{32.8833, -6.7833});
        MOROCCAN_CITIES.put("Zaouiat Cheikh", new double[]{32.6500, -5.9167});
        MOROCCAN_CITIES.put("Itzer", new double[]{32.8833, -5.0333});

        // Additional Notable Towns - South
        MOROCCAN_CITIES.put("Imintanoute", new double[]{31.1833, -8.8500});
        MOROCCAN_CITIES.put("Igherm", new double[]{30.0667, -8.4333});
        MOROCCAN_CITIES.put("Tafraoute", new double[]{29.7233, -8.9753});
        MOROCCAN_CITIES.put("Taghazout", new double[]{30.5439, -9.7106});
        MOROCCAN_CITIES.put("Tamri", new double[]{30.7167, -9.8333});
        MOROCCAN_CITIES.put("Paradise Valley", new double[]{30.5833, -9.6667});

        // Atlas Mountains Towns
        MOROCCAN_CITIES.put("Imlil", new double[]{31.1378, -7.9197});
        MOROCCAN_CITIES.put("Oukaïmeden", new double[]{31.2000, -7.8667});
        MOROCCAN_CITIES.put("Asni", new double[]{31.2500, -7.9833});
        MOROCCAN_CITIES.put("Tizi n'Test", new double[]{30.8667, -8.3833});
        MOROCCAN_CITIES.put("Aït Benhaddou", new double[]{31.0472, -7.1297});
        MOROCCAN_CITIES.put("Skoura", new double[]{31.0667, -6.5667});
        MOROCCAN_CITIES.put("Boumalne Dadès", new double[]{31.3667, -5.9833});
        MOROCCAN_CITIES.put("Todra Gorge", new double[]{31.5881, -5.5842});
        MOROCCAN_CITIES.put("Tighza", new double[]{31.4500, -5.8833});

        // Coastal Towns
        MOROCCAN_CITIES.put("Aglou", new double[]{29.8167, -9.8333});
        MOROCCAN_CITIES.put("Mirleft", new double[]{29.5833, -10.0333});
        MOROCCAN_CITIES.put("Legzira", new double[]{29.5100, -10.0700});
        MOROCCAN_CITIES.put("Moulay Bouzerktoune", new double[]{31.6167, -9.6167});
        MOROCCAN_CITIES.put("Oualidia", new double[]{32.7333, -9.0500});
        MOROCCAN_CITIES.put("Azemmour", new double[]{33.2833, -8.3500});
        MOROCCAN_CITIES.put("Bouznika", new double[]{33.7833, -7.1667});
        MOROCCAN_CITIES.put("Harhoura", new double[]{33.9500, -6.9333});
        MOROCCAN_CITIES.put("Mehdia", new double[]{34.2500, -6.6667});
        MOROCCAN_CITIES.put("Moulay Bousselham", new double[]{34.8750, -6.2917});

        // Additional Provincial Capitals
        MOROCCAN_CITIES.put("Aïn Leuh", new double[]{33.2833, -5.3500});
        MOROCCAN_CITIES.put("Had Kourt", new double[]{34.6167, -5.7333});
        MOROCCAN_CITIES.put("Mechra Bel Ksiri", new double[]{34.5667, -5.9500});
        MOROCCAN_CITIES.put("Jorf El Melha", new double[]{34.4833, -5.5000});
        MOROCCAN_CITIES.put("Zagota", new double[]{34.4500, -5.0667});
        MOROCCAN_CITIES.put("Aknoul", new double[]{34.6500, -3.8667});
        MOROCCAN_CITIES.put("Guercif", new double[]{34.2333, -3.3500});
        MOROCCAN_CITIES.put("Debdou", new double[]{33.9833, -3.0500});
        MOROCCAN_CITIES.put("Ain Bni Mathar", new double[]{34.0167, -2.0333});
        MOROCCAN_CITIES.put("Touissit", new double[]{34.4667, -1.7833});

        // More Towns
        MOROCCAN_CITIES.put("Ain Taoujdate", new double[]{33.9333, -5.2167});
        MOROCCAN_CITIES.put("My Driss Zerhoun", new double[]{34.0500, -5.5333});
        MOROCCAN_CITIES.put("Volubilis", new double[]{34.0722, -5.5544});
        MOROCCAN_CITIES.put("Agourai", new double[]{33.6333, -5.5833});
        MOROCCAN_CITIES.put("Boufekrane", new double[]{33.8000, -5.3667});
        MOROCCAN_CITIES.put("Toulal", new double[]{33.9167, -5.4833});
        MOROCCAN_CITIES.put("Outat El Haj", new double[]{33.4000, -3.7000});
        MOROCCAN_CITIES.put("Ribat El Kheir", new double[]{33.8333, -4.4167});
        MOROCCAN_CITIES.put("Bhalil", new double[]{33.8500, -4.8833});
        MOROCCAN_CITIES.put("Imouzzer Kandar", new double[]{33.7333, -5.0167});
        MOROCCAN_CITIES.put("Imouzzer Marmoucha", new double[]{33.4667, -4.3667});

        // Desert & Oasis Towns
        MOROCCAN_CITIES.put("Hassilabied", new double[]{31.0944, -3.9708});
        MOROCCAN_CITIES.put("Khamlia", new double[]{31.0333, -3.9833});
        MOROCCAN_CITIES.put("Taouz", new double[]{31.0500, -3.9667});
        MOROCCAN_CITIES.put("Meski", new double[]{31.7833, -4.2833});
        MOROCCAN_CITIES.put("Ziz Valley", new double[]{31.8667, -4.3167});
        MOROCCAN_CITIES.put("Tafilalet", new double[]{31.4333, -4.2500});
        MOROCCAN_CITIES.put("Tazzarine", new double[]{30.7833, -5.5667});
        MOROCCAN_CITIES.put("N'kob", new double[]{30.8833, -5.8833});
        MOROCCAN_CITIES.put("Agdz", new double[]{30.7000, -6.4500});
        MOROCCAN_CITIES.put("Draa Valley", new double[]{30.4500, -6.0000});
        MOROCCAN_CITIES.put("Tamgroute", new double[]{29.9667, -5.8167});
        MOROCCAN_CITIES.put("Tamegroute", new double[]{29.9667, -5.8167});
    }

    @PostConstruct
    @Transactional
    public void initializeCities() {
        if (villeRepository.count() == 0) {
            log.info("Initializing Moroccan cities database...");
            MOROCCAN_CITIES.forEach((name, coords) -> {
                VilleEntity ville = VilleEntity.builder()
                        .name(name)
                        .latitude(coords[0])
                        .longitude(coords[1])
                        .build();
                villeRepository.save(ville);
            });
            log.info("Initialized {} Moroccan cities", MOROCCAN_CITIES.size());
        }
    }

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

    @Transactional(readOnly = true)
    public long getCitiesCount() {
        return villeRepository.count();
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
