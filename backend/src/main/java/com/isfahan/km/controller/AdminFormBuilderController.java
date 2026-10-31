package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.DynamicFormDefinition;
import com.isfahan.km.entity.KnowledgeNodeType;
import com.isfahan.km.repository.DynamicFormDefinitionRepository;
import com.querydsl.core.types.dsl.PathBuilder;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/form-builder")
@RequiredArgsConstructor
public class AdminFormBuilderController {

    private final DynamicFormDefinitionRepository formRepository;

    @GetMapping("/schema/{knowledgeType}")
    @JsonResponseFilter(include = {"id", "knowledgeType", "title", "formSchemaJson", "isActive"})
    public DynamicFormDefinition getSchema(@PathVariable KnowledgeNodeType knowledgeType) {
        PathBuilder<DynamicFormDefinition> path = new PathBuilder<>(DynamicFormDefinition.class, "dynamicFormDefinition");
        return formRepository.findOne(path.get("knowledgeType", KnowledgeNodeType.class).eq(knowledgeType))
                .orElseGet(() -> {
                    DynamicFormDefinition def = new DynamicFormDefinition();
                    def.setKnowledgeType(knowledgeType);
                    def.setTitle("فرم ثبت " + knowledgeType.name());
                    def.setFormSchemaJson("[]");
                    def.setIsActive(true);
                    return formRepository.save(def);
                });
    }

    @PostMapping("/schema")
    @ResponseStatus(HttpStatus.CREATED)
    @ValidateModel({
            @FieldRule(field = "title", rule = RuleType.NOT_BLANK, message = "عنوان فرم الزامی است")
    })
    @JsonRequestFilter(allow = {"id", "knowledgeType", "title", "formSchemaJson", "isActive"})
    @JsonResponseFilter(include = {"id", "knowledgeType", "title", "formSchemaJson", "isActive", "updatedAt"})
    public DynamicFormDefinition saveSchema(@RequestBody DynamicFormDefinition definition) {
        PathBuilder<DynamicFormDefinition> path = new PathBuilder<>(DynamicFormDefinition.class, "dynamicFormDefinition");
        return formRepository.findOne(path.get("knowledgeType", KnowledgeNodeType.class).eq(definition.getKnowledgeType()))
                .map(existing -> {
                    existing.setTitle(definition.getTitle());
                    existing.setFormSchemaJson(definition.getFormSchemaJson());
                    if (definition.getIsActive() != null) {
                        existing.setIsActive(definition.getIsActive());
                    }
                    return formRepository.save(existing);
                })
                .orElseGet(() -> formRepository.save(definition));
    }
}
