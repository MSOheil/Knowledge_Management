package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.primeng.PNTableModel;
import com.example.base.querydsl.CustomPredicatesJoinBuilderJPA;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.Appeal;
import com.isfahan.km.entity.User;
import com.isfahan.km.repository.AppealRepository;
import com.isfahan.km.service.EvaluationWorkflowService;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/appeals")
@RequiredArgsConstructor
public class AppealController {

    private final EvaluationWorkflowService workflowService;
    private final AppealRepository appealRepository;

    @PostMapping("/submit")
    @ValidateModel({
            @FieldRule(field = "reason", rule = RuleType.NOT_BLANK, message = "Reason is required"),
            @FieldRule(field = "reason", rule = RuleType.SIZE, min = 5, max = 2000, message = "Reason must be between 5 and 2000 characters")
    })
    @JsonRequestFilter(allow = {"knowledgeItem", "knowledgeItem.id", "reason"})
    @JsonResponseFilter(include = {
            "id", "reason", "status", "appealCount", "adminFeedback",
            "knowledgeItem.id", "knowledgeItem.title", "knowledgeItem.status", "createdAt"
    })
    public Appeal submit(@RequestBody Appeal appeal, @AuthenticationPrincipal User user) {
        UUID itemId = appeal.getKnowledgeItem() != null ? appeal.getKnowledgeItem().getId() : null;
        return workflowService.submitAppeal(itemId, user, appeal.getReason());
    }

    @GetMapping("/item/{itemId}")
    @JsonResponseFilter(include = {
            "id", "reason", "status", "appealCount", "adminFeedback",
            "knowledgeItem.id", "knowledgeItem.title", "knowledgeItem.status", "createdAt", "updatedAt"
    })
    public Appeal getByKnowledgeItem(@PathVariable UUID itemId) {
        return appealRepository.findByKnowledgeItemId(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("اعتراضی برای این دانش یافت نشد."));
    }

    @PostMapping("/review/{id}")
    @JsonRequestFilter(allow = {"status", "adminFeedback"})
    @JsonResponseFilter(include = {
            "id", "reason", "status", "appealCount", "adminFeedback",
            "knowledgeItem.id", "knowledgeItem.title", "knowledgeItem.status", "updatedAt"
    })
    public Appeal review(@PathVariable UUID id, @RequestBody Appeal payload, @AuthenticationPrincipal User reviewer) {
        return workflowService.reviewAppeal(id, payload.getStatus(), payload.getAdminFeedback(), reviewer);
    }

    @PostMapping("/getListTable")
    @JsonResponseFilter(include = {
            "id", "reason", "status", "appealCount", "adminFeedback",
            "knowledgeItem.id", "knowledgeItem.title", "knowledgeItem.status",
            "user.fullName", "user.username", "createdAt"
    })
    public Page<Appeal> getListTable(@RequestBody PNTableModel event) {
        CustomPredicatesJoinBuilderJPA<Appeal> joinBuilder = new CustomPredicatesJoinBuilderJPA<>(Appeal.class);
        Predicate predicate = joinBuilder.buildPredicate(event).getValue();
        Pageable pageable = joinBuilder.resolvePageable(event);

        if (predicate != null) {
            return appealRepository.findAll(predicate, pageable);
        }
        return appealRepository.findAll(pageable);
    }
}
