package com.example.base.querydsl;

import com.example.base.primeng.FilterMetadata;
import com.example.base.primeng.PNTableModel;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.PathBuilder;
import org.springframework.data.domain.Pageable;
import org.springframework.util.StringUtils;

import java.util.Map;

public class CustomPredicatesJoinBuilderJPA<T> {

    private final Class<T> entityClass;
    private final String variable;
    private final PathBuilder<T> pathBuilder;

    public CustomPredicatesJoinBuilderJPA(Class<T> entityClass) {
        this(entityClass, entityClass.getSimpleName().substring(0, 1).toLowerCase() + entityClass.getSimpleName().substring(1));
    }

    public CustomPredicatesJoinBuilderJPA(Class<T> entityClass, String variable) {
        this.entityClass = entityClass;
        this.variable = variable;
        this.pathBuilder = new PathBuilder<>(entityClass, variable);
    }

    public Pageable resolvePageable(PNTableModel event) {
        if (event == null) {
            return Pageable.unpaged();
        }
        return event.toPageable();
    }

    public BooleanBuilder buildPredicate(PNTableModel event) {
        BooleanBuilder builder = new BooleanBuilder();
        if (event == null) {
            return builder;
        }

        // Global search filter
        if (StringUtils.hasText(event.getGlobalFilter())) {
            String globalTerm = event.getGlobalFilter().trim();
            BooleanBuilder globalOr = new BooleanBuilder();
            try {
                globalOr.or(pathBuilder.getString("feedback").containsIgnoreCase(globalTerm));
            } catch (Exception ignored) {}
            try {
                globalOr.or(pathBuilder.getString("correctionHint").containsIgnoreCase(globalTerm));
            } catch (Exception ignored) {}
            builder.and(globalOr);
        }

        // Column filters
        if (event.getFilters() != null && !event.getFilters().isEmpty()) {
            for (Map.Entry<String, Object> entry : event.getFilters().entrySet()) {
                String field = entry.getKey();
                Object rawFilter = entry.getValue();
                if (rawFilter == null) continue;

                String filterValue = null;
                String matchMode = "contains";

                if (rawFilter instanceof FilterMetadata meta) {
                    if (meta.getValue() != null) {
                        filterValue = meta.getValue().toString();
                    }
                    if (meta.getMatchMode() != null) {
                        matchMode = meta.getMatchMode();
                    }
                } else if (rawFilter instanceof Map<?, ?> map) {
                    Object val = map.get("value");
                    if (val != null) {
                        filterValue = val.toString();
                    }
                    Object mm = map.get("matchMode");
                    if (mm != null) {
                        matchMode = mm.toString();
                    }
                } else {
                    filterValue = rawFilter.toString();
                }

                if (StringUtils.hasText(filterValue)) {
                    applyFilter(builder, field, filterValue.trim(), matchMode);
                }
            }
        }

        return builder;
    }

    private void applyFilter(BooleanBuilder builder, String field, String value, String matchMode) {
        try {
            if (field.contains(".")) {
                String[] parts = field.split("\\.");
                PathBuilder<?> currentPath = pathBuilder;
                for (int i = 0; i < parts.length - 1; i++) {
                    currentPath = currentPath.get(parts[i]);
                }
                String finalField = parts[parts.length - 1];
                if ("equals".equalsIgnoreCase(matchMode)) {
                    builder.and(currentPath.getString(finalField).equalsIgnoreCase(value));
                } else {
                    builder.and(currentPath.getString(finalField).containsIgnoreCase(value));
                }
            } else {
                if ("equals".equalsIgnoreCase(matchMode)) {
                    builder.and(pathBuilder.getString(field).equalsIgnoreCase(value));
                } else {
                    builder.and(pathBuilder.getString(field).containsIgnoreCase(value));
                }
            }
        } catch (Exception ignored) {
            // Gracefully ignore unresolvable dynamic paths
        }
    }

    public Predicate resolve(PNTableModel event, Predicate basePredicate) {
        BooleanBuilder builder = buildPredicate(event);
        if (basePredicate != null) {
            builder.and(basePredicate);
        }
        return builder.getValue();
    }
}
