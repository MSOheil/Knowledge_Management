package com.isfahan.km.entity;

import com.example.base.entity.BaseEntity;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "forum_answers")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ForumAnswer extends BaseEntity {

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "question_id", nullable = false)
    @JsonIgnoreProperties({"answers"})
    private ForumQuestion question;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "author_id")
    @JsonIgnoreProperties({"password", "roles"})
    private User author;

    @Column(name = "answer_body", nullable = false, columnDefinition = "TEXT")
    private String answerBody;

    @Column(name = "is_accepted", nullable = false)
    private Boolean isAccepted = false;
}
