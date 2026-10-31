package com.isfahan.km.repository;

import com.isfahan.km.entity.ExperiencePanel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface ExperiencePanelRepository extends JpaRepository<ExperiencePanel, UUID>, QuerydslPredicateExecutor<ExperiencePanel> {
    List<ExperiencePanel> findByStatusOrderByCreatedAtDesc(String status);
    List<ExperiencePanel> findByStatusAndDeadlineAtAfterOrderByDeadlineAtAsc(String status, LocalDateTime now);
}

