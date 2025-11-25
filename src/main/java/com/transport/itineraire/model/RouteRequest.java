package com.transport.itineraire.model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class RouteRequest {
    private Waypoint origin;
    private Waypoint destination;
    private String originAddress;
    private String destinationAddress;
    private List<Waypoint> waypoints;
    private Boolean includeReturn;
    private String userId;
    private String requestId;

}
