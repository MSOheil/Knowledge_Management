import { Component, inject, signal, computed, OnInit, OnDestroy, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { filter, Subscription } from 'rxjs';
import { HeaderComponent } from './header/header.component';
import { SidebarComponent } from './sidebar/sidebar.component';
import { FooterComponent } from './footer/footer.component';
import { PublicNavComponent } from './public-nav/public-nav.component';
import { WorkspaceTabsComponent } from './tabs/workspace-tabs.component';
import { LayoutService } from '../core/services/layout.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, HeaderComponent, SidebarComponent, FooterComponent, PublicNavComponent, WorkspaceTabsComponent],
  templateUrl: './app-layout.component.html',
  styleUrl: './app-layout.component.scss'
})
export class AppLayoutComponent implements OnInit, OnDestroy {
  public layout = inject(LayoutService);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private sub: Subscription | null = null;

  public currentUrl = signal<string>('/');

  // Route-type detectors
  public isAuthPage = computed(() => {
    return this.currentUrl().startsWith('/auth/login');
  });

  public isPublicHomepage = computed(() => {
    const raw = this.currentUrl().split('?')[0].split('#')[0];
    return raw === '/' || raw === '';
  });

  public isShellPage = computed(() => {
    return !this.isAuthPage() && !this.isPublicHomepage();
  });

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.currentUrl.set(this.router.url);
      this.sub = this.router.events
        .pipe(filter(e => e instanceof NavigationEnd))
        .subscribe((event: any) => {
          this.currentUrl.set(event.urlAfterRedirects || event.url);
        });
    }
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
