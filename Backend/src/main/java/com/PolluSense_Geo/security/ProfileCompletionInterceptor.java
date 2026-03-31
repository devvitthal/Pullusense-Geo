package com.PolluSense_Geo.security;

import com.PolluSense_Geo.entity.User;
import com.PolluSense_Geo.repository.UserRepository;
import tools.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.util.Map;

/**
 * Blocks access to any protected API endpoint when the authenticated user
 * has not yet provided a mobile number and address. Returns HTTP 403 with
 * body {@code {"code":"PROFILE_INCOMPLETE"}} so the frontend can redirect.
 *
 * Exempt paths are configured in {@link com.PolluSense_Geo.WebConfig}.
 */
@Component
public class ProfileCompletionInterceptor implements HandlerInterceptor {

    @Autowired
    private UserRepository userRepository;

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Override
    public boolean preHandle(HttpServletRequest request,
            HttpServletResponse response,
            Object handler) throws Exception {

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();

        // Unauthenticated or anonymous — let the security layer handle it
        if (auth == null || !auth.isAuthenticated()
                || "anonymousUser".equals(auth.getPrincipal())) {
            return true;
        }

        User user = userRepository.findByEmail(auth.getName()).orElse(null);

        if (user != null
                && (isBlank(user.getMobileNumber()) || isBlank(user.getAddress()))) {

            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            MAPPER.writeValue(response.getWriter(), Map.of(
                    "code", "PROFILE_INCOMPLETE",
                    "message", "Please complete your profile before continuing."));
            return false;
        }

        return true;
    }

    private boolean isBlank(String s) {
        return s == null || s.isBlank();
    }
}
