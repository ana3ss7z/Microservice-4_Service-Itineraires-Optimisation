package com.transport.itineraire.model;
import lombok.*;
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
