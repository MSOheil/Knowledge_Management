package com.isfahan.km.repository;

import com.isfahan.km.entity.CommitteePerformanceLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.Optional;
import java.util.UUID;

public interface CommitteePerformanceLogRepository extends JpaRepository<CommitteePerformanceLog, UUID>, QuerydslPredicateExecutor<CommitteePerformanceLog> {
    Optional<CommitteePerformanceLog> findByCommitteeName(String committeeName);
}
