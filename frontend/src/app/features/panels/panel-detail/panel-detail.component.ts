import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-panel-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './panel-detail.component.html',
  styleUrl: './panel-detail.component.scss'
})
export class PanelDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  public panelId = signal<string>('');
  public panel = signal<any | null>(null);
  public contributions = signal<any[]>([]);
  public isLoading = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

  public newContribution = {
    experienceTitle: '',
    experienceBody: '',
    attachmentPath: ''
  };

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
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  public get isOpenForContributions(): boolean {
    const p = this.panel();
    if (!p || p.status !== 'APPROVED_OPEN') return false;
    if (!p.deadlineAt) return true;
    return new Date(p.deadlineAt).getTime() > new Date().getTime();
  }

  public submitContribution(): void {
    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http.post<any>(`${environment.apiUrl}/experience-panels/${this.panelId()}/contribute`, this.newContribution).subscribe({
      next: (created) => {
        this.isSubmitting.set(false);
        this.successMessage.set('تجربه ارزشمند شما با موفقیت در این پویش ثبت گردید.');
        this.newContribution = { experienceTitle: '', experienceBody: '', attachmentPath: '' };
        this.loadPanel(this.panelId());
      },
      error: (err) => {
        this.isSubmitting.set(false);
        this.errorMessage.set(err.error?.message || 'خطا در ثبت تجربه');
      }
    });
  }

  public approvePanel(): void {
    this.http.post<any>(`${environment.apiUrl}/experience-panels/${this.panelId()}/approve`, {}).subscribe({
      next: () => {
        this.loadPanel(this.panelId());
      }
    });
  }

  public closePanel(): void {
    this.http.post<any>(`${environment.apiUrl}/experience-panels/${this.panelId()}/close`, {}).subscribe({
      next: () => {
        this.router.navigate(['/panels', this.panelId(), 'synthesis']);
      }
    });
  }
}

