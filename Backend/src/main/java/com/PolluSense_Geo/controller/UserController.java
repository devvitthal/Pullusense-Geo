package com.PolluSense_Geo.controller;

import com.PolluSense_Geo.dto.MessageResponse;
import com.PolluSense_Geo.dto.ProfileDTO;
import com.PolluSense_Geo.dto.UpdateProfileRequest;
import com.PolluSense_Geo.entity.AuthProvider;
import com.PolluSense_Geo.entity.User;
import com.PolluSense_Geo.exception.ResourceNotFoundException;
import com.PolluSense_Geo.repository.UserRepository;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/user")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping("/profile")
    public ResponseEntity<?> getProfile(Authentication authentication) {
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        return ResponseEntity.ok(toDTO(user));
    }

    @PutMapping("/profile")
    public ResponseEntity<?> updateProfile(
            @Valid @RequestBody UpdateProfileRequest request,
            Authentication authentication) {

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null && !request.getName().isBlank()) {
            user.setName(request.getName().trim());
        }

        if (request.getMobileNumber() != null && !request.getMobileNumber().isBlank()) {
            user.setMobileNumber(request.getMobileNumber().trim());
        }

        if (request.getAddress() != null && !request.getAddress().isBlank()) {
            user.setAddress(request.getAddress().trim());
        }

        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            if (user.getProvider() != AuthProvider.LOCAL) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Password cannot be changed for social login accounts."));
            }
            if (request.getCurrentPassword() == null
                    || !passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
                return ResponseEntity.badRequest()
                        .body(new MessageResponse("Current password is incorrect."));
            }
            user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        }

        userRepository.save(user);
        return ResponseEntity.ok(toDTO(user));
    }

    private ProfileDTO toDTO(User user) {
        String provider = user.getProvider() != null ? user.getProvider().toString() : "LOCAL";
        return new ProfileDTO(user.getId(), user.getName(), user.getEmail(), provider,
                user.getMobileNumber(), user.getAddress());
    }
}
