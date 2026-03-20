package com.PolluSense_Geo.service;

import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import lombok.extern.slf4j.Slf4j;

/**
 * Service to resolve geographic location information.
 * - Uses ip-api.com to detect the server's location when the IoT node sends no GPS fix.
 * - Uses Nominatim (OpenStreetMap) to reverse-geocode valid GPS coordinates into a human-readable name.
 * Falls back to configured default coordinates if any API call fails.
 */
@Service
@Slf4j
public class GeoLocationService {

    @Value("${geolocation.default.latitude:0.0}")
    private double defaultLatitude;

    @Value("${geolocation.default.longitude:0.0}")
    private double defaultLongitude;

    private final RestTemplate restTemplate = new RestTemplate();

    // Cached server (laptop) location resolved once from ip-api.com
    private Double cachedLatitude;
    private Double cachedLongitude;
    private String cachedLocationName;

    /** Server latitude resolved from IP geolocation (fallback when GPS is null). */
    public double getLatitude() {
        resolveServerLocationIfNeeded();
        return cachedLatitude;
    }

    /** Server longitude resolved from IP geolocation (fallback when GPS is null). */
    public double getLongitude() {
        resolveServerLocationIfNeeded();
        return cachedLongitude;
    }

    /** Human-readable location name resolved from IP geolocation (fallback when GPS is null). */
    public String getLocationName() {
        resolveServerLocationIfNeeded();
        return cachedLocationName;
    }

    /**
     * Reverse-geocodes the given GPS coordinates into a human-readable location name
     * using the Nominatim (OpenStreetMap) API. Returns null on failure.
     */
    @SuppressWarnings("unchecked")
    public String reverseGeocode(double latitude, double longitude) {
        try {
            String url = String.format(
                    "https://nominatim.openstreetmap.org/reverse?lat=%f&lon=%f&format=json",
                    latitude, longitude);

            // Nominatim requires a User-Agent header
            org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
            headers.set("User-Agent", "PolluSense-Geo/1.0");
            org.springframework.http.HttpEntity<Void> entity =
                    new org.springframework.http.HttpEntity<>(headers);

            Map<String, Object> response = restTemplate.exchange(
                    url,
                    org.springframework.http.HttpMethod.GET,
                    entity,
                    Map.class
            ).getBody();

            if (response != null && response.containsKey("address")) {
                Map<String, String> address = (Map<String, String>) response.get("address");
                // Build a concise name: neighbourhood/suburb, city, state
                String part1 = firstNonNull(address,
                        "neighbourhood", "suburb", "village", "town", "city_district");
                String city   = firstNonNull(address, "city", "town", "village", "county");
                String state  = address.getOrDefault("state", "");

                StringBuilder name = new StringBuilder();
                if (part1 != null && !part1.equals(city)) name.append(part1).append(", ");
                if (city  != null)                         name.append(city).append(", ");
                if (!state.isEmpty())                      name.append(state);

                String result = name.toString().replaceAll(",\\s*$", "").trim();
                log.info("Reverse geocoded ({}, {}) -> {}", latitude, longitude, result);
                return result.isEmpty() ? (String) response.get("display_name") : result;
            }
        } catch (Exception e) {
            log.warn("Reverse geocoding failed for ({}, {}): {}", latitude, longitude, e.getMessage());
        }
        return null;
    }

    // -----------------------------------------------------------------------
    // Private helpers
    // -----------------------------------------------------------------------

    @SuppressWarnings("unchecked")
    private synchronized void resolveServerLocationIfNeeded() {
        if (cachedLatitude != null && cachedLongitude != null) {
            return;
        }

        try {
            log.info("Resolving server location via IP geolocation API...");
            Map<String, Object> response = restTemplate.getForObject(
                    "http://ip-api.com/json/?fields=status,lat,lon,city,regionName",
                    Map.class
            );

            if (response != null && "success".equals(response.get("status"))) {
                cachedLatitude  = ((Number) response.get("lat")).doubleValue();
                cachedLongitude = ((Number) response.get("lon")).doubleValue();

                String city   = (String) response.get("city");
                String region = (String) response.get("regionName");
                cachedLocationName = (city != null && region != null)
                        ? city + ", " + region
                        : (city != null ? city : region);

                log.info("Resolved server location: lat={}, lon={}, name={}",
                        cachedLatitude, cachedLongitude, cachedLocationName);
            } else {
                log.warn("IP geolocation API returned non-success. Using default coordinates.");
                useDefaults();
            }
        } catch (Exception e) {
            log.warn("Failed to resolve server location: {}. Using defaults.", e.getMessage());
            useDefaults();
        }
    }

    private void useDefaults() {
        cachedLatitude     = defaultLatitude;
        cachedLongitude    = defaultLongitude;
        cachedLocationName = "Unknown Location";
    }

    private String firstNonNull(Map<String, String> map, String... keys) {
        for (String key : keys) {
            if (map.containsKey(key)) return map.get(key);
        }
        return null;
    }
}
