import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { I18nService } from '../../core/services/i18n.service';
import { SeoService } from '../../core/services/seo.service';

interface KnowledgeItem {
  id: string;
  title: string;
  category: string;
  author: string;
  date: string;
  views: number;
  likes: number;
  tag: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  protected i18n = inject(I18nService);
  private seo = inject(SeoService);

  public featuredItems: KnowledgeItem[] = [
    {
      id: '1',
      title: 'مدیریت هوشمند پساب و آبیاری فضای سبز شهری در شرایط تنش آبی',
      category: 'خدمات شهری و محیط زیست',
      author: 'مهندس حسینی (معاونت خدمات شهری)',
      date: '۱۴۰۳/۰۸/۰۵',
      views: 342,
      likes: 48,
      tag: 'تجربه برتر'
    },
    {
      id: '2',
      title: 'پیاده‌سازی الگوریتم‌های هوش مصنوعی در پایش تقاطع‌های هوشمند ترافیکی اصفهان',
      category: 'فناوری اطلاعات و حمل و نقل',
      author: 'دکتر رجبی (سازمان فاوا)',
      date: '۱۴۰۳/۰۸/۰۲',
      views: 512,
      likes: 76,
      tag: 'نوآوری سازمانی'
    },
    {
      id: '3',
      title: 'بهینه‌سازی فرایند صدور پروانه ساختمانی الکترونیک از طریق سامانه سارینا',
      category: 'شهرسازی و معماری',
      author: 'مهندس ابراهیمی (منطقه ۳)',
      date: '۱۴۰۳/۰۷/۲۸',
      views: 289,
      likes: 35,
      tag: 'درس‌آموخته'
    }
  ];

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'صفحه نخست',
      description: 'سامانه جامع مدیریت دانش شهرداری اصفهان - بانک دانش، تجارب و نوآوری‌های پرسنل شهرداری',
      canonicalUrl: 'https://km.isfahan.ir/'
    });
  }
}
