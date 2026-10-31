import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface ApprovedKnowledgeItem {
  id: string;
  title: string;
  knowledgeType: string;
}

@Component({
  selector: 'app-karbest-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './karbest-form.component.html',
  styleUrl: './karbest-form.component.scss'
})
export class KarbestFormComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  public approvedItems = signal<ApprovedKnowledgeItem[]>([]);
  public selectedParentId = signal<string>('');
  public description = signal<string>('');
  public resultsAchieved = signal<string>('');

  public isLoading = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);
  public successMessage = signal<string | null>(null);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadApprovedItems();
    }
  }

  public loadApprovedItems(): void {
    this.isLoading.set(true);
    this.http.post<any>(`${environment.apiUrl}/knowledge/flow/search`, { first: 0, rows: 50 }).subscribe({
      next: (res) => {
        const list = res?.content || res || [];
        this.approvedItems.set(list.map((item: any) => ({
          id: item.id,
          title: item.title,
          knowledgeType: item.knowledgeType
        })));
        if (this.approvedItems().length > 0) {
          this.selectedParentId.set(this.approvedItems()[0].id);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.approvedItems.set([]);
        this.isLoading.set(false);
      }
    });
  }

  public onSubmit(): void {
    if (!this.selectedParentId()) {
      this.errorMessage.set('لطفاً دانش پایه‌ای که از آن کاربست ساخته‌اید را انتخاب فرمایید.');
      return;
    }
    if (!this.description().trim()) {
      this.errorMessage.set('شرح اقدامات اجرایی و نحوه کاربست تجربه الزامی است.');
      return;
    }

    this.errorMessage.set(null);
    this.successMessage.set(null);
    this.isSubmitting.set(true);

    const payload = {
      parentKnowledgeItem: { id: this.selectedParentId() },
      description: this.description().trim(),
      resultsAchieved: this.resultsAchieved().trim()
    };

    this.http.post<any>(`${environment.apiUrl}/knowledge/application/submit`, payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.successMessage.set('گزارش کاربست دانش با موفقیت در سامانه ثبت شد و در فرآیند بررسی و اعطای امتیاز قرار گرفت.');
        this.description.set('');
        this.resultsAchieved.set('');
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'خطا در ثبت کاربست تجربه. لطفاً مجدداً تلاش فرمایید.';
        this.errorMessage.set(msg);
      }
    });
  }
}
