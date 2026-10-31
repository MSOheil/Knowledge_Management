import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
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
  imports: [CommonModule, FormsModule],
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
        this.questions.set(list);
        this.totalQuestions.set(res?.totalElements || list.length);
        this.isLoading.set(false);
      },
      error: () => {
        this.questions.set([]);
        this.isLoading.set(false);
      }
    });
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
