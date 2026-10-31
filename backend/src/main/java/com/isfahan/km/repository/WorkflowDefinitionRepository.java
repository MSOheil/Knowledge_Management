package com.isfahan.km.repository;

import com.isfahan.km.entity.KnowledgeNodeType;
import com.isfahan.km.entity.WorkflowDefinition;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkflowDefinitionRepository extends JpaRepository<WorkflowDefinition, UUID>, QuerydslPredicateExecutor<WorkflowDefinition> {
    List<WorkflowDefinition> findByKnowledgeTypeAndIsActiveTrue(KnowledgeNodeType knowledgeType);
    Optional<WorkflowDefinition> findFirstByKnowledgeTypeAndSecretariatIdAndIsActiveTrue(KnowledgeNodeType knowledgeType, UUID secretariatId);
    Optional<WorkflowDefinition> findFirstByKnowledgeTypeAndIsActiveTrue(KnowledgeNodeType knowledgeType);
}

