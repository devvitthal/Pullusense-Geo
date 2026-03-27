package com.PolluSense_Geo.security;

import com.PolluSense_Geo.entity.AuthProvider;
import com.PolluSense_Geo.entity.Role;
import com.PolluSense_Geo.entity.User;
import com.PolluSense_Geo.repository.RoleRepository;
import com.PolluSense_Geo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserRequest;
import org.springframework.security.oauth2.client.oidc.userinfo.OidcUserService;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.oidc.user.OidcUser;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Optional;

@Service
public class CustomOidcUserService extends OidcUserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private RoleRepository roleRepository;

    @Override
    public OidcUser loadUser(OidcUserRequest userRequest) throws OAuth2AuthenticationException {
        OidcUser oidcUser = super.loadUser(userRequest);

        try {
            return processOidcUser(userRequest, oidcUser);
        } catch (Exception ex) {
            throw new OAuth2AuthenticationException(ex.getMessage() != null ? ex.getMessage() : "OAuth2 Login Error");
        }
    }

    private OidcUser processOidcUser(OidcUserRequest oidcUserRequest, OidcUser oidcUser) {
        String email = oidcUser.getAttribute("email");
        Optional<User> userOptional = userRepository.findByEmail(email);
        User user;

        if (userOptional.isPresent()) {
            user = userOptional.get();
            if (user.getProvider() == null || !user.getProvider().equals(AuthProvider.GOOGLE)) {
                String providerStr = user.getProvider() == null ? "local" : user.getProvider().toString();
                throw new OAuth2AuthenticationException("Looks like you're signed up with " +
                        providerStr + " account. Please use your " + providerStr +
                        " account to login.");
            }
            user.setName(oidcUser.getAttribute("name"));
            userRepository.save(user);
        } else {
            user = new User();
            user.setProvider(AuthProvider.GOOGLE);
            user.setProviderId(oidcUser.getSubject());
            user.setName(oidcUser.getAttribute("name"));
            user.setEmail(email);

            Role userRole = roleRepository.findByName("ROLE_USER")
                    .orElseGet(() -> {
                        Role role = new Role();
                        role.setName("ROLE_USER");
                        return roleRepository.save(role);
                    });

            user.setRoles(Collections.singleton(userRole));
            userRepository.save(user);
        }

        return oidcUser;
    }
}
