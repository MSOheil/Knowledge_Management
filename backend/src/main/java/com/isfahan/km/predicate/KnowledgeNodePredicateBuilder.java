package com.isfahan.km.predicate;

import com.isfahan.km.entity.KnowledgeNode;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.PathBuilder;
import org.springframework.util.StringUtils;

import java.util.UUID;

public class KnowledgeNodePredicateBuilder {

    private static final PathBuilder<KnowledgeNode> entity = new PathBuilder<>(KnowledgeNode.class, "knowledgeNode");

    public static Predicate roots() {
        return entity.get("parent", KnowledgeNode.class).isNull();
    }

    public static Predicate activeRoots() {
        BooleanBuilder builder = new BooleanBuilder();
        builder.and(entity.get("parent", KnowledgeNode.class).isNull());
        builder.and(entity.getBoolean("isActive").isTrue());
        return builder.getValue();
    }

    public static Predicate active() {
        return entity.getBoolean("isActive").isTrue();
    }

    public static Predicate byParentId(UUID parentId) {
        if (parentId == null) {
            return roots();
        }
        return entity.get("parent", KnowledgeNode.class).get("id", UUID.class).eq(parentId);
    }

    public static Predicate build(String title, String code, Boolean isActive, UUID parentId) {
        BooleanBuilder builder = new BooleanBuilder();

        if (StringUtils.hasText(title)) {
            builder.and(entity.getString("title").containsIgnoreCase(title.trim()));
        }
        if (StringUtils.hasText(code)) {
            builder.and(entity.getString("code").containsIgnoreCase(code.trim()));
        }
        if (isActive != null) {
            builder.and(entity.getBoolean("isActive").eq(isActive));
        }
        if (parentId != null) {
            builder.and(entity.get("parent", KnowledgeNode.class).get("id", UUID.class).eq(parentId));
        }

        return builder.getValue() != null ? builder.getValue() : Expressions.asBoolean(true).isTrue();
    }
}
