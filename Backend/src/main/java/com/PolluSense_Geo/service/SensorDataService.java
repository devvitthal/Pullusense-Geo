package com.PolluSense_Geo.service;

import com.PolluSense_Geo.dto.SensorDataDTO;
import com.PolluSense_Geo.entity.SensorReading;

import java.util.List;

public interface SensorDataService {

    /**
     * Persists incoming sensor data from an IoT node.
     */
    SensorReading saveSensorData(SensorDataDTO dto);

    /**
     * Returns the most recent reading for the given node.
     *
     * @throws com.PolluSense_Geo.exception.ResourceNotFoundException if no data exists for the node
     */
    SensorReading getLatestByNode(String nodeId);

    /**
     * Returns the latest reading for every known node.
     */
    List<SensorReading> getAllLatestData();

    /**
     * Returns the full reading history for the given node, newest first.
     *
     * @throws com.PolluSense_Geo.exception.ResourceNotFoundException if no data exists for the node
     */
    List<SensorReading> getHistoryByNode(String nodeId);
}
