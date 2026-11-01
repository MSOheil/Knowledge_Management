import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/services/i18n.service';
import { SeoService } from '../../core/services/seo.service';
import { AuthService } from '../../core/services/auth.service';

export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  subtitle: string;
  trend: string;
  trendType: 'up' | 'warning' | 'info';
  comparison: string;
  icon: string;
  accentColor: string;
  bgLight: string;
}

export interface RecentActivity {
  id: string;
  type: 'create' | 'approve' | 'review' | 'karbest';
  title: string;
  category: string;
  author: string;
  department: string;
  timestamp: string;
  statusBadge: string;
  statusClass: string;
}

export interface PopularArticle {
  id: string;
  code: string;
  title: string;
  category: string;
  author: string;
  views: number;
  rating: string;
  likes: number;
  savings: string;
  tag: string;
}

export interface DepartmentMetric {
  name: string;
  count: number;
  percentage: number;
  color: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  protected i18n = inject(I18nService);
  private seo = inject(SeoService);
  private router = inject(Router);
  public auth = inject(AuthService);

  public searchQuery: string = '';
  public selectedFilter = signal<string>('all');
  public todayDateString = signal<string>('شنبه، ۱۰ آبان ۱۴۰۳');

  // 6 Core Enterprise KPI Cards
  public readonly kpis: KpiMetric[] = [
    {
      id: 'total-articles',
      title: 'کل مقالات و مستندات',
      value: '۲,۵۴۰',
      subtitle: 'تجارب ثبت شده در سامانه',
      trend: '+۱۲٫۴٪',
      trendType: 'up',
      comparison: 'نسبت به ماه گذشته',
      accentColor: '#17365D',
      bgLight: '#F3F6FA',
      icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
    },
    {
      id: 'published-docs',
      title: 'مستندات منتشر شده',
      value: '۱,۸۹۰',
      subtitle: 'مصوب شورای عالی ممیزی',
      trend: '+۸٫۱٪',
      trendType: 'up',
      comparison: 'نرخ تصویب ۷۴٪',
      accentColor: '#246B8F',
      bgLight: '#EBF8FF',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 'pending-approvals',
      title: 'در انتظار ارزیابی',
      value: '۳۴',
      subtitle: 'در کارتابل دبیرخانه‌ها',
      trend: 'اقدام فوری',
      trendType: 'warning',
      comparison: 'میانگین پاسخ: ۳٫۴ روز',
      accentColor: '#E6A23C',
      bgLight: '#FFF8E1',
      icon: 'M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 'active-users',
      title: 'کاربران و خبرگان فعال',
      value: '۳۸۰+',
      subtitle: 'پژوهشگران و ارزیابان',
      trend: '+۱۵ نفر',
      trendType: 'up',
      comparison: 'در ماه جاری',
      accentColor: '#2E8B78',
      bgLight: '#E8F5E9',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
      id: 'categories',
      title: 'دسته‌بندی‌های دانشی',
      value: '۴۸',
      subtitle: 'شاخه‌های تخصصی و فرآیندی',
      trend: '۱۰۰٪ پوشش',
      trendType: 'info',
      comparison: 'معاونت‌ها و مناطق ۱۵گانه',
      accentColor: '#344054',
      bgLight: '#EDF2F7',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      id: 'monthly-contributions',
      title: 'مشارکت‌های ماه جاری',
      value: '۱۲۶',
      subtitle: 'تجربه و درس‌آموخته جدید',
      trend: '+۲۱٪',
      trendType: 'up',
      comparison: 'نسبت به میانگین فصلی',
      accentColor: '#16A36A',
      bgLight: '#E8F5E9',
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6'
    }
  ];

  // Department contribution comparison
  public readonly departmentMetrics: DepartmentMetric[] = [
    { name: 'معاونت خدمات شهری و محیط زیست', count: 620, percentage: 32, color: '#17365D' },
    { name: 'سازمان فناوری اطلاعات و ارتباطات (فاوا)', count: 540, percentage: 28, color: '#246B8F' },
    { name: 'معاونت شهرسازی و معماری', count: 430, percentage: 22, color: '#2E8B78' },
    { name: 'معاونت حمل و نقل و ترافیک', count: 350, percentage: 18, color: '#E6A23C' }
  ];

  // Monthly Trend Chart Data
  public readonly monthlyTrend = [
    { month: 'اردیبهشت', submitted: 84, approved: 62, heightPercent: 45 },
    { month: 'خرداد', submitted: 96, approved: 75, heightPercent: 55 },
    { month: 'تیر', submitted: 110, approved: 86, heightPercent: 65 },
    { month: 'مرداد', submitted: 102, approved: 79, heightPercent: 60 },
    { month: 'شهریور', submitted: 135, approved: 104, heightPercent: 80 },
    { month: 'مهر', submitted: 154, approved: 126, heightPercent: 95 }
  ];

