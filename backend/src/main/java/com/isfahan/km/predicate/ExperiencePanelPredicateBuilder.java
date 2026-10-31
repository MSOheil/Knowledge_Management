package com.isfahan.km.predicate;

import com.isfahan.km.entity.ExperiencePanel;
import com.isfahan.km.entity.Secretariat;
import com.isfahan.km.entity.User;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.PathBuilder;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.UUID;

public class ExperiencePanelPredicateBuilder {

    private static final PathBuilder<ExperiencePanel> entity = new PathBuilder<>(ExperiencePanel.class, "experiencePanel");

    public static Predicate bySecretariatId(UUID secretariatId) {
        if (secretariatId == null) return null;
        return entity.get("secretariat", Secretariat.class).get("id", UUID.class).eq(secretariatId);
    }

    public static Predicate byCreatorId(UUID creatorId) {
        if (creatorId == null) return null;
        return entity.get("creator", User.class).get("id", UUID.class).eq(creatorId);
    }

    public static Predicate byStatus(String status) {
        if (!StringUtils.hasText(status)) return null;
        return entity.getString("status").equalsIgnoreCase(status.trim());
    }

    public static Predicate activeDeadlines() {
        return entity.getDateTime("deadlineAt", LocalDateTime.class).after(LocalDateTime.now());
    }

    public static Predicate search(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return Expressions.asBoolean(true).isTrue();
        }
        String term = keyword.trim();
        BooleanBuilder builder = new BooleanBuilder();
        builder.or(entity.getString("title").containsIgnoreCase(term));
        builder.or(entity.getString("topicDescription").containsIgnoreCase(term));
        return builder.getValue();
    }

    public static Predicate build(UUID secretariatId, UUID creatorId, String status, Boolean activeOnly, String keyword) {
        BooleanBuilder builder = new BooleanBuilder();
        if (secretariatId != null) {
            builder.and(bySecretariatId(secretariatId));
        }
        if (creatorId != null) {
            builder.and(byCreatorId(creatorId));
        }
        if (StringUtils.hasText(status)) {
            builder.and(byStatus(status));
        }
        if (Boolean.TRUE.equals(activeOnly)) {
            builder.and(activeDeadlines());
        }
        if (StringUtils.hasText(keyword)) {
            builder.and(search(keyword));
        }
        return builder.getValue();
    }
}

