package com.isfahan.km.repository;

import com.isfahan.km.entity.ManagerKnowledgeRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.querydsl.QuerydslPredicateExecutor;

import java.util.List;
import java.util.UUID;

public interface ManagerKnowledgeRequestRepository extends JpaRepository<ManagerKnowledgeRequest, UUID>, QuerydslPredicateExecutor<ManagerKnowledgeRequest> {
    List<ManagerKnowledgeRequest> findByStatusOrderByCreatedAtDesc(String status);
    List<ManagerKnowledgeRequest> findByManagerIdOrderByCreatedAtDesc(UUID managerId);
}
