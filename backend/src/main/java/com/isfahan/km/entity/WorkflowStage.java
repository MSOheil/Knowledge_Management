package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "workflow_stages")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowStage extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id", nullable = false)
    @JsonIgnoreProperties({"stages"})
    private WorkflowDefinition workflow;

    @Column(name = "stage_order", nullable = false)
    private Integer stageOrder;

    @Column(name = "stage_name", nullable = false, length = 100)
    private String stageName;

    @Column(name = "reviewer_role", nullable = false, length = 50)
    private String reviewerRole;

    @Column(name = "form_schema_json", columnDefinition = "TEXT")
    private String formSchemaJson;

    @Column(name = "sla_hours", nullable = false)
    private Integer slaHours = 48;

    @Column(name = "requires_scoring", nullable = false)
    private Boolean requiresScoring = false;

    @Column(name = "min_passing_score", nullable = false)
    private Double minPassingScore = 0.0;
}
