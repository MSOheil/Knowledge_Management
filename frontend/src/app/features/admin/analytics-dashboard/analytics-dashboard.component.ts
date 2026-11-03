import { Component, OnInit, OnDestroy, signal, inject, PLATFORM_ID, ElementRef, ViewChild, afterNextRender } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

export interface LeaderboardUser {
  id: string;
  rank: number;
  fullName: string;
  department: string;
  points: number;
  knowledgeCount: number;
  level: 'NOVICE' | 'CONTRIBUTOR' | 'DEVELOPER';
  levelLabel: string;
  hasBlueBadge: boolean;
  avatarText: string;
}

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.scss'
})
export class AnalyticsDashboardComponent implements OnInit, OnDestroy {
  @ViewChild('trendChartRef') trendChartRef!: ElementRef<HTMLDivElement>;
  @ViewChild('deptChartRef') deptChartRef!: ElementRef<HTMLDivElement>;
  @ViewChild('typeChartRef') typeChartRef!: ElementRef<HTMLDivElement>;
  @ViewChild('committeeChartRef') committeeChartRef!: ElementRef<HTMLDivElement>;

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  // Metric KPI signals
  public totalSubmissions = signal<number>(412);
  public perCapitaSubmission = signal<number>(2.4);
  public approvedRatio = signal<number>(78.6);
  public activeExpertsCount = signal<number>(64);
  public totalPointsAwarded = signal<number>(1850);
  public isLoading = signal<boolean>(false);

  // Gamification Leaderboard
  public leaderboard = signal<LeaderboardUser[]>([
    {
      id: '1',
      rank: 1,
      fullName: 'دکتر بهنام رجبی',
      department: 'سازمان فاوا (فناوری اطلاعات)',
      points: 295,
      knowledgeCount: 16,
      level: 'DEVELOPER',
      levelLabel: 'توسعه‌دهنده دانش',
      hasBlueBadge: true,
      avatarText: 'ب‌ر'
    },
    {
      id: '2',
      rank: 2,
      fullName: 'مهندس محمدرضا حسینی',
      department: 'معاونت خدمات شهری و محیط زیست',
      points: 260,
      knowledgeCount: 13,
      level: 'DEVELOPER',
      levelLabel: 'توسعه‌دهنده دانش',
      hasBlueBadge: true,
      avatarText: 'م‌ح'
    },
    {
      id: '3',
      rank: 3,
      fullName: 'دکتر علی صادقی',
      department: 'سازمان قطار شهری اصفهان',
      points: 220,
      knowledgeCount: 10,
      level: 'CONTRIBUTOR',
      levelLabel: 'مشارکت‌کننده فعال',
      hasBlueBadge: true,
      avatarText: 'ع‌ص'
    },
    {
      id: '4',
      rank: 4,
      fullName: 'مهندس سارا رحیمی',
      department: 'معاونت معماری و شهرسازی',
      points: 185,
      knowledgeCount: 8,
      level: 'CONTRIBUTOR',
      levelLabel: 'مشارکت‌کننده فعال',
      hasBlueBadge: true,
      avatarText: 'س‌ر'
    },
    {
      id: '5',
      rank: 5,
      fullName: 'مهندس علیرضا بهرامی',
      department: 'شهرداری منطقه ۶ اصفهان',
      points: 135,
      knowledgeCount: 5,
      level: 'NOVICE',
      levelLabel: 'نوآموز دانشی',
      hasBlueBadge: false,
      avatarText: 'ع‌ب'
    }
  ]);

  private trendChartInstance: any = null;
  private deptChartInstance: any = null;
  private typeChartInstance: any = null;
  private committeeChartInstance: any = null;
  private resizeListener: any = null;

