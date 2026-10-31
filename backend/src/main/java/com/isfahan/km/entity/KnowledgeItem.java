package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

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

    @Enumerated(EnumType.STRING)
    @Column(name = "knowledge_type", nullable = false, length = 50)
    private KnowledgeNodeType knowledgeType = KnowledgeNodeType.EXPERIENCE;

    @Column(name = "content", columnDefinition = "TEXT")
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private KnowledgeItemStatus status = KnowledgeItemStatus.DRAFT;
}
