package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "committee_performance_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommitteePerformanceLog extends BaseEntity {

    @Column(name = "committee_name", nullable = false, length = 100)
    private String committeeName;

    @Column(name = "total_evaluated", nullable = false)
    private Integer totalEvaluated = 0;

    @Column(name = "total_approved", nullable = false)
    private Integer totalApproved = 0;

    @Column(name = "total_rejected", nullable = false)
    private Integer totalRejected = 0;

    @Column(name = "total_appeals_received", nullable = false)
    private Integer totalAppealsReceived = 0;

    @Column(name = "average_review_hours", nullable = false)
    private Double averageReviewHours = 0.0;
}
