package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "knowledge_access_logs")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeAccessLog extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "knowledge_item_id", nullable = false)
    @JsonIgnoreProperties({"evaluations", "appeals", "attachments"})
    private KnowledgeItem knowledgeItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "roles"})
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(name = "access_purpose", nullable = false, length = 100)
    private AccessPurpose accessPurpose = AccessPurpose.LEARNING_STUDY;

    @Column(name = "custom_purpose_description", columnDefinition = "TEXT")
    private String customPurposeDescription;

    @Column(name = "accessed_at", nullable = false)
    private LocalDateTime accessedAt = LocalDateTime.now();
}
