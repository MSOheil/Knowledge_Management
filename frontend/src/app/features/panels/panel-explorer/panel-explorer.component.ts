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
        this.panels.set(list);
        this.isLoading.set(false);
      },
      error: () => {
        this.panels.set([]);
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
}

