package com.example.base.annotation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * Restricts which JSON fields can bind to the entity during deserialization.
 * Prevents mass-assignment vulnerabilities without manual DTO classes.
 */
@Target({ElementType.METHOD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
public @interface JsonRequestFilter {
    String[] value() default {};
    String[] allow() default {};
    String[] include() default {};
    String[] exclude() default {};
}
