package com.transport.itineraire.model;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data @Builder @NoArgsConstructor @AllArgsConstructor
public class Waypoint {
    private String name;
    private String address;
    private Double latitude;
    private Double longitude;
    private Integer order;
    private String city;
}
