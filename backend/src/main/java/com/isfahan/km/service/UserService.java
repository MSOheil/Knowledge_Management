package com.isfahan.km.service;

import com.example.base.exception.BadRequestException;
import com.example.base.exception.ResourceNotFoundException;
import com.isfahan.km.entity.Role;
import com.isfahan.km.entity.User;
import com.isfahan.km.entity.UserStatus;
import com.isfahan.km.predicate.RolePredicateBuilder;
import com.isfahan.km.predicate.UserPredicateBuilder;
import com.isfahan.km.repository.RoleRepository;
import com.isfahan.km.repository.UserRepository;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional(readOnly = true)
    public User findById(UUID id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + id));
    }

    @Transactional(readOnly = true)
    public User findByUsername(String username) {
        return userRepository.findOne(UserPredicateBuilder.byUsername(username))
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
    }

    @Transactional(readOnly = true)
    public Page<User> findAll(Predicate predicate, Pageable pageable) {
        return userRepository.findAll(predicate, pageable);
    }

    @Transactional
    public User create(User user) {
        if (userRepository.exists(UserPredicateBuilder.byUsername(user.getUsername()))) {
            throw new BadRequestException("Username already exists: " + user.getUsername());
        }
        if (user.getEmail() != null && userRepository.exists(UserPredicateBuilder.byEmail(user.getEmail()))) {
            throw new BadRequestException("Email already exists: " + user.getEmail());
        }

        user.setPassword(passwordEncoder.encode(user.getPassword()));
        if (user.getStatus() == null) {
            user.setStatus(UserStatus.ACTIVE);
        }

        // Attach default USER role if roles empty
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            roleRepository.findOne(RolePredicateBuilder.byName("USER")).ifPresent(roles::add);
            user.setRoles(roles);
        }

        return userRepository.save(user);
    }

    @Transactional
    public User update(UUID id, User updatedUser) {
        User existing = findById(id);

        if (updatedUser.getFullName() != null) {
            existing.setFullName(updatedUser.getFullName());
        }
        if (updatedUser.getPhoneNumber() != null) {
            existing.setPhoneNumber(updatedUser.getPhoneNumber());
        }
        if (updatedUser.getStatus() != null) {
            existing.setStatus(updatedUser.getStatus());
        }
        if (updatedUser.getPassword() != null && !updatedUser.getPassword().isBlank()) {
            existing.setPassword(passwordEncoder.encode(updatedUser.getPassword()));
        }

        return userRepository.save(existing);
    }

    @Transactional
    public void delete(UUID id) {
        User existing = findById(id);
        userRepository.delete(existing);
    }
}
