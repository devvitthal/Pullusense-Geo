package com.PolluSense_Geo.controller;

import com.PolluSense_Geo.dto.MessageResponse;
import com.PolluSense_Geo.dto.PushSubscriptionDTO;
import com.PolluSense_Geo.entity.PushSubscription;
import com.PolluSense_Geo.entity.User;
import com.PolluSense_Geo.exception.ResourceNotFoundException;
import com.PolluSense_Geo.repository.PushSubscriptionRepository;
import com.PolluSense_Geo.repository.UserRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/push")
@RequiredArgsConstructor
public class PushSubscriptionController {

    private final PushSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    @PostMapping("/subscribe")
    public ResponseEntity<?> subscribe(@Valid @RequestBody PushSubscriptionDTO dto, Authentication auth) {
        User user = userRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (subscriptionRepository.existsByEndpoint(dto.getEndpoint())) {
            return ResponseEntity.ok(new MessageResponse("Already subscribed."));
        }

        PushSubscription sub = PushSubscription.builder()
                .user(user)
                .endpoint(dto.getEndpoint())
                .p256dh(dto.getP256dh())
                .authKey(dto.getAuth())
                .build();

        subscriptionRepository.save(sub);
        return ResponseEntity.status(HttpStatus.CREATED).body(new MessageResponse("Subscribed to push notifications."));
    }

    @Transactional
    @PostMapping("/unsubscribe")
    public ResponseEntity<?> unsubscribe(@RequestBody PushSubscriptionDTO dto) {
        subscriptionRepository.deleteByEndpoint(dto.getEndpoint());
        return ResponseEntity.ok(new MessageResponse("Unsubscribed."));
    }
}
