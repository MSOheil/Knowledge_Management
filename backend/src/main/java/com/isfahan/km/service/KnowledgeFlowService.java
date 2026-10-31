package com.isfahan.km.service;

import com.example.base.exception.BadRequestException;
import com.example.base.exception.ResourceNotFoundException;
import com.isfahan.km.entity.*;
import com.isfahan.km.predicate.KnowledgeSearchPredicateBuilder;
import com.isfahan.km.repository.KnowledgeAccessLogRepository;
import com.isfahan.km.repository.KnowledgeApplicationRepository;
import com.isfahan.km.repository.KnowledgeItemRepository;
import com.isfahan.km.repository.ManagerKnowledgeRequestRepository;
import com.querydsl.core.types.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class KnowledgeFlowService {

    private final KnowledgeAccessLogRepository accessLogRepository;
    private final KnowledgeApplicationRepository applicationRepository;
    private final KnowledgeItemRepository knowledgeItemRepository;
    private final ManagerKnowledgeRequestRepository managerRequestRepository;

    @Transactional
    public KnowledgeAccessLog logAccess(UUID knowledgeItemId, User user, AccessPurpose purpose, String customDescription) {
        if (knowledgeItemId == null) {
            throw new BadRequestException("شناسه دانش الزامی است.");
        }
        KnowledgeItem item = knowledgeItemRepository.findById(knowledgeItemId)
                .orElseThrow(() -> new ResourceNotFoundException("دانش مورد نظر یافت نشد."));

        KnowledgeAccessLog log = new KnowledgeAccessLog();
        log.setKnowledgeItem(item);
        log.setUser(user);
        log.setAccessPurpose(purpose != null ? purpose : AccessPurpose.LEARNING_STUDY);
        log.setCustomPurposeDescription(customDescription);
        log.setAccessedAt(LocalDateTime.now());

        return accessLogRepository.save(log);
    }

    public Page<KnowledgeItem> search(String keyword, KnowledgeNodeType type, UUID nodeId, UUID authorId, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        Predicate predicate = KnowledgeSearchPredicateBuilder.build(keyword, type, nodeId, authorId, KnowledgeItemStatus.APPROVED, from, to);
        if (predicate != null) {
            return knowledgeItemRepository.findAll(predicate, pageable);
        }
        return knowledgeItemRepository.findAll(pageable);
    }

    @Transactional
    public KnowledgeApplication submitApplication(UUID parentItemId, User user, String description, String resultsAchieved) {
        if (parentItemId == null) {
            throw new BadRequestException("شناسه دانش پایه الزامی است.");
        }
        if (description == null || description.isBlank()) {
            throw new BadRequestException("شرح کاربست الزامی است.");
        }

        KnowledgeItem parentItem = knowledgeItemRepository.findById(parentItemId)
                .orElseThrow(() -> new ResourceNotFoundException("دانش پایه یافت نشد."));

        KnowledgeApplication app = new KnowledgeApplication();
        app.setParentKnowledgeItem(parentItem);
        app.setUser(user);
        app.setDescription(description.trim());
        app.setResultsAchieved(resultsAchieved);
        app.setStatus("PENDING");

        return applicationRepository.save(app);
    }

    @Transactional
    public KnowledgeApplication reviewApplication(UUID applicationId, String status, User reviewer) {
        KnowledgeApplication app = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("درخواست کاربست یافت نشد."));

        if (!"APPROVED".equalsIgnoreCase(status) && !"REJECTED".equalsIgnoreCase(status)) {
            throw new BadRequestException("وضعیت بررسی نامعتبر است.");
        }

        app.setStatus(status.toUpperCase());
        return applicationRepository.save(app);
    }

    @Transactional
    public ManagerKnowledgeRequest createManagerRequest(ManagerKnowledgeRequest request, User manager) {
        if (request.getTitle() == null || request.getTitle().isBlank()) {
            throw new BadRequestException("عنوان نیاز دانشی مدیر الزامی است.");
        }
        if (request.getTopicDescription() == null || request.getTopicDescription().isBlank()) {
            throw new BadRequestException("شرح موضوع دانشی الزامی است.");
        }

        request.setManager(manager);
        request.setStatus("ACTIVE");
        return managerRequestRepository.save(request);
    }

    public List<ManagerKnowledgeRequest> getActiveManagerRequests() {
        return managerRequestRepository.findByStatusOrderByCreatedAtDesc("ACTIVE");
    }
}
