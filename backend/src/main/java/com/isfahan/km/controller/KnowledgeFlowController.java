package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.primeng.PNTableModel;
import com.example.base.querydsl.CustomPredicatesJoinBuilderJPA;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.AccessPurpose;
import com.isfahan.km.entity.KnowledgeAccessLog;
import com.isfahan.km.entity.KnowledgeItem;
import com.isfahan.km.entity.User;
import com.isfahan.km.predicate.KnowledgeSearchPredicateBuilder;
import com.isfahan.km.repository.KnowledgeAccessLogRepository;
import com.isfahan.km.repository.KnowledgeItemRepository;
import com.isfahan.km.service.KnowledgeFlowService;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/knowledge/flow")
@RequiredArgsConstructor
public class KnowledgeFlowController {

    private final KnowledgeFlowService flowService;
    private final KnowledgeAccessLogRepository accessLogRepository;
    private final KnowledgeItemRepository knowledgeItemRepository;

    @PostMapping("/log-access")
    @ValidateModel({
            @FieldRule(field = "accessPurpose", rule = RuleType.NOT_NULL, message = "Access purpose is required")
    })
    @JsonRequestFilter(allow = {"knowledgeItem", "knowledgeItem.id", "accessPurpose", "customPurposeDescription"})
    @JsonResponseFilter(include = {"id", "accessPurpose", "customPurposeDescription", "accessedAt"})
    public KnowledgeAccessLog logAccess(@RequestBody KnowledgeAccessLog log, @AuthenticationPrincipal User user) {
        UUID itemId = log.getKnowledgeItem() != null ? log.getKnowledgeItem().getId() : null;
        AccessPurpose purpose = log.getAccessPurpose();
        return flowService.logAccess(itemId, user, purpose, log.getCustomPurposeDescription());
    }

    @PostMapping("/search")
    @JsonResponseFilter(include = {
            "id", "title", "knowledgeType", "summary", "content",
            "node.id", "node.title",
            "user.id", "user.fullName", "createdAt"
    })
    public Page<KnowledgeItem> search(@RequestBody PNTableModel event) {
        CustomPredicatesJoinBuilderJPA<KnowledgeItem> joinBuilder = new CustomPredicatesJoinBuilderJPA<>(KnowledgeItem.class);
        Pageable pageable = joinBuilder.resolvePageable(event);

        String keyword = event.getGlobalFilter();
        Predicate predicate = KnowledgeSearchPredicateBuilder.search(keyword);
        if (predicate != null) {
            return knowledgeItemRepository.findAll(predicate, pageable);
        }
        return knowledgeItemRepository.findAll(pageable);
    }

    @PostMapping("/access-logs/getListTable")
    @JsonResponseFilter(include = {
            "id", "accessPurpose", "customPurposeDescription", "accessedAt",
            "knowledgeItem.id", "knowledgeItem.title",
            "user.fullName", "user.username"
    })
    public Page<KnowledgeAccessLog> getAccessLogsTable(@RequestBody PNTableModel event) {
        CustomPredicatesJoinBuilderJPA<KnowledgeAccessLog> joinBuilder = new CustomPredicatesJoinBuilderJPA<>(KnowledgeAccessLog.class);
        Predicate predicate = joinBuilder.buildPredicate(event).getValue();
        Pageable pageable = joinBuilder.resolvePageable(event);

        if (predicate != null) {
            return accessLogRepository.findAll(predicate, pageable);
        }
        return accessLogRepository.findAll(pageable);
    }
}
