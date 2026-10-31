package com.isfahan.km.predicate;

import com.isfahan.km.entity.KnowledgeItem;
import com.isfahan.km.entity.KnowledgeItemStatus;
import com.isfahan.km.entity.KnowledgeNode;
import com.isfahan.km.entity.KnowledgeNodeType;
import com.isfahan.km.entity.User;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.PathBuilder;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.UUID;

public class KnowledgeSearchPredicateBuilder {

    private static final PathBuilder<KnowledgeItem> entity = new PathBuilder<>(KnowledgeItem.class, "knowledgeItem");

    public static Predicate search(String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return Expressions.asBoolean(true).isTrue();
        }
        String term = keyword.trim();
        BooleanBuilder builder = new BooleanBuilder();
        builder.or(entity.getString("title").containsIgnoreCase(term));
        builder.or(entity.getString("summary").containsIgnoreCase(term));
        builder.or(entity.getString("content").containsIgnoreCase(term));
        return builder.getValue();
    }

    public static Predicate byType(KnowledgeNodeType type) {
        return entity.get("knowledgeType", KnowledgeNodeType.class).eq(type);
    }

    public static Predicate byNodeId(UUID nodeId) {
        return entity.get("node", KnowledgeNode.class).get("id", UUID.class).eq(nodeId);
    }

    public static Predicate byUserId(UUID userId) {
        return entity.get("user", User.class).get("id", UUID.class).eq(userId);
    }

    public static Predicate byStatus(KnowledgeItemStatus status) {
        return entity.get("status", KnowledgeItemStatus.class).eq(status);
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

    public static Predicate build(String keyword, KnowledgeNodeType type, UUID nodeId, UUID userId, KnowledgeItemStatus status, LocalDateTime from, LocalDateTime to) {
        BooleanBuilder builder = new BooleanBuilder();

        if (StringUtils.hasText(keyword)) {
            builder.and(search(keyword));
        }
        if (type != null) {
            builder.and(byType(type));
        }
        if (nodeId != null) {
            builder.and(byNodeId(nodeId));
        }
        if (userId != null) {
            builder.and(byUserId(userId));
        }
        if (status != null) {
            builder.and(byStatus(status));
        }
        Predicate datePredicate = byDateRange(from, to);
        if (datePredicate != null) {
            builder.and(datePredicate);
        }

        return builder.getValue();
    }
}
