import { Injectable, signal, inject, PLATFORM_ID, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { DirectionService } from './direction.service';
import { HttpClient } from '@angular/common/http';

export type Language = 'fa' | 'en';

@Injectable({
  providedIn: 'root'
})
export class I18nService {
  private platformId = inject(PLATFORM_ID);
  private directionService = inject(DirectionService);
  private http = inject(HttpClient);

  public currentLang = signal<Language>('fa');
  private translations = signal<Record<string, any>>({});

  constructor() {
    this.loadTranslations(this.currentLang());
  }

  public setLanguage(lang: Language): void {
    this.currentLang.set(lang);
    if (lang === 'fa') {
      this.directionService.setDirection('rtl');
    } else {
      this.directionService.setDirection('ltr');
    }

    if (isPlatformBrowser(this.platformId)) {
      document.documentElement.setAttribute('lang', lang);
      localStorage.setItem('km_preferred_lang', lang);
    }

    this.loadTranslations(lang);
  }

  public toggleLanguage(): void {
    const nextLang = this.currentLang() === 'fa' ? 'en' : 'fa';
    this.setLanguage(nextLang);
  }

  private loadTranslations(lang: Language): void {
    this.http.get<Record<string, any>>(`assets/i18n/${lang}.json`).subscribe({
      next: (data) => this.translations.set(data),
      error: () => {
        // Fallback or maintain current state
      }
    });
  }

  public translate(key: string): string {
    const dict = this.translations();
    const parts = key.split('.');
    let current: any = dict;

    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part];
      } else {
        return key;
      }
    }

    return typeof current === 'string' ? current : key;
  }
}
