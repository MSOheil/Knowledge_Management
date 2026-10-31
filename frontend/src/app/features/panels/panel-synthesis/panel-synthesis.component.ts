import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-panel-synthesis',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './panel-synthesis.component.html',
  styleUrl: './panel-synthesis.component.scss'
})
export class PanelSynthesisComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  public panelId = signal<string>('');
  public panel = signal<any | null>(null);
  public contributions = signal<any[]>([]);
  public synthesisText = signal<string>('');
  public isLoading = signal<boolean>(false);
  public isSynthesizing = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.panelId.set(id);
      if (isPlatformBrowser(this.platformId)) {
        this.loadPanel(id);
      }
    }
  }

  public loadPanel(id: string): void {
    this.isLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}/experience-panels/${id}`).subscribe({
      next: (data) => {
        this.panel.set(data);
        this.contributions.set(data.contributions || []);
        if (data.synthesisSummary) {
          this.synthesisText.set(data.synthesisSummary);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  public triggerAiSummarize(): void {
    this.isSynthesizing.set(true);
    this.http.get<any>(`${environment.apiUrl}/experience-panels/${this.panelId()}/preview-synthesis`).subscribe({
      next: (res) => {
        this.synthesisText.set(res?.preview || '');
        this.isSynthesizing.set(false);
      },
      error: () => {
        this.isSynthesizing.set(false);
      }
    });
  }

  public submitSynthesizedKnowledge(): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    const payload = {
      synthesisSummary: this.synthesisText()
    };

    this.http.post<any>(`${environment.apiUrl}/experience-panels/${this.panelId()}/synthesize`, payload).subscribe({
      next: (createdKnowledge) => {
        this.isSubmitting.set(false);
        this.successMessage.set('سنتز تجارب با موفقیت ثبت شد و وارد فرآیند داوری پویا گردید.');
        setTimeout(() => {
          this.router.navigate(['/panels', this.panelId()]);
        }, 2000);
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'خطا در ثبت و ارسال سنتز');
      }
    });
  }
}

