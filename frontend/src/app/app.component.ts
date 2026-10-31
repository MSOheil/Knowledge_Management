import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DirectionService } from './core/services/direction.service';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  protected directionService = inject(DirectionService);
  private seoService = inject(SeoService);

  ngOnInit(): void {
    this.seoService.updateMetadata({
      title: 'سامانه جامع مدیریت دانش',
      description: 'سامانه جامع مدیریت دانش شهرداری اصفهان - ثبت تجارب و نوآوری‌های سازمانی',
      canonicalUrl: 'https://km.isfahan.ir/'
    });

    this.seoService.setJsonLd({
      '@context': 'https://schema.org',
      '@type': 'GovernmentOrganization',
      'name': 'شهرداری اصفهان - سامانه مدیریت دانش',
      'url': 'https://km.isfahan.ir',
      'logo': 'https://km.isfahan.ir/assets/icons/icon-512x512.png',
      'description': 'بستر ثبت و تبادل دانش و درس‌آموخته‌های پرسنل شهرداری اصفهان'
    });
  }
}
