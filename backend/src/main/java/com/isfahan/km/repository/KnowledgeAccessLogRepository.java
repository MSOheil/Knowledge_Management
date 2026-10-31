package com.isfahan.km.repository;

import com.isfahan.km.entity.KnowledgeAccessLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.UUID;

public interface KnowledgeAccessLogRepository extends JpaRepository<KnowledgeAccessLog, UUID>, QuerydslPredicateExecutor<KnowledgeAccessLog> {
    List<KnowledgeAccessLog> findByKnowledgeItemId(UUID knowledgeItemId);
    List<KnowledgeAccessLog> findByUserId(UUID userId);
}
