package com.isfahan.km.predicate;

import com.isfahan.km.entity.Evaluation;
import com.isfahan.km.entity.EvaluationDecision;
import com.isfahan.km.entity.EvaluationStage;
import com.isfahan.km.entity.KnowledgeItem;
import com.isfahan.km.entity.User;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.PathBuilder;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.UUID;

public class EvaluationPredicateBuilder {

    private static final PathBuilder<Evaluation> entity = new PathBuilder<>(Evaluation.class, "evaluation");

    public static Predicate byStage(EvaluationStage stage) {
        return entity.get("stage", EvaluationStage.class).eq(stage);
    }

    public static Predicate byDecision(EvaluationDecision decision) {
        return entity.get("decision", EvaluationDecision.class).eq(decision);
    }

    public static Predicate byEvaluatorId(UUID evaluatorId) {
        return entity.get("evaluator", User.class).get("id", UUID.class).eq(evaluatorId);
    }

    public static Predicate byKnowledgeItemId(UUID knowledgeItemId) {
        return entity.get("knowledgeItem", KnowledgeItem.class).get("id", UUID.class).eq(knowledgeItemId);
    }

    public static Predicate byDateRange(LocalDateTime from, LocalDateTime to) {
        BooleanBuilder builder = new BooleanBuilder();
        if (from != null) {
            builder.and(entity.getDateTime("createdAt", LocalDateTime.class).goe(from));
        }
        if (to != null) {
            builder.and(entity.getDateTime("createdAt", LocalDateTime.class).loe(to));
        }
        return builder.getValue();
    }

    public static Predicate search(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return Expressions.asBoolean(true).isTrue();
        }
        String term = keyword.trim();
        BooleanBuilder builder = new BooleanBuilder();
        builder.or(entity.getString("feedback").containsIgnoreCase(term));
        builder.or(entity.getString("conditionalRequirements").containsIgnoreCase(term));
        builder.or(entity.getString("correctionHint").containsIgnoreCase(term));
        builder.or(entity.get("knowledgeItem", KnowledgeItem.class).getString("title").containsIgnoreCase(term));
        return builder.getValue();
    }

    public static Predicate build(EvaluationStage stage, EvaluationDecision decision, UUID evaluatorId, UUID knowledgeItemId, LocalDateTime from, LocalDateTime to, String keyword) {
        BooleanBuilder builder = new BooleanBuilder();

        if (stage != null) {
            builder.and(byStage(stage));
        }
        if (decision != null) {
            builder.and(byDecision(decision));
        }
        if (evaluatorId != null) {
            builder.and(byEvaluatorId(evaluatorId));
        }
        if (knowledgeItemId != null) {
            builder.and(byKnowledgeItemId(knowledgeItemId));
        }
        Predicate datePredicate = byDateRange(from, to);
        if (datePredicate != null) {
            builder.and(datePredicate);
        }
        if (StringUtils.hasText(keyword)) {
            builder.and(search(keyword));
        }

        return builder.getValue();
    }
}
