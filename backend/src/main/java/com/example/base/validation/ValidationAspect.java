package com.example.base.validation;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;

import java.lang.reflect.Field;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Pattern;

@Aspect
@Component
@Order(10)
public class ValidationAspect {

    @Before("@annotation(validateModel)")
    public void validate(JoinPoint joinPoint, ValidateModel validateModel) {
        Object[] args = joinPoint.getArgs();
        if (args == null || args.length == 0) {
            return;
        }

        // Target body object (prioritize @RequestBody, otherwise first non-simple object)
        Object target = null;
        if (joinPoint.getSignature() instanceof org.aspectj.lang.reflect.MethodSignature methodSignature) {
            java.lang.annotation.Annotation[][] paramAnnotations = methodSignature.getMethod().getParameterAnnotations();
            for (int i = 0; i < args.length; i++) {
                if (paramAnnotations.length > i) {
                    for (java.lang.annotation.Annotation ann : paramAnnotations[i]) {
                        if (ann instanceof org.springframework.web.bind.annotation.RequestBody) {
                            target = args[i];
                            break;
                        }
                    }
                }
                if (target != null) break;
            }
        }

        if (target == null) {
            for (Object arg : args) {
                if (arg != null && !isSimpleType(arg.getClass())) {
                    target = arg;
                    break;
                }
            }
        }

        if (target == null) {
            return;
        }

        Map<String, String> errors = new HashMap<>();

        for (FieldRule rule : validateModel.value()) {
            String fieldName = rule.field();
            Object value = getFieldValue(target, fieldName);

            switch (rule.rule()) {
                case NOT_BLANK -> {
                    if (value == null || value.toString().trim().isEmpty()) {
                        errors.put(fieldName, rule.message().isEmpty() ? fieldName + " is required" : rule.message());
                    }
                }
                case NOT_NULL -> {
                    if (value == null) {
                        errors.put(fieldName, rule.message().isEmpty() ? fieldName + " cannot be null" : rule.message());
                    }
                }
                case EMAIL -> {
                    if (value != null && !value.toString().trim().isEmpty()) {
                        String emailRegex = "^[A-Za-z0-9+_.-]+@(.+)$";
                        if (!Pattern.compile(emailRegex).matcher(value.toString()).matches()) {
                            errors.put(fieldName, rule.message().isEmpty() ? "Invalid email format" : rule.message());
                        }
                    }
                }
                case SIZE -> {
                    if (value != null) {
                        int len = value.toString().length();
                        if (rule.min() != Long.MIN_VALUE && len < rule.min()) {
                            errors.put(fieldName, rule.message().isEmpty() ? fieldName + " length must be >= " + rule.min() : rule.message());
                        } else if (rule.max() != Long.MAX_VALUE && len > rule.max()) {
                            errors.put(fieldName, rule.message().isEmpty() ? fieldName + " length must be <= " + rule.max() : rule.message());
                        }
                    }
                }
                case PATTERN -> {
                    if (value != null && !rule.pattern().isEmpty()) {
                        if (!Pattern.compile(rule.pattern()).matcher(value.toString()).matches()) {
                            errors.put(fieldName, rule.message().isEmpty() ? fieldName + " does not match pattern" : rule.message());
                        }
                    }
                }
                case MIN -> {
                    if (value instanceof Number num && num.longValue() < rule.value()) {
                        errors.put(fieldName, rule.message().isEmpty() ? fieldName + " must be >= " + rule.value() : rule.message());
                    }
                }
                case MAX -> {
                    if (value instanceof Number num && num.longValue() > rule.value()) {
                        errors.put(fieldName, rule.message().isEmpty() ? fieldName + " must be <= " + rule.value() : rule.message());
                    }
                }
            }
        }

        if (!errors.isEmpty()) {
            throw new ModelValidationException(errors);
        }
    }

    private Object getFieldValue(Object target, String fieldName) {
        try {
            Class<?> clazz = target.getClass();
            while (clazz != null) {
                try {
                    Field field = clazz.getDeclaredField(fieldName);
                    field.setAccessible(true);
                    return field.get(target);
                } catch (NoSuchFieldException e) {
                    clazz = clazz.getSuperclass();
                }
            }
        } catch (Exception ignored) {
        }
        return null;
    }

    private boolean isSimpleType(Class<?> clazz) {
        return clazz.isPrimitive() ||
                clazz.equals(Boolean.class) ||
                clazz.equals(Integer.class) ||
                clazz.equals(Character.class) ||
                clazz.equals(Byte.class) ||
                clazz.equals(Short.class) ||
                clazz.equals(Double.class) ||
                clazz.equals(Long.class) ||
                clazz.equals(Float.class) ||
                clazz.equals(String.class) ||
                java.util.UUID.class.isAssignableFrom(clazz) ||
                Number.class.isAssignableFrom(clazz) ||
                java.time.temporal.Temporal.class.isAssignableFrom(clazz);
    }
}
