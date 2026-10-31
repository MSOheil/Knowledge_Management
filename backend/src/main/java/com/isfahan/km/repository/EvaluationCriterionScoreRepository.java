package com.isfahan.km.repository;

import com.isfahan.km.entity.EvaluationCriterionScore;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.UUID;

public interface EvaluationCriterionScoreRepository extends JpaRepository<EvaluationCriterionScore, UUID>, QuerydslPredicateExecutor<EvaluationCriterionScore> {
    List<EvaluationCriterionScore> findByEvaluationId(UUID evaluationId);
}
