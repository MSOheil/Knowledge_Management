package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.primeng.PNTableModel;
import com.example.base.querydsl.CustomPredicatesJoinBuilderJPA;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.Evaluation;
import com.isfahan.km.entity.EvaluationCriterion;
import com.isfahan.km.entity.User;
import com.isfahan.km.repository.EvaluationCriterionRepository;
import com.isfahan.km.repository.EvaluationRepository;
import com.isfahan.km.service.EvaluationWorkflowService;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/admin/evaluations")
@RequiredArgsConstructor
public class AdminEvaluationController {

    private final EvaluationWorkflowService workflowService;
    private final EvaluationRepository evaluationRepository;
    private final EvaluationCriterionRepository criterionRepository;

    @PostMapping("/getListTable")
    @JsonResponseFilter(include = {
            "id", "stage", "decision", "score", "feedback", "conditionalRequirements", "correctionHint",
            "knowledgeItem.id", "knowledgeItem.title", "knowledgeItem.knowledgeType", "knowledgeItem.status",
            "evaluator.fullName", "evaluator.username", "createdAt", "updatedAt"
    })
    public Page<Evaluation> getListTable(@RequestBody PNTableModel event) {
        CustomPredicatesJoinBuilderJPA<Evaluation> joinBuilder = new CustomPredicatesJoinBuilderJPA<>(Evaluation.class);
        Predicate predicate = joinBuilder.buildPredicate(event).getValue();
        Pageable pageable = joinBuilder.resolvePageable(event);

        if (predicate != null) {
            return evaluationRepository.findAll(predicate, pageable);
        }
        return evaluationRepository.findAll(pageable);
    }

    @PostMapping("/submit-decision")
    @ValidateModel({
            @FieldRule(field = "decision", rule = RuleType.NOT_NULL, message = "Decision is required")
    })
    @JsonRequestFilter(allow = {
            "knowledgeItem", "knowledgeItem.id", "stage", "decision", "score", "feedback",
            "conditionalRequirements", "correctionHint", "criterionScores",
            "criterionScores.criterion", "criterionScores.criterion.id", "criterionScores.givenScore"
    })
    @JsonResponseFilter(include = {
            "id", "stage", "decision", "score", "feedback", "conditionalRequirements", "correctionHint",
            "knowledgeItem.id", "knowledgeItem.title", "knowledgeItem.status", "createdAt"
    })
    public Evaluation submitDecision(@RequestBody Evaluation evaluation, @AuthenticationPrincipal User evaluator) {
        return workflowService.submitDecision(evaluation, evaluator);
    }

    @GetMapping("/criteria/{knowledgeType}")
    @JsonResponseFilter(include = {"id", "title", "maxScore", "weight", "knowledgeType", "isActive"})
    public List<EvaluationCriterion> getCriteria(@PathVariable String knowledgeType) {
        return workflowService.getActiveCriteriaForType(knowledgeType);
    }

    @GetMapping("/criteria")
    @JsonResponseFilter(include = {"id", "title", "maxScore", "weight", "knowledgeType", "isActive"})
    public List<EvaluationCriterion> getAllCriteria() {
        return workflowService.getActiveCriteriaForType(null);
    }

    @GetMapping("/{id}")
    @JsonResponseFilter(include = {
            "id", "stage", "decision", "score", "feedback", "conditionalRequirements", "correctionHint",
            "knowledgeItem.id", "knowledgeItem.title", "knowledgeItem.knowledgeType", "knowledgeItem.status",
            "knowledgeItem.summary", "knowledgeItem.content",
            "evaluator.fullName", "createdAt",
            "criterionScores.id", "criterionScores.givenScore", "criterionScores.criterion.id",
            "criterionScores.criterion.title", "criterionScores.criterion.maxScore", "criterionScores.criterion.weight"
    })
    public Evaluation getById(@PathVariable UUID id) {
        return evaluationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ارزیابی یافت نشد."));
    }
}
