package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "knowledge_items")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeItem extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "node_id", nullable = false)
    @JsonIgnoreProperties({"items", "children", "parent"})
    private KnowledgeNode node;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "roles"})
    private User user;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "target_audience", length = 255)
    private String targetAudience;

    @Enumerated(EnumType.STRING)
    @Column(name = "knowledge_type", nullable = false, length = 50)
    private KnowledgeNodeType knowledgeType = KnowledgeNodeType.EXPERIENCE;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Column(name = "custom_fields_json", columnDefinition = "TEXT")
    private String customFieldsJson;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private KnowledgeItemStatus status = KnowledgeItemStatus.DRAFT;

    @OneToMany(mappedBy = "knowledgeItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"knowledgeItem"})
    private List<KnowledgeAttachment> attachments = new ArrayList<>();

    @OneToMany(mappedBy = "knowledgeItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"knowledgeItem"})
    private List<Evaluation> evaluations = new ArrayList<>();

    @OneToMany(mappedBy = "knowledgeItem", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"knowledgeItem"})
    private List<Appeal> appeals = new ArrayList<>();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workflow_id")
    @JsonIgnoreProperties({"stages"})
    private WorkflowDefinition workflow;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "current_stage_id")
    @JsonIgnoreProperties({"workflow"})
    private WorkflowStage currentStage;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "panel_id")
    @JsonIgnoreProperties({"contributions"})
    private ExperiencePanel panel;

    @Transient
    @JsonIgnore
    private List<MultipartFile> uploadedFiles = new ArrayList<>();
}
