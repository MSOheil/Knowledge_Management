package com.isfahan.km.repository;

import com.isfahan.km.entity.KnowledgeNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.UUID;

public interface KnowledgeNodeRepository extends JpaRepository<KnowledgeNode, UUID>, QuerydslPredicateExecutor<KnowledgeNode> {
}
