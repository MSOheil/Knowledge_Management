import { Component, OnInit, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { SeoService } from '../../../core/services/seo.service';
import { environment } from '../../../../environments/environment';

export interface FormBuilderField {
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder?: string;
}

@Component({
  selector: 'app-form-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './form-builder.component.html',
  styleUrl: './form-builder.component.scss'
})
export class FormBuilderComponent implements OnInit {
  private http = inject(HttpClient);
  private fb = inject(FormBuilder);
  private seo = inject(SeoService);
  private platformId = inject(PLATFORM_ID);

  public selectedType = signal<string>('EXPERIENCE');
  public formTitle = signal<string>('فرم ثبت تجربه سازمانی');
  public fields = signal<FormBuilderField[]>([]);
  public isLoading = signal<boolean>(false);
  public isSaving = signal<boolean>(false);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

  // New Field Modal
  public showAddFieldModal = signal<boolean>(false);
  public newFieldForm = this.fb.group({
    name: ['', [Validators.required, Validators.pattern('^[a-zA-Z][a-zA-Z0-9_]*$')]],
    label: ['', [Validators.required, Validators.minLength(2)]],
    type: ['text', [Validators.required]],
    required: [false],
    placeholder: ['']
  });

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'طراحی فرم‌های پویا',
      description: 'سامانه فرم‌ساز پویا و داینامیک برای مدیریت فیلدهای انواع دانش شهرداری اصفهان',
      canonicalUrl: 'https://km.isfahan.ir/admin/form-builder'
    });

    if (isPlatformBrowser(this.platformId)) {
      this.loadSchema(this.selectedType());
    }
  }

  public onTypeChange(type: string): void {
    this.selectedType.set(type);
    this.loadSchema(type);
  }

  public loadSchema(type: string): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http.get<any>(`${environment.apiUrl}/admin/form-builder/schema/${type}`).subscribe({
      next: (data) => {
        this.isLoading.set(false);
        this.formTitle.set(data?.title || 'طراحی فرم پویا');
        if (data?.formSchemaJson) {
          try {
            const parsed = JSON.parse(data.formSchemaJson);
            this.fields.set(Array.isArray(parsed) ? parsed : []);
          } catch (e) {
            this.fields.set([]);
          }
        } else {
          this.fields.set([]);
        }
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set('خطا در دریافت ساختار فرم پویا');
      }
    });
  }

  public openAddFieldModal(): void {
    this.newFieldForm.reset({
      name: '',
      label: '',
      type: 'text',
      required: false,
      placeholder: ''
    });
    this.showAddFieldModal.set(true);
  }

  public closeAddFieldModal(): void {
    this.showAddFieldModal.set(false);
  }

  public addField(): void {
    if (this.newFieldForm.invalid) {
      this.newFieldForm.markAllAsTouched();
      return;
    }

    const val = this.newFieldForm.value;
    const newField: FormBuilderField = {
      name: val.name!,
      label: val.label!,
      type: val.type || 'text',
      required: !!val.required,
      placeholder: val.placeholder || ''
    };

    this.fields.update(f => [...f, newField]);
    this.closeAddFieldModal();
  }

  public removeField(index: number): void {
    this.fields.update(f => f.filter((_, i) => i !== index));
  }

  public moveFieldUp(index: number): void {
    if (index === 0) return;
    this.fields.update(f => {
      const copy = [...f];
      const temp = copy[index];
      copy[index] = copy[index - 1];
      copy[index - 1] = temp;
      return copy;
    });
  }

  public moveFieldDown(index: number): void {
    if (index === this.fields().length - 1) return;
    this.fields.update(f => {
      const copy = [...f];
      const temp = copy[index];
      copy[index] = copy[index + 1];
      copy[index + 1] = temp;
      return copy;
    });
  }

  public saveSchema(): void {
    this.isSaving.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = {
      knowledgeType: this.selectedType(),
      title: this.formTitle(),
      formSchemaJson: JSON.stringify(this.fields()),
      isActive: true
    };

    this.http.post<any>(`${environment.apiUrl}/admin/form-builder/schema`, payload).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.successMessage.set('ساختار فرم پویا با موفقیت در پایگاه‌داده ذخیره شد.');
      },
      error: (err) => {
        this.isSaving.set(false);
        this.errorMessage.set(err.error?.message || 'خطا در ذخیره‌سازی ساختار فرم');
      }
    });
  }
}
