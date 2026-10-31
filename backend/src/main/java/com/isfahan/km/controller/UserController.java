package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.User;
import com.isfahan.km.entity.UserStatus;
import com.isfahan.km.predicate.UserPredicateBuilder;
import com.isfahan.km.service.UserService;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/{id}")
    @JsonResponseFilter(include = {"id", "username", "fullName", "email", "phoneNumber", "status", "roles.name", "createdAt", "updatedAt"})
    public User getUser(@PathVariable UUID id) {
        return userService.findById(id);
    }

    @GetMapping
    @JsonResponseFilter(include = {"content.id", "content.username", "content.fullName", "content.email", "content.phoneNumber", "content.status", "totalElements", "totalPages", "size", "number"})
    public Page<User> searchUsers(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String fullName,
            @RequestParam(required = false) UserStatus status,
            Pageable pageable) {
        Predicate predicate = UserPredicateBuilder.build(username, email, fullName, status);
        return userService.findAll(predicate, pageable);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @ValidateModel({
            @FieldRule(field = "username", rule = RuleType.NOT_BLANK, message = "Username is required"),
            @FieldRule(field = "username", rule = RuleType.SIZE, min = 3, max = 50),
            @FieldRule(field = "password", rule = RuleType.NOT_BLANK, message = "Password is required"),
            @FieldRule(field = "password", rule = RuleType.SIZE, min = 6, max = 64),
            @FieldRule(field = "email", rule = RuleType.EMAIL, message = "Invalid email format")
    })
    @JsonRequestFilter(allow = {"username", "password", "fullName", "email", "phoneNumber", "status"})
    @JsonResponseFilter(include = {"id", "username", "fullName", "email", "phoneNumber", "status", "createdAt"})
    public User createUser(@RequestBody User user) {
        return userService.create(user);
    }

    @PutMapping("/{id}")
    @JsonRequestFilter(allow = {"fullName", "phoneNumber", "status", "password"})
    @JsonResponseFilter(include = {"id", "username", "fullName", "email", "phoneNumber", "status", "updatedAt"})
    public User updateUser(@PathVariable UUID id, @RequestBody User user) {
        return userService.update(id, user);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteUser(@PathVariable UUID id) {
        userService.delete(id);
    }
}
