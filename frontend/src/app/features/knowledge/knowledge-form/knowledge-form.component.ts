import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { DynamicFormComponent, IForm, FieldConfig } from '../../../shared/components/dynamic-form/dynamic-form.component';
import { KnowledgeLifecycleComponent } from '../../../shared/components/knowledge-lifecycle/knowledge-lifecycle.component';
import { SeoService } from '../../../core/services/seo.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

export interface SimilarityMatch {
  id: string;
  title: string;
  knowledgeType: string;
  summary: string;
  similarityPercentage: number;
  matchReason: string;
}

@Component({
  selector: 'app-knowledge-form',
  standalone: true,
  imports: [CommonModule, RouterModule, DynamicFormComponent, KnowledgeLifecycleComponent],
  templateUrl: './knowledge-form.component.html',
  styleUrl: './knowledge-form.component.scss'
})
export class KnowledgeFormComponent implements OnInit {
  private http = inject(HttpClient);
  private seo = inject(SeoService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  public auth = inject(AuthService);

  public selectedType = signal<string>('EXPERIENCE');
  public isSubmitting = signal<boolean>(false);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);
  public similarityMatches = signal<SimilarityMatch[]>([]);
  public isCheckingSimilarity = signal<boolean>(false);

  private similarityDebounceTimer: any = null;

  public formConfig: IForm = {
    title: 'ثبت تجربه و دانش جدید در سامانه مدیریت دانش شهرداری اصفهان',
    submitButtonText: 'ارسال دانش جهت ارزیابی',
    fields: []
  };

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'ثبت دانش جدید',
      description: 'ثبت تجارب، پروژه‌ها و درس‌آموخته‌های پرسنل شهرداری اصفهان در سامانه مدیریت دانش',
      canonicalUrl: 'https://km.isfahan.ir/knowledge/submit'
    });

    this.rebuildFormFields();
  }

  public onTypeChange(type: string): void {
    this.selectedType.set(type);
    this.rebuildFormFields();
  }

  private rebuildFormFields(): void {
    const type = this.selectedType();

    const baseFields: FieldConfig[] = [
      {
        name: 'title',
        label: 'عنوان دانش یا تجربه سازمانی',
        type: 'text',
        required: true,
        placeholder: 'عنوان صریح و گویای دانش ثبت‌شده...'
      },
      {
        name: 'summary',
        label: 'خلاصه مدیریتی (چکیده اجرایی)',
        type: 'textarea',
        required: true,
        placeholder: 'خلاصه‌ای از مسئله، متدولوژی اجرا و دستاورد شاخص...'
      },
      {
        name: 'targetAudience',
        label: 'جامعه هدف و ذینفعان کلیدی در شهرداری',
        type: 'text',
        required: false,
        placeholder: 'مثال: معاونت خدمات شهری، شهرداری‌های مناطق، کارشناسان فاوا...'
      },
      {
        name: 'nodeId',
        label: 'موقعیت در درخت دانش شهرداری اصفهان',
        type: 'treeselect',
        required: true
      },
      {
        name: 'registrationDate',
        label: 'تاریخ وقوع / تدوین تجربه (شمسی)',
        type: 'datepicker',
        calendar: 'jalali',
        required: false
      },
      {
        name: 'content',
        label: 'متن کامل مستند و شرح جزئیات فنی',
        type: 'textarea',
        required: false,
        placeholder: 'شرح فرآیند، موانع اجرایی، درس‌های آموخته‌شده...'
      },
      {
        name: 'attachments',
        label: 'پیوست‌ها و مستندات تکمیلی (اسناد، تصاویر، فایل‌های صوتی و ویدیویی)',
        type: 'file',
        multiple: true
      }
    ];

    // Fetch dynamic schema custom fields for the selected knowledge type
    if (isPlatformBrowser(this.platformId)) {
      this.http.get<any>(`${environment.apiUrl}/admin/form-builder/schema/${type}`).subscribe({
        next: (schemaDef) => {
          let customFields: FieldConfig[] = [];
          if (schemaDef?.formSchemaJson) {
            try {
              customFields = JSON.parse(schemaDef.formSchemaJson);
            } catch (e) {}
          }
          this.formConfig = {
            ...this.formConfig,
            fields: [...baseFields, ...customFields]
          };
        },
        error: () => {
          this.formConfig = { ...this.formConfig, fields: baseFields };
        }
      });
    } else {
      this.formConfig = { ...this.formConfig, fields: baseFields };
    }
  }

  public onValueChange(values: any): void {
    if (values.title || values.summary) {
      if (this.similarityDebounceTimer) {
        clearTimeout(this.similarityDebounceTimer);
      }
      this.similarityDebounceTimer = setTimeout(() => {
        this.checkSimilarity(values.title, values.content, values.summary);
      }, 700);
    }
  }

  private checkSimilarity(title: string, content: string, summary: string): void {
    if (!title || title.trim().length < 3) return;

    this.isCheckingSimilarity.set(true);
    this.http.post<SimilarityMatch[]>(`${environment.apiUrl}/knowledge/check-similarity`, {
      title,
      content,
      summary
    }).subscribe({
      next: (matches) => {
        this.isCheckingSimilarity.set(false);
        this.similarityMatches.set(matches || []);
      },
      error: () => {
        this.isCheckingSimilarity.set(false);
      }
    });
  }

  public onSubmit(event: { values: any; files: File[] }): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const values = event.values;
    const itemPayload: any = {
      title: values.title,
      knowledgeType: this.selectedType(),
      summary: values.summary,
      targetAudience: values.targetAudience,
      content: values.content,
      node: values.nodeId ? { id: values.nodeId } : null
    };

    // Separate custom fields into JSON
    const customFieldsMap: Record<string, any> = {};
    for (const key of Object.keys(values)) {
      if (!['title', 'summary', 'targetAudience', 'nodeId', 'registrationDate', 'content'].includes(key)) {
        customFieldsMap[key] = values[key];
      }
    }
    itemPayload.customFieldsJson = JSON.stringify(customFieldsMap);

    if (event.files && event.files.length > 0) {
      const formData = new FormData();
      formData.append('item', new Blob([JSON.stringify(itemPayload)], { type: 'application/json' }));
      for (const file of event.files) {
        formData.append('files', file);
      }

      this.http.post<any>(`${environment.apiUrl}/knowledge/create-with-files`, formData).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.successMessage.set('دانش با موفقیت در سامانه ثبت گردید و به میز ارزیابی ارسال شد.');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'خطا در ثبت دانش');
        }
      });
    } else {
      this.http.post<any>(`${environment.apiUrl}/knowledge/create`, itemPayload).subscribe({
        next: (res) => {
          this.isSubmitting.set(false);
          this.successMessage.set('دانش با موفقیت در سامانه ثبت گردید و به میز ارزیابی ارسال شد.');
        },
        error: (err) => {
          this.isSubmitting.set(false);
          this.errorMessage.set(err.error?.message || 'خطا در ثبت دانش');
        }
      });
    }
  }
}
