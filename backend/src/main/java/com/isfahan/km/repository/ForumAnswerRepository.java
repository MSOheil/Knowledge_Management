package com.isfahan.km.repository;

import com.isfahan.km.entity.ForumAnswer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.UUID;

public interface ForumAnswerRepository extends JpaRepository<ForumAnswer, UUID>, QuerydslPredicateExecutor<ForumAnswer> {
    List<ForumAnswer> findByQuestionIdOrderByCreatedAtAsc(UUID questionId);
}
