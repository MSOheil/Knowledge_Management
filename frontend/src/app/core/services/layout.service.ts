import { Injectable, signal, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { ThemeService } from './theme.service';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

export interface WorkspaceTab {
  id: string;
  title: string;
  route: string;
  icon?: string;
  closable?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);
  private theme = inject(ThemeService);

  public sidebarCollapsed = signal<boolean>(false);
  public mobileSidebarOpen = signal<boolean>(false);
  
  public get isDarkMode() {
    return this.theme.isDarkMode;
  }

  public breadcrumbs = signal<BreadcrumbItem[]>([
    { label: 'سامانه مدیریت دانش' },
    { label: 'داشبورد مدیریتی' }
  ]);

  // Dynamic Workspace Tabs
  public tabs = signal<WorkspaceTab[]>([
    { id: 'dashboard', title: 'پیشخوان هوش سازمانی', route: '/admin/analytics', icon: 'pi pi-chart-bar', closable: false }
  ]);
  public activeTabId = signal<string>('dashboard');

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const storedSidebar = localStorage.getItem('km_sidebar_collapsed');
      if (storedSidebar === 'true') {
        this.sidebarCollapsed.set(true);
      }
    }
  }

  public toggleSidebar(): void {
    this.sidebarCollapsed.update(v => {
      const next = !v;
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('km_sidebar_collapsed', String(next));
      }
      return next;
    });
  }

  public toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update(v => !v);
  }

  public closeMobileSidebar(): void {
    this.mobileSidebarOpen.set(false);
  }

  public toggleDarkMode(): void {
    this.theme.toggleTheme();
  }

  public setBreadcrumbs(items: BreadcrumbItem[]): void {
    this.breadcrumbs.set(items);
  }

  public openTab(tab: WorkspaceTab): void {
    const current = this.tabs();
    const existing = current.find(t => t.id === tab.id || t.route === tab.route);
    if (!existing) {
      this.tabs.set([...current, tab]);
    }
    this.activeTabId.set(tab.id);
    this.router.navigateByUrl(tab.route);
  }

  public selectTab(tab: WorkspaceTab): void {
    this.activeTabId.set(tab.id);
    this.router.navigateByUrl(tab.route);
  }

  public closeTab(tabId: string, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    const current = this.tabs();
    const target = current.find(t => t.id === tabId);
    if (!target || target.closable === false) {
      return;
    }

    const filtered = current.filter(t => t.id !== tabId);
    this.tabs.set(filtered);

    if (this.activeTabId() === tabId) {
      const fallback = filtered[filtered.length - 1];
      if (fallback) {
        this.selectTab(fallback);
      }
    }
  }
}
