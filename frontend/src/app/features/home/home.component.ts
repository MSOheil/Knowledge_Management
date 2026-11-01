import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/services/i18n.service';
import { SeoService } from '../../core/services/seo.service';

export interface KnowledgeItem {
  id: string;
  code: string;
  title: string;
  category: string;
  author: string;
  role: string;
  date: string;
  views: number;
  likes: number;
  score: string;
  savings: string;
  tag: string;
  secretariat: string;
  honorBadge: string;
  summary: string;
}

export interface KmServicePortal {
  id: string;
  serviceCode: string;
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
  targetCount: number;
  priorityLabel: string;
  priorityClass: string;
  description: string;
}

export interface MunicipalExpert {
  id: string;
  fullName: string;
  role: string;
  department: string;
  approvedCount: number;
  points: number;
  avatarText: string;
  badge: string;
  specialty: string;
}

export interface OfficialBulletin {
  id: string;
  directiveNumber: string;
  title: string;
  date: string;
  sender: string;
  urgent: boolean;
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
  public selectedCategory = signal<string>('all');

  public readonly searchCategories = [
    { id: 'all', label: 'همه حوزه‌ها' },
    { id: 'services', label: 'خدمات شهری و محیط زیست' },
    { id: 'civil', label: 'فنی و عمرانی' },
    { id: 'it', label: 'فناوری اطلاعات و شهر هوشمند' },
    { id: 'urban', label: 'شهرسازی و معماری اسلامی-ایرانی' }
  ];

  public quickSearchTags: string[] = [
    'مدیریت پساب و تنش آبی',
    'هوشمندسازی تقاطع‌های ترافیکی',
    'کاهش فرونشست زمین',
    'سامانه شهرسازی سارینا',
    'بازآفرینی بافت تاریخی'
  ];

