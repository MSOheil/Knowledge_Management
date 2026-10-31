package com.isfahan.km.service;

import com.example.base.exception.UnauthorizedException;
import com.example.base.security.JwtTokenProvider;
import com.example.base.security.SecurityConstant;
import com.isfahan.km.entity.Role;
import com.isfahan.km.entity.User;
import com.isfahan.km.entity.UserStatus;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

    @Transactional(readOnly = true)
    public Map<String, Object> login(String username, String rawPassword) {
        User user = userService.findByUsername(username);

        if (user.getStatus() != UserStatus.ACTIVE) {
            throw new UnauthorizedException("User account is inactive or suspended");
        }

        if (!passwordEncoder.matches(rawPassword, user.getPassword())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        List<String> roleNames = user.getRoles().stream()
                .map(Role::getName)
                .collect(Collectors.toList());

        String token = tokenProvider.generateToken(user.getUsername(), roleNames);

        Map<String, Object> authData = new HashMap<>();
        authData.put("token", token);
        authData.put("tokenType", SecurityConstant.TOKEN_PREFIX.trim());
        authData.put("username", user.getUsername());
        authData.put("fullName", user.getFullName());
        authData.put("roles", roleNames);

        return authData;
    }

    @Transactional
    public User register(User user) {
        return userService.create(user);
    }
}
