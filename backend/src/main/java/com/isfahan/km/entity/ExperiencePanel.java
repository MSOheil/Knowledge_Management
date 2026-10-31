package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "experience_panels")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExperiencePanel extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id")
    @JsonIgnoreProperties({"password", "roles"})
    private User creator;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "secretariat_id")
    @JsonIgnoreProperties({"workflows"})
    private Secretariat secretariat;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "topic_description", nullable = false, columnDefinition = "TEXT")
    private String topicDescription;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "PENDING_APPROVAL";

    @Column(name = "opened_at")
    private LocalDateTime openedAt;

    @Column(name = "deadline_at")
    private LocalDateTime deadlineAt;

    @Column(name = "duration_days", nullable = false)
    private Integer durationDays = 30;

    @Column(name = "synthesis_summary", columnDefinition = "TEXT")
    private String synthesisSummary;

    @OneToMany(mappedBy = "panel", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("submittedAt DESC")
    @JsonIgnoreProperties({"panel"})
    private List<ExperiencePanelContribution> contributions = new ArrayList<>();
}