  public servicePortals: KmServicePortal[] = [
    {
      id: 'submit',
      serviceCode: 'خدمت ۱۰۱',
      title: 'ثبت تجربه و نوآوری جدید',
      desc: 'تدوین نظام‌مند تجارب موفق و پروژه‌ها بر اساس مدل استاندارد APQC و ISO 30401',
      badge: 'فرم استاندارد',
      route: '/submit-knowledge',
      iconBg: 'bg-teal-50 dark:bg-teal-950/70',
      iconColor: 'text-teal-700 dark:text-teal-400',
      iconPath: 'M12 4v16m8-8H4'
    },
    {
      id: 'evaluation',
      serviceCode: 'خدمت ۱۰۲',
      title: 'کارتابل داوری و ممیزی تخصصی',
      desc: 'گردش‌کار ارزیابی دومرحله‌ای، بررسی انطباق علمی، ممیزی و امتیازدهی داوران',
      badge: 'ممیزی دومرحله‌ای',
      route: '/evaluation',
      iconBg: 'bg-indigo-50 dark:bg-indigo-950/70',
      iconColor: 'text-indigo-700 dark:text-indigo-400',
      iconPath: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
    },
    {
      id: 'tree',
      serviceCode: 'خدمت ۱۰۳',
      title: 'درخت دانش شهرداری اصفهان',
      desc: 'سلسله‌مراتب طبقه‌بندی تخصصی حوزه‌های مأموریتی، معاونت‌ها و مناطق ۱۵گانه',
      badge: 'ساختار استاندارد',
      route: '/knowledge-tree',
      iconBg: 'bg-emerald-50 dark:bg-emerald-950/70',
      iconColor: 'text-emerald-700 dark:text-emerald-400',
      iconPath: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10'
    },
    {
      id: 'karbest',
      serviceCode: 'خدمت ۱۰۴',
      title: 'سامانه کاربست و اثربخشی دانش',
      desc: 'پیاده‌سازی میدانی تجارب تاییدشده در مناطق شهری و سنجش بازگشت سرمایه (ROI)',
      badge: '۶۴۰+ پروژه مستقر',
      route: '/karbest',
      iconBg: 'bg-amber-50 dark:bg-amber-950/70',
      iconColor: 'text-amber-700 dark:text-amber-400',
      iconPath: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 'experts',
      serviceCode: 'خدمت ۱۰۵',
      title: 'بانک خبرگان و نخبگان شهری',
      desc: 'فهرست نخبگان دانشگاهی، اساتید، داوران رسمی ممیزی و پژوهشگران شهرداری',
      badge: '۳۸۰+ متخصص تاییدشده',
      route: '/experts',
      iconBg: 'bg-cyan-50 dark:bg-cyan-950/70',
      iconColor: 'text-cyan-700 dark:text-cyan-400',
      iconPath: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z'
    },
    {
      id: 'panels',
      serviceCode: 'خدمت ۱۰۶',
      title: 'پویش‌های حل مسائل راهبردی',
      desc: 'طوفان فکری، گردآوری تجارب حل بحران و پاسخ به چالش‌های اولویت‌دار شهردار',
      badge: 'پویش‌های فعال',
      route: '/panels',
      iconBg: 'bg-teal-50 dark:bg-teal-950/70',
      iconColor: 'text-teal-700 dark:text-teal-400',
      iconPath: 'M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z'
    },
    {
      id: 'communities',
      serviceCode: 'خدمت ۱۰۷',
      title: 'تالارهای اندیشه‌ورزی و خبرگی',
      desc: 'کانون‌های تخصصی حل مسئله فنی، مباحثه کارشناسی و تبادل دانش پرسنلی',
      badge: '۱۵ حوزه تخصصی',
      route: '/communities',
      iconBg: 'bg-rose-50 dark:bg-rose-950/70',
      iconColor: 'text-rose-700 dark:text-rose-400',
      iconPath: 'M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z'
    },
    {
      id: 'analytics',
      serviceCode: 'خدمت ۱۰۸',
      title: 'داشبورد هوش سازمانی و تحلیل داده',
      desc: 'گزارش‌های راهبردی شهردار، ماتریس شکاف دانش، رتبه‌بندی مناطق و تحلیل روندها',
      badge: 'تحلیل راهبردی کلان',
      route: '/analytics',
      iconBg: 'bg-violet-50 dark:bg-violet-950/70',
      iconColor: 'text-violet-700 dark:text-violet-400',
      iconPath: 'M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z'
    }
  ];

  public activeCampaigns: ActiveCampaign[] = [
    {
      id: 'c1',
      title: 'پویش تخصصی مدیریت پساب و آبیاری بهینه فضای سبز در تنش آبی اصفهان',
      secretariat: 'دبیرخانه تخصصی خدمات شهری و محیط زیست',
      daysRemaining: 18,
      contributionsCount: 42,
      targetCount: 50,
      priorityLabel: 'اولویت بحرانی شهردار',
      priorityClass: 'bg-rose-50 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-900',
      description: 'گردآوری تجارب سازمانی مناطق ۱۵گانه در استفاده از پساب تصفیه‌شده، زه‌آب‌ها و فناوری‌های نوین آبیاری درختان کهنسال حاشیه زاینده‌رود.'
    },
    {
      id: 'c2',
      title: 'هوشمندسازی و پایش برخط تقاطع‌های بحرانی ترافیک شهری اصفهان',
      secretariat: 'دبیرخانه تخصصی حمل و نقل و شهر هوشمند',
      daysRemaining: 24,
      contributionsCount: 31,
      targetCount: 40,
      priorityLabel: 'تحول دیجیتال',
      priorityClass: 'bg-teal-50 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-900',
      description: 'مستندسازی ابتکارات و الگوریتم‌های ترافیکی در کنترل هوشمند چراغ‌ها و کاهش ماندگاری در رینگ‌های ترافیکی شهر.'
    },
    {
      id: 'c3',
      title: 'بازآفرینی مشارکتی و حفاظت از بافت تاریخی پیرامون میدان نقش جهان و جلفا',
      secretariat: 'دبیرخانه تخصصی شهرسازی و معماری اسلامی-ایرانی',
      daysRemaining: 12,
      contributionsCount: 56,
      targetCount: 60,
      priorityLabel: 'میراث و هویت شهری',
      priorityClass: 'bg-amber-50 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-900',
      description: 'تجارب الگوهای موفق توانمندسازی محلی، ضوابط بهسازی بافت‌های واجد ارزش و گردشگری پایدار شهری.'
    }
  ];

