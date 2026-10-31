package com.isfahan.km.predicate;

import com.isfahan.km.entity.ForumQuestion;
import com.isfahan.km.entity.User;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.PathBuilder;
import org.springframework.util.StringUtils;

import java.util.UUID;

public class ForumPredicateBuilder {

    private static final PathBuilder<ForumQuestion> entity = new PathBuilder<>(ForumQuestion.class, "forumQuestion");

    public static Predicate byPublic(Boolean isPublic) {
        if (isPublic == null) return Expressions.asBoolean(true).isTrue();
        return entity.getBoolean("isPublic").eq(isPublic);
    }

    public static Predicate byAssignedExpertId(UUID expertId) {
        return entity.get("assignedExpert", User.class).get("id", UUID.class).eq(expertId);
    }

    public static Predicate byAuthorId(UUID authorId) {
        return entity.get("author", User.class).get("id", UUID.class).eq(authorId);
    }

    public static Predicate byStatus(String status) {
        if (!StringUtils.hasText(status)) return Expressions.asBoolean(true).isTrue();
        return entity.getString("status").equalsIgnoreCase(status);
    }

    public static Predicate search(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return Expressions.asBoolean(true).isTrue();
        }
        String term = keyword.trim();
        BooleanBuilder builder = new BooleanBuilder();
        builder.or(entity.getString("title").containsIgnoreCase(term));
        builder.or(entity.getString("questionBody").containsIgnoreCase(term));
        return builder.getValue();
    }

    public static Predicate build(Boolean isPublic, UUID assignedExpertId, UUID authorId, String status, String keyword) {
        BooleanBuilder builder = new BooleanBuilder();

        if (isPublic != null) {
            builder.and(byPublic(isPublic));
        }
        if (assignedExpertId != null) {
            builder.and(byAssignedExpertId(assignedExpertId));
        }
        if (authorId != null) {
            builder.and(byAuthorId(authorId));
        }
        if (StringUtils.hasText(status)) {
            builder.and(byStatus(status));
        }
        if (StringUtils.hasText(keyword)) {
            builder.and(search(keyword));
        }

        return builder.getValue();
    }
}
