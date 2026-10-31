package com.isfahan.km.controller;

import com.example.base.annotation.JsonResponseFilter;
import com.example.base.primeng.PNTableModel;
import com.example.base.querydsl.CustomPredicatesJoinBuilderJPA;
import com.isfahan.km.entity.KnowledgeTranscript;
import com.isfahan.km.entity.User;
import com.isfahan.km.entity.UserGamificationProfile;
import com.isfahan.km.service.GamificationService;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/gamification")
@RequiredArgsConstructor
public class GamificationController {

    private final GamificationService gamificationService;

    @GetMapping("/transcript/{userId}")
    @JsonResponseFilter(include = {
            "id", "totalPoints", "hasBlueBadge", "knowledgeContributorLevel",
            "bonusAmountEligible", "certificateEligible",
            "user.id", "user.fullName", "user.username"
    })
    public UserGamificationProfile getProfile(@PathVariable UUID userId) {
        return gamificationService.getProfileByUserId(userId);
    }

    @GetMapping("/me")
    @JsonResponseFilter(include = {
            "id", "totalPoints", "hasBlueBadge", "knowledgeContributorLevel",
            "bonusAmountEligible", "certificateEligible",
            "user.id", "user.fullName", "user.username"
    })
    public UserGamificationProfile getMyProfile(@AuthenticationPrincipal User user) {
        UUID userId = user != null ? user.getId() : UUID.randomUUID();
        return gamificationService.getProfileByUserId(userId);
    }

    @GetMapping("/transcripts/{userId}")
    @JsonResponseFilter(include = {
            "id", "activityType", "points", "referenceId", "description", "createdAt"
    })
    public List<KnowledgeTranscript> getTranscripts(@PathVariable UUID userId) {
        return gamificationService.getUserTranscripts(userId);
    }

    @PostMapping("/profiles/getListTable")
    @JsonResponseFilter(include = {
            "id", "totalPoints", "hasBlueBadge", "knowledgeContributorLevel",
            "bonusAmountEligible", "certificateEligible",
            "user.fullName", "user.username", "createdAt"
    })
    public Page<UserGamificationProfile> getProfilesTable(@RequestBody PNTableModel event) {
        CustomPredicatesJoinBuilderJPA<UserGamificationProfile> joinBuilder = new CustomPredicatesJoinBuilderJPA<>(UserGamificationProfile.class);
        Predicate predicate = joinBuilder.buildPredicate(event).getValue();
        Pageable pageable = joinBuilder.resolvePageable(event);

        return gamificationService.getAllProfiles(pageable);
    }
}
