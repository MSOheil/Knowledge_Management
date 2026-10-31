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
@Table(name = "workflow_definitions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class WorkflowDefinition extends BaseEntity {

    @Column(name = "title", nullable = false, length = 150)
    private String title;

    @Enumerated(EnumType.STRING)
    @Column(name = "knowledge_type", nullable = false, length = 50)
    private KnowledgeNodeType knowledgeType = KnowledgeNodeType.EXPERIENCE;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "secretariat_id")
    @JsonIgnoreProperties({"workflows"})
    private Secretariat secretariat;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @OneToMany(mappedBy = "workflow", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("stageOrder ASC")
    @JsonIgnoreProperties({"workflow"})
    private List<WorkflowStage> stages = new ArrayList<>();
}
