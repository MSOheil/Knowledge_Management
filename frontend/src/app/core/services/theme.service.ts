import { Injectable, signal, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  public isDarkMode = signal<boolean>(false);

  constructor() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('km_theme');
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        this.isDarkMode.set(true);
      }
    }

    effect(() => {
      const dark = this.isDarkMode();
      if (isPlatformBrowser(this.platformId)) {
        if (dark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('km_theme', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('km_theme', 'light');
        }
      }
    });
  }

  public toggleTheme(): void {
    this.isDarkMode.update(d => !d);
  }
}
