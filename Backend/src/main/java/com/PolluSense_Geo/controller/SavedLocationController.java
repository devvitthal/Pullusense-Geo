package com.PolluSense_Geo.controller;

import com.PolluSense_Geo.dto.SavedLocationDTO;
import com.PolluSense_Geo.entity.SavedLocation;
import com.PolluSense_Geo.entity.User;
import com.PolluSense_Geo.exception.ResourceNotFoundException;
import com.PolluSense_Geo.repository.SavedLocationRepository;
import com.PolluSense_Geo.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
public class SavedLocationController {

    private final SavedLocationRepository locationRepository;
    private final UserRepository userRepository;

    private static final int MAX_LOCATIONS = 10;

    @GetMapping
    public ResponseEntity<List<SavedLocationDTO>> getLocations(Authentication auth) {
        User user = getUser(auth);
        List<SavedLocationDTO> locations = locationRepository.findByUserIdOrderByCreatedAtDesc(user.getId())
                .stream()
                .map(this::toDTO)
                .toList();
        return ResponseEntity.ok(locations);
    }

    @PostMapping
    public ResponseEntity<?> addLocation(@Valid @RequestBody SavedLocationDTO dto, Authentication auth) {
        User user = getUser(auth);

        if (locationRepository.countByUserId(user.getId()) >= MAX_LOCATIONS) {
            return ResponseEntity.badRequest().body(
                    new com.PolluSense_Geo.dto.MessageResponse("Maximum " + MAX_LOCATIONS + " locations allowed."));
        }

        SavedLocation location = SavedLocation.builder()
                .user(user)
                .label(dto.getLabel().trim())
                .latitude(dto.getLatitude())
                .longitude(dto.getLongitude())
                .alertsEnabled(dto.getAlertsEnabled() != null ? dto.getAlertsEnabled() : true)
                .build();

        locationRepository.save(location);
        return ResponseEntity.status(HttpStatus.CREATED).body(toDTO(location));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateLocation(@PathVariable Long id,
            @Valid @RequestBody SavedLocationDTO dto, Authentication auth) {
        User user = getUser(auth);
        SavedLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        if (!location.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        location.setLabel(dto.getLabel().trim());
        location.setLatitude(dto.getLatitude());
        location.setLongitude(dto.getLongitude());
        if (dto.getAlertsEnabled() != null) {
            location.setAlertsEnabled(dto.getAlertsEnabled());
        }

        locationRepository.save(location);
        return ResponseEntity.ok(toDTO(location));
    }

    @PatchMapping("/{id}/toggle-alerts")
    public ResponseEntity<?> toggleAlerts(@PathVariable Long id, Authentication auth) {
        User user = getUser(auth);
        SavedLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        if (!location.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        location.setAlertsEnabled(!location.getAlertsEnabled());
        locationRepository.save(location);
        return ResponseEntity.ok(toDTO(location));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteLocation(@PathVariable Long id, Authentication auth) {
        User user = getUser(auth);
        SavedLocation location = locationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Location not found"));

        if (!location.getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        locationRepository.delete(location);
        return ResponseEntity.noContent().build();
    }

    private User getUser(Authentication auth) {
        return userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private SavedLocationDTO toDTO(SavedLocation loc) {
        return SavedLocationDTO.builder()
                .id(loc.getId())
                .label(loc.getLabel())
                .latitude(loc.getLatitude())
                .longitude(loc.getLongitude())
                .alertsEnabled(loc.getAlertsEnabled())
                .createdAt(loc.getCreatedAt() != null ? loc.getCreatedAt().toString() : null)
                .build();
    }
}
