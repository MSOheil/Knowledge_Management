package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "knowledge_transcripts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class KnowledgeTranscript extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"password", "roles"})
    private User user;

    @Column(name = "activity_type", nullable = false, length = 50)
    private String activityType;

    @Column(name = "points", nullable = false)
    private Integer points;

    @Column(name = "reference_id")
    private UUID referenceId;

    @Column(name = "description", length = 255)
    private String description;
}
