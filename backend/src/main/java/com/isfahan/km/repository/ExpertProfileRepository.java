package com.isfahan.km.repository;

import com.isfahan.km.entity.ExpertProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ExpertProfileRepository extends JpaRepository<ExpertProfile, UUID>, QuerydslPredicateExecutor<ExpertProfile> {
    Optional<ExpertProfile> findByUserId(UUID userId);
    List<ExpertProfile> findByIsVerifiedTrue();
    List<ExpertProfile> findByDepartment(String department);
}
