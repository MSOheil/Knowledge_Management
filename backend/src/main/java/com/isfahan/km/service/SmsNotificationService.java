package com.isfahan.km.service;

import com.isfahan.km.entity.Appeal;
import com.isfahan.km.entity.KnowledgeItem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

@Service
@Slf4j
public class SmsNotificationService {

    public void sendSubmissionAlert(KnowledgeItem item) {
        String recipient = resolveRecipientPhone(item);
        String message = String.format("شهرداری اصفهان - سامانه مدیریت دانش\nدانش «%s» با موفقیت ثبت شد و وارد فرآیند ارزیابی گردید.", item.getTitle());
        dispatchSms(recipient, message);
    }

    public void sendReferralForCorrectionAlert(KnowledgeItem item, String correctionHint) {
        String recipient = resolveRecipientPhone(item);
        String message = String.format("شهرداری اصفهان - سامانه مدیریت دانش\nدانش «%s» جهت اصلاح بازگردانده شد.\nتوضیحات: %s",
                item.getTitle(), correctionHint != null ? correctionHint : "لطفاً به کارتابل خود مراجعه فرمایید.");
        dispatchSms(recipient, message);
    }

    public void sendApprovalAlert(KnowledgeItem item) {
        String recipient = resolveRecipientPhone(item);
        String message = String.format("شهرداری اصفهان - سامانه مدیریت دانش\nتبریک! دانش «%s» به تایید نهایی رسید و در سامانه منتشر شد.", item.getTitle());
        dispatchSms(recipient, message);
    }

    public void sendConditionalApprovalAlert(KnowledgeItem item, String requirements) {
        String recipient = resolveRecipientPhone(item);
        String message = String.format("شهرداری اصفهان - سامانه مدیریت دانش\nدانش «%s» به صورت مشروط تایید شد.\nمدارک/اقدامات مورد نیاز: %s",
                item.getTitle(), requirements != null ? requirements : "مشاهده در کارتابل");
        dispatchSms(recipient, message);
    }

    public void sendRejectionAlert(KnowledgeItem item, String reason) {
        String recipient = resolveRecipientPhone(item);
        String message = String.format("شهرداری اصفهان - سامانه مدیریت دانش\nدانش «%s» رد شد.\nشما تا یک نوبت حق ثبت اعتراض در کارتابل خود را دارید.", item.getTitle());
        dispatchSms(recipient, message);
    }

    public void sendAppealReceivedAlert(Appeal appeal) {
        String recipient = appeal.getUser() != null && appeal.getUser().getUsername() != null ? appeal.getUser().getUsername() : "09130000000";
        String message = String.format("شهرداری اصفهان - سامانه مدیریت دانش\nاعتراض شما برای دانش «%s» ثبت و در دستور کار کمیته تجدید نظر قرار گرفت.",
                appeal.getKnowledgeItem() != null ? appeal.getKnowledgeItem().getTitle() : "");
        dispatchSms(recipient, message);
    }

    private String resolveRecipientPhone(KnowledgeItem item) {
        if (item.getUser() != null && item.getUser().getUsername() != null) {
            return item.getUser().getUsername();
        }
        return "09130000000";
    }

    private void dispatchSms(String phoneNumber, String message) {
        log.info("[SMS DISPATCHER] To: {} | Content:\n{}", phoneNumber, message);
        // Integrated mock gateway logger simulating delivery to telecommunication service provider
    }
}
