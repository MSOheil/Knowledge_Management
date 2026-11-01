import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export interface BreadcrumbItem {
  label: string;
  route?: string;
}

@Injectable({
  providedIn: 'root'
})
export class LayoutService {
  private platformId = inject(PLATFORM_ID);

  public sidebarCollapsed = signal<boolean>(false);
  public mobileSidebarOpen = signal<boolean>(false);
  public breadcrumbs = signal<BreadcrumbItem[]>([
    { label: 'سامانه مدیریت دانش' },
    { label: 'داشبورد مدیریتی' }
  ]);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('km_sidebar_collapsed');
      if (stored === 'true') {
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

  public setBreadcrumbs(items: BreadcrumbItem[]): void {
    this.breadcrumbs.set(items);
  }
}

