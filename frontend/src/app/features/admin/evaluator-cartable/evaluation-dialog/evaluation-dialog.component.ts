import { Component, Input, Output, EventEmitter, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../../environments/environment';

export interface CriterionItem {
  id: string;
  title: string;
  maxScore: number;
  weight: number;
  givenScore?: number;
}

@Component({
  selector: 'app-evaluation-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './evaluation-dialog.component.html',
  styleUrl: './evaluation-dialog.component.scss'
})
export class EvaluationDialogComponent implements OnInit {
  @Input({ required: true }) item: any;
  @Output() close = new EventEmitter<void>();
  @Output() saved = new EventEmitter<any>();

  private http = inject(HttpClient);

  public stage = signal<'SECRETARIAT_STAGE' | 'SPECIALIZED_COMMITTEE_STAGE'>('SECRETARIAT_STAGE');
  public decision = signal<'APPROVED' | 'CONDITIONAL_APPROVED' | 'REFERRED_FOR_CORRECTION' | 'REJECTED'>('APPROVED');
  public feedback = signal<string>('');
  public conditionalRequirements = signal<string>('');
  public correctionHint = signal<string>('');
  public criteria = signal<CriterionItem[]>([]);
  public isSubmitting = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    if (this.item) {
      if (this.item.stage) {
        this.stage.set(this.item.stage);
      } else if (this.item.knowledgeItem?.status === 'UNDER_COMMITTEE_REVIEW') {
        this.stage.set('SPECIALIZED_COMMITTEE_STAGE');
      }
      this.loadCriteria();
    }
  }

  public loadCriteria(): void {
    const knowledgeType = this.item.knowledgeItem?.knowledgeType || this.item.knowledgeType || 'EXPERIENCE';
    this.http.get<CriterionItem[]>(`${environment.apiUrl}/admin/evaluations/criteria/${knowledgeType}`).subscribe({
      next: (list) => {
        if (list && list.length > 0) {
          const mapped = list.map(c => ({
            ...c,
            givenScore: c.maxScore ? Math.round(c.maxScore * 0.8) : 80
          }));
          this.criteria.set(mapped);
        } else {
          this.criteria.set([
            { id: '1', title: 'اصالت و نوآوری دانش (Originality)', maxScore: 25, weight: 1.0, givenScore: 21 },
            { id: '2', title: 'اثربخشی در مدیریت شهری (Effectiveness)', maxScore: 25, weight: 1.0, givenScore: 22 },
            { id: '3', title: 'تعمیم‌پذیری و بازتولید در مناطق (Generalizability)', maxScore: 25, weight: 1.0, givenScore: 20 },
            { id: '4', title: 'کاهش هزینه و صرفه‌جویی اقتصادی (Cost Reduction)', maxScore: 25, weight: 1.0, givenScore: 22 }
          ]);
        }
      },
      error: () => {
        this.criteria.set([
          { id: '1', title: 'اصالت و نوآوری دانش (Originality)', maxScore: 25, weight: 1.0, givenScore: 21 },
          { id: '2', title: 'اثربخشی در مدیریت شهری (Effectiveness)', maxScore: 25, weight: 1.0, givenScore: 22 },
          { id: '3', title: 'تعمیم‌پذیری و بازتولید در مناطق (Generalizability)', maxScore: 25, weight: 1.0, givenScore: 20 },
          { id: '4', title: 'کاهش هزینه و صرفه‌جویی اقتصادی (Cost Reduction)', maxScore: 25, weight: 1.0, givenScore: 22 }
        ]);
      }
    });
  }

  public get calculatedScore(): number {
    let totalGiven = 0;
    let totalMax = 0;
    for (const c of this.criteria()) {
      const weight = c.weight || 1.0;
      const given = c.givenScore || 0;
      const max = c.maxScore || 100;
      totalGiven += (given * weight);
      totalMax += (max * weight);
    }
    if (totalMax === 0) return 0;
    return Math.round((totalGiven / totalMax) * 100 * 10) / 10;
  }

  public onSubmit(): void {
    this.errorMessage.set(null);
    this.isSubmitting.set(true);

    const knowledgeItemId = this.item.knowledgeItem?.id || this.item.id;

    const payload = {
      knowledgeItem: { id: knowledgeItemId },
      stage: this.stage(),
      decision: this.decision(),
      score: this.calculatedScore,
      feedback: this.feedback(),
      conditionalRequirements: this.decision() === 'CONDITIONAL_APPROVED' ? this.conditionalRequirements() : null,
      correctionHint: this.decision() === 'REFERRED_FOR_CORRECTION' ? this.correctionHint() : null,
      criterionScores: this.criteria().map(c => ({
        criterion: { id: c.id },
        givenScore: c.givenScore
      }))
    };

    this.http.post<any>(`${environment.apiUrl}/admin/evaluations/submit-decision`, payload).subscribe({
      next: (res) => {
        this.isSubmitting.set(false);
        this.saved.emit(res);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        const msg = err.error?.message || 'خطا در ثبت رأی ارزیابی';
        this.errorMessage.set(msg);
      }
    });
  }

  public onBackdropClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) {
      this.close.emit();
    }
  }
}
