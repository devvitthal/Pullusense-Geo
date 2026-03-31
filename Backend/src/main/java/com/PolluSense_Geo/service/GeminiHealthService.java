package com.PolluSense_Geo.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import lombok.extern.slf4j.Slf4j;

@Service
@Slf4j
public class GeminiHealthService {

    private final WebClient webClient;
    private final String apiKey;

    public GeminiHealthService(@Value("${app.geminiApiKey}") String apiKey) {
        this.apiKey = apiKey;
        this.webClient = WebClient.builder()
                .baseUrl("https://generativelanguage.googleapis.com")
                .build();
    }

    /**
     * Calls Gemini and returns a structured advisory map with keys:
     * summary, aqiAdvice, temperatureAdvice, sensitiveGroups, actionTip
     */
    public Map<String, String> getHealthAdvisory(int aqi, double temperature, String locationName) {
        String prompt = buildPrompt(aqi, temperature, locationName);

        try {
            Map<String, Object> body = Map.of(
                    "contents", List.of(
                            Map.of("parts", List.of(
                                    Map.of("text", prompt)))));

            Map<?, ?> response = webClient.post()
                    .uri("/v1beta/models/gemini-2.0-flash:generateContent?key={key}", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(body)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            String raw = extractText(response);
            return parseStructuredResponse(raw);
        } catch (Exception e) {
            log.error("Gemini API call failed: {}", e.getMessage());
            return getFallbackAdvisory(aqi, temperature);
        }
    }

    private String buildPrompt(int aqi, double temperature, String locationName) {
        return String.format(
                """
                        You are a health advisor for an IoT air quality monitoring app called PolluSense Geo.

                        Current conditions near %s:
                        - AQI (Air Quality Index): %d
                        - Temperature: %.1f°C

                        Respond with EXACTLY 5 labeled sections separated by the labels shown below. Each section should be 1-2 sentences. You MUST address BOTH air quality AND temperature in every response.

                        SUMMARY: A one-line overall verdict combining both AQI and temperature (e.g. "Air quality is good but temperature is dangerously high").
                        AQI_ADVICE: What the AQI number means for health and specific outdoor activity recommendations. Mention whether it's safe to exercise, walk, or be outside.
                        TEMP_ADVICE: Temperature impact on health — hydration, clothing, sun protection, heat/cold precautions as relevant. If comfortable, say so and mention it's favorable. Always address temperature even if normal.
                        SENSITIVE_GROUPS: Tailored advice for children, elderly, pregnant women, and people with respiratory or heart conditions, combining both AQI and temperature factors.
                        ACTION_TIP: One specific, practical thing the user can do right now.

                        Rules:
                        - Use the exact labels above followed by a colon.
                        - Do NOT use markdown, bullet points, numbered lists, or asterisks.
                        - Write in plain flowing sentences.
                        - Even if AQI is good, give meaningful temperature advice. Even if temperature is normal, give meaningful AQI context.
                        """,
                locationName != null ? locationName : "the user's location", aqi, temperature);
    }

    @SuppressWarnings("unchecked")
    private String extractText(Map<?, ?> response) {
        if (response == null)
            return "";
        try {
            var candidates = (List<Map<String, Object>>) response.get("candidates");
            var content = (Map<String, Object>) candidates.get(0).get("content");
            var parts = (List<Map<String, Object>>) content.get("parts");
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            log.warn("Failed to parse Gemini response: {}", e.getMessage());
            return "";
        }
    }

    /**
     * Parses the labeled sections from Gemini's text response.
     */
    private Map<String, String> parseStructuredResponse(String raw) {
        Map<String, String> result = new LinkedHashMap<>();
        String[] keys = { "SUMMARY", "AQI_ADVICE", "TEMP_ADVICE", "SENSITIVE_GROUPS", "ACTION_TIP" };

        if (raw == null || raw.isBlank()) {
            return result;
        }

        for (int i = 0; i < keys.length; i++) {
            String startLabel = keys[i] + ":";
            int startIdx = raw.indexOf(startLabel);
            if (startIdx == -1)
                continue;

            int valueStart = startIdx + startLabel.length();
            int endIdx = raw.length();

            // Find the next label
            for (int j = i + 1; j < keys.length; j++) {
                int nextIdx = raw.indexOf(keys[j] + ":", valueStart);
                if (nextIdx != -1) {
                    endIdx = nextIdx;
                    break;
                }
            }

            String value = raw.substring(valueStart, endIdx).trim();
            result.put(keys[i], value);
        }

        // If parsing failed (no labels found), put everything under SUMMARY
        if (result.isEmpty()) {
            result.put("SUMMARY", raw.trim());
        }

        return result;
    }

    private Map<String, String> getFallbackAdvisory(int aqi, double temperature) {
        Map<String, String> result = new LinkedHashMap<>();

        // Summary
        String aqiLabel = aqi <= 50 ? "good" : aqi <= 100 ? "moderate" : aqi <= 200 ? "unhealthy" : "hazardous";
        String tempLabel = temperature > 40 ? "dangerously hot"
                : temperature > 35 ? "very warm"
                        : temperature > 30 ? "warm"
                                : temperature >= 10 ? "comfortable" : temperature >= 0 ? "cold" : "freezing";
        result.put("SUMMARY", String.format("Air quality is %s (AQI %d) and temperature is %s at %.1f°C.", aqiLabel,
                aqi, tempLabel, temperature));

        // AQI advice
        if (aqi <= 50) {
            result.put("AQI_ADVICE",
                    "Air quality is excellent — outdoor activities including jogging, cycling, and playing are perfectly safe for everyone.");
        } else if (aqi <= 100) {
            result.put("AQI_ADVICE",
                    "Air quality is acceptable. Most people can be active outdoors, but unusually sensitive individuals should consider reducing prolonged outdoor exertion.");
        } else if (aqi <= 150) {
            result.put("AQI_ADVICE",
                    "Air quality is unhealthy for sensitive groups. Consider wearing a mask outdoors and limit strenuous exercise. Keep duration of outdoor activities short.");
        } else if (aqi <= 200) {
            result.put("AQI_ADVICE",
                    "Air quality is unhealthy for everyone. Significantly reduce outdoor activities, keep windows closed, and consider using an air purifier indoors.");
        } else if (aqi <= 300) {
            result.put("AQI_ADVICE",
                    "Air quality is very unhealthy. Avoid all outdoor activities and keep air purifiers running indoors. Everyone may begin to experience health effects.");
        } else {
            result.put("AQI_ADVICE",
                    "Air quality is hazardous — this is a health emergency. Stay indoors, seal windows and doors, and run air purifiers on maximum.");
        }

        // Temperature advice
        if (temperature > 40) {
            result.put("TEMP_ADVICE", String.format(
                    "Temperature is dangerously high at %.1f°C with serious risk of heat stroke. Stay in air-conditioned spaces, drink water every 15 minutes, and avoid any sun exposure.",
                    temperature));
        } else if (temperature > 35) {
            result.put("TEMP_ADVICE", String.format(
                    "Temperature is very warm at %.1f°C. Stay hydrated, wear light and breathable clothing, apply sunscreen, and take frequent breaks in shade if you must be outdoors.",
                    temperature));
        } else if (temperature > 30) {
            result.put("TEMP_ADVICE", String.format(
                    "Temperature is warm at %.1f°C. Drink plenty of water, avoid strenuous outdoor activity during peak afternoon hours, and wear sun protection.",
                    temperature));
        } else if (temperature >= 10) {
            result.put("TEMP_ADVICE", String.format(
                    "Temperature is comfortable at %.1f°C — favorable conditions for outdoor activities if air quality permits.",
                    temperature));
        } else if (temperature >= 5) {
            result.put("TEMP_ADVICE", String.format(
                    "Temperature is cool at %.1f°C. Wear warm layers if heading outside and keep extremities covered.",
                    temperature));
        } else if (temperature >= 0) {
            result.put("TEMP_ADVICE", String.format(
                    "Temperature is very cold at %.1f°C. Dress warmly in multiple layers, cover exposed skin, and limit time outdoors.",
                    temperature));
        } else {
            result.put("TEMP_ADVICE", String.format(
                    "Temperature is below freezing at %.1f°C with risk of frostbite and hypothermia. Minimize outdoor exposure and wear fully insulated clothing.",
                    temperature));
        }

        // Sensitive groups
        result.put("SENSITIVE_GROUPS",
                "Children, elderly, pregnant women, and individuals with asthma, COPD, or heart conditions should take extra precautions. Monitor symptoms closely and stay in controlled environments when possible.");

        // Action tip
        if (aqi > 150) {
            result.put("ACTION_TIP",
                    "Turn on an air purifier now and check that all windows are sealed. If you don't have a purifier, a wet towel over a fan can help filter particles.");
        } else if (temperature > 35) {
            result.put("ACTION_TIP",
                    "Fill a water bottle and set a reminder to drink every 20 minutes. Apply SPF 30+ sunscreen if you plan to step outside.");
        } else if (temperature < 5) {
            result.put("ACTION_TIP",
                    "Layer up with thermal wear before stepping out and keep a warm beverage handy to maintain core body temperature.");
        } else {
            result.put("ACTION_TIP",
                    "Great conditions! Consider a walk or some outdoor exercise to make the most of the favorable air quality and weather.");
        }

        return result;
    }
}
