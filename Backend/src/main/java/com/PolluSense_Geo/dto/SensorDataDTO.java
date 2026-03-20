package com.PolluSense_Geo.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SensorDataDTO {

    @NotBlank(message = "Node ID must not be blank")
    private String nodeId;

    @NotNull(message = "AQI must not be null")
    @Min(value = 0, message = "AQI must be at least 0")
    @Max(value = 500, message = "AQI must not exceed 500")
    private Integer aqi;

    @NotNull(message = "Temperature must not be null")
    @DecimalMin(value = "-90.0", message = "Temperature must be at least -90°C")
    @DecimalMax(value = "60.0", message = "Temperature must not exceed 60°C")
    private Double temperature;

    @NotNull(message = "Humidity must not be null")
    @DecimalMin(value = "0.0", message = "Humidity must be at least 0%")
    @DecimalMax(value = "100.0", message = "Humidity must not exceed 100%")
    private Double humidity;

    @DecimalMin(value = "-90.0", message = "Latitude must be between -90 and 90")
    @DecimalMax(value = "90.0", message = "Latitude must be between -90 and 90")
    private Double latitude;

    @DecimalMin(value = "-180.0", message = "Longitude must be between -180 and 180")
    @DecimalMax(value = "180.0", message = "Longitude must be between -180 and 180")
    private Double longitude;

    @NotNull(message = "Timestamp must not be null")
    private Long timestamp;
}
