import { Component, OnInit, signal, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AccessPurposeDialogComponent, AccessPurposeType } from '../access-purpose-dialog/access-purpose-dialog.component';

export interface SearchResultItem {
  id: string;
  title: string;
  summary: string;
  content?: string;
  knowledgeType: string;
  createdAt: string;
  node?: { id: string; title: string };
  user?: { id: string; fullName: string };
}

@Component({
  selector: 'app-knowledge-search',
  standalone: true,
  imports: [CommonModule, FormsModule, AccessPurposeDialogComponent],
  templateUrl: './knowledge-search.component.html',
  styleUrl: './knowledge-search.component.scss'
})
export class KnowledgeSearchComponent implements OnInit {
  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  public keyword = signal<string>('');
  public selectedType = signal<string>('ALL');
  public results = signal<SearchResultItem[]>([]);
  public totalResults = signal<number>(0);
  public isLoading = signal<boolean>(false);

  // Purpose Interception Modal
  public isPurposeDialogOpen = signal<boolean>(false);
  public pendingItem = signal<SearchResultItem | null>(null);
  public pendingAction = signal<'READ' | 'DOWNLOAD'>('READ');
  public unlockedItemIds = signal<Set<string>>(new Set<string>());
  public activeItemDetail = signal<SearchResultItem | null>(null);

  public readonly knowledgeTypes = [
    { label: 'همه قالب‌ها', value: 'ALL' },
    { label: 'تجربه زیسته', value: 'EXPERIENCE' },
    { label: 'کتاب تخصصی', value: 'BOOK' },
    { label: 'مقاله علمی', value: 'ARTICLE' },
    { label: 'پروژه پژوهشی', value: 'RESEARCH_PROJECT' },
    { label: 'پایان‌نامه', value: 'THESIS' },
    { label: 'تجربه پیمانکاران', value: 'CONTRACTOR_EXPERIENCE' }
  ];

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.onSearch();
    }
  }

  public onSearch(): void {
    this.isLoading.set(true);

    const payload = {
      first: 0,
      rows: 20,
      sortField: 'createdAt',
      sortOrder: -1,
      globalFilter: this.keyword()
    };

    this.http.post<any>(`${environment.apiUrl}/knowledge/flow/search`, payload).subscribe({
      next: (res) => {
        if (res && res.content) {
          let list: SearchResultItem[] = res.content;
          if (this.selectedType() !== 'ALL') {
            list = list.filter(i => i.knowledgeType === this.selectedType());
          }
          this.results.set(list);
          this.totalResults.set(res.totalElements || list.length);
        } else if (Array.isArray(res)) {
          let list: SearchResultItem[] = res;
          if (this.selectedType() !== 'ALL') {
            list = list.filter(i => i.knowledgeType === this.selectedType());
          }
          this.results.set(list);
          this.totalResults.set(list.length);
        } else {
          this.results.set([]);
          this.totalResults.set(0);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.results.set([]);
        this.totalResults.set(0);
        this.isLoading.set(false);
      }
    });
  }

  public requestAccess(item: SearchResultItem, action: 'READ' | 'DOWNLOAD'): void {
    if (this.unlockedItemIds().has(item.id)) {
      // Already unlocked in current session
      this.openItem(item);
      return;
    }
    this.pendingItem.set(item);
    this.pendingAction.set(action);
    this.isPurposeDialogOpen.set(true);
  }

  public onPurposeConfirmed(event: { item: any; purpose: AccessPurposeType }): void {
    this.isPurposeDialogOpen.set(false);
    if (event.item && event.item.id) {
      this.unlockedItemIds.update(set => {
        const next = new Set(set);
        next.add(event.item.id);
        return next;
      });
      this.openItem(event.item);
    }
  }

  public openItem(item: SearchResultItem): void {
    this.activeItemDetail.set(item);
  }

  public closeItemDetail(): void {
    this.activeItemDetail.set(null);
  }

  public getBadgeLabel(type: string): string {
    const found = this.knowledgeTypes.find(t => t.value === type);
    return found ? found.label : type;
  }
}
