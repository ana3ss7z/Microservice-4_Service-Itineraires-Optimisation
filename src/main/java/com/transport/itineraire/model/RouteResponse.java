package com.transport.itineraire.model;
import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RouteResponse {
    private String routeId;
    private Double distanceKm;
    private Integer durationMin;
    private List<Waypoint> steps;
    private String routePolyline;

    // 🟩 Add these:
    private Double returnDistanceKm;
    private Integer returnDurationMin;


    private Double totalDistanceKm;
    private Integer totalDurationMin;
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime calculatedAt;
    private String status;
    private List<String> instructions;
}
