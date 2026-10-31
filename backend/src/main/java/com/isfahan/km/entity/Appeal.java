package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "appeals")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Appeal extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "knowledge_item_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"appeals", "evaluations", "attachments"})
    private KnowledgeItem knowledgeItem;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    @JsonIgnoreProperties({"password", "roles"})
    private User user;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private AppealStatus status = AppealStatus.PENDING;

    @Column(name = "admin_feedback", columnDefinition = "TEXT")
    private String adminFeedback;

    @Column(name = "appeal_count", nullable = false)
    private Integer appealCount = 1;
}
