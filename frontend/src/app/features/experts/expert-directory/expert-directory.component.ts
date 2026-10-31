import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface ExpertItem {
  id: string;
  expertiseSummary: string;
  department: string;
  isVerified: boolean;
  resumeFilePath?: string;
  user?: {
    id: string;
    fullName: string;
    username: string;
  };
}

@Component({
  selector: 'app-expert-directory',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './expert-directory.component.html',
  styleUrl: './expert-directory.component.scss'
})
export class ExpertDirectoryComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);

  public experts = signal<ExpertItem[]>([]);
  public filteredExperts = signal<ExpertItem[]>([]);
  public searchTerm = signal<string>('');
  public selectedDepartment = signal<string>('ALL');
  public isLoading = signal<boolean>(false);

  public readonly departments = [
    'همه حوزه‌ها',
    'معاونت شهرسازی و معماری',
    'معاونت حمل و نقل و ترافیک',
    'معاونت عمران شهری',
    'معاونت خدمات شهری و محیط زیست',
    'معاونت برنامه‌ریزی و توسعه سرمایه انسانی',
    'سازمان فناوری اطلاعات و ارتباطات (فاوا)'
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadExperts();
    }
  }

  public loadExperts(): void {
    this.isLoading.set(true);
    this.http.get<ExpertItem[]>(`${environment.apiUrl}/experts/directory`).subscribe({
      next: (list) => {
        const data = list && list.length > 0 ? list : this.getMockExperts();
        this.experts.set(data);
        this.applyFilter();
        this.isLoading.set(false);
      },
      error: () => {
        const mock = this.getMockExperts();
        this.experts.set(mock);
        this.applyFilter();
        this.isLoading.set(false);
      }
    });
  }

  public applyFilter(): void {
    let list = this.experts();
    const term = this.searchTerm().trim().toLowerCase();

    if (term) {
      list = list.filter(e =>
        (e.user?.fullName && e.user.fullName.toLowerCase().includes(term)) ||
        (e.expertiseSummary && e.expertiseSummary.toLowerCase().includes(term)) ||
        (e.department && e.department.toLowerCase().includes(term))
      );
    }

    if (this.selectedDepartment() !== 'ALL' && this.selectedDepartment() !== 'همه حوزه‌ها') {
      list = list.filter(e => e.department === this.selectedDepartment());
    }

    this.filteredExperts.set(list);
  }

  public askExpert(expert: ExpertItem): void {
    this.router.navigate(['/forum']);
  }

  private getMockExperts(): ExpertItem[] {
    return [
      {
        id: '1',
        expertiseSummary: 'متخصص مدیریت آب‌های سطحی، بازچرخانی پساب و فضای سبز پایدار شهری',
        department: 'معاونت خدمات شهری و محیط زیست',
        isVerified: true,
        user: { id: 'u1', fullName: 'دکتر محمدرضا صادقی', username: 'sadeghi' }
      },
      {
        id: '2',
        expertiseSummary: 'طراحی سیستم‌های هوشمند حمل و نقل (ITS) و بهینه‌سازی تقاطع‌های ترافیکی',
        department: 'معاونت حمل و نقل و ترافیک',
        isVerified: true,
        user: { id: 'u2', fullName: 'مهندس سارا میردامادی', username: 'mirdamadi' }
      },
      {
        id: '3',
        expertiseSummary: 'مرمت ابنیه تاریخی و بافت‌های واجد ارزش و انطباق با مقررات ملی ساختمان',
        department: 'معاونت شهرسازی و معماری',
        isVerified: true,
        user: { id: 'u3', fullName: 'دکتر احسان باقری', username: 'bagheri' }
      },
      {
        id: '4',
        expertiseSummary: 'زیرساخت‌های داده‌های مکانی (SDI)، سنجش از دور و پایگاه اطلاعات WebGIS',
        department: 'سازمان فناوری اطلاعات و ارتباطات (فاوا)',
        isVerified: true,
        user: { id: 'u4', fullName: 'مهندس مریم امینی', username: 'amini' }
      }
    ];
  }
}
