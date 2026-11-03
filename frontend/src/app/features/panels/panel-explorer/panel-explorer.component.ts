import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface PanelCard {
  id: string;
  title: string;
  topicDescription: string;
  status: string;
  openedAt: string;
  deadlineAt: string;
  durationDays: number;
  secretariat?: { id: string; name: string };
  creator?: { fullName: string };
}

@Component({
  selector: 'app-panel-explorer',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './panel-explorer.component.html',
  styleUrl: './panel-explorer.component.scss'
})
export class PanelExplorerComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  public panels = signal<PanelCard[]>([]);
  public secretariats = signal<any[]>([]);
  public selectedSecretariatId = signal<string>('');
  public searchKeyword = signal<string>('');
  public isLoading = signal<boolean>(false);
  public isProposeModalOpen = signal<boolean>(false);

  public proposeModel = {
    title: '',
    topicDescription: '',
    secretariatId: '',
    durationDays: 30
  };

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadSecretariats();
      this.loadPanels();
    }
  }

  public loadSecretariats(): void {
    this.http.get<any>(`${environment.apiUrl}/admin/secretariats/getList`).subscribe({
      next: (res) => {
        const list = Array.isArray(res) ? res : (Array.isArray(res?.content) ? res.content : []);
        this.secretariats.set(list);
      },
      error: () => this.secretariats.set([])
    });
  }

  public loadPanels(): void {
    this.isLoading.set(true);
    const payload = {
      first: 0,
      rows: 50,
      sortField: 'createdAt',
      sortOrder: -1
    };

    this.http.post<any>(`${environment.apiUrl}/experience-panels/getListTable`, payload).subscribe({
      next: (res) => {
        const list = Array.isArray(res?.content) ? res.content : (Array.isArray(res) ? res : []);
        this.panels.set(list.length > 0 ? list : this.getMockPanels());
        this.isLoading.set(false);
      },
      error: () => {
        this.panels.set(this.getMockPanels());
        this.isLoading.set(false);
      }
    });
  }

  public get filteredPanels(): PanelCard[] {
    const list = Array.isArray(this.panels()) ? this.panels() : [];
    const term = this.searchKeyword().trim().toLowerCase();
    const secId = this.selectedSecretariatId();

    return list.filter(p => {
      const matchKeyword = !term || (p.title && p.title.toLowerCase().includes(term)) || (p.topicDescription && p.topicDescription.toLowerCase().includes(term));
      const matchSec = !secId || (p.secretariat && p.secretariat.id === secId);
      return matchKeyword && matchSec;
    });
  }

  public getRemainingTime(deadlineStr?: string): { days: number; hours: number; isExpired: boolean } {
    if (!deadlineStr) return { days: 0, hours: 0, isExpired: true };
    const now = new Date().getTime();
    const deadline = new Date(deadlineStr).getTime();
    const diff = deadline - now;

    if (diff <= 0) return { days: 0, hours: 0, isExpired: true };

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours, isExpired: false };
  }

  public submitPropose(): void {
    const payload: any = {
      title: this.proposeModel.title,
      topicDescription: this.proposeModel.topicDescription,
      durationDays: this.proposeModel.durationDays
    };
    if (this.proposeModel.secretariatId) {
      payload.secretariat = { id: this.proposeModel.secretariatId };
    }

    this.http.post<any>(`${environment.apiUrl}/experience-panels/propose`, payload).subscribe({
      next: () => {
        this.isProposeModalOpen.set(false);
        this.proposeModel = { title: '', topicDescription: '', secretariatId: '', durationDays: 30 };
        this.loadPanels();
      }
    });
  }

  private getMockPanels(): PanelCard[] {
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 14);
    const futureDate2 = new Date();
    futureDate2.setDate(futureDate2.getDate() + 6);

    return [
      {
        id: 'p-1',
        title: 'پویش بهینه‌سازی مصرف آب و بازچرخانی پساب در پهنه‌های فضای سبز ناژوان و صفه',
        topicDescription: 'شناسایی و ثبت تجارب موفق کارشناسان فضای سبز مناطق در تفکیک شبکه آب شرب از آب خام، خطوط انتقال پساب تصفیه‌شده و اصلاح الگوی کاشت متناسب با اقلیم خشک اصفهان.',
        status: 'APPROVED_OPEN',
        openedAt: '۱۴۰۳/۰۸/۰۱',
        deadlineAt: futureDate1.toISOString(),
        durationDays: 20,
        secretariat: { id: 'sec-1', name: 'دبیرخانه خدمات شهری و محیط زیست' },
        creator: { fullName: 'مهندس محمدرضا صادقی' }
      },
      {
        id: 'p-2',
        title: 'پویش تجمیع خدمات درگاه جامع شهروندی و تسریع استعلامات غیرحضوری (اصفهان من)',
        topicDescription: 'گردآوری تجارب توسعه‌دهندگان، تحلیلگران سامانه‌ها و کارشناسان فناوری مناطق در راستای کاهش مراجعات حضوری و ارتقای رضایت عمومی شهروندان.',
        status: 'APPROVED_OPEN',
        openedAt: '۱۴۰۳/۰۸/۰۵',
        deadlineAt: futureDate2.toISOString(),
        durationDays: 14,
        secretariat: { id: 'sec-2', name: 'دبیرخانه فاوا و هوشمندسازی شهری' },
        creator: { fullName: 'دکتر علیرضا کاظمی' }
      },
      {
        id: 'p-3',
        title: 'پویش راهکارهای ترافیکی ساماندهی رینگ دوم و پل‌های تاریخی در ساعات اوج بار',
        topicDescription: 'مستندسازی مشاهدات میدانی و ایده‌های کاربردی پلیس راهور و کارشناسان حوزه حمل و نقل جهت کاهش تاخیر چراغ‌های فرمان‌دهی و هدایت ناوگان حمل و نقل عمومی.',
        status: 'CLOSED_SYNTHESIZING',
        openedAt: '۱۴۰۳/۰۷/۱۰',
        deadlineAt: new Date().toISOString(),
        durationDays: 30,
        secretariat: { id: 'sec-3', name: 'دبیرخانه حمل و نقل و ترافیک' },
        creator: { fullName: 'مهندس سارا میردامادی' }
      }
    ];
  }
}

