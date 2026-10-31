import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface BonusExportItem {
  rowNumber: number;
  fullName: string;
  nationalCode: string;
  personnelCode: string;
  totalPoints: number;
  level: string;
  hasBlueBadge: boolean;
  suggestedBonus: number;
}

@Component({
  selector: 'app-bonus-export',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './bonus-export.component.html',
  styleUrl: './bonus-export.component.scss'
})
export class BonusExportComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  public bonusRows = signal<BonusExportItem[]>([]);
  public isLoading = signal<boolean>(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadBonusData();
    }
  }

  public loadBonusData(): void {
    this.isLoading.set(true);
    this.http.get<BonusExportItem[]>(`${environment.apiUrl}/admin/reports/export/bonuses`).subscribe({
      next: (data) => {
        this.bonusRows.set(data || []);
        this.isLoading.set(false);
      },
      error: () => {
        this.bonusRows.set([]);
        this.isLoading.set(false);
      }
    });
  }

  public exportToExcel(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const rows = this.bonusRows();
    const headers = ['ردیف', 'نام و نام خانوادگی', 'کد ملی', 'کد پرسنلی', 'مجموع امتیاز', 'سطح مشارکت', 'نشان آبی', 'پاداش پیشنهادی (ریال)'];

    let csvContent = '\uFEFF'; // UTF-8 BOM for Persian Excel support
    csvContent += headers.join(',') + '\n';

    for (const r of rows) {
      const line = [
        r.rowNumber,
        `"${r.fullName}"`,
        `"${r.nationalCode}"`,
        `"${r.personnelCode}"`,
        r.totalPoints,
        `"${r.level}"`,
        r.hasBlueBadge ? 'دارد' : 'ندارد',
        r.suggestedBonus
      ];
      csvContent += line.join(',') + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KM_Bonus_Rewards_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  public printList(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.print();
    }
  }
}
