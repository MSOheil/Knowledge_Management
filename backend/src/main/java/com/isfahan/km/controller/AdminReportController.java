package com.isfahan.km.controller;

import com.example.base.annotation.JsonResponseFilter;
import com.example.base.primeng.PNTableModel;
import com.example.base.querydsl.CustomPredicatesJoinBuilderJPA;
import com.isfahan.km.entity.CommitteePerformanceLog;
import com.isfahan.km.repository.CommitteePerformanceLogRepository;
import com.isfahan.km.service.AnalyticsReportingService;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/reports")
@RequiredArgsConstructor
public class AdminReportController {

    private final AnalyticsReportingService reportingService;
    private final CommitteePerformanceLogRepository committeeRepository;

    @GetMapping("/analytics-summary")
    @JsonResponseFilter(include = {
            "totalSubmissions", "approvedCount", "approvedRatio",
            "departmentStats.*", "knowledgeTypeDistribution.*", "committeeStats.*"
    })
    public Map<String, Object> getAnalyticsSummary() {
        return reportingService.getAnalyticsSummary();
    }

    @GetMapping("/export/bonuses")
    public List<Map<String, Object>> getBonusExport() {
        return reportingService.getBonusExportData();
    }

    @PostMapping("/committee-table")
    @JsonResponseFilter(include = {
            "id", "committeeName", "totalEvaluated", "totalApproved",
            "totalRejected", "totalAppealsReceived", "averageReviewHours", "createdAt"
    })
    public Page<CommitteePerformanceLog> getCommitteeTable(@RequestBody PNTableModel event) {
        CustomPredicatesJoinBuilderJPA<CommitteePerformanceLog> joinBuilder = new CustomPredicatesJoinBuilderJPA<>(CommitteePerformanceLog.class);
        Predicate predicate = joinBuilder.buildPredicate(event).getValue();
        Pageable pageable = joinBuilder.resolvePageable(event);

        if (predicate != null) {
            return committeeRepository.findAll(predicate, pageable);
        }
        return committeeRepository.findAll(pageable);
    }
}
