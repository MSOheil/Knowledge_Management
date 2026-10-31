import { Injectable, signal, inject, PLATFORM_ID, effect } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export type Direction = 'rtl' | 'ltr';

@Injectable({
  providedIn: 'root'
})
export class DirectionService {
  private platformId = inject(PLATFORM_ID);
  public currentDirection = signal<Direction>('rtl');

  constructor() {
    effect(() => {
      const dir = this.currentDirection();
      if (isPlatformBrowser(this.platformId)) {
        document.documentElement.setAttribute('dir', dir);
      }
    });
  }

  public setDirection(direction: Direction): void {
    this.currentDirection.set(direction);
  }

  public toggleDirection(): void {
    this.currentDirection.update(d => d === 'rtl' ? 'ltr' : 'rtl');
  }

  public isRtl(): boolean {
    return this.currentDirection() === 'rtl';
  }
}
