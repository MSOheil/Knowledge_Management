import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface FieldOption {
  label: string;
  value: any;
}

export interface FieldConfig {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'datepicker' | 'treeselect' | 'file';
  required?: boolean;
  options?: FieldOption[];
  placeholder?: string;
  calendar?: 'jalali' | 'gregorian';
  accept?: string;
  multiple?: boolean;
  value?: any;
}

export interface IForm {
  title?: string;
  fields: FieldConfig[];
  submitButtonText?: string;
}

@Component({
  selector: 'dynamic-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './dynamic-form.component.html',
  styleUrl: './dynamic-form.component.scss'
})
export class DynamicFormComponent implements OnInit, OnChanges {
  @Input({ required: true }) config!: IForm;
  @Output() formSubmit = new EventEmitter<{ values: any; files: File[] }>();
  @Output() valueChange = new EventEmitter<any>();

  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  public formGroup: FormGroup = this.fb.group({});
  public uploadedFiles = signal<File[]>([]);
  public treeNodes = signal<any[]>([]);
  public isTreeOpen = signal<boolean>(false);
  public selectedNodeTitle = signal<string>('انتخاب شاخه از درخت دانش...');

  ngOnInit(): void {
    this.buildForm();
    if (isPlatformBrowser(this.platformId)) {
      this.loadKnowledgeTree();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['config'] && !changes['config'].firstChange) {
      this.buildForm();
    }
  }

  private buildForm(): void {
    const group: Record<string, FormControl> = {};

    if (this.config?.fields) {
      for (const field of this.config.fields) {
        if (field.type === 'file') continue;
        const validators = field.required ? [Validators.required] : [];
        group[field.name] = new FormControl(field.value !== undefined ? field.value : '', validators);
      }
    }

    this.formGroup = new FormGroup(group);
    this.formGroup.valueChanges.subscribe(val => {
      this.valueChange.emit(val);
    });
  }

  private loadKnowledgeTree(): void {
    this.http.get<any[]>(`${environment.apiUrl}/admin/knowledge-tree/tree`).subscribe({
      next: (data) => this.treeNodes.set(data || []),
      error: () => {}
    });
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const newFiles = Array.from(input.files);
      this.uploadedFiles.update(files => [...files, ...newFiles]);
    }
  }

  public removeFile(index: number): void {
    this.uploadedFiles.update(files => files.filter((_, i) => i !== index));
  }

  public selectTreeNode(node: any, fieldName: string): void {
    this.formGroup.get(fieldName)?.setValue(node.id);
    this.selectedNodeTitle.set(node.title);
    this.isTreeOpen.set(false);
  }

  public handleSubmit(): void {
    if (this.formGroup.invalid) {
      this.formGroup.markAllAsTouched();
      return;
    }

    this.formSubmit.emit({
      values: this.formGroup.value,
      files: this.uploadedFiles()
    });
  }
}
