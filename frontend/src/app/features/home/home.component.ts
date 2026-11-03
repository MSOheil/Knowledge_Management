import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { I18nService } from '../../core/services/i18n.service';
import { SeoService } from '../../core/services/seo.service';
import { AuthService } from '../../core/services/auth.service';

export interface StrategicGoal {
  id: string;
  title: string;
  description: string;
  icon: string;
  benefit: string;
}

export interface LifecycleStep {
  step: number;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
}

export interface PlatformModule {
  id: string;
  title: string;
  badge: string;
  description: string;
  route: string;
  icon: string;
  features: string[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category: string;
  isOpen?: boolean;
}

export interface DistrictItem {
  number: number;
  name: string;
  focus: string;
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

  public todayDateString = signal<string>('شنبه، ۱۰ آبان ۱۴۰۳');

  // 1. Strategic Goals of Knowledge Management for Isfahan Municipality
  public readonly strategicGoals: StrategicGoal[] = [
    {
      id: 'prevent-repetition',
      title: 'پیشگیری از خطاهای تکراری و اتلاف بودجه',
      description: 'مستندسازی علل ناکامی و درس‌آموخته‌های پروژه‌های شهری برای ممانعت از صرف هزینه‌های موازی در مناطق ۱۵‌گانه.',
      benefit: 'صرفه‌جویی اقتصادی ۳۳ میلیارد ریالی در سال ۱۴۰۳',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      id: 'preserve-intellectual-capital',
      title: 'ماندگاری تجارب خبرگان در آستانه بازنشستگی',
      description: 'استخراج و ثبت دانش ضمنی مدیران و کارشناسان باتجربه شهرداری پیش از خروج از چرخه خدمت و تبدیل آن به دانش صریح سازمانی.',
      benefit: 'حفظ حافظه تاریخی و فنی مدیریت کهن‌شهر اصفهان',
      icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253'
    },
    {
      id: 'speed-innovation',
      title: 'تسریع نوآوری و بهبود مستمر خدمات شهری',
      description: 'اشتراک‌گذاری ایده‌ها و راهکارهای نوآورانه میان معاونت‌ها و سازمان‌های وابسته جهت ارتقای رضایت‌مندی شهروندان.',
      benefit: 'کاهش زمان فرآیندهای اداری و صدور مجوزها',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z'
    },
    {
      id: 'gamification-rewards',
      title: 'پاداش انگیزشی و رشد حرفه‌ای کارکنان',
      description: 'ثبت کارنامه دانشی، اعطای نشان آبی خبرگی و تخصیص پاداش‌های مالی و ارتقای سازمانی به کارکنان مشارکت‌کننده.',
      benefit: 'نظام تشویقی شفاف و مصوب شورای تحول اداری',
      icon: 'M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z'
    }
  ];

  // 2. The 4-Stage Knowledge Lifecycle
  public readonly lifecycleSteps: LifecycleStep[] = [
    {
      step: 1,
      title: 'خلق و ثبت تجربه',
      subtitle: 'ورود برخط توسط کارشناس',
      description: 'ثبت تجارب زیسته، پروژه‌های پژوهشی و درس‌آموخته‌ها با فرم‌های استاندارد و برچسب‌گذاری طبق درخت دانش.',
      icon: 'M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z'
    },
    {
      step: 2,
      title: 'ممیزی و داوری دلفی',
      subtitle: 'ارزیابی علمی و اجرایی',
      description: 'بررسی در دبیرخانه‌های تخصصی با روش دلفی کور، تعیین امتیاز کیفی و تایید فنی توسط ارزیابان رسمی.',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'
    },
    {
      step: 3,
      title: 'نشر و کاربست در مناطق',
      subtitle: 'پیاده‌سازی در پروژه‌های شهری',
      description: 'به‌کارگیری تجارب مصوب در سایر مناطق ۱۵‌گانه شهرداری اصفهان و سنجش صرفه‌جویی و اثربخشی میدانی.',
      icon: 'M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15'
    },
    {
      step: 4,
      title: 'کارنامه دانشی و پاداش',
      subtitle: 'ارتقای سازمانی و تجلیل',
      description: 'ثبت امتیاز در شناسنامه دانشی همکار، اعطای نشان آبی خبرگی و واریز پاداش مالی مصوب شورا.',
      icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z'
    }
  ];

