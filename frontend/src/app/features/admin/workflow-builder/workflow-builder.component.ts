import { Component, OnInit, signal, inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { TableComponent, TableConfig } from '../../../shared/components/table/table.component';
import { environment } from '../../../../environments/environment';

export interface WorkflowStageItem {
  id?: string;
  stageOrder: number;
  stageName: string;
  reviewerRole: string;
  slaHours: number;
  requiresScoring: boolean;
  minPassingScore: number;
}

@Component({
  selector: 'app-workflow-builder',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TableComponent],
  templateUrl: './workflow-builder.component.html',
  styleUrl: './workflow-builder.component.scss'
})
export class WorkflowBuilderComponent implements OnInit {
  @ViewChild('tableRef') tableRef!: TableComponent;
  private http = inject(HttpClient);

  public selectedWorkflow = signal<any | null>(null);
  public stages = signal<WorkflowStageItem[]>([]);
  public isStageModalOpen = signal<boolean>(false);
  public isCreateWorkflowModalOpen = signal<boolean>(false);
  public secretariats = signal<any[]>([]);

  public newWorkflow = {
    title: '',
    knowledgeType: 'EXPERIENCE',
    secretariatId: ''
  };

  public currentEditingStage = signal<WorkflowStageItem>({
    stageOrder: 1,
    stageName: '',
    reviewerRole: 'SECRETARIAT',
    slaHours: 48,
    requiresScoring: false,
    minPassingScore: 0.0
  });

  public tableConfig: TableConfig = {
    itemListURL: `${environment.apiUrl}/admin/workflows/getListTable`,
    defaultSortField: 'createdAt',
    defaultSortOrder: -1,
    rows: 10,
    cols: [
      { field: 'title', header: 'عنوان فرآیند گردش‌کار' },
      { field: 'knowledgeType', header: 'قالب دانش' },
      { field: 'secretariat.name', header: 'دبیرخانه تخصصی' },
      { field: 'stages.length', header: 'تعداد گام‌ها', type: 'score' },
      { field: 'createdAt', header: 'تاریخ تعریف', type: 'date' }
    ],
    actions: [
      {
        id: 'edit_stages',
        label: 'طراحی و مدیریت گام‌ها',
        class: 'px-3 py-1.5 text-xs font-bold rounded-lg bg-teal-600 text-white hover:bg-teal-700 shadow-xs transition-colors'
      }
    ]
  };

  ngOnInit(): void {
    this.loadSecretariats();
  }

  public loadSecretariats(): void {
    this.http.get<any[]>(`${environment.apiUrl}/admin/secretariats/getList`).subscribe({
      next: (list) => this.secretariats.set(list || []),
      error: () => this.secretariats.set([])
    });
  }

  public onAction(event: { action: string; row: any }): void {
    if (event.action === 'edit_stages') {
      this.selectWorkflow(event.row);
    }
  }

  public selectWorkflow(workflow: any): void {
    this.selectedWorkflow.set(workflow);
    this.http.get<any>(`${environment.apiUrl}/admin/workflows/${workflow.id}`).subscribe({
      next: (res) => {
        const sortedStages = (res?.stages || []).sort((a: any, b: any) => a.stageOrder - b.stageOrder);
        this.stages.set(sortedStages);
      },
      error: () => this.stages.set([])
    });
  }

  public openAddStageModal(): void {
    this.currentEditingStage.set({
      stageOrder: this.stages().length + 1,
      stageName: '',
      reviewerRole: 'SPECIALIZED_COMMITTEE',
      slaHours: 48,
      requiresScoring: true,
      minPassingScore: 70.0
    });
    this.isStageModalOpen.set(true);
  }

  public moveStage(index: number, direction: 'UP' | 'DOWN'): void {
    const list = [...this.stages()];
    const targetIndex = direction === 'UP' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= list.length) return;

    const temp = list[index];
    list[index] = list[targetIndex];
    list[targetIndex] = temp;

    // re-assign stage orders
    list.forEach((st, idx) => {
      st.stageOrder = idx + 1;
    });

    this.stages.set(list);

    // Save orders to backend
    list.forEach(st => {
      this.http.post(`${environment.apiUrl}/admin/workflows/stage/save`, {
        ...st,
        workflow: { id: this.selectedWorkflow().id }
      }).subscribe();
    });
  }

  public saveStage(): void {
    const st = this.currentEditingStage();
    const payload = {
      ...st,
      workflow: { id: this.selectedWorkflow().id }
    };

    this.http.post<any>(`${environment.apiUrl}/admin/workflows/stage/save`, payload).subscribe({
      next: () => {
        this.isStageModalOpen.set(false);
        this.selectWorkflow(this.selectedWorkflow());
        if (this.tableRef) this.tableRef.reload();
      }
    });
  }

  public deleteStage(stageId?: string): void {
    if (!stageId) return;
    if (confirm('آیا از حذف این مرحله از گردش‌کار اطمینان دارید؟')) {
      this.http.get(`${environment.apiUrl}/admin/workflows/stage/delete/${stageId}`).subscribe({
        next: () => {
          this.selectWorkflow(this.selectedWorkflow());
          if (this.tableRef) this.tableRef.reload();
        }
      });
    }
  }

  public createWorkflow(): void {
    const payload: any = {
      title: this.newWorkflow.title,
      knowledgeType: this.newWorkflow.knowledgeType || 'EXPERIENCE',
      isActive: true
    };
    if (this.newWorkflow.secretariatId) {
      payload.secretariat = { id: this.newWorkflow.secretariatId };
    }

    this.http.post<any>(`${environment.apiUrl}/admin/workflows/create`, payload).subscribe({
      next: (created) => {
        this.isCreateWorkflowModalOpen.set(false);
        this.newWorkflow.title = '';
        if (this.tableRef) this.tableRef.reload();
        this.selectWorkflow(created);
      }
    });
  }
}

