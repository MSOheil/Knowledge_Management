package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "evaluation_criteria")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class EvaluationCriterion extends BaseEntity {

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "max_score", nullable = false)
    private Integer maxScore;

    @Column(name = "weight", nullable = false)
    private Double weight = 1.0;

    @Enumerated(EnumType.STRING)
    @Column(name = "knowledge_type", length = 50)
    private KnowledgeNodeType knowledgeType;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
