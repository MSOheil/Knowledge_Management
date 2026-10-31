package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.exception.BadRequestException;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.primeng.PNTableModel;
import com.example.base.querydsl.CustomPredicatesJoinBuilderJPA;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.WorkflowDefinition;
import com.isfahan.km.entity.WorkflowStage;
import com.isfahan.km.repository.WorkflowDefinitionRepository;
import com.isfahan.km.repository.WorkflowStageRepository;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/workflows")
@RequiredArgsConstructor
public class AdminWorkflowController {

    private final WorkflowDefinitionRepository workflowRepository;
    private final WorkflowStageRepository stageRepository;

    @PostMapping("/getListTable")
    @JsonResponseFilter(include = {
            "totalElements", "totalPages", "size", "number", "first", "last", "empty", "numberOfElements",
            "content.id", "content.title", "content.knowledgeType", "content.isActive", "content.createdAt", "content.updatedAt",
            "content.secretariat.id", "content.secretariat.name", "content.secretariat.code",
            "content.stages.id", "content.stages.stageOrder", "content.stages.stageName", "content.stages.reviewerRole",
            "content.stages.slaHours", "content.stages.requiresScoring", "content.stages.minPassingScore",
            "id", "title", "knowledgeType", "isActive", "createdAt", "updatedAt"
    })
    public Page<WorkflowDefinition> getListTable(@RequestBody PNTableModel event) {
        CustomPredicatesJoinBuilderJPA<WorkflowDefinition> joinBuilder = new CustomPredicatesJoinBuilderJPA<>(WorkflowDefinition.class);
        Predicate predicate = joinBuilder.buildPredicate(event).getValue();
        Pageable pageable = joinBuilder.resolvePageable(event);

        if (predicate != null) {
            return workflowRepository.findAll(predicate, pageable);
        }
        return workflowRepository.findAll(pageable);
    }

    @GetMapping("/{id}")
    @JsonResponseFilter(include = {
            "id", "title", "knowledgeType", "isActive", "createdAt", "updatedAt",
            "secretariat.id", "secretariat.name", "secretariat.code",
            "stages.id", "stages.stageOrder", "stages.stageName", "stages.reviewerRole",
            "stages.formSchemaJson", "stages.slaHours", "stages.requiresScoring", "stages.minPassingScore"
    })
    public WorkflowDefinition getById(@PathVariable UUID id) {
        return workflowRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("گردش‌کار یافت نشد."));
    }

    @PostMapping("/create")
    @ValidateModel({
            @FieldRule(field = "title", rule = RuleType.NOT_BLANK, message = "عنوان گردش‌کار الزامی است")
    })
    @JsonRequestFilter(allow = {"title", "knowledgeType", "secretariat", "secretariat.id", "isActive"})
    @JsonResponseFilter(include = {"id", "title", "knowledgeType", "isActive", "secretariat.name", "createdAt"})
    public WorkflowDefinition create(@RequestBody WorkflowDefinition definition) {
        return workflowRepository.save(definition);
    }

    @PostMapping("/stage/save")
    @ValidateModel({
            @FieldRule(field = "stageName", rule = RuleType.NOT_BLANK, message = "نام مرحله الزامی است"),
            @FieldRule(field = "reviewerRole", rule = RuleType.NOT_BLANK, message = "نقش بررسی‌کننده الزامی است")
    })
    @JsonRequestFilter(allow = {
            "id", "workflow", "workflow.id", "stageOrder", "stageName", "reviewerRole",
            "formSchemaJson", "slaHours", "requiresScoring", "minPassingScore"
    })
    @JsonResponseFilter(include = {
            "id", "stageOrder", "stageName", "reviewerRole", "slaHours",
            "requiresScoring", "minPassingScore", "workflow.id"
    })
    public WorkflowStage saveStage(@RequestBody WorkflowStage stage) {
        if (stage.getWorkflow() == null || stage.getWorkflow().getId() == null) {
            throw new BadRequestException("شناسه گردش‌کار الزامی است.");
        }

        WorkflowDefinition workflow = workflowRepository.findById(stage.getWorkflow().getId())
                .orElseThrow(() -> new ResourceNotFoundException("گردش‌کار والد یافت نشد."));
        stage.setWorkflow(workflow);

        if (stage.getStageOrder() == null) {
            List<WorkflowStage> existing = stageRepository.findByWorkflowIdOrderByStageOrderAsc(workflow.getId());
            stage.setStageOrder(existing.size() + 1);
        }

        return stageRepository.save(stage);
    }

    @GetMapping("/stage/delete/{id}")
    public void deleteStage(@PathVariable UUID id) {
        WorkflowStage stage = stageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("مرحله مورد نظر یافت نشد."));
        stageRepository.delete(stage);
    }
}

