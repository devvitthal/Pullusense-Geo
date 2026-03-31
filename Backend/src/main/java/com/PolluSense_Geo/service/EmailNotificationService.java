package com.PolluSense_Geo.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailNotificationService {

    private final JavaMailSender mailSender;

    @Async
    public void sendAlertEmail(String to, String locationLabel, int aqi, double temperature,
            String severity, String summary, String actionTip) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject("⚠ PolluSense Alert — " + severity + " at " + locationLabel);
            message.setText(buildEmailBody(locationLabel, aqi, temperature, severity, summary, actionTip));
            message.setFrom("noreply@pollusense.geo");

            mailSender.send(message);
            log.info("Alert email sent to {} for location '{}'", to, locationLabel);
        } catch (Exception e) {
            log.error("Failed to send alert email to {}: {}", to, e.getMessage());
        }
    }

    private String buildEmailBody(String locationLabel, int aqi, double temperature,
            String severity, String summary, String actionTip) {
        return String.format("""
                PolluSense Geo — Air Quality Alert
                ====================================

                📍 Location: %s
                🔴 Severity: %s
                💨 AQI: %d
                🌡 Temperature: %.1f °C

                Summary:
                %s

                Recommended Action:
                %s

                ────────────────────────────────
                Stay safe! Visit your dashboard for full details.
                — PolluSense Geo Team
                """, locationLabel, severity, aqi, temperature, summary, actionTip);
    }
}
