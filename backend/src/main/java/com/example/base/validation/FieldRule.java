package com.example.base.validation;

import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({})
@Retention(RetentionPolicy.RUNTIME)
public @interface FieldRule {
    String field();
    RuleType rule();
    String message() default "";
    long min() default Long.MIN_VALUE;
    long max() default Long.MAX_VALUE;
    long value() default 0;
    String pattern() default "";
}
