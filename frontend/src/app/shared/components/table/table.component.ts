import { Component, Input, Output, EventEmitter, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

export interface TableColumn {
  field: string;
  header: string;
  type?: 'text' | 'badge' | 'date' | 'score';
  sortable?: boolean;
}

export interface TableAction {
  id: string;
  label: string;
  icon?: string;
  class?: string;
  condition?: (row: any) => boolean;
}

export interface TableConfig {
  itemListURL: string;
  cols: TableColumn[];
  rows?: number;
  actions?: TableAction[];
  defaultSortField?: string;
  defaultSortOrder?: number;
}

@Component({
  selector: 'app-table',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent implements OnInit {
  @Input({ required: true }) config!: TableConfig;
  @Output() buttonClicked = new EventEmitter<{ action: string; row: any }>();

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  public data = signal<any[]>([]);
  public totalElements = signal<number>(0);
  public loading = signal<boolean>(false);

  public first = signal<number>(0);
  public rows = signal<number>(10);
  public sortField = signal<string>('createdAt');
  public sortOrder = signal<number>(-1);
  public globalFilter = signal<string>('');

  ngOnInit(): void {
    if (this.config.rows) {
      this.rows.set(this.config.rows);
    }
    if (this.config.defaultSortField) {
      this.sortField.set(this.config.defaultSortField);
    }
    if (this.config.defaultSortOrder !== undefined) {
      this.sortOrder.set(this.config.defaultSortOrder);
    }

    if (isPlatformBrowser(this.platformId)) {
      this.loadData();
    }
  }

  public reload(): void {
    this.first.set(0);
    this.loadData();
  }

  public loadData(): void {
    if (!this.config.itemListURL) return;

    this.loading.set(true);
    const payload = {
      first: this.first(),
      rows: this.rows(),
      sortField: this.sortField(),
      sortOrder: this.sortOrder(),
      globalFilter: this.globalFilter()
    };

    this.http.post<any>(this.config.itemListURL, payload).subscribe({
      next: (res) => {
        if (res && res.content) {
          this.data.set(res.content);
          this.totalElements.set(res.totalElements);
        } else if (Array.isArray(res)) {
          this.data.set(res);
          this.totalElements.set(res.length);
        } else {
          this.data.set([]);
          this.totalElements.set(0);
        }
        this.loading.set(false);
      },
      error: () => {
        this.data.set([]);
        this.totalElements.set(0);
        this.loading.set(false);
      }
    });
  }

  public onSort(field: string): void {
    if (this.sortField() === field) {
      this.sortOrder.set(this.sortOrder() === 1 ? -1 : 1);
    } else {
      this.sortField.set(field);
      this.sortOrder.set(1);
    }
    this.reload();
  }

  public onSearch(): void {
    this.reload();
  }

  public onPageChange(pageOffset: number): void {
    const nextFirst = this.first() + pageOffset * this.rows();
    if (nextFirst >= 0 && nextFirst < this.totalElements()) {
      this.first.set(nextFirst);
      this.loadData();
    }
  }

  public onAction(actionId: string, row: any): void {
    this.buttonClicked.emit({ action: actionId, row });
  }

  public resolveValue(obj: any, path: string): any {
    if (!obj || !path) return '';
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
  }

  public isActionVisible(action: TableAction, row: any): boolean {
    if (!action.condition) return true;
    return action.condition(row);
  }

  public getStatusClass(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800';
      case 'CONDITIONAL_APPROVED':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800';
      case 'REFERRED_FOR_CORRECTION':
        return 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300 border border-sky-300 dark:border-sky-800';
      case 'REJECTED':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 border border-rose-300 dark:border-rose-800';
      case 'APPEALED':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300 border border-purple-300 dark:border-purple-800';
      case 'UNDER_SECRETARIAT_REVIEW':
      case 'UNDER_COMMITTEE_REVIEW':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-800';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700';
    }
  }

  public getStatusLabel(status: string): string {
    switch (status) {
      case 'APPROVED': return 'تایید نهایی';
      case 'CONDITIONAL_APPROVED': return 'تایید مشروط';
      case 'REFERRED_FOR_CORRECTION': return 'نیازمند اصلاح';
      case 'REJECTED': return 'رد شده';
      case 'APPEALED': return 'در حال رسیدگی به اعتراض';
      case 'UNDER_SECRETARIAT_REVIEW': return 'در انتظار دبیرخانه';
      case 'UNDER_COMMITTEE_REVIEW': return 'در انتظار کمیته تخصصی';
      case 'SUBMITTED': return 'ثبت شده';
      case 'DRAFT': return 'پیش‌نویس';
      default: return status || 'نامشخص';
    }
  }

  public get currentPage(): number {
    return Math.floor(this.first() / this.rows()) + 1;
  }

  public get totalPages(): number {
    return Math.ceil(this.totalElements() / this.rows()) || 1;
  }
}
