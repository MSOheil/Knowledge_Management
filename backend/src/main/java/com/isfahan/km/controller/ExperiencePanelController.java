package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.primeng.PNTableModel;
import com.example.base.querydsl.CustomPredicatesJoinBuilderJPA;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.ExperiencePanel;
import com.isfahan.km.entity.ExperiencePanelContribution;
import com.isfahan.km.entity.KnowledgeItem;
import com.isfahan.km.entity.User;
import com.isfahan.km.repository.ExperiencePanelRepository;
import com.isfahan.km.service.ExperiencePanelService;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/experience-panels")
@RequiredArgsConstructor
public class ExperiencePanelController {

    private final ExperiencePanelService panelService;
    private final ExperiencePanelRepository panelRepository;

    @PostMapping("/getListTable")
    @JsonResponseFilter(include = {
            "totalElements", "totalPages", "size", "number", "first", "last", "empty", "numberOfElements",
            "content.id", "content.title", "content.topicDescription", "content.status", "content.openedAt", "content.deadlineAt", "content.durationDays",
            "content.createdAt", "content.creator.fullName", "content.creator.username",
            "content.secretariat.id", "content.secretariat.name", "content.secretariat.code",
            "id", "title", "topicDescription", "status", "openedAt", "deadlineAt", "durationDays", "createdAt"
    })
    public Page<ExperiencePanel> getListTable(@RequestBody PNTableModel event) {
        CustomPredicatesJoinBuilderJPA<ExperiencePanel> joinBuilder = new CustomPredicatesJoinBuilderJPA<>(ExperiencePanel.class);
        Predicate predicate = joinBuilder.buildPredicate(event).getValue();
        Pageable pageable = joinBuilder.resolvePageable(event);

        if (predicate != null) {
            return panelRepository.findAll(predicate, pageable);
        }
        return panelRepository.findAll(pageable);
    }

    @GetMapping("/active")
    @JsonResponseFilter(include = {
            "id", "title", "topicDescription", "status", "openedAt", "deadlineAt", "durationDays",
            "secretariat.id", "secretariat.name", "creator.fullName"
    })
    public List<ExperiencePanel> getActivePanels() {
        return panelRepository.findByStatusAndDeadlineAtAfterOrderByDeadlineAtAsc("APPROVED_OPEN", LocalDateTime.now());
    }

    @GetMapping("/{id}")
    @JsonResponseFilter(include = {
            "id", "title", "topicDescription", "status", "openedAt", "deadlineAt", "durationDays",
            "synthesisSummary", "createdAt",
            "creator.id", "creator.fullName",
            "secretariat.id", "secretariat.name", "secretariat.code",
            "contributions.id", "contributions.experienceTitle", "contributions.experienceBody",
            "contributions.attachmentPath", "contributions.submittedAt", "contributions.contributor.fullName"
    })
    public ExperiencePanel getById(@PathVariable UUID id) {
        return panelRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("پویش مورد نظر یافت نشد."));
    }

    @PostMapping("/propose")
    @ValidateModel({
            @FieldRule(field = "title", rule = RuleType.NOT_BLANK, message = "عنوان پویش الزامی است"),
            @FieldRule(field = "topicDescription", rule = RuleType.NOT_BLANK, message = "شرح موضوع پویش الزامی است")
    })
    @JsonRequestFilter(allow = {"title", "topicDescription", "durationDays", "secretariat", "secretariat.id"})
    @JsonResponseFilter(include = {"id", "title", "topicDescription", "status", "durationDays", "createdAt"})
    public ExperiencePanel propose(@RequestBody ExperiencePanel panel, @AuthenticationPrincipal User user) {
        return panelService.proposePanel(panel, user);
    }

    @PostMapping("/{id}/approve")
    @JsonResponseFilter(include = {"id", "title", "status", "openedAt", "deadlineAt"})
    public ExperiencePanel approve(@PathVariable UUID id, @AuthenticationPrincipal User reviewer) {
        return panelService.approvePanel(id, reviewer);
    }

    @PostMapping("/{id}/reject")
    @JsonResponseFilter(include = {"id", "title", "status"})
    public ExperiencePanel reject(@PathVariable UUID id, @RequestBody(required = false) Map<String, String> body, @AuthenticationPrincipal User reviewer) {
        String reason = body != null ? body.get("reason") : null;
        return panelService.rejectPanel(id, reason, reviewer);
    }

    @PostMapping("/{id}/contribute")
    @ValidateModel({
            @FieldRule(field = "experienceTitle", rule = RuleType.NOT_BLANK, message = "عنوان تجربه الزامی است"),
            @FieldRule(field = "experienceBody", rule = RuleType.NOT_BLANK, message = "شرح تجربه الزامی است")
    })
    @JsonRequestFilter(allow = {"experienceTitle", "experienceBody", "attachmentPath"})
    @JsonResponseFilter(include = {"id", "experienceTitle", "experienceBody", "submittedAt", "contributor.fullName"})
    public ExperiencePanelContribution contribute(@PathVariable UUID id, @RequestBody ExperiencePanelContribution contribution, @AuthenticationPrincipal User user) {
        return panelService.contributeExperience(id, contribution, user);
    }

    @PostMapping("/{id}/close")
    @JsonResponseFilter(include = {"id", "title", "status"})
    public ExperiencePanel close(@PathVariable UUID id, @AuthenticationPrincipal User user) {
        return panelService.closePanelForSynthesis(id, user);
    }

    @GetMapping("/{id}/preview-synthesis")
    public Map<String, String> previewSynthesis(@PathVariable UUID id) {
        String preview = panelService.generateAiSynthesisPreview(id);
        return Map.of("preview", preview);
    }

    @PostMapping("/{id}/synthesize")
    @JsonResponseFilter(include = {"id", "title", "summary", "status", "createdAt"})
    public KnowledgeItem synthesize(@PathVariable UUID id, @RequestBody Map<String, String> payload, @AuthenticationPrincipal User user) {
        String summary = payload.get("synthesisSummary");
        String nodeIdStr = payload.get("nodeId");
        UUID nodeId = (nodeIdStr != null && !nodeIdStr.isBlank()) ? UUID.fromString(nodeIdStr) : null;
        return panelService.synthesizeAndSubmitToWorkflow(id, summary, nodeId, user);
    }
}

