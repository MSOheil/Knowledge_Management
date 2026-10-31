package com.isfahan.km.predicate;

import com.isfahan.km.entity.WorkflowDefinition;
import com.isfahan.km.entity.WorkflowStage;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.PathBuilder;
import org.springframework.util.StringUtils;

import java.util.UUID;

public class WorkflowStagePredicateBuilder {

    private static final PathBuilder<WorkflowStage> entity = new PathBuilder<>(WorkflowStage.class, "workflowStage");

    public static Predicate byWorkflowId(UUID workflowId) {
        if (workflowId == null) return null;
        return entity.get("workflow", WorkflowDefinition.class).get("id", UUID.class).eq(workflowId);
    }

    public static Predicate byOrder(Integer order) {
        if (order == null) return null;
        return entity.getNumber("stageOrder", Integer.class).eq(order);
    }

    public static Predicate byReviewerRole(String role) {
        if (!StringUtils.hasText(role)) return null;
        return entity.getString("reviewerRole").equalsIgnoreCase(role.trim());
    }

    public static Predicate build(UUID workflowId, String reviewerRole) {
        BooleanBuilder builder = new BooleanBuilder();
        if (workflowId != null) {
            builder.and(byWorkflowId(workflowId));
        }
        if (StringUtils.hasText(reviewerRole)) {
            builder.and(byReviewerRole(reviewerRole));
        }
        return builder.getValue();
    }
}

