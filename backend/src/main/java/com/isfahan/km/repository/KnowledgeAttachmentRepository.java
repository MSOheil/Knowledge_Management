package com.isfahan.km.repository;

import com.isfahan.km.entity.KnowledgeAttachment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.UUID;

public interface KnowledgeAttachmentRepository extends JpaRepository<KnowledgeAttachment, UUID>, QuerydslPredicateExecutor<KnowledgeAttachment> {
}
