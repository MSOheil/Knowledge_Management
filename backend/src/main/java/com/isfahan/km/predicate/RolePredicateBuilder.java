package com.isfahan.km.predicate;

import com.isfahan.km.entity.Role;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.PathBuilder;

public class RolePredicateBuilder {

    private static final PathBuilder<Role> entity = new PathBuilder<>(Role.class, "role");

    public static Predicate byName(String name) {
        return entity.getString("name").equalsIgnoreCase(name);
    }
}
