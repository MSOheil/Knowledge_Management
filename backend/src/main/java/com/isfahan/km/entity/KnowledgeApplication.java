package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "knowledge_applications")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeApplication extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_knowledge_item_id", nullable = false)
    @JsonIgnoreProperties({"evaluations", "appeals", "attachments"})
    private KnowledgeItem parentKnowledgeItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "roles"})
    private User user;

    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(name = "results_achieved", columnDefinition = "TEXT")
    private String resultsAchieved;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING";
}
