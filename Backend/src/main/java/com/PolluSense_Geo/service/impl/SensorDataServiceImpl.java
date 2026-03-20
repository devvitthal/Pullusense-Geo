package com.PolluSense_Geo.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.PolluSense_Geo.dto.SensorDataDTO;
import com.PolluSense_Geo.entity.SensorReading;
import com.PolluSense_Geo.exception.ResourceNotFoundException;
import com.PolluSense_Geo.repository.SensorReadingRepository;
import com.PolluSense_Geo.service.GeoLocationService;
import com.PolluSense_Geo.service.SensorDataService;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

@Service
@RequiredArgsConstructor
@Slf4j
public class SensorDataServiceImpl implements SensorDataService {

    private final SensorReadingRepository sensorReadingRepository;
    private final GeoLocationService geoLocationService;

    @Override
    @Transactional
    public SensorReading saveSensorData(SensorDataDTO dto) {
        log.debug("Saving sensor data from node: {}", dto.getNodeId());

        Double latitude  = dto.getLatitude();
        Double longitude = dto.getLongitude();
        String locationName;

        if (latitude == null || longitude == null) {
            // No GPS fix from IoT node — fall back to server's IP-based location
            log.info("Latitude/Longitude is null for node={}. Using server location as fallback.",
                    dto.getNodeId());
            latitude     = geoLocationService.getLatitude();
            longitude    = geoLocationService.getLongitude();
            locationName = geoLocationService.getLocationName();
            log.info("Fallback coordinates: lat={}, lon={}, location={}", latitude, longitude, locationName);
        } else {
            // GPS fix available — reverse-geocode to get a human-readable name
            locationName = geoLocationService.reverseGeocode(latitude, longitude);
            log.info("GPS location name for node={}: {}", dto.getNodeId(), locationName);
        }

        SensorReading reading = SensorReading.builder()
                .nodeId(dto.getNodeId())
                .aqi(dto.getAqi())
                .temperature(dto.getTemperature())
                .humidity(dto.getHumidity())
                .latitude(latitude)
                .longitude(longitude)
                .locationName(locationName)
                .timestamp(dto.getTimestamp())
                .build();

        SensorReading saved = sensorReadingRepository.save(reading);
        log.info("Saved reading id={} for node={}", saved.getId(), saved.getNodeId());
        return saved;
    }

    @Override
    @Transactional(readOnly = true)
    public SensorReading getLatestByNode(String nodeId) {
        log.debug("Fetching latest reading for node: {}", nodeId);
        return sensorReadingRepository.findTopByNodeIdOrderByCreatedAtDesc(nodeId)
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No sensor data found for node: " + nodeId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SensorReading> getAllLatestData() {
        log.debug("Fetching latest readings for all nodes");
        return sensorReadingRepository.findLatestForAllNodes();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SensorReading> getHistoryByNode(String nodeId) {
        log.debug("Fetching history for node: {}", nodeId);
        List<SensorReading> history = sensorReadingRepository.findByNodeIdOrderByCreatedAtDesc(nodeId);
        if (history.isEmpty()) {
            throw new ResourceNotFoundException("No sensor data found for node: " + nodeId);
        }
        return history;
    }
}