  // Recent Activities
  public readonly recentActivities: RecentActivity[] = [
    {
      id: 'act1',
      type: 'create',
      title: 'ثبت تجربه مدار بسته بازچرخانی پساب ثانویه تصفیه‌خانه جنوب',
      category: 'خدمات شهری',
      author: 'مهندس حسینی',
      department: 'معاونت خدمات شهری',
      timestamp: '۱۰ دقیقه پیش',
      statusBadge: 'در انتظار داوری',
      statusClass: 'bg-[#FFF8E1] text-[#E6A23C] border border-[#FFE082]'
    },
    {
      id: 'act2',
      type: 'approve',
      title: 'تصویب نهایی الگوریتم هوشمند سنجش تراکم تقاطع شهید چمران',
      category: 'فناوری اطلاعات',
      author: 'دکتر رجبی',
      department: 'سازمان فاوا',
      timestamp: '۴۵ دقیقه پیش',
      statusBadge: 'مصوب ممیزی',
      statusClass: 'bg-[#E8F5E9] text-[#16A36A] border border-[#C8E6C9]'
    },
    {
      id: 'act3',
      type: 'karbest',
      title: 'گزارش اثربخشی میدانی صدور پروانه الکترونیک در منطقه ۳',
      category: 'شهرسازی',
      author: 'مهندس ابراهیمی',
      department: 'شهرداری منطقه ۳',
      timestamp: '۲ ساعت پیش',
      statusBadge: 'کاربست موفق',
      statusClass: 'bg-[#EBF8FF] text-[#3182CE] border border-[#BEE3F8]'
    },
    {
      id: 'act4',
      type: 'review',
      title: 'ثبت نظر داوری تخصصی در پویش مهار فرونشست زمین',
      category: 'عمران و شهرسازی',
      author: 'دکتر صادقی',
      department: 'شورای عالی ممیزی',
      timestamp: 'دیروز ساعت ۱۶:۲۰',
      statusBadge: 'بررسی شده',
      statusClass: 'bg-[#EDF2F7] text-[#344054] border border-[#E4E9F0]'
    }
  ];

  // Popular / Most Viewed Knowledge Records
  public readonly popularArticles: PopularArticle[] = [
    {
      id: 'p1',
      code: 'KM-1403-ENV-014',
      title: 'مدیریت هوشمند پساب و آبیاری بهینه فضای سبز در تنش آبی اصفهان',
      category: 'خدمات شهری و محیط زیست',
      author: 'مهندس حسینی (معاونت خدمات شهری)',
      views: 1420,
      likes: 184,
      rating: '۴٫۹',
      savings: '۴٫۲ میلیارد ریال',
      tag: 'تجربه برتر سال'
    },
    {
      id: 'p2',
      code: 'KM-1403-IT-089',
      title: 'پیاده‌سازی الگوریتم هوش مصنوعی در پایش برخط تقاطع‌های ترافیکی',
      category: 'فناوری اطلاعات و حمل‌ونقل',
      author: 'دکتر رجبی (سازمان فاوا)',
      views: 1290,
      likes: 156,
      rating: '۴٫۸',
      savings: '۶٫۱ میلیارد ریال',
      tag: 'نوآوری سازمانی'
    },
    {
      id: 'p3',
      code: 'KM-1403-URB-032',
      title: 'بهینه‌سازی فرایند صدور پروانه ساختمانی از طریق سامانه سارینا',
      category: 'شهرسازی و معماری',
      author: 'مهندس ابراهیمی (منطقه ۳)',
      views: 980,
      likes: 112,
      rating: '۴٫۷',
      savings: '۳٫۵ میلیارد ریال',
      tag: 'بهبود فرآیند'
    }
  ];

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'داشبورد مدیریتی | سامانه مدیریت دانش شهرداری اصفهان',
      description: 'داشبورد جامع هوش سازمانی و مدیریت دانش شهرداری اصفهان - نظارت بر چرخه ثبت، داوری، انتشار و کاربست تجارب',
      canonicalUrl: 'https://km.isfahan.ir/'
    });

    try {
      const formatted = new Intl.DateTimeFormat('fa-IR-u-ca-persian', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }).format(new Date());
      this.todayDateString.set(formatted);
    } catch {
      // fallback preserved
    }
  }

  public executeSearch(): void {
    if (this.searchQuery && this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
    } else {
      this.router.navigate(['/search']);
    }
  }
}
