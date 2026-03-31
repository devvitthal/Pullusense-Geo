package com.PolluSense_Geo.service;

import com.PolluSense_Geo.entity.PushSubscription;
import com.PolluSense_Geo.repository.PushSubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;
import java.security.GeneralSecurityException;
import java.security.Security;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class WebPushService {

    private final PushSubscriptionRepository subscriptionRepository;

    @Value("${app.vapid.publicKey}")
    private String vapidPublicKey;

    @Value("${app.vapid.privateKey}")
    private String vapidPrivateKey;

    private PushService pushService;

    @PostConstruct
    public void init() throws GeneralSecurityException {
        // Register BouncyCastle provider required by web-push
        if (Security.getProvider(org.bouncycastle.jce.provider.BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new org.bouncycastle.jce.provider.BouncyCastleProvider());
        }
        pushService = new PushService();
        pushService.setPublicKey(vapidPublicKey);
        pushService.setPrivateKey(vapidPrivateKey);
        pushService.setSubject("mailto:alerts@pollusense.geo");
    }

    @Async
    public void sendPushToUser(Long userId, String title, String body, String url) {
        List<PushSubscription> subs = subscriptionRepository.findByUserId(userId);
        String payload = String.format(
                "{\"title\":\"%s\",\"body\":\"%s\",\"url\":\"%s\"}",
                escapeJson(title), escapeJson(body), escapeJson(url));

        for (PushSubscription sub : subs) {
            try {
                Notification notification = new Notification(
                        sub.getEndpoint(),
                        sub.getP256dh(),
                        sub.getAuthKey(),
                        payload.getBytes());
                pushService.send(notification);
                log.info("Push sent to user {} endpoint {}", userId, sub.getEndpoint().substring(0, 50));
            } catch (Exception e) {
                log.error("Push failed for endpoint {}: {}", sub.getEndpoint().substring(0, 50), e.getMessage());
                // If endpoint is gone (410), remove it
                if (e.getMessage() != null && e.getMessage().contains("410")) {
                    subscriptionRepository.delete(sub);
                    log.info("Removed stale push subscription {}", sub.getId());
                }
            }
        }
    }

    private String escapeJson(String s) {
        if (s == null)
            return "";
        return s.replace("\\", "\\\\").replace("\"", "\\\"").replace("\n", " ");
    }
}
