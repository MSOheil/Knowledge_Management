package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "evaluation_criterion_scores")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationCriterionScore extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "evaluation_id", nullable = false)
    @JsonIgnoreProperties({"criterionScores"})
    private Evaluation evaluation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "criterion_id", nullable = false)
    private EvaluationCriterion criterion;

    @Column(name = "given_score", nullable = false)
    private Double givenScore;
}
