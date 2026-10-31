package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "evaluations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Evaluation extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "knowledge_item_id", nullable = false)
    @JsonIgnoreProperties({"evaluations", "appeals", "attachments"})
    private KnowledgeItem knowledgeItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluator_id")
    @JsonIgnoreProperties({"password", "roles"})
    private User evaluator;

    @Enumerated(EnumType.STRING)
    @Column(name = "stage", nullable = false, length = 50)
    private EvaluationStage stage;

    @Enumerated(EnumType.STRING)
    @Column(name = "decision", nullable = false, length = 50)
    private EvaluationDecision decision;

    @Column(name = "score")
    private Double score;

    @Column(name = "feedback", columnDefinition = "TEXT")
    private String feedback;

    @Column(name = "conditional_requirements", columnDefinition = "TEXT")
    private String conditionalRequirements;

    @Column(name = "correction_hint", columnDefinition = "TEXT")
    private String correctionHint;

    @OneToMany(mappedBy = "evaluation", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"evaluation"})
    private List<EvaluationCriterionScore> criterionScores = new ArrayList<>();
}
