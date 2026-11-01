import { Component, inject, signal, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/services/i18n.service';
import { ThemeService } from '../../core/services/theme.service';
import { DirectionService } from '../../core/services/direction.service';
import { AuthService } from '../../core/services/auth.service';

export interface QuickSearchItem {
  title: string;
  category: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit {
  protected i18n = inject(I18nService);
  protected theme = inject(ThemeService);
  protected direction = inject(DirectionService);
  public auth = inject(AuthService);
  private router = inject(Router);

  public mobileMenuOpen = signal<boolean>(false);
  public moreMenuOpen = signal<boolean>(false);
  public servicesMenuOpen = signal<boolean>(false);
  public notificationsOpen = signal<boolean>(false);
  public userMenuOpen = signal<boolean>(false);
  public commandPaletteOpen = signal<boolean>(false);
  public quickSearch = signal<string>('');
  public todayJalaliDate = signal<string>('شنبه، ۱۰ آبان ۱۴۰۳');

  public readonly notificationsList = [
    {
      id: 'n1',
      title: 'ارجاع ۳ تجربه جدید جهت داوری علمی',
      category: 'کارتابل ممیزی',
      time: '۱۰ دقیقه پیش',
      unread: true,
      route: '/evaluation'
    },
    {
      id: 'n2',
      title: 'آغاز پویش تخصصی مهار فرونشست زمین',
      category: 'پویش‌های راهبردی',
      time: '۲ ساعت پیش',
      unread: true,
      route: '/panels'
    },
    {
      id: 'n3',
      title: 'تصویب کاربست پروژه ساماندهی پساب منطقه ۳',
      category: 'کاربست و اثربخشی',
      time: 'دیروز',
      unread: false,
      route: '/karbest'
    }
  ];

  public readonly searchableItems: QuickSearchItem[] = [
    { title: 'ثبت تجربه و نوآوری جدید', category: 'میز خدمت', route: '/submit-knowledge', icon: 'M12 4v16m8-8H4' },
    { title: 'کارتابل داوری و ممیزی دانش', category: 'ممیزی', route: '/evaluation', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
    { title: 'درخت دانش شهرداری اصفهان', category: 'ساختار دانشی', route: '/knowledge-tree', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { title: 'پویش‌های گردآوری تجربه', category: 'پویش‌ها', route: '/panels', icon: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z' },
    { title: 'بانک خبرگان و نخبگان شهری', category: 'نخبگان', route: '/experts', icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' },
    { title: 'سامانه کاربست تجارب شهری', category: 'کاربست', route: '/karbest', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'داشبورد هوش سازمانی و تحلیل داده', category: 'تحلیل راهبردی', route: '/analytics', icon: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { title: 'کارنامه دانشی و امتیازات همکاران', category: 'تعالی فردی', route: '/transcript', icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
    { title: 'تالارهای گفتگوی خبرگی و کانون‌های تفکر', category: 'تعاملات', route: '/communities', icon: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z' }
  ];

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent): void {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
      event.preventDefault();
      this.toggleCommandPalette();
    } else if (event.key === 'Escape' && this.commandPaletteOpen()) {
      this.closeCommandPalette();
    }
  }

  ngOnInit(): void {
    try {
      const formatted = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date());
      this.todayJalaliDate.set(formatted);
    } catch {
      // fallback preserved
    }
  }

  public toggleMobileMenu(): void {
    this.mobileMenuOpen.update(v => !v);
  }

  public closeMobileMenu(): void {
    this.mobileMenuOpen.set(false);
  }

  public toggleMoreMenu(): void {
    this.moreMenuOpen.update(v => !v);
  }

  public closeMoreMenu(): void {
    this.moreMenuOpen.set(false);
  }

  public toggleServicesMenu(): void {
    this.servicesMenuOpen.update(v => !v);
  }

  public closeServicesMenu(): void {
    this.servicesMenuOpen.set(false);
  }

  public toggleNotifications(): void {
    this.notificationsOpen.update(v => !v);
    this.userMenuOpen.set(false);
  }

  public closeNotifications(): void {
    this.notificationsOpen.set(false);
  }

  public toggleUserMenu(): void {
    this.userMenuOpen.update(v => !v);
    this.notificationsOpen.set(false);
  }

  public closeUserMenu(): void {
    this.userMenuOpen.set(false);
  }

  public toggleCommandPalette(): void {
    this.commandPaletteOpen.update(v => !v);
    if (!this.commandPaletteOpen()) {
      this.quickSearch.set('');
    }
  }

  public closeCommandPalette(): void {
    this.commandPaletteOpen.set(false);
    this.quickSearch.set('');
  }

  public get filteredQuickItems(): QuickSearchItem[] {
    const q = this.quickSearch().trim().toLowerCase();
    if (!q) {
      return this.searchableItems.slice(0, 6);
    }
    return this.searchableItems.filter(item => 
      item.title.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    );
  }

  public selectQuickItem(item: QuickSearchItem): void {
    this.closeCommandPalette();
    this.router.navigate([item.route]);
  }

  public submitQuickSearch(): void {
    const q = this.quickSearch().trim();
    this.closeCommandPalette();
    if (q) {
      this.router.navigate(['/search'], { queryParams: { q } });
    } else {
      this.router.navigate(['/search']);
    }
  }
}
