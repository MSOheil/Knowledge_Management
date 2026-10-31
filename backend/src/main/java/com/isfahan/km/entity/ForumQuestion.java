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
@Table(name = "forum_questions")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForumQuestion extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    @JsonIgnoreProperties({"password", "roles"})
    private User author;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_expert_id")
    @JsonIgnoreProperties({"password", "roles"})
    private User assignedExpert;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "question_body", nullable = false, columnDefinition = "TEXT")
    private String questionBody;

    @Column(name = "is_public", nullable = false)
    private Boolean isPublic = true;

    @Column(name = "status", nullable = false, length = 50)
    private String status = "OPEN";

    @OneToMany(mappedBy = "question", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonIgnoreProperties({"question"})
    private List<ForumAnswer> answers = new ArrayList<>();
}