  // 3. Core Integrated Platform Modules
  public readonly platformModules: PlatformModule[] = [
    {
      id: 'knowledge-tree',
      title: 'درخت دانش سازمانی (۴۸ شاخه)',
      badge: 'ساختار پایه',
      description: 'معماری و طبقه‌بندی سلسله‌مراتبی کلیه حوزه‌های وظیفه‌ای شهرداری اصفهان در ۶ معاونت و ۴۸ شاخه تخصصی فرآیندی.',
      route: '/knowledge-tree',
      icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      features: ['تخصیص متولی سازمانی به هر شاخه', 'اتصال به فرآیندهای اداری و پروژه‌ای', 'کاوش سریع در سرفصل‌ها']
    },
    {
      id: 'expert-directory',
      title: 'بانک خبرگان با نشان آبی',
      badge: 'شبکه نخبگان',
      description: 'سامانه شناسایی، رتبه‌بندی و شبکه‌سازی خبرگان و ارزیابان شهرداری اصفهان با اعطای نشان رسمی خبرگی.',
      route: '/experts',
      icon: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z',
      features: ['۳۸۰+ کارشناس و خبره فعال', 'رزومه دانشی و سوابق داوری', 'امکان ارجاع مسائل تخصصی شهری']
    },
    {
      id: 'evaluator-cartable',
      title: 'کارتابل داوری و ممیزی دلفی',
      badge: 'اعتبارسنجی',
      description: 'میز کار ارزیابان مستقل و دبیرخانه‌های تخصصی جهت بررسی مدارک، نظرات داوری و صدور گواهی مصوب.',
      route: '/evaluations',
      icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4',
      features: ['روش دلفی ۳ مرحله‌ای کور', 'فرم‌های استاندارد نمره‌دهی', 'ثبت صورتجلسات کمیته‌های ممیزی']
    },
    {
      id: 'karbest-system',
      title: 'سامانه ثبت کاربست و اثربخشی',
      badge: 'ارزش‌آفرینی',
      description: 'ثبت کاربردهای میدانی دانش‌های مصوب در پروژه‌های اجرایی مناطق و محاسبه ارزش افزوده و صرفه‌جویی ریالی.',
      route: '/karbest',
      icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z',
      features: ['محاسبه اتوماتیک صرفه‌جویی ریالی', 'تاییدیه معاونت بهره‌بردار', 'امتیاز ویژه کاربست برای ثبت‌کننده']
    },
    {
      id: 'urban-challenges',
      title: 'پویش‌های حل مسائل اولویت‌دار',
      badge: 'مسئله‌محور',
      description: 'فراخوان‌های تجربی برای مهار فرونشست، تنش آبی، مدیریت پساب و کاهش ترافیک با هدف تجمیع ایده‌های پرسنل.',
      route: '/panels',
      icon: 'M13 10V3L4 14h7v7l9-11h-7z',
      features: ['مهلت زمانی و جوایز ویژه پویش', 'سنتز و تجمیع تجارب ارسالی', 'حل عملیاتی چالش‌های کهن‌شهر اصفهان']
    },
    {
      id: 'gamification-transcript',
      title: 'کارنامه دانشی و پاداش همکاران',
      badge: 'انگیزشی',
      description: 'داشبورد شفاف ثبت سوابق، نشان‌ها، رتبه‌بندی فردی در سطح شهرداری اصفهان و محاسبه پاداش‌های فصلی.',
      route: '/transcript',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      features: ['محاسبه امتیاز برخط', 'صدور گواهی کارنامه معتبر اداری', 'اتصال به سامانه احکام و فیش حقوقی']
    }
  ];

