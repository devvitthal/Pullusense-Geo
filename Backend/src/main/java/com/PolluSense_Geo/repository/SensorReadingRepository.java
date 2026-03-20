package com.PolluSense_Geo.repository;

import com.PolluSense_Geo.entity.SensorReading;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface SensorReadingRepository extends JpaRepository<SensorReading, Long> {

    /**
     * Finds the most recent reading for a given node, ordered by createdAt descending.
     */
    Optional<SensorReading> findTopByNodeIdOrderByCreatedAtDesc(String nodeId);

    /**
     * Returns the full history for a given node, newest first.
     */
    List<SensorReading> findByNodeIdOrderByCreatedAtDesc(String nodeId);

    /**
     * Returns the latest reading for every distinct node.
     */
    @Query("""
            SELECT s FROM SensorReading s
            WHERE s.createdAt = (
                SELECT MAX(s2.createdAt) FROM SensorReading s2
                WHERE s2.nodeId = s.nodeId
            )
            ORDER BY s.nodeId ASC
            """)
    List<SensorReading> findLatestForAllNodes();
}
