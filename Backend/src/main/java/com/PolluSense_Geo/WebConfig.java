package com.PolluSense_Geo;

import com.PolluSense_Geo.security.ProfileCompletionInterceptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Autowired
    private ProfileCompletionInterceptor profileCompletionInterceptor;

    @Override
    public void addInterceptors(InterceptorRegistry registry) {
        registry.addInterceptor(profileCompletionInterceptor)
                .excludePathPatterns(
                        "/api/auth/**", // public registration & login
                        "/api/user/profile", // GET + PUT allowed so the page can save
                        "/api/sensor-data", // Arduino node ingest (POST, API-key auth)
                        "/error");
    }
}
