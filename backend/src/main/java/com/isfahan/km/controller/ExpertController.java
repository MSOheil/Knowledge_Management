package com.isfahan.km.controller;

import com.example.base.annotation.JsonRequestFilter;
import com.example.base.annotation.JsonResponseFilter;
import com.example.base.primeng.PNTableModel;
import com.example.base.querydsl.CustomPredicatesJoinBuilderJPA;
import com.example.base.validation.FieldRule;
import com.example.base.validation.RuleType;
import com.example.base.validation.ValidateModel;
import com.isfahan.km.entity.ExpertProfile;
import com.isfahan.km.entity.User;
import com.isfahan.km.repository.ExpertProfileRepository;
import com.isfahan.km.service.ExpertService;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/experts")
@RequiredArgsConstructor
public class ExpertController {

    private final ExpertService expertService;
    private final ExpertProfileRepository expertRepository;

    @GetMapping("/directory")
    @JsonResponseFilter(include = {
            "id", "expertiseSummary", "department", "isVerified", "resumeFilePath",
            "user.id", "user.fullName", "user.username"
    })
    public List<ExpertProfile> getDirectory() {
        return expertService.getVerifiedExperts();
    }

    @PostMapping("/register")
    @ValidateModel({
            @FieldRule(field = "expertiseSummary", rule = RuleType.NOT_BLANK, message = "Expertise summary is required")
    })
    @JsonRequestFilter(allow = {"expertiseSummary", "department", "resumeFilePath"})
    @JsonResponseFilter(include = {"id", "expertiseSummary", "department", "isVerified"})
    public ExpertProfile register(@RequestBody ExpertProfile profile, @AuthenticationPrincipal User user) {
        return expertService.registerOrUpdateProfile(profile, user);
    }

    @PostMapping("/verify/{id}")
    @JsonResponseFilter(include = {"id", "isVerified", "department", "updatedAt"})
    public ExpertProfile verify(@PathVariable UUID id, @RequestParam(defaultValue = "true") boolean isVerified) {
        return expertService.verifyExpert(id, isVerified);
    }

    @PostMapping("/getListTable")
    @JsonResponseFilter(include = {
            "id", "expertiseSummary", "department", "isVerified", "resumeFilePath",
            "user.fullName", "user.username", "createdAt"
    })
    public Page<ExpertProfile> getListTable(@RequestBody PNTableModel event) {
        CustomPredicatesJoinBuilderJPA<ExpertProfile> joinBuilder = new CustomPredicatesJoinBuilderJPA<>(ExpertProfile.class);
        Predicate predicate = joinBuilder.buildPredicate(event).getValue();
        Pageable pageable = joinBuilder.resolvePageable(event);

        if (predicate != null) {
            return expertRepository.findAll(predicate, pageable);
        }
        return expertRepository.findAll(pageable);
    }
}
