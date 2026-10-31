package com.example.base.propertyfilter;

import com.example.base.annotation.JsonResponseFilter;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ArrayNode;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.springframework.core.MethodParameter;
import org.springframework.http.MediaType;
import org.springframework.http.converter.HttpMessageConverter;
import org.springframework.http.server.ServerHttpRequest;
import org.springframework.http.server.ServerHttpResponse;
import org.springframework.util.AntPathMatcher;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.servlet.mvc.method.annotation.ResponseBodyAdvice;

import java.util.*;

@RestControllerAdvice
public class JsonResponseFilterAdvice implements ResponseBodyAdvice<Object> {

    private final ObjectMapper objectMapper;
    private final AntPathMatcher pathMatcher = new AntPathMatcher();

    public JsonResponseFilterAdvice(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public boolean supports(MethodParameter returnType, Class<? extends HttpMessageConverter<?>> converterType) {
        return returnType.hasMethodAnnotation(JsonResponseFilter.class);
    }

    @Override
    public Object beforeBodyWrite(Object body,
                                  MethodParameter returnType,
                                  MediaType selectedContentType,
                                  Class<? extends HttpMessageConverter<?>> selectedConverterType,
                                  ServerHttpRequest request,
                                  ServerHttpResponse response) {
        if (body == null) {
            return null;
        }

        JsonResponseFilter filter = returnType.getMethodAnnotation(JsonResponseFilter.class);
        if (filter == null) {
            return body;
        }

        Set<String> includes = new HashSet<>(Arrays.asList(filter.include()));
        if (filter.value().length > 0) {
            includes.addAll(Arrays.asList(filter.value()));
        }
        Set<String> excludes = new HashSet<>(Arrays.asList(filter.exclude()));

        if (includes.isEmpty() && excludes.isEmpty()) {
            return body;
        }

        try {
            JsonNode rootNode = objectMapper.valueToTree(body);
            JsonNode filteredNode = filterJsonNode(rootNode, "", includes, excludes);
            return objectMapper.treeToValue(filteredNode, Object.class);
        } catch (Exception e) {
            return body;
        }
    }

    private JsonNode filterJsonNode(JsonNode node, String currentPath, Set<String> includes, Set<String> excludes) {
        if (node.isObject()) {
            ObjectNode objectNode = (ObjectNode) node;
            List<String> fieldNames = new ArrayList<>();
            objectNode.fieldNames().forEachRemaining(fieldNames::add);

            for (String fieldName : fieldNames) {
                String fieldPath = currentPath.isEmpty() ? fieldName : currentPath + "." + fieldName;

                // Check exclusion first
                if (matchesAny(fieldPath, excludes)) {
                    objectNode.remove(fieldName);
                    continue;
                }

                // Check inclusion if specified
                if (!includes.isEmpty() && !matchesOrIsParentOfInclude(fieldPath, includes)) {
                    objectNode.remove(fieldName);
                    continue;
                }

                // Recursively filter child
                filterJsonNode(objectNode.get(fieldName), fieldPath, includes, excludes);
            }
            return objectNode;
        } else if (node.isArray()) {
            ArrayNode arrayNode = (ArrayNode) node;
            for (int i = 0; i < arrayNode.size(); i++) {
                filterJsonNode(arrayNode.get(i), currentPath, includes, excludes);
            }
            return arrayNode;
        }
        return node;
    }

    private boolean matchesAny(String path, Set<String> patterns) {
        for (String pattern : patterns) {
            if (pathMatcher.match(pattern, path) || pathMatcher.match("**/." + pattern, path)) {
                return true;
            }
        }
        return false;
    }

    private boolean matchesOrIsParentOfInclude(String path, Set<String> includes) {
        for (String pattern : includes) {
            if (pathMatcher.match(pattern, path) || pattern.startsWith(path + ".") || pathMatcher.match(pattern + "/**", path)) {
                return true;
            }
        }
        return false;
    }
}
