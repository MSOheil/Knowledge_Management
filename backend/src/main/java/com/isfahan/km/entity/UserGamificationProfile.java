package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "user_gamification_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class UserGamificationProfile extends BaseEntity {

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    @JsonIgnoreProperties({"password", "roles"})
    private User user;

    @Column(name = "total_points", nullable = false)
    private Integer totalPoints = 0;

    @Column(name = "knowledge_contributor_level", nullable = false, length = 50)
    private String knowledgeContributorLevel = "NOVICE";

    @Column(name = "has_blue_badge", nullable = false)
    private Boolean hasBlueBadge = false;

    @Column(name = "bonus_amount_eligible", nullable = false)
    private Long bonusAmountEligible = 0L;

    @Column(name = "certificate_eligible", nullable = false)
    private Boolean certificateEligible = false;
}
