package com.isfahan.km.repository;

import com.isfahan.km.entity.UserGamificationProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.Optional;
import java.util.UUID;

public interface UserGamificationProfileRepository extends JpaRepository<UserGamificationProfile, UUID>, QuerydslPredicateExecutor<UserGamificationProfile> {
    Optional<UserGamificationProfile> findByUserId(UUID userId);
}
