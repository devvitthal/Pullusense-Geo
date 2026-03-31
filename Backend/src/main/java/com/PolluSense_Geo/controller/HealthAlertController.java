package com.PolluSense_Geo.controller;

import com.PolluSense_Geo.dto.HealthAlertDTO;
import com.PolluSense_Geo.entity.SensorReading;
import com.PolluSense_Geo.service.GeminiHealthService;
import com.PolluSense_Geo.service.SensorDataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/health-alert")
@RequiredArgsConstructor
@Slf4j
public class HealthAlertController {

    private final SensorDataService sensorDataService;
    private final GeminiHealthService geminiHealthService;

    @Value("${app.alertRadiusKm:5.0}")
    private double alertRadiusKm;

    /**
     * GET /api/health-alert?lat=...&lon=...
     * Returns the closest nearby node's health advisory using Gemini AI.
     */
    @GetMapping
    public ResponseEntity<HealthAlertDTO> getHealthAlert(
            @RequestParam double lat,
            @RequestParam double lon) {

        log.info("GET /api/health-alert lat={}, lon={}", lat, lon);

        List<SensorReading> latestReadings = sensorDataService.getAllLatestData();

        // Find the closest node within the configured radius
        SensorReading closest = null;
        double minDistance = Double.MAX_VALUE;

        for (SensorReading reading : latestReadings) {
            if (reading.getLatitude() == null || reading.getLongitude() == null)
                continue;
            double dist = haversine(lat, lon, reading.getLatitude(), reading.getLongitude());
            if (dist < minDistance && dist <= alertRadiusKm) {
                minDistance = dist;
                closest = reading;
            }
        }

        if (closest == null) {
            // No nearby nodes — still provide general advisory based on the closest node
            closest = latestReadings.stream()
                    .filter(r -> r.getLatitude() != null && r.getLongitude() != null)
                    .min(Comparator.comparingDouble(
                            r -> haversine(lat, lon, r.getLatitude(), r.getLongitude())))
                    .orElse(null);

            if (closest == null) {
                return ResponseEntity.ok(HealthAlertDTO.builder()
                        .severity("UNKNOWN")
                        .summary("No sensor nodes available. Unable to assess air quality in your area.")
                        .build());
            }
            minDistance = haversine(lat, lon, closest.getLatitude(), closest.getLongitude());
        }

        String severity = classifySeverity(closest.getAqi());
        String tempAlert = classifyTemperature(closest.getTemperature());
        Map<String, String> advisory = geminiHealthService.getHealthAdvisory(
                closest.getAqi(), closest.getTemperature(), closest.getLocationName());

        HealthAlertDTO alert = HealthAlertDTO.builder()
                .severity(severity)
                .aqi(closest.getAqi())
                .temperature(closest.getTemperature())
                .nodeId(closest.getNodeId())
                .locationName(closest.getLocationName())
                .distanceKm(Math.round(minDistance * 100.0) / 100.0)
                .temperatureAlert(tempAlert)
                .summary(advisory.getOrDefault("SUMMARY", ""))
                .aqiAdvice(advisory.getOrDefault("AQI_ADVICE", ""))
                .tempAdvice(advisory.getOrDefault("TEMP_ADVICE", ""))
                .sensitiveGroups(advisory.getOrDefault("SENSITIVE_GROUPS", ""))
                .actionTip(advisory.getOrDefault("ACTION_TIP", ""))
                .build();

        return ResponseEntity.ok(alert);
    }

    /**
     * Haversine formula — distance in km between two GPS points.
     */
    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0; // Earth radius in km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    private String classifySeverity(int aqi) {
        if (aqi <= 50)
            return "GOOD";
        if (aqi <= 100)
            return "MODERATE";
        if (aqi <= 150)
            return "UNHEALTHY_SENSITIVE";
        if (aqi <= 200)
            return "UNHEALTHY";
        if (aqi <= 300)
            return "VERY_UNHEALTHY";
        return "HAZARDOUS";
    }

    private String classifyTemperature(double temp) {
        if (temp > 40)
            return "Extreme heat — risk of heat stroke. Stay indoors and hydrate.";
        if (temp > 35)
            return "High temperature — avoid prolonged sun exposure.";
        if (temp < 0)
            return "Freezing conditions — dress warmly and limit outdoor exposure.";
        if (temp < 5)
            return "Very cold — wear warm layers and stay dry.";
        return null; // normal range
    }
}
