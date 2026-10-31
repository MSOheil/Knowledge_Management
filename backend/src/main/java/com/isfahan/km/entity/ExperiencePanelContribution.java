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
@Table(name = "experience_panel_contributions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExperiencePanelContribution extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "panel_id", nullable = false)
    @JsonIgnoreProperties({"contributions"})
    private ExperiencePanel panel;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contributor_id")
    @JsonIgnoreProperties({"password", "roles"})
    private User contributor;

    @Column(name = "experience_title", nullable = false, length = 255)
    private String experienceTitle;

    @Column(name = "experience_body", nullable = false, columnDefinition = "TEXT")
    private String experienceBody;

    @Column(name = "attachment_path", length = 1000)
    private String attachmentPath;

    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt = LocalDateTime.now();
}
