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
@Table(name = "manager_knowledge_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ManagerKnowledgeRequest extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id")
    @JsonIgnoreProperties({"password", "roles"})
    private User manager;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "topic_description", nullable = false, columnDefinition = "TEXT")
    private String topicDescription;

    @Column(name = "deadline")
    private LocalDateTime deadline;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "ACTIVE";
}
