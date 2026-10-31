package com.isfahan.km.service;

import com.example.base.exception.BadRequestException;
import com.example.base.exception.ResourceNotFoundException;
import com.isfahan.km.entity.*;
import com.isfahan.km.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class DynamicWorkflowEngineService {

    private final WorkflowDefinitionRepository workflowRepository;
    private final WorkflowStageRepository stageRepository;
    private final KnowledgeItemRepository knowledgeItemRepository;
    private final EvaluationRepository evaluationRepository;
    private final EvaluationCriterionRepository criterionRepository;
    private final EvaluationCriterionScoreRepository criterionScoreRepository;
    private final SmsNotificationService smsNotificationService;

    @Transactional
    public KnowledgeItem initiateWorkflow(KnowledgeItem item, UUID secretariatId) {
        if (item == null) {
            throw new BadRequestException("دانش نمی‌تواند خالی باشد.");
        }

        KnowledgeNodeType type = item.getKnowledgeType() != null ? item.getKnowledgeType() : KnowledgeNodeType.EXPERIENCE;
        
        // Find matching workflow: first by type and secretariat, then fallback to type
        Optional<WorkflowDefinition> matchedWorkflow = Optional.empty();
        if (secretariatId != null) {
            matchedWorkflow = workflowRepository.findFirstByKnowledgeTypeAndSecretariatIdAndIsActiveTrue(type, secretariatId);
        }
        if (matchedWorkflow.isEmpty()) {
            matchedWorkflow = workflowRepository.findFirstByKnowledgeTypeAndIsActiveTrue(type);
        }

        if (matchedWorkflow.isPresent()) {
            WorkflowDefinition def = matchedWorkflow.get();
            item.setWorkflow(def);

            Optional<WorkflowStage> firstStage = stageRepository.findFirstByWorkflowIdOrderByStageOrderAsc(def.getId());
            if (firstStage.isPresent()) {
                item.setCurrentStage(firstStage.get());
                item.setStatus(KnowledgeItemStatus.UNDER_SECRETARIAT_REVIEW);
            }
        } else {
            // Default fallback if no dynamic workflow configured
            item.setStatus(KnowledgeItemStatus.SUBMITTED);
        }

        return knowledgeItemRepository.save(item);
    }

    @Transactional
    public Evaluation processStageDecision(UUID knowledgeItemId, Evaluation evaluation, User reviewer) {
        if (knowledgeItemId == null) {
            throw new BadRequestException("شناسه دانش الزامی است.");
        }

        KnowledgeItem item = knowledgeItemRepository.findById(knowledgeItemId)
                .orElseThrow(() -> new ResourceNotFoundException("دانش مورد نظر یافت نشد."));

        if (reviewer != null) {
            evaluation.setEvaluator(reviewer);
        }

        WorkflowStage currentStage = item.getCurrentStage();
        if (currentStage != null) {
            evaluation.setWorkflowStage(currentStage);
        }

        EvaluationDecision decision = evaluation.getDecision();
        if (decision == null) {
            throw new BadRequestException("تصمیم ارزیابی الزامی است.");
        }

        // Calculate score from criterion scores if present
        if (evaluation.getCriterionScores() != null && !evaluation.getCriterionScores().isEmpty()) {
            double totalWeightedGiven = 0.0;
            double totalWeight = 0.0;
            for (EvaluationCriterionScore cs : evaluation.getCriterionScores()) {
                if (cs.getCriterion() != null && cs.getCriterion().getId() != null) {
                    EvaluationCriterion criterion = criterionRepository.findById(cs.getCriterion().getId()).orElse(null);
                    if (criterion != null) {
                        double weight = criterion.getWeight() != null ? criterion.getWeight() : 1.0;
                        double given = cs.getGivenScore() != null ? cs.getGivenScore() : 0.0;
                        totalWeightedGiven += (given * weight);
                        totalWeight += (criterion.getMaxScore() * weight);
                    }
                }
            }
            if (totalWeight > 0) {
                evaluation.setScore(Math.round((totalWeightedGiven / totalWeight) * 100.0 * 10.0) / 10.0);
            }
        }

        // Check if passing score is satisfied when scoring is required
        if (currentStage != null && Boolean.TRUE.equals(currentStage.getRequiresScoring())) {
            double passingScore = currentStage.getMinPassingScore() != null ? currentStage.getMinPassingScore() : 60.0;
            double achievedScore = evaluation.getScore() != null ? evaluation.getScore() : 0.0;
            if (decision == EvaluationDecision.APPROVED && achievedScore < passingScore) {
                throw new BadRequestException(String.format("امتیاز مکتسبه (%.1f) کمتر از حداقل نمره قبولی این مرحله (%.1f) است.", achievedScore, passingScore));
            }
        }

        // State Machine Decision Handling
        switch (decision) {
            case APPROVED -> {
                if (currentStage != null && currentStage.getWorkflow() != null) {
                    int nextOrder = currentStage.getStageOrder() + 1;
                    Optional<WorkflowStage> nextStageOpt = stageRepository.findByWorkflowIdAndStageOrder(currentStage.getWorkflow().getId(), nextOrder);
                    if (nextStageOpt.isPresent()) {
                        WorkflowStage nextStage = nextStageOpt.get();
                        item.setCurrentStage(nextStage);
                        item.setStatus("SPECIALIZED_COMMITTEE".equalsIgnoreCase(nextStage.getReviewerRole())
                                ? KnowledgeItemStatus.UNDER_COMMITTEE_REVIEW
                                : KnowledgeItemStatus.UNDER_SECRETARIAT_REVIEW);
                    } else {
                        // All stages finished successfully -> Final approval and publish
                        item.setStatus(KnowledgeItemStatus.APPROVED);
                        smsNotificationService.sendApprovalAlert(item);
                    }
                } else {
                    item.setStatus(KnowledgeItemStatus.APPROVED);
                    smsNotificationService.sendApprovalAlert(item);
                }
            }
            case CONDITIONAL_APPROVED -> {
                item.setStatus(KnowledgeItemStatus.CONDITIONAL_APPROVED);
                smsNotificationService.sendConditionalApprovalAlert(item, evaluation.getConditionalRequirements());
            }
            case REFERRED_FOR_CORRECTION -> {
                item.setStatus(KnowledgeItemStatus.REFERRED_FOR_CORRECTION);
                smsNotificationService.sendReferralForCorrectionAlert(item, evaluation.getCorrectionHint());
            }
            case REJECTED -> {
                item.setStatus(KnowledgeItemStatus.REJECTED);
                smsNotificationService.sendRejectionAlert(item, evaluation.getFeedback());
            }
        }

        knowledgeItemRepository.save(item);
        evaluation.setKnowledgeItem(item);
        Evaluation savedEvaluation = evaluationRepository.save(evaluation);

        if (evaluation.getCriterionScores() != null) {
            for (EvaluationCriterionScore cs : evaluation.getCriterionScores()) {
                cs.setEvaluation(savedEvaluation);
                criterionScoreRepository.save(cs);
            }
        }

        return savedEvaluation;
    }

    @Transactional
    public KnowledgeItem resubmitCorrectedItem(UUID knowledgeItemId, User creator) {
        KnowledgeItem item = knowledgeItemRepository.findById(knowledgeItemId)
                .orElseThrow(() -> new ResourceNotFoundException("دانش یافت نشد."));

        if (item.getStatus() != KnowledgeItemStatus.REFERRED_FOR_CORRECTION) {
            throw new BadRequestException("فقط دانش‌های در وضعیت «ارجاع به اصلاح» امکان ثبت مجدد اصلاحات را دارند.");
        }

        // Directly return to the referring stage
        WorkflowStage currentStage = item.getCurrentStage();
        if (currentStage != null && "SPECIALIZED_COMMITTEE".equalsIgnoreCase(currentStage.getReviewerRole())) {
            item.setStatus(KnowledgeItemStatus.UNDER_COMMITTEE_REVIEW);
        } else {
            item.setStatus(KnowledgeItemStatus.UNDER_SECRETARIAT_REVIEW);
        }

        return knowledgeItemRepository.save(item);
    }
}

