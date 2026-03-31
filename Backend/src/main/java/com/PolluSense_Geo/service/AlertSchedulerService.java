package com.PolluSense_Geo.service;

import com.PolluSense_Geo.entity.SavedLocation;
import com.PolluSense_Geo.entity.SensorReading;
import com.PolluSense_Geo.repository.SavedLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AlertSchedulerService {

    private final SavedLocationRepository savedLocationRepository;
    private final SensorDataService sensorDataService;
    private final EmailNotificationService emailService;
    private final WebPushService webPushService;

    @Value("${app.alertRadiusKm:5.0}")
    private double alertRadiusKm;

    /** AQI threshold above which alerts fire (51 = Moderate and above). */
    private static final int AQI_THRESHOLD = 51;

    /**
     * Track last alert per location to avoid spamming (locationId → last alerted
     * AQI bracket).
     */
    private final Map<Long, String> lastAlertedSeverity = new HashMap<>();

    /**
     * Runs every 5 minutes. Checks all saved locations with alerts enabled,
     * finds nearby sensor data, and fires email + push if AQI is unhealthy.
     */
    @Scheduled(fixedRate = 300_000, initialDelay = 60_000)
    public void checkAlerts() {
        List<SavedLocation> locations = savedLocationRepository.findByAlertsEnabledTrue();
        if (locations.isEmpty())
            return;

        List<SensorReading> latestReadings = sensorDataService.getAllLatestData();
        if (latestReadings.isEmpty())
            return;

        log.debug("Alert check: {} locations, {} nodes", locations.size(), latestReadings.size());

        for (SavedLocation loc : locations) {
            try {
                processLocation(loc, latestReadings);
            } catch (Exception e) {
                log.error("Alert check failed for location {}: {}", loc.getId(), e.getMessage());
            }
        }
    }

    private void processLocation(SavedLocation loc, List<SensorReading> readings) {
        // Find closest node within radius
        SensorReading closest = null;
        double minDist = Double.MAX_VALUE;

        for (SensorReading r : readings) {
            if (r.getLatitude() == null || r.getLongitude() == null)
                continue;
            double dist = haversine(loc.getLatitude(), loc.getLongitude(),
                    r.getLatitude(), r.getLongitude());
            if (dist < minDist && dist <= alertRadiusKm) {
                minDist = dist;
                closest = r;
            }
        }

        if (closest == null)
            return;

        String severity = classifySeverity(closest.getAqi());
        boolean shouldAlert = closest.getAqi() >= AQI_THRESHOLD;

        if (!shouldAlert)
            return;

        String email = loc.getUser().getEmail();
        String label = loc.getLabel();
        int aqi = closest.getAqi();
        double temp = closest.getTemperature();

        String summary = String.format("AQI at %s is %d (%s). Take precautions.", label, aqi, severity);
        String actionTip = aqi > 300
                ? "Stay indoors, seal windows, use air purifier."
                : aqi > 200 ? "Avoid outdoor exercise, wear N95 mask outside."
                        : "Sensitive groups should limit outdoor activity.";

        // Send email
        emailService.sendAlertEmail(email, label, aqi, temp, severity, summary, actionTip);

        // Send push notification
        Long userId = loc.getUser().getId();
        webPushService.sendPushToUser(userId,
                "⚠ " + severity + " at " + label,
                "AQI: " + aqi + " — " + actionTip,
                "/dashboard");

        log.info("Alert fired for user {} location '{}': AQI={} severity={}", userId, label, aqi, severity);
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

    private double haversine(double lat1, double lon1, double lat2, double lon2) {
        final double R = 6371.0;
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    }
}
