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
      const savedTheme = localStorage.getItem('theme_mode');
      if (savedTheme === 'dark') {
        this.isDarkMode.set(true);
        document.documentElement.classList.add('dark');
      } else {
        this.isDarkMode.set(false);
        document.documentElement.classList.remove('dark');
      }
    }

    effect(() => {
      const dark = this.isDarkMode();
      if (isPlatformBrowser(this.platformId)) {
        if (dark) {
          document.documentElement.classList.add('dark');
          localStorage.setItem('theme_mode', 'dark');
        } else {
          document.documentElement.classList.remove('dark');
          localStorage.setItem('theme_mode', 'light');
        }
      }
    });
  }

  public toggleTheme(): void {
    this.isDarkMode.update(d => !d);
  }
}
