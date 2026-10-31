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
@Table(name = "knowledge_nodes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeNode extends BaseEntity {

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "code", length = 50)
    private String code;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "node_order", nullable = false)
    private Integer nodeOrder = 0;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id")
    @JsonIgnoreProperties({"children", "items", "parent"})
    private KnowledgeNode parent;

    @OneToMany(mappedBy = "parent", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("nodeOrder ASC, title ASC")
    @JsonIgnoreProperties({"parent", "items"})
    private List<KnowledgeNode> children = new ArrayList<>();

    @OneToMany(mappedBy = "node", cascade = CascadeType.ALL)
    @JsonIgnoreProperties({"node"})
    private List<KnowledgeItem> items = new ArrayList<>();
}
