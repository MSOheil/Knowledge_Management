package com.isfahan.km.repository;

import com.isfahan.km.entity.ForumQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.UUID;

public interface ForumQuestionRepository extends JpaRepository<ForumQuestion, UUID>, QuerydslPredicateExecutor<ForumQuestion> {
    List<ForumQuestion> findByIsPublicTrueOrderByCreatedAtDesc();
    List<ForumQuestion> findByAssignedExpertIdOrderByCreatedAtDesc(UUID expertId);
    List<ForumQuestion> findByAuthorIdOrderByCreatedAtDesc(UUID authorId);
}
