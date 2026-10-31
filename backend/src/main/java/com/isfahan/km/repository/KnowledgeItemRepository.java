package com.isfahan.km.repository;

import com.isfahan.km.entity.KnowledgeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.UUID;

public interface KnowledgeItemRepository extends JpaRepository<KnowledgeItem, UUID>, QuerydslPredicateExecutor<KnowledgeItem> {
}
