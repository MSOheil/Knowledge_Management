import { Component, Input, Output, EventEmitter, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export type AccessPurposeType = 'REPORT_PREPARATION' | 'LEARNING_STUDY' | 'DECISION_MEETING' | 'OTHER';

@Component({
  selector: 'app-access-purpose-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './access-purpose-dialog.component.html',
  styleUrl: './access-purpose-dialog.component.scss'
})
export class AccessPurposeDialogComponent {
  @Input({ required: true }) item: any;
  @Input() actionType: 'READ' | 'DOWNLOAD' = 'READ';
  @Output() close = new EventEmitter<void>();
  @Output() confirmed = new EventEmitter<{ item: any; purpose: AccessPurposeType }>();

  private http = inject(HttpClient);

  public selectedPurpose = signal<AccessPurposeType>('REPORT_PREPARATION');
  public customDescription = signal<string>('');
  public isSubmitting = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  public readonly purposeOptions: { value: AccessPurposeType; title: string; subtitle: string; icon: string }[] = [
    {
      value: 'REPORT_PREPARATION',
      title: 'تدوین گزارش کارشناسی',
      subtitle: 'استفاده از یافته‌های دانش در تدوین گزارش‌های فنی و مدیریتی',
      icon: '📊'
    },
    {
      value: 'LEARNING_STUDY',
      title: 'آموزش و ارتقای مهارت شخصی',
      subtitle: 'مطالعه جهت توسعه فردی و به‌کارگیری در فرآیندهای شغلی روزمره',
      icon: '🎓'
    },
    {
      value: 'DECISION_MEETING',
      title: 'استفاده در جلسات تصمیم‌گیری',
      subtitle: 'استناد در جلسات راهبردی، کمیته‌های تخصصی یا پروژه‌های مصوب',
      icon: '⚖️'
    },
    {
      value: 'OTHER',
      title: 'سایر موارد',
      subtitle: 'نیازهای پژوهشی، کاربست‌های سازمانی یا اهداف موردی',
      icon: '📝'
    }
  ];

  public onConfirm(): void {
    if (this.selectedPurpose() === 'OTHER' && !this.customDescription().trim()) {
      this.errorMessage.set('لطفاً هدف خود از مطالعه یا دانلود دانش را شرح دهید.');
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const itemId = this.item?.id || this.item?.knowledgeItem?.id;
    const payload = {
      knowledgeItem: { id: itemId },
      accessPurpose: this.selectedPurpose(),
      customPurposeDescription: this.selectedPurpose() === 'OTHER' ? this.customDescription().trim() : null
    };

    this.http.post<any>(`${environment.apiUrl}/knowledge/flow/log-access`, payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.confirmed.emit({ item: this.item, purpose: this.selectedPurpose() });
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'خطا در ثبت لاگ جریان دانش';
        this.errorMessage.set(msg);
      }
    });
  }

  public onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
