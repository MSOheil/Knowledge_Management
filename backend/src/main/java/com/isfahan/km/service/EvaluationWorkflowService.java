package com.isfahan.km.service;

import com.example.base.exception.BadRequestException;
import com.example.base.exception.ResourceNotFoundException;
import com.isfahan.km.entity.*;
import com.isfahan.km.repository.AppealRepository;
import com.isfahan.km.repository.EvaluationCriterionRepository;
import com.isfahan.km.repository.EvaluationCriterionScoreRepository;
import com.isfahan.km.repository.EvaluationRepository;
import com.isfahan.km.repository.KnowledgeItemRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EvaluationWorkflowService {

    private final EvaluationRepository evaluationRepository;
    private final EvaluationCriterionRepository criterionRepository;
    private final EvaluationCriterionScoreRepository criterionScoreRepository;
    private final KnowledgeItemRepository knowledgeItemRepository;
    private final AppealRepository appealRepository;
    private final SmsNotificationService smsNotificationService;
    private final DynamicWorkflowEngineService dynamicWorkflowEngineService;

    public boolean isSingleStage(KnowledgeNodeType type) {
        return type == KnowledgeNodeType.BOOK ||
               type == KnowledgeNodeType.ARTICLE ||
               type == KnowledgeNodeType.THESIS;
    }

    public List<EvaluationCriterion> getActiveCriteriaForType(String knowledgeType) {
        if (knowledgeType != null && !knowledgeType.isBlank()) {
            List<EvaluationCriterion> criteria = criterionRepository.findByKnowledgeTypeAndIsActiveTrue(knowledgeType);
            if (!criteria.isEmpty()) {
                return criteria;
            }
        }
        return criterionRepository.findByIsActiveTrue();
    }

    @Transactional
    public Evaluation submitDecision(Evaluation evaluation, User evaluator) {
        if (evaluation.getKnowledgeItem() == null || evaluation.getKnowledgeItem().getId() == null) {
            throw new BadRequestException("شناسه دانش الزامی است.");
        }

        KnowledgeItem item = knowledgeItemRepository.findById(evaluation.getKnowledgeItem().getId())
                .orElseThrow(() -> new ResourceNotFoundException("دانش مورد نظر یافت نشد."));

        if (evaluator != null) {
            evaluation.setEvaluator(evaluator);
        }

        // Seamless handover to Dynamic Workflow Engine if item is managed by dynamic workflow
        if (item.getWorkflow() != null && item.getCurrentStage() != null) {
            return dynamicWorkflowEngineService.processStageDecision(item.getId(), evaluation, evaluator);
        }

        boolean singleStage = isSingleStage(item.getKnowledgeType());
        EvaluationStage stage = evaluation.getStage() != null ? evaluation.getStage() :
                (singleStage ? EvaluationStage.SECRETARIAT_STAGE : EvaluationStage.SPECIALIZED_COMMITTEE_STAGE);
        evaluation.setStage(stage);

        EvaluationDecision decision = evaluation.getDecision();
        if (decision == null) {
            throw new BadRequestException("تصمیم ارزیابی باید مشخص گردد.");
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

        // State Machine Transitions
        if (stage == EvaluationStage.SECRETARIAT_STAGE) {
            if (singleStage) {
                applyFinalDecisionToItem(item, decision, evaluation);
            } else {
                // Two-stage workflow: Secretariat verification moves to committee
                switch (decision) {
                    case APPROVED -> {
                        item.setStatus(KnowledgeItemStatus.UNDER_COMMITTEE_REVIEW);
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
            }
        } else if (stage == EvaluationStage.SPECIALIZED_COMMITTEE_STAGE) {
            applyFinalDecisionToItem(item, decision, evaluation);
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

    private void applyFinalDecisionToItem(KnowledgeItem item, EvaluationDecision decision, Evaluation evaluation) {
        switch (decision) {
            case APPROVED -> {
                item.setStatus(KnowledgeItemStatus.APPROVED);
                smsNotificationService.sendApprovalAlert(item);
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
    }

    @Transactional
    public Appeal submitAppeal(UUID knowledgeItemId, User user, String reason) {
        if (knowledgeItemId == null) {
            throw new BadRequestException("شناسه دانش نامعتبر است.");
        }
        if (reason == null || reason.isBlank()) {
            throw new BadRequestException("دلیل اعتراض الزامی است.");
        }

        KnowledgeItem item = knowledgeItemRepository.findById(knowledgeItemId)
                .orElseThrow(() -> new ResourceNotFoundException("دانش مورد نظر یافت نشد."));

        if (item.getStatus() != KnowledgeItemStatus.REJECTED) {
            throw new BadRequestException("امکان ثبت اعتراض فقط برای دانش‌های در وضعیت «رد شده» وجود دارد.");
        }

        if (appealRepository.existsByKnowledgeItemId(knowledgeItemId)) {
            throw new BadRequestException("برای هر دانش حداکثر یک نوبت امکان ثبت اعتراض وجود دارد.");
        }

        Appeal appeal = new Appeal();
        appeal.setKnowledgeItem(item);
        appeal.setUser(user != null ? user : item.getUser());
        appeal.setReason(reason.trim());
        appeal.setStatus(AppealStatus.PENDING);
        appeal.setAppealCount(1);

        item.setStatus(KnowledgeItemStatus.APPEALED);
        knowledgeItemRepository.save(item);

        Appeal savedAppeal = appealRepository.save(appeal);
        smsNotificationService.sendAppealReceivedAlert(savedAppeal);
        return savedAppeal;
    }

    @Transactional
    public Appeal reviewAppeal(UUID appealId, AppealStatus status, String adminFeedback, User reviewer) {
        Appeal appeal = appealRepository.findById(appealId)
                .orElseThrow(() -> new ResourceNotFoundException("درخواست اعتراض یافت نشد."));

        if (status == null || status == AppealStatus.PENDING) {
            throw new BadRequestException("وضعیت بررسی اعتراض نامعتبر است.");
        }

        appeal.setStatus(status);
        appeal.setAdminFeedback(adminFeedback);

        KnowledgeItem item = appeal.getKnowledgeItem();
        if (item != null) {
            if (status == AppealStatus.ACCEPTED) {
                boolean singleStage = isSingleStage(item.getKnowledgeType());
                item.setStatus(singleStage ? KnowledgeItemStatus.UNDER_SECRETARIAT_REVIEW : KnowledgeItemStatus.UNDER_COMMITTEE_REVIEW);
            } else if (status == AppealStatus.REJECTED) {
                item.setStatus(KnowledgeItemStatus.REJECTED);
            }
            knowledgeItemRepository.save(item);
        }

        return appealRepository.save(appeal);
    }
}
