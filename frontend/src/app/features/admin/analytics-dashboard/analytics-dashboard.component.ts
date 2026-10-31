import { Component, OnInit, AfterViewInit, OnDestroy, signal, inject, PLATFORM_ID, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-analytics-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './analytics-dashboard.component.html',
  styleUrl: './analytics-dashboard.component.scss'
})
export class AnalyticsDashboardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('deptChartRef') deptChartRef!: ElementRef<HTMLDivElement>;
  @ViewChild('typeChartRef') typeChartRef!: ElementRef<HTMLDivElement>;
  @ViewChild('committeeChartRef') committeeChartRef!: ElementRef<HTMLDivElement>;

  private http = inject(HttpClient);
  private platformId = inject(PLATFORM_ID);

  public totalSubmissions = signal<number>(341);
  public approvedRatio = signal<number>(76.4);
  public activeExpertsCount = signal<number>(48);
  public totalPointsAwarded = signal<number>(1420);
  public isLoading = signal<boolean>(false);

  private deptChartInstance: any = null;
  private typeChartInstance: any = null;
  private committeeChartInstance: any = null;
  private resizeListener: any = null;

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadDashboardData();
    }
  }

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.initCharts();
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      if (this.resizeListener) {
        window.removeEventListener('resize', this.resizeListener);
      }
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
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  private async initCharts(): Promise<void> {
    try {
      const echarts = await import('echarts');

      // 1. Department Submissions Bar Chart
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
            name: 'تعداد اسناد',
            nameTextStyle: { color: '#94a3b8', fontSize: 11 },
            splitLine: { lineStyle: { color: '#f1f5f9' } },
            axisLabel: { color: '#64748b' }
          },
          series: [
            {
              name: 'اسناد ثبت شده',
              type: 'bar',
              barWidth: '40%',
              itemStyle: {
                borderRadius: [8, 8, 0, 0],
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: '#0d9488' },
                  { offset: 1, color: '#14b8a6' }
                ])
              },
              data: [78, 65, 54, 48, 42, 39, 33]
            }
          ]
        };
        this.deptChartInstance.setOption(deptOption);
      }

      // 2. Knowledge Type Distribution Donut Chart
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
                { value: 125, name: 'تجربه زیسته', itemStyle: { color: '#0ea5e9' } },
                { value: 58, name: 'مقاله تخصصی', itemStyle: { color: '#10b981' } },
                { value: 45, name: 'پروژه پژوهشی', itemStyle: { color: '#8b5cf6' } },
                { value: 34, name: 'پایان‌نامه', itemStyle: { color: '#f59e0b' } },
                { value: 22, name: 'کتاب و ترجمه', itemStyle: { color: '#ec4899' } }
              ]
            }
          ]
        };
        this.typeChartInstance.setOption(typeOption);
      }

      // 3. Committee Radar Performance Chart
      if (this.committeeChartRef?.nativeElement) {
        this.committeeChartInstance = echarts.init(this.committeeChartRef.nativeElement);
        const radarOption = {
          tooltip: {},
          radar: {
            indicator: [
              { name: 'سرعت ارزیابی (ساعت)', max: 30 },
              { name: 'نرخ پذیرش (%)', max: 100 },
              { name: 'رضایت پدیدآورنده (%)', max: 100 },
              { name: 'دقت بررسی فنی (%)', max: 100 },
              { name: 'کمترین نرخ اعتراض (%)', max: 100 }
            ],
            axisName: { color: '#64748b', fontSize: 11 }
          },
          series: [
            {
              name: 'عملکرد کمیته‌های تخصصی',
              type: 'radar',
              data: [
                {
                  value: [14.2, 87.5, 92, 94, 96],
                  name: 'کمیته حمل و نقل و هوشمندسازی',
                  itemStyle: { color: '#0d9488' },
                  areaStyle: { opacity: 0.25, color: '#0d9488' }
                },
                {
                  value: [18.5, 83.3, 88, 90, 94],
                  name: 'کمیته عمران و زیرساخت شهری',
                  itemStyle: { color: '#6366f1' },
                  areaStyle: { opacity: 0.25, color: '#6366f1' }
                }
              ]
            }
          ]
        };
        this.committeeChartInstance.setOption(radarOption);
      }

      // Responsive window resize listener
      this.resizeListener = () => {
        this.deptChartInstance?.resize();
        this.typeChartInstance?.resize();
        this.committeeChartInstance?.resize();
      };
      window.addEventListener('resize', this.resizeListener);

    } catch (err) {
      console.warn('ECharts client initialization deferred', err);
    }
  }
}
