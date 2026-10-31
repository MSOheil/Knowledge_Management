import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/services/i18n.service';
import { SeoService } from '../../core/services/seo.service';

export interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  tag: string;
  secretariat: string;
  honorBadge?: string;
}

export interface KmServicePortal {
  id: string;
  title: string;
  desc: string;
  badge: string;
  route: string;
  iconBg: string;
  iconColor: string;
  iconPath: string;
}

export interface ActiveCampaign {
  id: string;
  title: string;
  secretariat: string;
  daysRemaining: number;
  contributionsCount: number;
  priorityLabel: string;
  priorityClass: string;
  description: string;
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

  public searchQuery: string = '';

  public quickSearchTags: string[] = [
    'مدیریت پساب و تنش آبی',
    'هوشمندسازی تقاطع‌های ترافیکی',
    'کاهش فرونشست زمین',
    'سامانه سارینا',
    'بازآفرینی بافت تاریخی'
  ];

  public servicePortals: KmServicePortal[] = [
    {
      id: 'panels',
      title: 'پویش‌های گردآوری تجربه',
      desc: 'طوفان فکری و حل مسائل اولویت‌دار شهرداری با مشارکت همگانی پرسنل',
      badge: 'پویش‌های فعال',
      route: '/panels',
      iconBg: 'bg-teal-50 dark:bg-teal-950/70',
      iconColor: 'text-teal-700 dark:text-teal-400',
      iconPath: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
    },
    {
      id: 'tree',
      title: 'درخت دانش شهرداری',
      desc: 'ساختار نظام‌مند طبقه‌بندی دانش معاونت‌ها، سازمان‌ها و مناطق ۱۵گانه',
      badge: 'ساختار استاندارد',
      route: '/knowledge-tree',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/70',
      iconColor: 'text-emerald-700 dark:text-emerald-400',
      iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      id: 'experts',
      title: 'بانک خبرگان و نخبگان شهری',
      desc: 'فهرست نخبگان، اساتید، خبرگان تجربی و داوران علمی پروژه‌ها',
      badge: '۳۸۰+ متخصص',
      route: '/experts',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/70',
      iconColor: 'text-cyan-700 dark:text-cyan-400',
      iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
      id: 'karbest',
      title: 'کاربست و اشاعه دانش',
      desc: 'پیاده‌سازی میدانی تجارب تاییدشده و سنجش بازگشت سرمایه در شهرداری',
      badge: '۶۴۰+ پروژه اجراشده',
      route: '/karbest',
      iconBg: 'bg-amber-50 dark:bg-amber-950/70',
      iconColor: 'text-amber-700 dark:text-amber-400',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 'evaluation',
      title: 'میز داوری و ارزیابی تخصصی',
      desc: 'گردش‌کار چندمرحله‌ای ممیزی دانش توسط دبیرخانه‌ها با نمره‌دهی علمی',
      badge: 'چندمرحله‌ای داینامیک',
      route: '/evaluation',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/70',
      iconColor: 'text-indigo-700 dark:text-indigo-400',
      iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    {
      id: 'communities',
      title: 'تالارهای گفتگوی خبرگی',
      desc: 'کانون‌های تخصصی اندیشه‌ورزی، پرسش‌وپاسخ فنی و حل مسئله همکاران',
      badge: '۱۵ حوزه تخصصی',
      route: '/communities',
      iconBg: 'bg-rose-50 dark:bg-rose-950/70',
      iconColor: 'text-rose-700 dark:text-rose-400',
      iconPath: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z'
    },
    {
      id: 'analytics',
      title: 'داشبورد هوش سازمانی',
      desc: 'گزارشات راهبردی، تحلیل روند تولید دانش، نمودارهای کلان و نقشه ماتریسی',
      badge: 'تحلیل راهبردی',
      route: '/analytics',
      iconBg: 'bg-violet-50 dark:bg-violet-950/70',
      iconColor: 'text-violet-700 dark:text-violet-400',
      iconPath: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
    },
    {
      id: 'transcript',
      title: 'کارنامه دانشی و تعالی فردی',
      desc: 'سوابق مشارکت، امتیازات انگیزشی، رتبه‌بندی دانشی و دریافت جوایز پرسنلی',
      badge: 'انگیزشی و پاداش',
      route: '/transcript',
      iconBg: 'bg-teal-50 dark:bg-teal-950/70',
      iconColor: 'text-teal-700 dark:text-teal-400',
      iconPath: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    }
  ];

  public activeCampaigns: ActiveCampaign[] = [
    {
      id: 'c1',
      title: 'پویش تخصصی مدیریت پساب و آبیاری بهینه فضای سبز در تنش آبی اصفهان',
      secretariat: 'دبیرخانه تخصصی خدمات شهری و محیط زیست',
      daysRemaining: 18,
      contributionsCount: 42,
      priorityLabel: 'اولویت راهبردی شهردار',
      priorityClass: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950 dark:text-amber-200',
      description: 'گردآوری تجارب سازمانی مناطق ۱۵گانه در استفاده از پساب تصفیه‌شده، زه‌آب‌ها و فناوری‌های نوین آبیاری درختان کهنسال.'
    },
    {
      id: 'c2',
      title: 'هوشمندسازی و پایش برخط تقاطع‌های بحرانی ترافیک شهری اصفهان',
      secretariat: 'دبیرخانه تخصصی حمل و نقل و شهر هوشمند',
      daysRemaining: 24,
      contributionsCount: 31,
      priorityLabel: 'تحول دیجیتال',
      priorityClass: 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950 dark:text-teal-200',
      description: 'مستندسازی ابتکارات و الگوریتم‌های ترافیکی در کنترل هوشمند چراغ‌ها و کاهش ماندگاری در رینگ‌های ترافیکی شهر.'
    },
    {
      id: 'c3',
      title: 'بازآفرینی مشارکتی و حفاظت از بافت تاریخی پیرامون میدان نقش جهان و جلفا',
      secretariat: 'دبیرخانه تخصصی شهرسازی و معماری اسلامی-ایرانی',
      daysRemaining: 12,
      contributionsCount: 56,
      priorityLabel: 'میراث و هویت شهری',
      priorityClass: 'bg-cyan-100 text-cyan-900 border-cyan-300 dark:bg-cyan-950 dark:text-cyan-200',
      description: 'تجارب الگوهای موفق توانمندسازی محلی، ضوابط بهسازی بافت‌های واجد ارزش و گردشگری پایدار شهری.'
    }
  ];

  public featuredItems: KnowledgeItem[] = [
    {
      id: '1',
      title: 'مدیریت هوشمند پساب و آبیاری فضای سبز شهری در شرایط تنش آبی',
      category: 'خدمات شهری و محیط زیست',
      author: 'مهندس حسینی (معاونت خدمات شهری)',
      date: '۱۴۰۳/۰۸/۰۵',
      views: 452,
      likes: 68,
      tag: 'تجربه برتر',
      secretariat: 'دبیرخانه خدمات شهری',
      honorBadge: 'نشان طلایی کاربست'
    },
    {
      id: '2',
      title: 'پیاده‌سازی الگوریتم‌های هوش مصنوعی در پایش تقاطع‌های هوشمند ترافیکی اصفهان',
      category: 'فناوری اطلاعات و حمل و نقل',
      author: 'دکتر رجبی (سازمان فاوا)',
      date: '۱۴۰۳/۰۸/۰۲',
      views: 618,
      likes: 94,
      tag: 'نوآوری سازمانی',
      secretariat: 'دبیرخانه حمل و نقل و فاوا',
      honorBadge: 'درس‌آموخته منتخب'
    },
    {
      id: '3',
      title: 'بهینه‌سازی فرایند صدور پروانه ساختمانی الکترونیک از طریق سامانه سارینا',
      category: 'شهرسازی و معماری',
      author: 'مهندس ابراهیمی (منطقه ۳ شهرداری)',
      date: '۱۴۰۳/۰۷/۲۸',
      views: 390,
      likes: 52,
      tag: 'بهبود فرآیند',
      secretariat: 'دبیرخانه شهرسازی و معماری',
      honorBadge: 'مصوب کمیته علمی'
    }
  ];

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'سامانه مدیریت دانش شهرداری اصفهان',
      description: 'پرتال جامع مدیریت دانش، بانک تجارب سازمانی، پویش‌های مسئله‌محور و سرمایه فکری شهرداری اصفهان',
      canonicalUrl: 'https://km.isfahan.ir/'
    });
  }

  public executeSearch(): void {
    if (this.searchQuery && this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery.trim() } });
    } else {
      this.router.navigate(['/search']);
    }
  }

  public searchTag(tag: string): void {
    this.router.navigate(['/search'], { queryParams: { q: tag } });
  }
}
