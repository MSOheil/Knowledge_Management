package com.isfahan.km.repository;

import com.isfahan.km.entity.Evaluation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.UUID;

public interface EvaluationRepository extends JpaRepository<Evaluation, UUID>, QuerydslPredicateExecutor<Evaluation> {
    List<Evaluation> findByKnowledgeItemId(UUID knowledgeItemId);
    List<Evaluation> findByEvaluatorId(UUID evaluatorId);
}
