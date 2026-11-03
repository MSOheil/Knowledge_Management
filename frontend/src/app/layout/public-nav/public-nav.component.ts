import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';
import { LayoutService } from '../../core/services/layout.service';

export interface NavLinkItem {
  label: string;
  route: string;
  exact?: boolean;
}

@Component({
  selector: 'app-public-nav',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './public-nav.component.html',
  styleUrl: './public-nav.component.scss'
})
export class PublicNavComponent {
  public auth = inject(AuthService);
  public layout = inject(LayoutService);
  private router = inject(Router);

  public mobileMenuOpen = signal<boolean>(false);
  public userMenuOpen = signal<boolean>(false);
  public searchQuery = signal<string>('');

  // Clean navigation links: only public intro when guest; internal panel links when logged in
  public navLinks = computed<NavLinkItem[]>(() => {
    if (!this.auth.isLoggedIn()) {
      return [
        { label: 'معرفی سامانه', route: '/', exact: true }
      ];
    }

    const items: NavLinkItem[] = [
      { label: 'معرفی سامانه', route: '/', exact: true }
    ];

    if (this.auth.isAdmin()) {
      items.push({ label: 'پیشخوان مدیریت', route: '/admin/analytics' });
      items.push({ label: 'پایگاه دانش', route: '/search' });
      items.push({ label: 'درخت دانش', route: '/knowledge-tree' });
      items.push({ label: 'کاربران و دسترسی‌ها', route: '/admin/users' });
    } else if (this.auth.isEvaluator()) {
      items.push({ label: 'کارتابل داوری', route: '/evaluations' });
      items.push({ label: 'پایگاه دانش', route: '/search' });
    } else {
      items.push({ label: 'پویش‌های تجارب', route: '/panels' });
      items.push({ label: 'کارنامه دانشی', route: '/transcript' });
      items.push({ label: 'پایگاه دانش', route: '/search' });
    }

    return items;
  });

  public getDashboardRoute(): string {
    if (this.auth.isAdmin()) {
      return '/admin/analytics';
    }
    if (this.auth.isEvaluator()) {
      return '/evaluations';
    }
    return '/transcript';
  }

  public getDashboardLabel(): string {
    if (this.auth.isAdmin()) {
      return 'مشاهده پنل مدیریت';
    }
    if (this.auth.isEvaluator()) {
      return 'مشاهده کارتابل داوری';
    }
    return 'ورود به پیشخوان کاربری';
  }

  public toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  public closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  public toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
  }

  public closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  public onSearch(): void {
    const q = this.searchQuery().trim();
    if (q) {
      this.router.navigate(['/search'], { queryParams: { q } });
    } else {
      this.router.navigate(['/search']);
    }
  }

  public logout(): void {
    this.auth.logout();
    this.closeUserMenu();
  }
}
