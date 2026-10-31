import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-appeal-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './appeal-dialog.component.html',
  styleUrl: './appeal-dialog.component.scss'
})
export class AppealDialogComponent implements OnInit {
  @Input({ required: true }) item: any;
  @Output() close = new EventEmitter<void>();
  @Output() submitted = new EventEmitter<any>();

  private http = inject(HttpClient);

  public reason = signal<string>('');
  public existingAppeal = signal<any | null>(null);
  public isLoading = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    if (this.item) {
      this.fetchExistingAppeal();
    }
  }

  public fetchExistingAppeal(): void {
    const itemId = this.item.knowledgeItem?.id || this.item.id;
    if (!itemId) return;

    this.isLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}/appeals/item/${itemId}`).subscribe({
      next: (res) => {
        this.existingAppeal.set(res);
        this.isLoading.set(false);
      },
      error: () => {
        this.existingAppeal.set(null);
        this.isLoading.set(false);
      }
    });
  }

  public onSubmit(): void {
    if (!this.reason().trim()) {
      this.errorMessage.set('لطفاً شرح مستدل اعتراض خود را وارد فرمایید.');
      return;
    }

    this.errorMessage.set(null);
    this.isSubmitting.set(true);
    const itemId = this.item.knowledgeItem?.id || this.item.id;

    const payload = {
      knowledgeItem: { id: itemId },
      reason: this.reason().trim()
    };

    this.http.post<any>(`${environment.apiUrl}/appeals/submit`, payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.existingAppeal.set(res);
        this.submitted.emit(res);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'خطا در ثبت اعتراض. لطفاً مجدداً تلاش فرمایید.';
        this.errorMessage.set(msg);
      }
    });
  }

  public onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }

  public getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800';
      default:
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
    }
  }

  public getStatusText(status: string): string {
    switch (status) {
      case 'ACCEPTED': return 'اعتراض پذیرفته شد (ارجاع مجدد به داوری)';
      case 'REJECTED': return 'اعتراض رد شد (تصمیم قطعی است)';
      default: return 'در انتظار بررسی توسط دبیرخانه / کمیته تجدید نظر';
    }
  }
}
