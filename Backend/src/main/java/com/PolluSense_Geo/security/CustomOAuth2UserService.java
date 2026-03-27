package com.PolluSense_Geo.security;

import com.PolluSense_Geo.entity.AuthProvider;
import com.PolluSense_Geo.entity.Role;
import com.PolluSense_Geo.entity.User;
import com.PolluSense_Geo.repository.RoleRepository;
import com.PolluSense_Geo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomOAuth2UserService extends DefaultOAuth2UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException {
        OAuth2User oAuth2User = super.loadUser(userRequest);

        try {
            return processOAuth2User(userRequest, oAuth2User);
        } catch (Exception ex) {
            // Throwing an instance of AuthenticationException will trigger the OAuth2AuthenticationFailureHandler
            throw new OAuth2AuthenticationException(ex.getMessage() != null ? ex.getMessage() : "OAuth2 Login Error");
        }
    }

    private OAuth2User processOAuth2User(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        String email = oAuth2User.getAttribute("email");
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (user.getProvider() == null || !user.getProvider().equals(AuthProvider.GOOGLE)) {
                // If the user already registered with LOCAL strategy but is trying to log in with Google
                String providerStr = user.getProvider() == null ? "local" : user.getProvider().toString();
                throw new OAuth2AuthenticationException("Looks like you're signed up with " +
                        providerStr + " account. Please use your " + providerStr +
                        " account to login.");
            }
            user = updateExistingUser(user, oAuth2User);
        } else {
            user = registerNewUser(oAuth2UserRequest, oAuth2User);
        }

        return UserPrincipal.build(user, oAuth2User.getAttributes());
    }

    private User registerNewUser(OAuth2UserRequest oAuth2UserRequest, OAuth2User oAuth2User) {
        User user = new User();

        user.setProvider(AuthProvider.GOOGLE);
        user.setProviderId(oAuth2User.getAttribute("sub"));
        user.setName(oAuth2User.getAttribute("name"));
        user.setEmail(oAuth2User.getAttribute("email"));

        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setName("ROLE_USER");
                    return roleRepository.save(role);
                });

        user.setRoles(Collections.singleton(userRole));
        return userRepository.save(user);
    }

    private User updateExistingUser(User existingUser, OAuth2User oAuth2User) {
        existingUser.setName(oAuth2User.getAttribute("name"));
        return userRepository.save(existingUser);
    }
}
