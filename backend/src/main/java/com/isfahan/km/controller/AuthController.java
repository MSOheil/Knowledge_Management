package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.User;
import com.isfahan.km.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public Map<String, Object> login(@RequestBody Map<String, String> loginRequest) {
        String username = loginRequest.get("username");
        String password = loginRequest.get("password");
        return authService.login(username, password);
    }

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @ValidateModel({
            @FieldRule(field = "username", rule = RuleType.NOT_BLANK, message = "Username is required"),
            @FieldRule(field = "username", rule = RuleType.SIZE, min = 3, max = 50, message = "Username must be between 3 and 50 characters"),
            @FieldRule(field = "password", rule = RuleType.NOT_BLANK, message = "Password is required"),
            @FieldRule(field = "password", rule = RuleType.SIZE, min = 6, max = 64, message = "Password must be at least 6 characters"),
            @FieldRule(field = "email", rule = RuleType.EMAIL, message = "Invalid email format")
    })
    @JsonRequestFilter(allow = {"username", "password", "fullName", "email", "phoneNumber"})
    @JsonResponseFilter(include = {"id", "username", "fullName", "email", "status", "createdAt"})
    public User register(@RequestBody User user) {
        return authService.register(user);
    }
}
