package com.isfahan.km.repository;

import com.isfahan.km.entity.WorkflowStage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface WorkflowStageRepository extends JpaRepository<WorkflowStage, UUID>, QuerydslPredicateExecutor<WorkflowStage> {
    List<WorkflowStage> findByWorkflowIdOrderByStageOrderAsc(UUID workflowId);
    Optional<WorkflowStage> findByWorkflowIdAndStageOrder(UUID workflowId, Integer stageOrder);
    Optional<WorkflowStage> findFirstByWorkflowIdOrderByStageOrderAsc(UUID workflowId);
}

