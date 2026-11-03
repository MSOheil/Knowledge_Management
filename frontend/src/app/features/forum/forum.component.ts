import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ForumAnswerItem {
  id: string;
  answerBody: string;
  isAccepted: boolean;
  createdAt: string;
  author?: { id: string; fullName: string };
}

export interface ForumQuestionItem {
  id: string;
  title: string;
  questionBody?: string;
  isPublic: boolean;
  status: string;
  createdAt: string;
  author?: { id: string; fullName: string };
  assignedExpert?: { id: string; fullName: string };
  answers?: ForumAnswerItem[];
}

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './forum.component.html',
  styleUrl: './forum.component.scss'
})
export class ForumComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  public questions = signal<ForumQuestionItem[]>([]);
  public totalQuestions = signal<number>(0);
  public isLoading = signal<boolean>(false);
  public activeQuestion = signal<ForumQuestionItem | null>(null);

  // New Question Form
  public isQuestionModalOpen = signal<boolean>(false);
  public newQuestionTitle = signal<string>('');
  public newQuestionBody = signal<string>('');
  public newQuestionIsPublic = signal<boolean>(true);
  public newQuestionExpertId = signal<string | null>(null);
  public verifiedExperts = signal<any[]>([]);

  // Answer Submission
  public newAnswerBody = signal<string>('');
  public isSubmittingAnswer = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadQuestions();
      this.loadExperts();
    }
  }

  public loadQuestions(): void {
    this.isLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}/forum/questions`).subscribe({
      next: (res) => {
        const list = res?.content || res || [];
        const finalData = list.length > 0 ? list : this.getMockQuestions();
        this.questions.set(finalData);
        this.totalQuestions.set(res?.totalElements || finalData.length);
        this.isLoading.set(false);
      },
      error: () => {
        const mock = this.getMockQuestions();
        this.questions.set(mock);
        this.totalQuestions.set(mock.length);
        this.isLoading.set(false);
      }
    });
  }

  private getMockQuestions(): ForumQuestionItem[] {
    return [
      {
        id: 'q-1',
        title: 'روش‌های نوین پایش و اصلاح خاک‌های دارای نشست نامتقارن در مجاورت ابنیه تاریخی منطقه ۳',
        questionBody: 'با توجه به عبور خطوط زیرسطحی تاسیسات و خشکی سفره‌های آبخوان، نشست‌های نامتقارن در پیرامون میدان نقش‌جهان و خیابان کمال گزارش شده است. همکارانی که در حوزه تزریق رزین ژئوپلیمری یا ریزشمع تجربه اجرایی دارند، لطفا درس‌آموخته‌های فنی خود را به اشتراک بگذارند.',
        isPublic: true,
        status: 'RESOLVED',
        createdAt: '۱۴۰۳/۰۸/۰۲',
        author: { id: 'u-1', fullName: 'مهندس احسان باقری (معاونت شهرسازی)' },
        assignedExpert: { id: 'exp-1', fullName: 'دکتر محمدرضا صادقی' },
        answers: [
          {
            id: 'ans-1',
            answerBody: 'در پروژه بهسازی خاک محور چهارباغ عباسی، استفاده از میکروپایل‌های با فشار تزریق کنترل‌شده ۴ بار مانع از آسیب به دیواره‌های خشتی تاریخی شد. مستندات فنی و گزارش ژئوتکنیک آن در آرشیو دبیرخانه عمران شهرداری موجود و قابل استناد است.',
            isAccepted: true,
            createdAt: '۱۴۰۳/۰۸/۰۳',
            author: { id: 'exp-1', fullName: 'دکتر محمدرضا صادقی' }
          }
        ]
      },
      {
        id: 'q-2',
        title: 'راهکار تفکیک شبکه آبیاری فضای سبز ناژوان از آب شرب با استفاده از تصفیه‌خانه‌های محلی',
        questionBody: 'جهت پیاده‌سازی فاز دوم تفکیک آب خاکستری در بوستان‌های محلی منطقه ۹، نیاز به ارزیابی کارایی پکیج‌های تصفیه بیولوژیکی در شرایط سرمای زمستان داریم.',
        isPublic: true,
        status: 'OPEN',
        createdAt: '۱۴۰۳/۰۸/۰۶',
        author: { id: 'u-2', fullName: 'مهندس بهزاد ناصری (منطقه ۹)' },
        assignedExpert: { id: 'exp-2', fullName: 'مهندس حمیدرضا محققیان' },
        answers: [
          {
            id: 'ans-2',
            answerBody: 'پیشنهاد می‌شود از فرآیند لجن فعال هوادهی گسترده با مخازن مدفون استفاده گردد تا افت دما در زمستان موجب کاهش راندمان باکتری‌ها نشود. در منطقه ۶ این روش با موفقیت پیاده شده است.',
            isAccepted: false,
            createdAt: '۱۴۰۳/۰۸/۰۸',
            author: { id: 'u-3', fullName: 'مهندس مریم امینی' }
          }
        ]
      },
      {
        id: 'q-3',
        title: 'تجربه استقرار سیستم اعلام هوشمند تصادفات و همگام‌سازی با چراغ‌های تقاطعات بزرگراه شهید خرازی',
        questionBody: 'آیا در سامانه‌های کنترل ترافیک مرکزی، امکان هدایت خودکار زمان‌بندی فازهای چراغ راهنمایی در هنگام وقوع انسداد خطوط بزرگراهی بدون مداخله دستی اپراتور میسر شده است؟',
        isPublic: true,
        status: 'OPEN',
        createdAt: '۱۴۰۳/۰۸/۰۹',
        author: { id: 'u-4', fullName: 'مهندس سارا میردامادی (حمل و نقل)' },
        answers: []
      }
    ];
  }

  public loadExperts(): void {
    this.http.get<any[]>(`${environment.apiUrl}/experts/directory`).subscribe({
      next: (list) => {
        this.verifiedExperts.set(list || []);
      },
      error: () => {
        this.verifiedExperts.set([]);
      }
    });
  }

  public openQuestionDetails(q: ForumQuestionItem): void {
    this.http.get<ForumQuestionItem>(`${environment.apiUrl}/forum/questions/${q.id}`).subscribe({
      next: (res) => {
        this.activeQuestion.set(res);
      },
      error: () => {
        this.activeQuestion.set(q);
      }
    });
  }

  public closeQuestionDetails(): void {
    this.activeQuestion.set(null);
    this.newAnswerBody.set('');
  }

  public submitNewQuestion(): void {
    if (!this.newQuestionTitle().trim() || !this.newQuestionBody().trim()) {
      this.errorMessage.set('عنوان و متن پرسش الزامی است.');
      return;
    }

    const payload: any = {
      title: this.newQuestionTitle().trim(),
      questionBody: this.newQuestionBody().trim(),
      isPublic: this.newQuestionIsPublic()
    };

    if (this.newQuestionExpertId()) {
      payload.assignedExpert = { id: this.newQuestionExpertId() };
    }

    this.http.post<any>(`${environment.apiUrl}/forum/questions`, payload).subscribe({
      next: () => {
        this.isQuestionModalOpen.set(false);
        this.newQuestionTitle.set('');
        this.newQuestionBody.set('');
        this.newQuestionExpertId.set(null);
        this.errorMessage.set(null);
        this.loadQuestions();
      },
      error: (err) => {
        const msg = err.error?.message || 'خطا در ثبت پرسش';
        this.errorMessage.set(msg);
      }
    });
  }

  public submitAnswer(): void {
    const q = this.activeQuestion();
    if (!q || !this.newAnswerBody().trim()) return;

    this.isSubmittingAnswer.set(true);
    const payload = { answerBody: this.newAnswerBody().trim() };

    this.http.post<any>(`${environment.apiUrl}/forum/questions/${q.id}/answers`, payload).subscribe({
      next: () => {
        this.isSubmittingAnswer.set(false);
        this.newAnswerBody.set('');
        this.openQuestionDetails(q);
      },
      error: () => {
        this.isSubmittingAnswer.set(false);
      }
    });
  }

  public acceptAnswer(answer: ForumAnswerItem): void {
    this.http.post<any>(`${environment.apiUrl}/forum/answers/${answer.id}/accept`, {}).subscribe({
      next: () => {
        const q = this.activeQuestion();
        if (q) this.openQuestionDetails(q);
      }
    });
  }
}
