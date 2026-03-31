package com.PolluSense_Geo.dto;

import lombok.*;

import java.util.Map;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class HealthAlertDTO {
    private String severity; // GOOD, MODERATE, UNHEALTHY, VERY_UNHEALTHY, HAZARDOUS
    private int aqi;
    private double temperature;
    private String nodeId;
    private String locationName;
    private double distanceKm;
    private String temperatureAlert; // null if normal

    // Structured advisory sections from Gemini
    private String summary; // One-line overall verdict
    private String aqiAdvice; // AQI-specific health advice
    private String tempAdvice; // Temperature-specific advice
    private String sensitiveGroups; // Advice for vulnerable populations
    private String actionTip; // One practical thing to do now
}
