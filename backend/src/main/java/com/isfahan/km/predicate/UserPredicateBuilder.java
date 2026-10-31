package com.isfahan.km.predicate;

import com.isfahan.km.entity.User;
import com.isfahan.km.entity.UserStatus;
import com.querydsl.core.BooleanBuilder;
import com.querydsl.core.types.Predicate;
import com.querydsl.core.types.dsl.Expressions;
import com.querydsl.core.types.dsl.PathBuilder;
import org.springframework.util.StringUtils;

public class UserPredicateBuilder {

    private static final PathBuilder<User> entity = new PathBuilder<>(User.class, "user");

    public static Predicate build(String username, String email, String fullName, UserStatus status) {
        BooleanBuilder builder = new BooleanBuilder();

        if (StringUtils.hasText(username)) {
            builder.and(entity.getString("username").containsIgnoreCase(username.trim()));
        }
        if (StringUtils.hasText(email)) {
            builder.and(entity.getString("email").containsIgnoreCase(email.trim()));
        }
        if (StringUtils.hasText(fullName)) {
            builder.and(entity.getString("fullName").containsIgnoreCase(fullName.trim()));
        }
        if (status != null) {
            builder.and(entity.get("status", UserStatus.class).eq(status));
        }

        return builder.getValue() != null ? builder.getValue() : Expressions.asBoolean(true).isTrue();
    }

    public static Predicate byUsername(String username) {
        return entity.getString("username").equalsIgnoreCase(username);
    }

    public static Predicate byEmail(String email) {
        return entity.getString("email").equalsIgnoreCase(email);
    }
}
