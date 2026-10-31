package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.ManagerKnowledgeRequest;
import com.isfahan.km.entity.User;
import com.isfahan.km.service.KnowledgeFlowService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/manager-requests")
@RequiredArgsConstructor
public class ManagerRequestController {

    private final KnowledgeFlowService flowService;

    @GetMapping("/active")
    @JsonResponseFilter(include = {
            "id", "title", "topicDescription", "deadline", "status",
            "manager.id", "manager.fullName", "createdAt"
    })
    public List<ManagerKnowledgeRequest> getActiveRequests() {
        return flowService.getActiveManagerRequests();
    }

    @PostMapping("/create")
    @ValidateModel({
            @FieldRule(field = "title", rule = RuleType.NOT_BLANK, message = "Title is required"),
            @FieldRule(field = "topicDescription", rule = RuleType.NOT_BLANK, message = "Topic description is required")
    })
    @JsonRequestFilter(allow = {"title", "topicDescription", "deadline"})
    @JsonResponseFilter(include = {"id", "title", "topicDescription", "deadline", "status", "createdAt"})
    public ManagerKnowledgeRequest create(@RequestBody ManagerKnowledgeRequest request, @AuthenticationPrincipal User manager) {
        return flowService.createManagerRequest(request, manager);
    }
}
