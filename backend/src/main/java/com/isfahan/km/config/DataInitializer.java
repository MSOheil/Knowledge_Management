package com.isfahan.km.config;

import com.isfahan.km.entity.Role;
import com.isfahan.km.entity.User;
import com.isfahan.km.entity.UserStatus;
import com.isfahan.km.repository.RoleRepository;
import com.isfahan.km.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;

@Slf4j
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        log.info("Checking and initializing admin account and roles...");

        // Ensure roles exist
        Role adminRole = roleRepository.findByName("ADMIN").orElseGet(() -> {
            Role r = new Role();
            r.setName("ADMIN");
            r.setDescription("مدیر ارشد سامانه مدیریت دانش");
            return roleRepository.save(r);
        });

        Role userRole = roleRepository.findByName("USER").orElseGet(() -> {
            Role r = new Role();
            r.setName("USER");
            r.setDescription("کاربر سازمانی شهرداری اصفهان");
            return roleRepository.save(r);
        });

        // Ensure admin user exists with username "admin" and password "123456"
        Optional<User> adminOpt = userRepository.findByUsername("admin");
        if (adminOpt.isPresent()) {
            User admin = adminOpt.get();
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setStatus(UserStatus.ACTIVE);
            if (admin.getRoles() == null) {
                admin.setRoles(new HashSet<>());
            }
            admin.getRoles().add(adminRole);
            admin.getRoles().add(userRole);
            userRepository.save(admin);
            log.info("Admin user updated with username: 'admin' and password: '***' (123456)");
        } else {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("123456"));
            admin.setFullName("مدیر ارشد سامانه");
            admin.setEmail("admin@isfahan.ir");
            admin.setPhoneNumber("09130000000");
            admin.setStatus(UserStatus.ACTIVE);
            Set<Role> roles = new HashSet<>();
            roles.add(adminRole);
            roles.add(userRole);
            admin.setRoles(roles);
            userRepository.save(admin);
            log.info("Admin user created with username: 'admin' and password: '***' (123456)");
        }
    }
}
