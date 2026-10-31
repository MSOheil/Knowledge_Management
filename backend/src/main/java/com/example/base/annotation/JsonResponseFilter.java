package com.example.base.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Dynamically filters serialized response JSON using AntPath pattern matching.
 * Guarantees explicit whitelists and strips sensitive fields without DTO boilerplate.
 */
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface JsonResponseFilter {
    String[] value() default {};
    String[] include() default {};
    String[] exclude() default {};
}