  public featuredItems: KnowledgeItem[] = [
    {
      id: '1',
      code: 'KM-1403-ENV-014',
      title: 'مدیریت هوشمند پساب و آبیاری فضای سبز شهری در شرایط تنش آبی',
      category: 'خدمات شهری و محیط زیست',
      author: 'مهندس حسینی',
      role: 'معاونت خدمات شهری شهرداری اصفهان',
      date: '۱۴۰۳/۰۸/۰۵',
      views: 452,
      likes: 68,
      score: '۹۶ / ۱۰۰',
      savings: '۴٫۲ میلیارد ریال',
      tag: 'تجربه برتر سال',
      secretariat: 'دبیرخانه خدمات شهری و محیط زیست',
      honorBadge: 'نشان طلایی کاربست',
      summary: 'طراحی مدار بسته بازچرخانی پساب ثانویه تصفیه‌خانه جنوب و اجرای خط انتقال فشارقوی با حذف ۶۰٪ تبخیر سطحی در بوستان‌های ناژوان و صفه.'
    },
    {
      id: '2',
      code: 'KM-1403-IT-089',
      title: 'پیاده‌سازی الگوریتم‌های هوش مصنوعی در پایش تقاطع‌های هوشمند ترافیکی اصفهان',
      category: 'فناوری اطلاعات و حمل و نقل',
      author: 'دکتر رجبی',
      role: 'سازمان فناوری اطلاعات و ارتباطات (فاوا)',
      date: '۱۴۰۳/۰۸/۰۲',
      views: 618,
      likes: 94,
      score: '۹۴ / ۱۰۰',
      savings: '۶٫۱ میلیارد ریال',
      tag: 'نوآوری سازمانی',
      secretariat: 'دبیرخانه حمل و نقل و فاوا',
      honorBadge: 'درس‌آموخته منتخب',
      summary: 'به‌کارگیری بینایی ماشین و سنجش تراکم لحظه‌ای خودروها در کنترل پویای زمان‌بندی تقاطع‌های شهید چمران و بزرگراه شهید ردانی‌پور.'
    },
    {
      id: '3',
      code: 'KM-1403-URB-032',
      title: 'بهینه‌سازی فرایند صدور پروانه ساختمانی الکترونیک از طریق سامانه سارینا',
      category: 'شهرسازی و معماری',
      author: 'مهندس ابراهیمی',
      role: 'شهرداری منطقه ۳ اصفهان',
      date: '۱۴۰۳/۰۷/۲۸',
      views: 390,
      likes: 52,
      score: '۹۱ / ۱۰۰',
      savings: '۳٫۵ میلیارد ریال',
      tag: 'بهبود فرآیند',
      secretariat: 'دبیرخانه شهرسازی و معماری',
      honorBadge: 'مصوب شورای ممیزی',
      summary: 'حذف مراجعات حضوری مهندسان ناظر از طریق اتصال برخط سامانه نظام مهندسی با شهرداری و تقلیل زمان پاسخ استعلامات به زیر ۴۸ ساعت.'
    }
  ];

