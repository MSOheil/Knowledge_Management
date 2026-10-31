import { Component, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableComponent, TableConfig } from '../../../shared/components/table/table.component';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-committee-ranking',
  standalone: true,
  imports: [CommonModule, TableComponent],
  templateUrl: './committee-ranking.component.html',
  styleUrl: './committee-ranking.component.scss'
})
export class CommitteeRankingComponent {
  @ViewChild('tableRef') tableRef!: TableComponent;

  public tableConfig: TableConfig = {
    itemListURL: `${environment.apiUrl}/admin/reports/committee-table`,
    defaultSortField: 'totalEvaluated',
    defaultSortOrder: -1,
    rows: 10,
    cols: [
      { field: 'committeeName', header: 'نام کمیته تخصصی داوری' },
      { field: 'totalEvaluated', header: 'کل پرونده‌ها', type: 'score' },
      { field: 'totalApproved', header: 'تایید شده', type: 'score' },
      { field: 'totalRejected', header: 'رد شده', type: 'score' },
      { field: 'totalAppealsReceived', header: 'اعتراضات دریافتی', type: 'score' },
      { field: 'averageReviewHours', header: 'میانگین زمان بررسی (ساعت)' }
    ]
  };
}