  // 4. District and Organizational Coverage
  public readonly municipalDistricts: DistrictItem[] = [
    { number: 1, name: 'منطقه یک', focus: 'بافت تاریخی و گردشگری' },
    { number: 2, name: 'منطقه دو', focus: 'توسعه و بازآفرینی شهری' },
    { number: 3, name: 'منطقه سه', focus: 'هسته مرکزی، بازار و تجاری' },
    { number: 4, name: 'منطقه چهار', focus: 'محیط زیست و حاشیه زاینده‌رود' },
    { number: 5, name: 'منطقه پنج', focus: 'ناژوان و گردشگری طبیعی' },
    { number: 6, name: 'منطقه شش', focus: 'معماری مدرن و مراکز فرهنگی' },
    { number: 7, name: 'منطقه هفت', focus: 'شمال شهر و مدیریت ترافیک' },
    { number: 8, name: 'منطقه هشت', focus: 'حمل‌ونقل عمومی و تقاطع‌ها' },
    { number: 9, name: 'منطقه نه', focus: 'غرب اصفهان و باغات' },
    { number: 10, name: 'منطقه ده', focus: 'تراکم جمعیتی و خدمات شهری' },
    { number: 11, name: 'منطقه یازده', focus: 'صنایع دستی و خدمات نوین' },
    { number: 12, name: 'منطقه دوازده', focus: 'ورودی شمالی و پایانه حمل‌ونقل' },
    { number: 13, name: 'منطقه سیزده', focus: 'کوهستان صفه و تفریحات' },
    { number: 14, name: 'منطقه چهارده', focus: 'بازآفرینی و توانمندسازی' },
    { number: 15, name: 'منطقه پانزده', focus: 'شرق اصفهان و صنایع شهری' }
  ];

  // 5. Frequently Asked Questions
  public readonly faqs: FaqItem[] = [
    {
      id: 'faq1',
      question: 'چه مواردی در شهرداری اصفهان به عنوان «دانش یا تجربه» قابلیت ثبت دارند؟',
      answer: 'هرگونه راهکار موفق یا ناموفق در اجرای پروژه‌های شهری، بهبود یک فرآیند اداری، کاهش هزینه‌های عملیاتی، مقالات و پژوهش‌های مرتبط با مدیریت شهری اصفهان و کتب تخصصی تالیف‌شده توسط همکاران.',
      category: 'قوانین و ضوابط'
    },
    {
      id: 'faq2',
      question: 'آیا ثبت درس‌آموخته از پروژه‌های ناموفق نیز دارای امتیاز و پاداش است؟',
      answer: 'بله، اکیداً! در نظام مدیریت دانش شهرداری اصفهان، درس‌آموخته‌های پروژه‌های ناموفق که از تکرار اشتباهات پرهزینه جلوگیری می‌کنند، هم‌ردیف تجارب موفق دارای بالاترین ضریب امتیاز و پاداش مادی می‌باشند.',
      category: 'ارزیابی و داوری'
    },
    {
      id: 'faq3',
      question: 'فرایند ارزیابی تجارب در دبیرخانه چه مدت زمان می‌برد؟',
      answer: 'طبق استاندارد مصوب، ارزیابی اولیه در دبیرخانه تخصصی حداکثر ظرف ۵ روز کاری و داوری تفصیلی دلفی ظرف ۲ تا ۳ هفته کاری تکمیل و نتیجه از طریق پیامک و کارتابل به همکار اطلاع‌رسانی می‌گردد.',
      category: 'زمان‌بندی'
    },
    {
      id: 'faq4',
      question: 'پاداش‌های مادی و ارتقای شغلی چگونه اعمال می‌شود؟',
      answer: 'پس از تصویب نهایی در شورای ممیزی مدیریت دانش، گواهی رسمی صادر شده، امتیاز مربوطه در کارنامه دانشی همکار ثبت و پاداش نقدی مصوب مستقیماً به فیش حقوقی اضافه می‌گردد.',
      category: 'پاداش و کارنامه'
    }
  ];

  public openFaqId = signal<string | null>('faq1');

  public toggleFaq(id: string): void {
    this.openFaqId.update(current => (current === id ? null : id));
  }

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'سامانه جامع مدیریت دانش و سرمایه فکری شهرداری اصفهان',
      description: 'پرتال یکپارچه معرفی نظام مدیریت دانش، اهداف راهبردی، ساختار درخت دانش و چرخه مشارکت پرسنل مناطق ۱۵‌گانه شهرداری اصفهان',
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

  public goToKnowledgeBase(): void {
    this.router.navigate(['/search']);
  }
}
