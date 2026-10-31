package com.isfahan.km.repository;

import com.isfahan.km.entity.KnowledgeTranscript;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.UUID;

public interface KnowledgeTranscriptRepository extends JpaRepository<KnowledgeTranscript, UUID>, QuerydslPredicateExecutor<KnowledgeTranscript> {
    List<KnowledgeTranscript> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
