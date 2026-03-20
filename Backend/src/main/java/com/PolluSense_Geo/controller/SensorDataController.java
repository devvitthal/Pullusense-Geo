package com.PolluSense_Geo.controller;

import com.PolluSense_Geo.dto.SensorDataDTO;
import com.PolluSense_Geo.entity.SensorReading;
import com.PolluSense_Geo.service.SensorDataService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/sensor-data")
@RequiredArgsConstructor
@Slf4j
public class SensorDataController {

    private final SensorDataService sensorDataService;

    /**
     * POST /api/sensor-data
     * Accepts a JSON payload from an IoT device and persists it.
     */
    @PostMapping
    public ResponseEntity<SensorReading> ingestSensorData(@Valid @RequestBody SensorDataDTO dto) {
        log.info("POST /api/sensor-data from node={}", dto.getNodeId());
        SensorReading saved = sensorDataService.saveSensorData(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    /**
     * GET /api/sensor-data/latest/{nodeId}
     * Returns the most recent reading for a specific node.
     */
    @GetMapping("/latest/{nodeId}")
    public ResponseEntity<SensorReading> getLatestByNode(@PathVariable String nodeId) {
        log.info("GET /api/sensor-data/latest/{}", nodeId);
        return ResponseEntity.ok(sensorDataService.getLatestByNode(nodeId));
    }

    /**
     * GET /api/sensor-data/latest
     * Returns the latest reading for every registered node.
     */
    @GetMapping("/latest")
    public ResponseEntity<List<SensorReading>> getAllLatestData() {
        log.info("GET /api/sensor-data/latest");
        return ResponseEntity.ok(sensorDataService.getAllLatestData());
    }

    /**
     * GET /api/sensor-data/history/{nodeId}
     * Returns the full reading history for a specific node (newest first).
     */
    @GetMapping("/history/{nodeId}")
    public ResponseEntity<List<SensorReading>> getHistoryByNode(@PathVariable String nodeId) {
        log.info("GET /api/sensor-data/history/{}", nodeId);
        return ResponseEntity.ok(sensorDataService.getHistoryByNode(nodeId));
    }
}
