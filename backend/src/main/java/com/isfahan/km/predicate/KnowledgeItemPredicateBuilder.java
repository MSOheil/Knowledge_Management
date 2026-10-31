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

import java.util.UUID;

public class KnowledgeItemPredicateBuilder {

    private static final PathBuilder<KnowledgeItem> entity = new PathBuilder<>(KnowledgeItem.class, "knowledgeItem");

    public static Predicate byType(KnowledgeNodeType type) {
        return entity.get("knowledgeType", KnowledgeNodeType.class).eq(type);
    }

    public static Predicate byStatus(KnowledgeItemStatus status) {
        return entity.get("status", KnowledgeItemStatus.class).eq(status);
    }

    public static Predicate byNodeId(UUID nodeId) {
        return entity.get("node", KnowledgeNode.class).get("id", UUID.class).eq(nodeId);
    }

    public static Predicate byUserId(UUID userId) {
        return entity.get("user", User.class).get("id", UUID.class).eq(userId);
    }

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

    public static Predicate build(KnowledgeNodeType type, KnowledgeItemStatus status, UUID nodeId, UUID userId, String keyword) {
        BooleanBuilder builder = new BooleanBuilder();

        if (type != null) {
            builder.and(byType(type));
        }
        if (status != null) {
            builder.and(byStatus(status));
        }
        if (nodeId != null) {
            builder.and(byNodeId(nodeId));
        }
        if (userId != null) {
            builder.and(byUserId(userId));
        }
        if (StringUtils.hasText(keyword)) {
            builder.and(search(keyword));
        }

        return builder.getValue() != null ? builder.getValue() : Expressions.asBoolean(true).isTrue();
    }
}
