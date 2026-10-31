package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "expert_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ExpertProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"password", "roles"})
    private User user;

    @Column(name = "expertise_summary", columnDefinition = "TEXT")
    private String expertiseSummary;

    @Column(name = "resume_file_path", length = 1000)
    private String resumeFilePath;

    @Column(name = "is_verified", nullable = false)
    private Boolean isVerified = false;

    @Column(name = "department", length = 255)
    private String department;
}
