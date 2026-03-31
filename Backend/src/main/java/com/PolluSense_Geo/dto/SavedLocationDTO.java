package com.PolluSense_Geo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SavedLocationDTO {
    private Long id;

    @NotBlank(message = "Label is required")
    @Size(max = 50, message = "Label must be under 50 characters")
    private String label;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    private Boolean alertsEnabled;
    private String createdAt;
}
