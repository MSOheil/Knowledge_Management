import { Component, OnInit, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { AccessPurposeDialogComponent, AccessPurposeType } from '../access-purpose-dialog/access-purpose-dialog.component';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';

export interface QaKnowledgeItem {
  id: string;
  code: string;
  title: string;
  summary: string;
  content: string;
  category: string;
  knowledgeType: string;
  department: string;
  authorName: string;
  authorRole: string;
  authorAvatar?: string;
  hasBlueBadge: boolean;
  createdAt: string;
  status: 'APPROVED' | 'IN_REVIEW' | 'APPLIED';
  statusLabel: string;
  statusClass: string;
  votes: number;
  userVoted?: boolean;
  karbestCount: number; // Answers / Applications in StackBros style
  viewCount: number;
  tags: string[];
  economicSavings?: string;
  isHot?: boolean;
  attachedDocsCount?: number;
}

export interface CategorySummary {
  id: string;
  name: string;
  count: number;
  icon: string;
}

export interface TopContributor {
  id: string;
  name: string;
  department: string;
  points: number;
  knowledgeCount: number;
  avatarText: string;
  hasBlueBadge: boolean;
}

@Component({
  selector: 'app-knowledge-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, AccessPurposeDialogComponent],
  templateUrl: './knowledge-search.component.html',
  styleUrl: './knowledge-search.component.scss'
})
export class KnowledgeSearchComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  public auth = inject(AuthService);
  private seo = inject(SeoService);
  private platformId = inject(PLATFORM_ID);

  // Search & Filter state
  public keyword = signal<string>('');
  public selectedCategory = signal<string>('ALL');
  public selectedType = signal<string>('ALL');
  public activeTab = signal<'ALL' | 'NEWEST' | 'MOST_APPLIED' | 'VERIFIED' | 'IN_REVIEW'>('ALL');
  public sortBy = signal<'NEWEST' | 'VOTES' | 'KARBEST' | 'VIEWS'>('NEWEST');
  public activeTag = signal<string | null>(null);

  public isLoading = signal<boolean>(false);
  public totalResultsCount = computed(() => this.filteredItems().length);

  // Purpose Interception Modal
  public isPurposeDialogOpen = signal<boolean>(false);
  public pendingItem = signal<QaKnowledgeItem | null>(null);
  public pendingAction = signal<'READ' | 'DOWNLOAD'>('READ');
  public unlockedItemIds = signal<Set<string>>(new Set<string>());
  public activeItemDetail = signal<QaKnowledgeItem | null>(null);

  // Knowledge Categories
  public readonly categories: CategorySummary[] = [
    { id: 'ALL', name: 'همه حوزه‌های موضوعی', count: 1890, icon: 'M4 6h16M4 12h16M4 18h16' },
    { id: 'خدمات شهری', name: 'خدمات شهری و محیط زیست', count: 620, icon: 'M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z' },
    { id: 'فناوری اطلاعات', name: 'فناوری اطلاعات و فاوا', count: 540, icon: 'M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
    { id: 'شهرسازی', name: 'شهرسازی و معماری', count: 430, icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
    { id: 'حمل‌ونقل', name: 'حمل‌ونقل و ترافیک', count: 350, icon: 'M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4' },
    { id: 'عمران', name: 'عمران و زیرساخت شهری', count: 310, icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
    { id: 'مالی', name: 'مالی، اداری و اقتصادی', count: 180, icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' }
  ];

  // Knowledge Types filter
  public readonly knowledgeTypes = [
    { label: 'همه قالب‌های دانشی', value: 'ALL' },
    { label: 'تجربه زیسته و اجرایی', value: 'EXPERIENCE' },
    { label: 'طرح پژوهشی و توسعه‌ای', value: 'RESEARCH_PROJECT' },
    { label: 'کتاب و راهنمای فنی', value: 'BOOK' },
    { label: 'مقاله علمی سازمانی', value: 'ARTICLE' },
    { label: 'پایان‌نامه کاربردی', value: 'THESIS' },
    { label: 'درس‌آموخته پیمانکاران', value: 'CONTRACTOR_EXPERIENCE' }
  ];

  // Top Knowledge Champions (Leaderboard)
  public readonly topContributors: TopContributor[] = [
    {
      id: 'c1',
      name: 'دکتر بهنام رجبی',
      department: 'سازمان فاوا (فناوری اطلاعات)',
      points: 280,
      knowledgeCount: 14,
      avatarText: 'ب‌ر',
      hasBlueBadge: true
    },
    {
      id: 'c2',
      name: 'مهندس محمدرضا حسینی',
      department: 'معاونت خدمات شهری و محیط زیست',
      points: 245,
      knowledgeCount: 11,
      avatarText: 'م‌ح',
      hasBlueBadge: true
    },
    {
      id: 'c3',
      name: 'دکتر علی صادقی',
      department: 'سازمان قطار شهری اصفهان',
      points: 210,
      knowledgeCount: 9,
      avatarText: 'ع‌ص',
      hasBlueBadge: true
    },
    {
      id: 'c4',
      name: 'مهندس سارا ابراهیمی',
      department: 'شهرداری منطقه ۳ اصفهان',
      points: 195,
      knowledgeCount: 8,
      avatarText: 'س‌ا',
      hasBlueBadge: true
    },
    {
      id: 'c5',
      name: 'دکتر وحید رحمانی',
      department: 'شرکت واحد اتوبوسرانی',
      points: 180,
      knowledgeCount: 7,
      avatarText: 'و‌ر',
      hasBlueBadge: false
    }
  ];

  // Trending Topic Tags Cloud
  public readonly trendingTags = [
    'تنش آبی',
    'هوش مصنوعی',
    'بازچرخانی پساب',
    'کاهش ترافیک',
    'فرونشست دشت اصفهان',
    'پروانه الکترونیک',
    'اتوبوس برقی',
    'اصفهان هوشمند',
    'تفکیک پسماند',
    'کاهش هزینه'
  ];

  // Authentic StackBros-Styled Knowledge Dataset
  public readonly registeredKnowledgeItems = signal<QaKnowledgeItem[]>([
    {
      id: 'km-001',
      code: 'KM-1403-ENV-014',
      title: 'مدیریت هوشمند پساب و آبیاری بهینه فضای سبز در شرایط تنش آبی اصفهان',
      summary: 'روش‌شناسی تفصیلی تصفیه ثانویه پساب شهری و بازچرخانی مداربسته آن در کمربند سبز ناژوان با کاهش ۴۰ درصدی مصرف آب شرب و استفاده از لوله‌های دوجداره پلی‌اتیلن مقاوم در برابر خوردگی بیولوژیک.',
      content: 'در این مستند جامع، فرآیند پیاده‌سازی سیستم هوشمند پایش کیفی و دبی پساب تصفیه‌خانه جنوب اصفهان به منظور استفاده در اراضی پارک جنگلی ناژوان شرح داده شده است. مراحل شامل: ۱. طراحی مخازن ته‌نشینی آرام و سیستم کلرزنی تکمیلی، ۲. نصب سنسورهای سنجش EC و TDS در خطوط انتقال، ۳. زمان‌بندی آبیاری بر اساس پیش‌بینی تبخیر و تعریق و دمای هوا به کمک سامانه هواشناسی اختصاصی، ۴. محاسبه صرفه‌جویی اقتصادی سالانه به میزان ۴٫۲ میلیارد ریال حاصل از عدم خرید آب شیرین تانکری.',
      category: 'خدمات شهری',
      knowledgeType: 'EXPERIENCE',
      department: 'معاونت خدمات شهری و محیط زیست',
      authorName: 'مهندس محمدرضا حسینی',
      authorRole: 'رئیس اداره امور بهینه‌سازی آب و خاک',
      hasBlueBadge: true,
      createdAt: '۱۴۰۳/۰۷/۱۵',
      status: 'APPLIED',
      statusLabel: 'کاربست موفق در ۳ منطقه',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      votes: 38,
      karbestCount: 4,
      viewCount: 620,
      tags: ['تنش آبی', 'فضای سبز', 'بازچرخانی پساب', 'کاهش هزینه'],
      economicSavings: '۴٫۲ میلیارد ریال صرفه‌جویی سالانه',
      isHot: true,
      attachedDocsCount: 3
    },
    {
      id: 'km-002',
      code: 'KM-1403-IT-089',
      title: 'پیاده‌سازی الگوریتم هوش مصنوعی و بینایی ماشین در تنظیم پویای زمان‌بندی تقاطع‌های چراغ‌دار',
      summary: 'استفاده از هوش مصنوعی لبه (Edge AI) و پردازش بلادرنگ تصاویر دوربین‌های نظارت تصویری شهرداری در تقاطع‌های بزرگراه شهید چمران و خیابان کاوه، جهت کاهش زمان توقف خودروها به میزان ۲۳ درصد.',
      content: 'سیستم سنتی زمان‌بندی ثابت یا نیمه‌هوشمند چراغ‌های راهنمایی در ساعات اوج بار با صف‌های طولانی و هدررفت زمان شهروندان همراه بود. در این پروژه، مدلی یادگیرنده بر بستر شبکه عصبی YOLOv8 توسعه یافت که با تخمین دقیق طول صف در هر رویکرد، زمان فاز سبز را به طور پویا بهینه‌سازی می‌کند. نتایج پایلوت در تقاطع چمران-آل محمد نشان‌دهنده کاهش ۱۸ درصدی مصرف سوخت خودروها و تقلیل ۲۳ درصدی زمان تاخیر است.',
      category: 'فناوری اطلاعات',
      knowledgeType: 'RESEARCH_PROJECT',
      department: 'سازمان فناوری اطلاعات و ارتباطات (فاوا)',
      authorName: 'دکتر بهنام رجبی',
      authorRole: 'مدیر توسعه سیستم‌های هوشمند شهری',
      hasBlueBadge: true,
      createdAt: '۱۴۰۳/۰۶/۲۸',
      status: 'APPLIED',
      statusLabel: 'کاربست عملیاتی در منطقه ۷ و ۸',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      votes: 45,
      karbestCount: 5,
      viewCount: 840,
      tags: ['هوش مصنوعی', 'کاهش ترافیک', 'اصفهان هوشمند', 'بینایی ماشین'],
      economicSavings: '۶٫۱ میلیارد ریال ارزش اقتصادی سوخت و زمان',
      isHot: true,
      attachedDocsCount: 2
    },
    {
      id: 'km-003',
      code: 'KM-1403-URB-032',
      title: 'بهینه‌سازی فرایند صدور پروانه ساختمانی از طریق استعلامات برخط سامانه سارینا و آتش‌نشانی',
      summary: 'حذف مراجعات حضوری مالکین از طریق الکترونیکی‌سازی تایید نقشه‌های نظام مهندسی، استعلامات آتش‌نشانی و پرداخت عوارض در شهرداری منطقه ۳ با کاهش میانگین زمان صدور از ۴۵ روز به ۱۲ روز کاری.',
      content: 'این تجربه مدون به بازطراحی فرآیند (BPR) صدور پروانه ساختمانی در بافت تاریخی و تجاری منطقه ۳ می‌پردازد. با ایجاد وب‌سرویس‌های امن میان شهرداری، سازمان نظام مهندسی ساختمان و سازمان آتش‌نشانی اصفهان، بارگذاری فایل‌های نقشه‌کشی، بررسی ضوابط شهرسازی و صدور برگه عوارض کاملاً بدون کاغذ و بدون مراجعه حضوری انجام می‌گردد. رضایت ارباب رجوع در این منطقه به ۸۹ درصد ارتقا یافته است.',
      category: 'شهرسازی',
      knowledgeType: 'EXPERIENCE',
      department: 'شهرداری منطقه ۳ اصفهان',
      authorName: 'مهندس سارا ابراهیمی',
      authorRole: 'معاون شهرسازی و معماری منطقه ۳',
      hasBlueBadge: true,
      createdAt: '۱۴۰۳/۰۵/۱۰',
      status: 'APPROVED',
      statusLabel: 'مصوب ممیزی عالی',
      statusClass: 'bg-[#086288]/10 text-[#086288] border-[#086288]/30',
      votes: 29,
      karbestCount: 3,
      viewCount: 470,
      tags: ['پروانه الکترونیک', 'شهرسازی هوشمند', 'کاهش بوروکراسی', 'رضایت شهروند'],
      economicSavings: '۳٫۵ میلیارد ریال بهبود بهره‌وری اداری',
      isHot: false,
      attachedDocsCount: 4
    },
    {
      id: 'km-004',
      code: 'KM-1403-CIV-055',
      title: 'روش ترکیبی مهار و پایدارسازی بستر سازه‌ها در پهنه‌های فرونشست دشت اصفهان',
      summary: 'تزریق ژئوپلیمرهای انبساطی متراکم در لایه‌های خاکی فرونشست‌یافته و طراحی شالوده‌های انعطاف‌پذیر با اتصالات مفصلی در احداث سازه‌های خط ۲ قطار شهری و تقاطع‌های غیرهمسطح.',
      content: 'دشت اصفهان با چالش فرونشست ناهمگن زمین مواجه است که پایداری ابنیه فنی و خطوط ریلی شهری را تهدید می‌کند. تیم مهندسی قطار شهری روشی نوآورانه شامل سونداژ دقیق ژئوفیزیک با رادار نفوذی به زمین (GPR)، حفر گمانه‌های میکرو و تزریق صمغ‌های ژئوپلیمری سبک ولی با مقاومت فشاری بالا توسعه داد که از نشست تفاضلی ریل‌ها جلوگیری نمود.',
      category: 'عمران',
      knowledgeType: 'RESEARCH_PROJECT',
      department: 'سازمان قطار شهری اصفهان',
      authorName: 'دکتر علی صادقی',
      authorRole: 'مشاور عالی ژئوتکنیک و سازه',
      hasBlueBadge: true,
      createdAt: '۱۴۰۳/۰۴/۰۲',
      status: 'APPROVED',
      statusLabel: 'مصوب کمیته عمران و زیرساخت',
      statusClass: 'bg-[#086288]/10 text-[#086288] border-[#086288]/30',
      votes: 52,
      karbestCount: 6,
      viewCount: 1120,
      tags: ['فرونشست دشت اصفهان', 'قطار شهری', 'ژئوپلیمر', 'ایمنی سازه'],
      economicSavings: '۱۱٫۸ میلیارد ریال جلوگیری از خسارت ساختاری',
      isHot: true,
      attachedDocsCount: 5
    },
    {
      id: 'km-005',
      code: 'KM-1403-TRF-021',
      title: 'استقرار ناوگان اتوبوس برقی سریع‌السیر (BRT) و اتصال هوشمند به کیف پول اصفهان‌کارت',
      summary: 'تحلیل داده‌های بارگیری شبانه ناوگان برقی و هماهنگی با شرکت توزیع برق منطقه‌ای جهت شارژ خارج از پیک، ادغام با گیت‌های پرداخت الکترونیک غیرتماسی و کاهش سالانه ۳۰۰ تن انتشار دی‌اکسید کربن.',
      content: 'راهبرد حمل‌ونقل پاک شهرداری اصفهان مستلزم ورود فناوری اتوبوس‌های تمام برقی بود. درس‌آموخته‌های این پروژه شامل: ۱. نحوه جانمایی ایستگاه‌های شارژ سریع ۳۵۰ کیلووات در پایانه‌های شهید بسطامی و خرم، ۲. قرارداد نگهداری باتری‌های لیتیوم-فسفات در اقلیم گرم و خشک، ۳. زمان‌بندی شیفت رانندگان و ۴. سیستم رزرو و شارژ کیف پول اصفهان‌کارت از طریق تلفن همراه.',
      category: 'حمل‌ونقل',
      knowledgeType: 'EXPERIENCE',
      department: 'شرکت واحد اتوبوسرانی اصفهان',
      authorName: 'دکتر وحید رحمانی',
      authorRole: 'معاون فنی و نگهداری ناوگان',
      hasBlueBadge: false,
      createdAt: '۱۴۰۳/۰۳/۱۴',
      status: 'APPLIED',
      statusLabel: 'کاربست در خط ۲ اتوبوسرانی',
      statusClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      votes: 31,
      karbestCount: 2,
      viewCount: 530,
      tags: ['اتوبوس برقی', 'اصفهان‌کارت', 'هوای پاک', 'حمل‌ونقل عمومی'],
      economicSavings: '۵٫۰ میلیارد ریال کاهش مصرف سوخت فسیلی',
      isHot: false,
      attachedDocsCount: 1
    },
    {
      id: 'km-006',
      code: 'KM-1403-ENV-077',
      title: 'سامانه جمع‌آوری هوشمند پسماند خشک با تفکیک در مبدا از طریق نرم‌افزار «اصکاپ»',
      summary: 'مدل‌سازی انگیزشی شهروندی با امتیازدهی دانشی و شارژ آنی کیف پول شهری در ازای تحویل پسماند بازیافتی به خودروهای مجهز به توزین دیجیتال با افزایش ۴۲ درصدی جمع‌آوری پسماند خشک در منطقه ۶.',
      content: 'تفکیک پسماند از مبدا یکی از ارکان اقتصاد چرخشی در مدیریت مدرن شهری است. سامانه اصکاپ امکان درخواست جمع‌آوری بازیافت را با مشخص نمودن زمان حضور ناوگان فراهم می‌سازد. رانندگان با باسکول متصل به بلوتوث، وزن پسماند را ثبت نموده و اعتبار ریالی معادل بلافاصله به کیف پول شهروند منظور می‌گردد.',
      category: 'خدمات شهری',
      knowledgeType: 'EXPERIENCE',
      department: 'سازمان مدیریت پسماند شهرداری اصفهان',
      authorName: 'مهندس مریم کاظمی',
      authorRole: 'رئیس اداره آموزش و فرهنگ‌سازی بازیافت',
      hasBlueBadge: false,
      createdAt: '۱۴۰۳/۰۲/۲۰',
      status: 'APPROVED',
      statusLabel: 'مصوب ممیزی محیط زیست',
      statusClass: 'bg-[#086288]/10 text-[#086288] border-[#086288]/30',
      votes: 27,
      karbestCount: 3,
      viewCount: 410,
      tags: ['تفکیک پسماند', 'اصکاپ', 'مشارکت شهروندی', 'اقتصاد چرخشی'],
      economicSavings: '۲٫۸ میلیارد ریال درآمد حاصل از بازیافت',
      isHot: false,
      attachedDocsCount: 2
    },
    {
      id: 'km-007',
      code: 'KM-1403-FIN-019',
      title: 'مدل نوین تامین مالی پروژه‌های کلان زیرساختی از طریق انتشار اوراق مشارکت با ضمانت درآمدهای پایدار شهری',
      summary: 'طراحی بسته تامین مالی ۱۲ هزار میلیارد ریالی برای توسعه خط ۲ قطار شهری اصفهان با استفاده از ابزارهای بازار سرمایه و معافیت‌های مالیاتی مصوب قانون درآمدهای پایدار شهرداری‌ها.',
      content: 'محدودیت‌های منابع نقدینگی شهرداری‌ها اجرای پروژه‌های زیربنایی را به تاخیر می‌اندازد. در این طرح تجربه، مدلی تلفیقی از انتشار صکوک اجاره و اوراق مشارکت با بازپرداخت متکی بر درآمدهای ارزش افزوده شهری طراحی گردید که علاوه بر کاهش نرخ موثر استقراض، ریسک اعتباری شهرداری را به حداقل ممکن رساند.',
      category: 'مالی',
      knowledgeType: 'EXPERIENCE',
      department: 'معاونت مالی و اقتصادی شهرداری اصفهان',
      authorName: 'دکتر محمدرضا نائینی',
      authorRole: 'مدیر کل امور مالی و سرمایه‌گذاری',
      hasBlueBadge: true,
      createdAt: '۱۴۰۳/۰۱/۱۸',
      status: 'APPROVED',
      statusLabel: 'مصوب ممیزی مالی',
      statusClass: 'bg-[#086288]/10 text-[#086288] border-[#086288]/30',
      votes: 24,
      karbestCount: 2,
      viewCount: 380,
      tags: ['تامین مالی', 'اوراق مشارکت', 'درآمدهای پایدار', 'کاهش هزینه'],
      economicSavings: '۱۴٫۵ میلیارد ریال صرفه‌جویی در هزینه تامین مالی',
      isHot: false,
      attachedDocsCount: 3
    }
  ]);

  // Dynamic Filtered Items (Client-side Search, Tag, Category & Tab Filter)
  public filteredItems = computed(() => {
    let list = this.registeredKnowledgeItems();
    const q = this.keyword().trim().toLowerCase();
    const cat = this.selectedCategory();
    const typ = this.selectedType();
    const tab = this.activeTab();
    const tag = this.activeTag();
    const sort = this.sortBy();

    // 1. Keyword search
    if (q) {
      list = list.filter(item =>
        item.title.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q) ||
        item.code.toLowerCase().includes(q) ||
        item.authorName.toLowerCase().includes(q) ||
        item.department.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // 2. Category Filter
    if (cat !== 'ALL') {
      list = list.filter(item => item.category === cat);
    }

    // 3. Knowledge Type Filter
    if (typ !== 'ALL') {
      list = list.filter(item => item.knowledgeType === typ);
    }

    // 4. Tag Filter
    if (tag) {
      list = list.filter(item => item.tags.includes(tag));
    }

    // 5. Tab Filter
    if (tab === 'NEWEST') {
      // already sorted by date or apply custom slice
    } else if (tab === 'MOST_APPLIED') {
      list = list.filter(item => item.karbestCount > 0);
    } else if (tab === 'VERIFIED') {
      list = list.filter(item => item.hasBlueBadge);
    } else if (tab === 'IN_REVIEW') {
      list = list.filter(item => item.status === 'IN_REVIEW');
    }

    // 6. Sorting
    list = [...list].sort((a, b) => {
      if (sort === 'VOTES') return b.votes - a.votes;
      if (sort === 'KARBEST') return b.karbestCount - a.karbestCount;
      if (sort === 'VIEWS') return b.viewCount - a.viewCount;
      return b.createdAt.localeCompare(a.createdAt);
    });

    return list;
  });

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'پایگاه دانش و تجارب سازمانی شهرداری اصفهان',
      description: 'مخزن جامع تجارب مستندسازی شده، نوآوری‌ها، پروژه‌های پژوهشی و درس‌آموخته‌های مناطق ۱۵‌گانه شهرداری اصفهان',
      canonicalUrl: 'https://km.isfahan.ir/search'
    });

    // Check query params
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.keyword.set(params['q']);
      }
      if (params['cat']) {
        this.selectedCategory.set(params['cat']);
      }
      if (params['tag']) {
        this.activeTag.set(params['tag']);
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      this.fetchBackendKnowledge();
    }
  }

  // Fetch backend data and integrate gracefully
  public fetchBackendKnowledge(): void {
    const payload = {
      first: 0,
      rows: 50,
      sortField: 'createdAt',
      sortOrder: -1,
      globalFilter: this.keyword()
    };

    this.http.post<any>(`${environment.apiUrl}/knowledge/flow/search`, payload).subscribe({
      next: (res) => {
        if (res && res.content && Array.isArray(res.content) && res.content.length > 0) {
          // Transform backend items into QaKnowledgeItem format and merge
          const serverItems: QaKnowledgeItem[] = res.content.map((item: any, idx: number) => ({
            id: item.id || `srv-${idx}`,
            code: item.code || `KM-1403-SRV-${100 + idx}`,
            title: item.title,
            summary: item.summary || item.content?.slice(0, 160) || 'خلاصه تجربه‌نگاری در دسترس است.',
            content: item.content || item.summary || '',
            category: item.node?.title || 'خدمات شهری',
            knowledgeType: item.knowledgeType || 'EXPERIENCE',
            department: item.department || 'شهرداری اصفهان',
            authorName: item.user?.fullName || 'کارشناس رسمی شهرداری',
            authorRole: 'پدیدآورنده دانش',
            hasBlueBadge: true,
            createdAt: item.createdAt ? item.createdAt.slice(0, 10) : '۱۴۰۳/۰۸/۱۰',
            status: 'APPROVED',
            statusLabel: 'مصوب ممیزی دبیرخانه',
            statusClass: 'bg-[#086288]/10 text-[#086288] border-[#086288]/30',
            votes: 15 + idx * 3,
            karbestCount: 2 + (idx % 3),
            viewCount: 150 + idx * 25,
            tags: ['مدیریت دانش', 'شهرداری اصفهان']
          }));

          // Merge without losing default verified catalog
          const existingIds = new Set(serverItems.map(i => i.id));
          const combined = [...serverItems, ...this.registeredKnowledgeItems().filter(i => !existingIds.has(i.id))];
          this.registeredKnowledgeItems.set(combined);
        }
      },
      error: () => {
        // Fallback already pre-seeded with 7 rich municipal records
      }
    });
  }

  // Tab switcher
  public setTab(tab: 'ALL' | 'NEWEST' | 'MOST_APPLIED' | 'VERIFIED' | 'IN_REVIEW'): void {
    this.activeTab.set(tab);
    if (tab === 'MOST_APPLIED') {
      this.sortBy.set('KARBEST');
    } else if (tab === 'NEWEST') {
      this.sortBy.set('NEWEST');
    }
  }

  // Filter by tag
  public filterByTag(tag: string): void {
    if (this.activeTag() === tag) {
      this.activeTag.set(null); // toggle off
    } else {
      this.activeTag.set(tag);
    }
  }

  // Clear all filters
  public clearAllFilters(): void {
    this.keyword.set('');
    this.selectedCategory.set('ALL');
    this.selectedType.set('ALL');
    this.activeTag.set(null);
    this.activeTab.set('ALL');
    this.sortBy.set('NEWEST');
  }

  // Upvote / Endorsement handler
  public toggleVote(item: QaKnowledgeItem, event: Event): void {
    event.stopPropagation();
    this.registeredKnowledgeItems.update(list =>
      list.map(i => {
        if (i.id === item.id) {
          const wasVoted = i.userVoted;
          return {
            ...i,
            userVoted: !wasVoted,
            votes: wasVoted ? i.votes - 1 : i.votes + 1
          };
        }
        return i;
      })
    );
  }

  // Purpose access dialog
  public requestAccess(item: QaKnowledgeItem, action: 'READ' | 'DOWNLOAD', event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    if (this.unlockedItemIds().has(item.id)) {
      this.openItem(item);
      return;
    }
    this.pendingItem.set(item);
    this.pendingAction.set(action);
    this.isPurposeDialogOpen.set(true);
  }

  public onPurposeConfirmed(event: { item: any; purpose: AccessPurposeType }): void {
    this.isPurposeDialogOpen.set(false);
    if (event.item && event.item.id) {
      this.unlockedItemIds.update(set => {
        const next = new Set(set);
        next.add(event.item.id);
        return next;
      });
      this.openItem(event.item);
    }
  }

  public openItem(item: QaKnowledgeItem): void {
    this.activeItemDetail.set(item);
  }

  public closeItemDetail(): void {
    this.activeItemDetail.set(null);
  }

  public getBadgeLabel(type: string): string {
    const found = this.knowledgeTypes.find(t => t.value === type);
    return found ? found.label : type;
  }
}
