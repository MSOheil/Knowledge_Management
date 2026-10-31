package com.isfahan.km.service;

import com.example.base.exception.BadRequestException;
import com.example.base.exception.ResourceNotFoundException;
import com.example.base.exception.UnauthorizedException;
import com.isfahan.km.entity.*;
import com.isfahan.km.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ExperiencePanelService {

    private final ExperiencePanelRepository panelRepository;
    private final ExperiencePanelContributionRepository contributionRepository;
    private final SecretariatRepository secretariatRepository;
    private final KnowledgeNodeRepository nodeRepository;
    private final DynamicWorkflowEngineService workflowEngineService;
    private final SmsNotificationService smsNotificationService;

    @Transactional
    public ExperiencePanel proposePanel(ExperiencePanel panel, User user) {
        if (panel.getTitle() == null || panel.getTitle().isBlank()) {
            throw new BadRequestException("عنوان پویش تجربه الزامی است.");
        }
        if (panel.getTopicDescription() == null || panel.getTopicDescription().isBlank()) {
            throw new BadRequestException("شرح موضوع پویش الزامی است.");
        }

        int duration = (panel.getDurationDays() != null && panel.getDurationDays() > 0)
                ? Math.min(panel.getDurationDays(), 30)
                : 30;
        panel.setDurationDays(duration);

        if (panel.getSecretariat() != null && panel.getSecretariat().getId() != null) {
            Secretariat sec = secretariatRepository.findById(panel.getSecretariat().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("دبیرخانه مورد نظر یافت نشد."));
            panel.setSecretariat(sec);
        }

        panel.setCreator(user);
        panel.setStatus("PENDING_APPROVAL");
        return panelRepository.save(panel);
    }

    @Transactional
    public ExperiencePanel approvePanel(UUID panelId, User secretariatReviewer) {
        ExperiencePanel panel = panelRepository.findById(panelId)
                .orElseThrow(() -> new ResourceNotFoundException("پویش مورد نظر یافت نشد."));

        if (!"PENDING_APPROVAL".equalsIgnoreCase(panel.getStatus())) {
            throw new BadRequestException("فقط پویش‌های در انتظار تایید، قابلیت تایید و گشایش دارند.");
        }

        LocalDateTime now = LocalDateTime.now();
        panel.setStatus("APPROVED_OPEN");
        panel.setOpenedAt(now);
        panel.setDeadlineAt(now.plusDays(panel.getDurationDays()));

        ExperiencePanel saved = panelRepository.save(panel);
        smsNotificationService.broadcastPanelOpen(saved);
        return saved;
    }

    @Transactional
    public ExperiencePanel rejectPanel(UUID panelId, String reason, User reviewer) {
        ExperiencePanel panel = panelRepository.findById(panelId)
                .orElseThrow(() -> new ResourceNotFoundException("پویش مورد نظر یافت نشد."));

        panel.setStatus("REJECTED");
        return panelRepository.save(panel);
    }

    @Transactional
    public ExperiencePanelContribution contributeExperience(UUID panelId, ExperiencePanelContribution contribution, User contributor) {
        ExperiencePanel panel = panelRepository.findById(panelId)
                .orElseThrow(() -> new ResourceNotFoundException("پویش مورد نظر یافت نشد."));

        if (!"APPROVED_OPEN".equalsIgnoreCase(panel.getStatus())) {
            throw new BadRequestException("این پویش در وضعیت باز و فعال قرار ندارد.");
        }

        if (panel.getDeadlineAt() != null && panel.getDeadlineAt().isBefore(LocalDateTime.now())) {
            panel.setStatus("CLOSED_SYNTHESIZING");
            panelRepository.save(panel);
            throw new BadRequestException("مهلت زمانی این پویش به اتمام رسیده است.");
        }

        if (contribution.getExperienceTitle() == null || contribution.getExperienceTitle().isBlank()) {
            throw new BadRequestException("عنوان تجربه الزامی است.");
        }
        if (contribution.getExperienceBody() == null || contribution.getExperienceBody().isBlank()) {
            throw new BadRequestException("متن شرح تجربه الزامی است.");
        }

        contribution.setPanel(panel);
        contribution.setContributor(contributor);
        contribution.setSubmittedAt(LocalDateTime.now());

        return contributionRepository.save(contribution);
    }

    @Transactional
    public ExperiencePanel closePanelForSynthesis(UUID panelId, User user) {
        ExperiencePanel panel = panelRepository.findById(panelId)
                .orElseThrow(() -> new ResourceNotFoundException("پویش مورد نظر یافت نشد."));

        panel.setStatus("CLOSED_SYNTHESIZING");
        return panelRepository.save(panel);
    }

    @Transactional(readOnly = true)
    public String generateAiSynthesisPreview(UUID panelId) {
        ExperiencePanel panel = panelRepository.findById(panelId)
                .orElseThrow(() -> new ResourceNotFoundException("پویش مورد نظر یافت نشد."));

        List<ExperiencePanelContribution> list = contributionRepository.findByPanelIdOrderBySubmittedAtAsc(panelId);
        if (list.isEmpty()) {
            return "هنوز هیچ تجربه‌ای در این پویش به ثبت نرسیده است.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append(String.format("گزارش تجمیعی و سنتز هوشمند تجارب پویش: «%s»\n", panel.getTitle()));
        sb.append(String.format("تعداد مشارکت‌های ثبت‌شده: %d مورد\n\n", list.size()));
        sb.append("--- یافته‌ها و محورهای کلیدی تجارب واصله ---\n");

        int index = 1;
        for (ExperiencePanelContribution c : list) {
            String author = c.getContributor() != null ? c.getContributor().getFullName() : "همکار ناشناس";
            sb.append(String.format("%d. %s (ارائه‌دهنده: %s):\n   %s\n\n",
                    index++, c.getExperienceTitle(), author, c.getExperienceBody()));
        }

        sb.append("--- جمع‌بندی سیاستی و توصیه‌های اجرایی برای شهرداری اصفهان ---\n");
        sb.append("۱. تدوین چک‌لیست فرآیندی استاندارد بر مبنای درس‌آموخته‌های پرسنل صف و ستاد.\n");
        sb.append("۲. اصلاح دستورالعمل‌های بهره‌برداری و اتصال خروجی‌های پویش به برنامه‌ریزی شهری.");

        return sb.toString();
    }

    @Transactional
    public KnowledgeItem synthesizeAndSubmitToWorkflow(UUID panelId, String synthesisSummary, UUID nodeId, User user) {
        ExperiencePanel panel = panelRepository.findById(panelId)
                .orElseThrow(() -> new ResourceNotFoundException("پویش مورد نظر یافت نشد."));

        if (synthesisSummary == null || synthesisSummary.isBlank()) {
            throw new BadRequestException("متن سنتز و جمع‌بندی تجارب الزامی است.");
        }

        panel.setSynthesisSummary(synthesisSummary);
        panel.setStatus("SUBMITTED_FOR_EVALUATION");
        panelRepository.save(panel);

        // Create synthesized KnowledgeItem
        KnowledgeItem item = new KnowledgeItem();
        item.setTitle("سنتز تجارب پویش: " + panel.getTitle());
        item.setSummary("خلاصه و تجمیع تجارب حاصل از پویش سازمانی در حوزه " + (panel.getSecretariat() != null ? panel.getSecretariat().getName() : "مدیریت شهری"));
        item.setContent(synthesisSummary);
        item.setKnowledgeType(KnowledgeNodeType.EXPERIENCE);
        item.setUser(panel.getCreator() != null ? panel.getCreator() : user);
        item.setPanel(panel);

        if (nodeId != null) {
            nodeRepository.findById(nodeId).ifPresent(item::setNode);
        }
        if (item.getNode() == null) {
            KnowledgeNode defaultNode = nodeRepository.findAll().stream().findFirst().orElseGet(() -> {
                KnowledgeNode root = new KnowledgeNode();
                root.setTitle("درخت دانش شهرداری اصفهان");
                root.setCode("KM-ROOT");
                root.setNodeOrder(1);
                root.setIsActive(true);
                return nodeRepository.save(root);
            });
            item.setNode(defaultNode);
        }

        UUID secId = panel.getSecretariat() != null ? panel.getSecretariat().getId() : null;
        return workflowEngineService.initiateWorkflow(item, secId);
    }
}

