package com.isfahan.km.repository;

import com.isfahan.km.entity.Appeal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.Optional;
import java.util.UUID;

public interface AppealRepository extends JpaRepository<Appeal, UUID>, QuerydslPredicateExecutor<Appeal> {
    Optional<Appeal> findByKnowledgeItemId(UUID knowledgeItemId);
    boolean existsByKnowledgeItemId(UUID knowledgeItemId);
}
