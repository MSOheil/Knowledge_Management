package com.example.base.validation;

import lombok.Getter;

import java.util.Map;

@Getter
public class ModelValidationException extends RuntimeException {

    private final Map<String, String> fieldErrors;

    public ModelValidationException(Map<String, String> fieldErrors) {
        super("Validation failed for request model: " + fieldErrors.toString());
        this.fieldErrors = fieldErrors;
    }
}
