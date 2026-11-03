import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableConfig } from '../../../shared/components/table/table.component';
import { EvaluationDialogComponent } from './evaluation-dialog/evaluation-dialog.component';
import { AppealDialogComponent } from '../../knowledge/appeal-dialog/appeal-dialog.component';
import { KnowledgeLifecycleComponent } from '../../../shared/components/knowledge-lifecycle/knowledge-lifecycle.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-evaluator-cartable',
  standalone: true,
  imports: [CommonModule, TableComponent, EvaluationDialogComponent, AppealDialogComponent, KnowledgeLifecycleComponent],
  templateUrl: './evaluator-cartable.component.html',
  styleUrl: './evaluator-cartable.component.scss'
})
export class EvaluatorCartableComponent {
  @ViewChild('tableRef') tableRef!: TableComponent;

  public selectedItemForEvaluation = signal<any | null>(null);
  public selectedItemForAppeal = signal<any | null>(null);

  public isEvaluationDialogOpen = signal<boolean>(false);
  public isAppealDialogOpen = signal<boolean>(false);

  public tableConfig: TableConfig = {
    itemListURL: `${environment.apiUrl}/admin/evaluations/getListTable`,
    defaultSortField: 'createdAt',
    defaultSortOrder: -1,
    rows: 10,
    cols: [
      { field: 'knowledgeItem.title', header: 'عنوان دانش' },
      { field: 'knowledgeItem.knowledgeType', header: 'قالب دانش' },
      { field: 'stage', header: 'مرحله داوری' },
      { field: 'decision', header: 'رأی داوری', type: 'badge' },
      { field: 'score', header: 'امتیاز مکتسبه', type: 'score' },
      { field: 'evaluator.fullName', header: 'ارزیاب مسئول' },
      { field: 'createdAt', header: 'تاریخ ارزیابی', type: 'date' }
    ],
    actions: [
      {
        id: 'evaluate',
        label: 'ارزیابی دانش',
        class: 'px-3 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs transition-colors'
      },
      {
        id: 'appeal',
        label: 'مشاهده اعتراض',
        class: 'px-3 py-1 text-xs font-bold rounded-lg bg-purple-600 text-white hover:bg-purple-700 shadow-2xs transition-colors',
        condition: (row: any) => row.decision === 'REJECTED' || row.knowledgeItem?.status === 'APPEALED' || row.knowledgeItem?.status === 'REJECTED'
      }
    ]
  };

  public onAction(event: { action: string; row: any }): void {
    if (event.action === 'evaluate') {
      this.selectedItemForEvaluation.set(event.row);
      this.isEvaluationDialogOpen.set(true);
    } else if (event.action === 'appeal') {
      this.selectedItemForAppeal.set(event.row);
      this.isAppealDialogOpen.set(true);
    }
  }

  public onEvaluationSaved(): void {
    this.isEvaluationDialogOpen.set(false);
    this.selectedItemForEvaluation.set(null);
    if (this.tableRef) {
      this.tableRef.reload();
    }
  }

  public onAppealSubmitted(): void {
    this.isAppealDialogOpen.set(false);
    this.selectedItemForAppeal.set(null);
    if (this.tableRef) {
      this.tableRef.reload();
    }
  }
}
