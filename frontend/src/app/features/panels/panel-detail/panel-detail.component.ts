import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface ContributionModel {
  id?: string;
  experienceTitle: string;
  experienceBody: string;
  attachmentPath?: string;
  contributor?: { fullName: string };
  submittedAt?: string;
}

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
  public contributions = signal<ContributionModel[]>([]);
  public isLoading = signal<boolean>(false);
  public isSubmitting = signal<boolean>(false);
  public successMessage = signal<string | null>(null);
  public errorMessage = signal<string | null>(null);

  // Drawer / Modal State
  public isDrawerOpen = signal<boolean>(false);

  // Audio Attachment Recorder State
  public isRecording = signal<boolean>(false);
  public recordDuration = signal<number>(0);
  public hasRecordedAudio = signal<boolean>(false);
  private recordInterval: any = null;

  // File Upload State
  public attachedFileName = signal<string | null>(null);
  public attachedFileSize = signal<string | null>(null);

  public newContribution: ContributionModel = {
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

  public openDrawer(): void {
    this.isDrawerOpen.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);
  }

  public closeDrawer(): void {
    this.isDrawerOpen.set(false);
    this.stopRecording();
  }

  public toggleAudioRecording(): void {
    if (this.isRecording()) {
      this.stopRecording();
      this.hasRecordedAudio.set(true);
    } else {
      this.isRecording.set(true);
      this.recordDuration.set(0);
      this.hasRecordedAudio.set(false);
      this.recordInterval = setInterval(() => {
        this.recordDuration.update(d => d + 1);
      }, 1000);
    }
  }

  public stopRecording(): void {
    if (this.recordInterval) {
      clearInterval(this.recordInterval);
      this.recordInterval = null;
    }
    this.isRecording.set(false);
  }

  public deleteRecordedAudio(): void {
    this.stopRecording();
    this.hasRecordedAudio.set(false);
    this.recordDuration.set(0);
  }

  public onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.attachedFileName.set(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      this.attachedFileSize.set(`${sizeMb} MB`);
      this.newContribution.attachmentPath = `/uploads/panels/${file.name}`;
    }
  }

  public removeAttachedFile(): void {
    this.attachedFileName.set(null);
    this.attachedFileSize.set(null);
    this.newContribution.attachmentPath = '';
  }

  public submitContribution(): void {
    if (!this.newContribution.experienceTitle.trim() || !this.newContribution.experienceBody.trim()) {
      this.errorMessage.set('لطفاً عنوان و شرح تجربه را تکمیل فرمایید.');
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);
    this.successMessage.set(null);

    this.http.post<any>(`${environment.apiUrl}/experience-panels/${this.panelId()}/contribute`, this.newContribution).subscribe({
      next: () => {
        this.isSubmitting.set(false);
        this.successMessage.set('تجربه ارزشمند شما با موفقیت در این پویش ثبت گردید.');
        this.newContribution = { experienceTitle: '', experienceBody: '', attachmentPath: '' };
        this.deleteRecordedAudio();
        this.removeAttachedFile();
        this.loadPanel(this.panelId());
        setTimeout(() => this.closeDrawer(), 1200);
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
