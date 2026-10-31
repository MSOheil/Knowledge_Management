import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface TranscriptItem {
  id: string;
  activityType: string;
  points: number;
  description: string;
  createdAt: string;
}

export interface GamificationProfile {
  id?: string;
  totalPoints: number;
  knowledgeContributorLevel: string;
  hasBlueBadge: boolean;
  bonusAmountEligible: number;
  certificateEligible: boolean;
  user?: {
    fullName: string;
    username: string;
  };
}

@Component({
  selector: 'app-knowledge-transcript',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './knowledge-transcript.component.html',
  styleUrl: './knowledge-transcript.component.scss'
})
export class KnowledgeTranscriptComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  public profile = signal<GamificationProfile>({
    totalPoints: 18,
    knowledgeContributorLevel: 'DEVELOPER',
    hasBlueBadge: true,
    bonusAmountEligible: 9_000_000,
    certificateEligible: true,
    user: {
      fullName: 'مهندس سارا میردامادی',
      username: 'mirdamadi'
    }
  });

  public transcripts = signal<TranscriptItem[]>([]);
  public isLoading = signal<boolean>(false);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadTranscriptData();
    }
  }

  public loadTranscriptData(): void {
    this.isLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}/gamification/me`).subscribe({
      next: (res) => {
        if (res) {
          this.profile.set(res);
        }
        this.loadHistory();
      },
      error: () => {
        this.loadHistory();
      }
    });
  }

  private loadHistory(): void {
    const mockList: TranscriptItem[] = [
      {
        id: '1',
        activityType: 'KNOWLEDGE_SUBMISSION_APPROVED',
        points: 5,
        description: 'تایید نهایی تجربه «مدیریت هوشمند علائم تقاطع‌های چراغ‌دار شهری»',
        createdAt: '2026-10-25T14:30:00'
      },
      {
        id: '2',
        activityType: 'KNOWLEDGE_APPLIED',
        points: 4,
        description: 'کاربست عملیاتی تجربه در طرح ساماندهی ترافیکی میدان آزادی',
        createdAt: '2026-10-20T10:15:00'
      },
      {
        id: '3',
        activityType: 'EVALUATION_COMPLETED',
        points: 3,
        description: 'انجام ارزیابی تخصصی سند پژوهشی حمل و نقل پاک',
        createdAt: '2026-10-14T11:45:00'
      },
      {
        id: '4',
        activityType: 'KNOWLEDGE_CONSUMED',
        points: 1,
        description: 'مطالعه و ثبت هدف استفاده از کتابچه استاندارد مسیرهای دوچرخه‌سواری',
        createdAt: '2026-10-08T09:20:00'
      }
    ];

    this.transcripts.set(mockList);
    this.isLoading.set(false);
  }

  public getActivityBadgeClass(type: string): string {
    switch (type) {
      case 'KNOWLEDGE_SUBMISSION_APPROVED':
        return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800';
      case 'KNOWLEDGE_APPLIED':
        return 'bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800';
      case 'EVALUATION_COMPLETED':
        return 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800';
      default:
        return 'bg-teal-50 text-teal-700 dark:bg-teal-950 dark:text-teal-300 border border-teal-200 dark:border-teal-800';
    }
  }

  public getActivityLabel(type: string): string {
    switch (type) {
      case 'KNOWLEDGE_SUBMISSION_APPROVED': return 'ثبت دانش تایید شده';
      case 'KNOWLEDGE_APPLIED': return 'کاربست موفق دانش';
      case 'EVALUATION_COMPLETED': return 'داوری و ارزیابی سند';
      case 'KNOWLEDGE_CONSUMED': return 'بهره‌برداری و مطالعه هدفمند';
      default: return type;
    }
  }
}
