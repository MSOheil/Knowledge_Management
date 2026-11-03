import { Component, OnInit, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TableComponent, TableConfig } from '../../../shared/components/table/table.component';
import { environment } from '../../../../environments/environment';

export interface SecretariatModel {
  id?: string;
  name: string;
  code: string;
  description: string;
  isActive: boolean;
}

@Component({
  selector: 'app-secretariat-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TableComponent],
  templateUrl: './secretariat-list.component.html',
  styleUrl: './secretariat-list.component.scss'
})
export class SecretariatListComponent implements OnInit {
  @ViewChild('tableRef') tableRef!: TableComponent;
  private http = inject(HttpClient);

  public isModalOpen = signal<boolean>(false);
  public isEditing = signal<boolean>(false);
  public currentItem = signal<SecretariatModel>({
    name: '',
    code: '',
    description: '',
    isActive: true
  });

  public tableConfig: TableConfig = {
    itemListURL: `${environment.apiUrl}/admin/secretariats/getListTable`,
    defaultSortField: 'createdAt',
    defaultSortOrder: -1,
    rows: 10,
    cols: [
      { field: 'name', header: 'نام دبیرخانه سازمانی' },
      { field: 'code', header: 'شناسه / کد یکتا' },
      { field: 'description', header: 'شرح حوزه تخصصی' },
      { field: 'isActive', header: 'وضعیت فعالیت', type: 'badge' },
      { field: 'createdAt', header: 'تاریخ ایجاد', type: 'date' }
    ],
    actions: [
      {
        id: 'edit',
        label: 'ویرایش',
        class: 'px-3 py-1.5 text-xs font-bold rounded-lg bg-slate-800 text-white hover:bg-slate-700 shadow-xs transition-colors'
      }
    ]
  };

  ngOnInit(): void {}

  public onAction(event: { action: string; row: any }): void {
    if (event.action === 'edit') {
      this.currentItem.set({ ...event.row });
      this.isEditing.set(true);
      this.isModalOpen.set(true);
    }
  }

  public openCreateModal(): void {
    this.currentItem.set({
      name: '',
      code: '',
      description: '',
      isActive: true
    });
    this.isEditing.set(false);
    this.isModalOpen.set(true);
  }

  public saveSecretariat(): void {
    this.http.post<any>(`${environment.apiUrl}/admin/secretariats/save`, this.currentItem()).subscribe({
      next: () => {
        this.isModalOpen.set(false);
        if (this.tableRef) this.tableRef.reload();
      }
    });
  }
}