  public topExperts: MunicipalExpert[] = [
    {
      id: 'exp1',
      fullName: 'دکتر محمدرضا صادقی',
      role: 'عضو هیئت علمی و داور ارشد ممیزی',
      department: 'سازمان فاوا و شهر هوشمند',
      approvedCount: 24,
      points: 1420,
      avatarText: 'ص',
      badge: 'خبره سرآمد ماه',
      specialty: 'اینترنت اشیاء، هوش مصنوعی در ترافیک'
    },
    {
      id: 'exp2',
      fullName: 'مهندس زهرا موسوی',
      role: 'کارشناس ارشد پایش زیست‌محیطی',
      department: 'معاونت خدمات شهری و فضای سبز',
      approvedCount: 19,
      points: 1180,
      avatarText: 'م',
      badge: 'پژوهشگر برگزیده',
      specialty: 'بازچرخانی پساب، مدیریت منابع آب'
    },
    {
      id: 'exp3',
      fullName: 'مهندس علیرضا قنبری',
      role: 'مدیر اداره شهرسازی و نوسازی',
      department: 'شهرداری منطقه ۵ اصفهان',
      approvedCount: 16,
      points: 980,
      avatarText: 'ق',
      badge: 'ممیز برتر کمیته',
      specialty: 'سامانه‌های GIS و بازآفرینی شهری'
    },
    {
      id: 'exp4',
      fullName: 'دکتر امیرحسین بهرامی',
      role: 'مشاور عالی برنامه‌ریزی راهبردی',
      department: 'معاونت برنامه‌ریزی و پژوهش',
      approvedCount: 21,
      points: 1290,
      avatarText: 'ب',
      badge: 'داور شورای عالی',
      specialty: 'مهندسی مجدد فرآیندها، مدیریت بحران'
    }
  ];

  public officialBulletins: OfficialBulletin[] = [
    {
      id: 'b1',
      directiveNumber: 'بخشنامه شماره ۱۴۰۳/۸۸۲',
      title: 'دستورالعمل ثبت درس‌آموخته‌های پروژه‌های عمرانی سال ۱۴۰۳ در سامانه مدیریت دانش',
      date: '۰۵ آبان ۱۴۰۳',
      sender: 'معاونت برنامه‌ریزی و توسعه سرمایه انسانی',
      urgent: true
    },
    {
      id: 'b2',
      directiveNumber: 'ابلاغیه شماره ۱۴۰۳/۷۶۱',
      title: 'تقویم زمان‌بندی جلسات داوری و ممیزی دانش دبیرخانه‌های تخصصی در آبان‌ماه',
      date: '۰۱ آبان ۱۴۰۳',
      sender: 'شورای راهبری مدیریت دانش شهرداری',
      urgent: false
    },
    {
      id: 'b3',
      directiveNumber: 'فراخوان شماره ۱۴۰۳/۵۴',
      title: 'آغاز فرایند ارزیابی سومین جشنواره تجلیل از نخبگان و سفیران دانشی شهرداری اصفهان',
      date: '۲۸ مهر ۱۴۰۳',
      sender: 'اداره کل نوسازی و تحول اداری',
      urgent: false
    }
  ];

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'سامانه جامع مدیریت دانش | شهرداری اصفهان',
      description: 'پرتال رسمی مدیریت دانش و سرمایه فکری شهرداری اصفهان - ثبت نوآوری‌ها، تجارب سازمانی، ممیزی نخبگان و کاربست در مناطق',
      canonicalUrl: 'https://km.isfahan.ir/'
    });
  }

  public setCategory(catId: string): void {
    this.selectedCategory.set(catId);
  }

  public executeSearch(): void {
    const q = this.searchQuery ? this.searchQuery.trim() : '';
    const cat = this.selectedCategory();
    const queryParams: any = {};
    if (q) queryParams.q = q;
    if (cat !== 'all') queryParams.category = cat;
    
    this.router.navigate(['/search'], { queryParams });
  }

  public searchTag(tag: string): void {
    this.router.navigate(['/search'], { queryParams: { q: tag } });
  }
}
