package com.isfahan.km.repository;

import com.isfahan.km.entity.ExperiencePanelContribution;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.UUID;

public interface ExperiencePanelContributionRepository extends JpaRepository<ExperiencePanelContribution, UUID>, QuerydslPredicateExecutor<ExperiencePanelContribution> {
    List<ExperiencePanelContribution> findByPanelIdOrderBySubmittedAtAsc(UUID panelId);
    long countByPanelId(UUID panelId);
}

