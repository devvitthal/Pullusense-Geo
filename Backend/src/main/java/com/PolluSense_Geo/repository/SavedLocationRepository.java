package com.PolluSense_Geo.repository;

import com.PolluSense_Geo.entity.SavedLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SavedLocationRepository extends JpaRepository<SavedLocation, Long> {
    List<SavedLocation> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<SavedLocation> findByAlertsEnabledTrue();

    long countByUserId(Long userId);
}
