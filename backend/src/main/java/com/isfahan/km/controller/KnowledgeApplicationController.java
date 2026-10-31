package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.primeng.PNTableModel;
import com.example.base.querydsl.CustomPredicatesJoinBuilderJPA;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.KnowledgeApplication;
import com.isfahan.km.entity.User;
import com.isfahan.km.repository.KnowledgeApplicationRepository;
import com.isfahan.km.service.KnowledgeFlowService;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/knowledge/application")
@RequiredArgsConstructor
public class KnowledgeApplicationController {

    private final KnowledgeFlowService flowService;
    private final KnowledgeApplicationRepository applicationRepository;

    @PostMapping("/submit")
    @ValidateModel({
            @FieldRule(field = "description", rule = RuleType.NOT_BLANK, message = "Description is required"),
            @FieldRule(field = "description", rule = RuleType.SIZE, min = 10, max = 3000, message = "Description must be between 10 and 3000 characters")
    })
    @JsonRequestFilter(allow = {"parentKnowledgeItem", "parentKnowledgeItem.id", "description", "resultsAchieved"})
    @JsonResponseFilter(include = {
            "id", "description", "resultsAchieved", "status",
            "parentKnowledgeItem.id", "parentKnowledgeItem.title", "createdAt"
    })
    public KnowledgeApplication submit(@RequestBody KnowledgeApplication app, @AuthenticationPrincipal User user) {
        UUID parentId = app.getParentKnowledgeItem() != null ? app.getParentKnowledgeItem().getId() : null;
        return flowService.submitApplication(parentId, user, app.getDescription(), app.getResultsAchieved());
    }

    @PostMapping("/review/{id}")
    @JsonRequestFilter(allow = {"status"})
    @JsonResponseFilter(include = {"id", "status", "updatedAt"})
    public KnowledgeApplication review(@PathVariable UUID id, @RequestBody KnowledgeApplication payload, @AuthenticationPrincipal User reviewer) {
        return flowService.reviewApplication(id, payload.getStatus(), reviewer);
    }

    @PostMapping("/getListTable")
    @JsonResponseFilter(include = {
            "id", "description", "resultsAchieved", "status",
            "parentKnowledgeItem.id", "parentKnowledgeItem.title",
            "user.fullName", "user.username", "createdAt"
    })
    public Page<KnowledgeApplication> getListTable(@RequestBody PNTableModel event) {
        CustomPredicatesJoinBuilderJPA<KnowledgeApplication> joinBuilder = new CustomPredicatesJoinBuilderJPA<>(KnowledgeApplication.class);
        Predicate predicate = joinBuilder.buildPredicate(event).getValue();
        Pageable pageable = joinBuilder.resolvePageable(event);

        if (predicate != null) {
            return applicationRepository.findAll(predicate, pageable);
        }
        return applicationRepository.findAll(pageable);
    }
}
