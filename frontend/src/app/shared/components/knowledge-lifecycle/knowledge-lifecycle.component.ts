import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface LifecycleStep {
  stepNumber: number;
  id: string;
  title: string;
  subtitle: string;
  status: 'COMPLETED' | 'ACTIVE' | 'PENDING' | 'REJECTED';
  responsibleParty?: string;
  date?: string;
  notes?: string;
  score?: number;
}

@Component({
  selector: 'app-knowledge-lifecycle',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './knowledge-lifecycle.component.html',
  styleUrl: './knowledge-lifecycle.component.scss'
})
export class KnowledgeLifecycleComponent implements OnInit {
  @Input() public currentStep: number = 4; // 1-10
  @Input() public customSteps?: LifecycleStep[];
  @Input() public knowledgeTitle?: string = 'طرح بهینه‌سازی شبکه آبیاری و مصرف پساب شهری';
  @Input() public trackingCode?: string = 'KM-1403-8941';

  public steps = signal<LifecycleStep[]>([]);
  public selectedStep = signal<LifecycleStep | null>(null);

  public progressPercentage = computed(() => {
    const total = this.steps().length || 10;
    const completedCount = this.steps().filter(s => s.status === 'COMPLETED').length;
    const activeCount = this.steps().filter(s => s.status === 'ACTIVE').length;
    return Math.round(((completedCount + (activeCount > 0 ? 0.5 : 0)) / total) * 100);
  });

  ngOnInit(): void {
    if (this.customSteps && this.customSteps.length > 0) {
      this.steps.set(this.customSteps);
    } else {
      this.steps.set(this.generateDefaultSteps(this.currentStep));
    }

    // Default selected step is the active one
    const active = this.steps().find(s => s.status === 'ACTIVE') || this.steps()[0];
    this.selectedStep.set(active);
  }

  public selectStep(step: LifecycleStep): void {
    this.selectedStep.set(step);
  }

  private generateDefaultSteps(currentStepNum: number): LifecycleStep[] {
    const rawSteps: Omit<LifecycleStep, 'status'>[] = [
      {
        stepNumber: 1,
        id: 'capture',
        title: 'ثبت دانش',
        subtitle: 'ثبت ایده و تجربه توسط همکار',
        responsibleParty: 'کارشناس ثبت‌کننده (مهندس حسینی)',
        date: '۱۴۰۳/۰۷/۱۰',
        notes: 'تکمیل فرم استاندارد، بارگذاری مستندات فنی و بررسی اولیه خودکار هوش مصنوعی'
      },
      {
        stepNumber: 2,
        id: 'initial_check',
        title: 'بررسی اولیه',
        subtitle: 'غربالگری و اعتبارسنجی',
        responsibleParty: 'دبیرخانه مرکزی مدیریت دانش',
        date: '۱۴۰۳/۰۷/۱۲',
        notes: 'بررسی اصالت موضوع، عدم همپوشانی با تجارب قبلی و تایید مدارک پیوست'
      },
      {
        stepNumber: 3,
        id: 'secretariat_triage',
        title: 'ارجاع به دبیرخانه',
        subtitle: 'تریاژ و انتساب حوزه تخصصی',
        responsibleParty: 'دبیرخانه تخصصی خدمات شهری و محیط زیست',
        date: '۱۴۰۳/۰۷/۱۵',
        notes: 'تعیین کارگروه داوری، تطبیق با درخت دانش (KM-ENV) و تخصیص داوران ارشد'
      },
      {
        stepNumber: 4,
        id: 'evaluation',
        title: 'ارزیابی تخصصی',
        subtitle: 'داوری معیار ۴گانه مدل دلفی',
        responsibleParty: 'هیئت داوران تخصصی (دکتر صادقی / مهندس امینی)',
        date: 'در حال انجام (مهلت SLA: ۴۸ ساعت)',
        notes: 'ارزیابی اصالت، اثربخشی، قابلیت تعمیم سازمانی و صرفه اقتصادی (کسب حداقل ۷۰ از ۱۰۰)'
      },
      {
        stepNumber: 5,
        id: 'approval',
        title: 'تصویب کمیته',
        subtitle: 'تایید نهایی شورای عالی ممیزی',
        responsibleParty: 'شورای ممیزی معاونت برنامه‌ریزی',
        notes: 'تصویب امتیاز نهایی، تایید سطح تجربی و صدور مجوز بهره‌برداری'
      },
      {
        stepNumber: 6,
        id: 'publishing',
        title: 'انتشار در پایگاه',
        subtitle: 'دسترس‌پذیری در مخزن دانش',
        responsibleParty: 'سامانه جامع پورتال دانش شهرداری',
        notes: 'نمایه‌سازی در موتور جستجوی معنایی، ثبت در شاخه درخت دانش و اطلاع‌رسانی به مناطق'
      },
      {
        stepNumber: 7,
        id: 'karbest',
        title: 'کاربست و به‌کارگیری',
        subtitle: 'پیاده‌سازی در پروژه‌های شهری',
        responsibleParty: 'مناطق ۱۵‌گانه شهرداری اصفهان',
        notes: 'ثبت فرم کاربست عملیاتی، گزارش بازدهی میدانی و بهره‌برداری در پروژه‌های عمرانی'
      },
      {
        stepNumber: 8,
        id: 'impact_verification',
        title: 'سنجش اثربخشی',
        subtitle: 'ارزیابی ارزش افزوده اقتصادی',
        responsibleParty: 'اداره کل بازرسی و ارزیابی عملکرد',
        notes: 'محاسبه ریالی صرفه‌جویی، ارتقای شاخص‌های ایمنی و پایش کاهش زمان اجرای پروژه‌ها'
      },
      {
        stepNumber: 9,
        id: 'transcript',
        title: 'صدور کارنامه دانش',
        subtitle: 'ثبت امتیاز در شناسنامه پرسنل',
        responsibleParty: 'سیستم هوشمند گیمیفیکیشن و سرمایه فکری',
        notes: 'اعطای نشان آبی خبرگی، ارتقای رتبه دانشی و اضافه شدن به پرونده الکترونیک همکار'
      },
      {
        stepNumber: 10,
        id: 'reward',
        title: 'اعطای پاداش و تسهیلات',
        subtitle: 'تسویه مالی و تقدیرنامه رسمی',
        responsibleParty: 'معاونت مالی، اداری و توسعه منابع انسانی',
        notes: 'صدور حواله پاداش انگیزشی، امتیاز ارتقای شغلی در کارگزینی و تقدیرنامه شهردار'
      }
    ];

    return rawSteps.map(s => {
      let status: 'COMPLETED' | 'ACTIVE' | 'PENDING' | 'REJECTED' = 'PENDING';
      if (s.stepNumber < currentStepNum) {
        status = 'COMPLETED';
      } else if (s.stepNumber === currentStepNum) {
        status = 'ACTIVE';
      }
      return {
        ...s,
        status
      };
    });
  }
}