  constructor() {
    // SSR-safe client execution via afterNextRender
    afterNextRender(() => {
      this.initCharts();
    });
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardData();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.resizeListener) {
        window.removeEventListener('resize', this.resizeListener);
      }
      this.trendChartInstance?.dispose();
      this.deptChartInstance?.dispose();
      this.typeChartInstance?.dispose();
      this.committeeChartInstance?.dispose();
    }
  }

  public loadDashboardData(): void {
    this.isLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}/admin/reports/analytics-summary`).subscribe({
      next: (res) => {
        if (res) {
          if (res.totalSubmissions) this.totalSubmissions.set(res.totalSubmissions);
          if (res.approvedRatio) this.approvedRatio.set(res.approvedRatio);
          if (res.activeExpertsCount) this.activeExpertsCount.set(res.activeExpertsCount);
          if (res.totalPointsAwarded) this.totalPointsAwarded.set(res.totalPointsAwarded);
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private async initCharts(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;

    try {
      const echarts = await import('echarts');

      // 1. Monthly Submission and Consumption Trends (Line + Bar)
      if (this.trendChartRef?.nativeElement) {
        this.trendChartInstance = echarts.init(this.trendChartRef.nativeElement);
        const trendOption = {
          tooltip: { trigger: 'axis' },
          legend: { data: ['ثبت دانش جدید', 'فراخوانی و کاربست'], textStyle: { color: '#64748b', fontSize: 11 } },
          grid: { top: '15%', right: '3%', bottom: '12%', left: '3%', containLabel: true },
          xAxis: {
            type: 'category',
            data: ['فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور', 'مهر', 'آبان'],
            axisLabel: { color: '#64748b', fontSize: 11 }
          },
          yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#f1f5f9' } },
            axisLabel: { color: '#64748b', fontSize: 11 }
          },
          series: [
            {
              name: 'ثبت دانش جدید',
              type: 'bar',
              barWidth: '35%',
              itemStyle: {
                borderRadius: [8, 8, 0, 0],
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#ea580c' },
                  { offset: 1, color: '#f97316' }
                ])
              },
              data: [28, 35, 42, 49, 56, 64, 70, 68]
            },
            {
              name: 'فراخوانی و کاربست',
              type: 'line',
              smooth: true,
              itemStyle: { color: '#f59e0b' },
              lineStyle: { width: 3 },
              areaStyle: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(245, 158, 11, 0.25)' },
                  { offset: 1, color: 'rgba(245, 158, 11, 0.01)' }
                ])
              },
              data: [45, 62, 78, 92, 110, 135, 150, 172]
            }
          ]
        };
        this.trendChartInstance.setOption(trendOption);
      }

      // 2. Department Submissions Bar Chart
      if (this.deptChartRef?.nativeElement) {
        this.deptChartInstance = echarts.init(this.deptChartRef.nativeElement);
        const deptOption = {
          tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
          grid: { top: '12%', right: '4%', bottom: '15%', left: '4%', containLabel: true },
          xAxis: {
            type: 'category',
            data: ['فاوا', 'ترافیک', 'خدمات شهری', 'شهرسازی', 'عمران', 'منطقه ۶', 'منطقه ۳'],
            axisLabel: { color: '#64748b', fontSize: 11, interval: 0, rotate: 15 }
          },
          yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#f1f5f9' } },
            axisLabel: { color: '#64748b', fontSize: 11 }
          },
          series: [
            {
              name: 'اسناد ثبت شده',
              type: 'bar',
              barWidth: '40%',
              itemStyle: {
                borderRadius: [8, 8, 0, 0],
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#ea580c' },
                  { offset: 1, color: '#f59e0b' }
                ])
              },
              data: [84, 72, 61, 53, 47, 43, 37]
            }
          ]
        };
        this.deptChartInstance.setOption(deptOption);
      }

      // 3. Knowledge Type Distribution Donut Chart
      if (this.typeChartRef?.nativeElement) {
        this.typeChartInstance = echarts.init(this.typeChartRef.nativeElement);
        const typeOption = {
          tooltip: { trigger: 'item', formatter: '{b}: {c} مورد ({d}%)' },
          legend: { bottom: '0%', left: 'center', textStyle: { color: '#64748b', fontSize: 11 } },
          series: [
            {
              name: 'قالب دانش',
              type: 'pie',
              radius: ['45%', '70%'],
              avoidLabelOverlap: false,
              itemStyle: { borderRadius: 8, borderColor: '#fff', borderWidth: 2 },
              label: { show: false },
              data: [
                { value: 165, name: 'تجربه زیسته', itemStyle: { color: '#ea580c' } },
                { value: 78, name: 'مقاله تخصصی', itemStyle: { color: '#f59e0b' } },
                { value: 58, name: 'پروژه پژوهشی', itemStyle: { color: '#f43f5e' } },
                { value: 44, name: 'پایان‌نامه', itemStyle: { color: '#8b5cf6' } },
                { value: 32, name: 'کتاب و راهنما', itemStyle: { color: '#10b981' } }
              ]
            }
          ]
        };
        this.typeChartInstance.setOption(typeOption);
      }

      // 4. Committee Radar Performance Chart
      if (this.committeeChartRef?.nativeElement) {
        this.committeeChartInstance = echarts.init(this.committeeChartRef.nativeElement);
        const radarOption = {
          tooltip: {},
          radar: {
            indicator: [
              { name: 'سرعت رسیدگی (ساعت)', max: 30 },
              { name: 'نرخ پذیرش (%)', max: 100 },
              { name: 'رضایت پدیدآورنده (%)', max: 100 },
              { name: 'دقت ارزیابی (%)', max: 100 },
              { name: 'کمترین نرخ اعتراض (%)', max: 100 }
            ],
            axisName: { color: '#64748b', fontSize: 11 }
          },
          series: [
            {
              name: 'عملکرد کمیته‌های داوری',
              type: 'radar',
              data: [
                {
                  value: [14.2, 88.5, 93, 95, 97],
                  name: 'کمیته حمل و نقل و هوشمندسازی',
                  itemStyle: { color: '#ea580c' },
                  areaStyle: { opacity: 0.25, color: '#ea580c' }
                },
                {
                  value: [18.0, 84.0, 89, 91, 95],
                  name: 'کمیته عمران و زیرساخت شهری',
                  itemStyle: { color: '#f59e0b' },
                  areaStyle: { opacity: 0.25, color: '#f59e0b' }
                }
              ]
            }
          ]
        };
        this.committeeChartInstance.setOption(radarOption);
      }

      // Auto-resize handler
      this.resizeListener = () => {
        this.trendChartInstance?.resize();
        this.deptChartInstance?.resize();
        this.typeChartInstance?.resize();
        this.committeeChartInstance?.resize();
      };
      window.addEventListener('resize', this.resizeListener);

    } catch (err) {
      console.warn('ECharts client initialization deferred', err);
    }
  }

  public exportBonusCsv(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const list = this.leaderboard();
    const headers = ['رتبه', 'نام و نام خانوادگی', 'معاونت / منطقه', 'مجموع امتیاز', 'تعداد دانش مصوب', 'سطح', 'نشان آبی'];
    let csvContent = '\uFEFF';
    csvContent += headers.join(',') + '\n';

    for (const u of list) {
      const line = [
        u.rank,
        `"${u.fullName}"`,
        `"${u.department}"`,
        u.points,
        u.knowledgeCount,
        `"${u.levelLabel}"`,
        u.hasBlueBadge ? 'دارد' : 'ندارد'
      ];
      csvContent += line.join(',') + '\n';
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `KM_Bonus_Leaderboard_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
