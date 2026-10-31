package com.isfahan.km.repository;

import com.isfahan.km.entity.EvaluationCriterion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.UUID;

public interface EvaluationCriterionRepository extends JpaRepository<EvaluationCriterion, UUID>, QuerydslPredicateExecutor<EvaluationCriterion> {
    List<EvaluationCriterion> findByIsActiveTrue();
    List<EvaluationCriterion> findByKnowledgeTypeAndIsActiveTrue(String knowledgeType);
}
