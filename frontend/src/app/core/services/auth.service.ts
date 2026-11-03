import { Injectable, inject, signal, computed, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';

export interface UserSession {
  username: string;
  fullName: string;
  token: string;
  tokenType: string;
  roles: string[];
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private platformId = inject(PLATFORM_ID);
  private router = inject(Router);

  public currentUser = signal<UserSession | null>(null);
  public token = signal<string | null>(null);

  public isLoggedIn = computed(() => !!this.currentUser() && !!this.token());
  public isAdmin = computed(() => {
    const roles = this.currentUser()?.roles;
    return Array.isArray(roles) && roles.includes('ADMIN');
  });

  public isEvaluator = computed(() => {
    const roles = this.currentUser()?.roles;
    return Array.isArray(roles) && (roles.includes('EVALUATOR') || roles.includes('ADMIN'));
  });

  public isExpert = computed(() => {
    const roles = this.currentUser()?.roles;
    return Array.isArray(roles) && (roles.includes('EXPERT') || roles.includes('ADMIN') || roles.includes('EVALUATOR'));
  });

  public hasRole(role: string): boolean {
    const roles = this.currentUser()?.roles;
    if (!Array.isArray(roles)) return false;
    return roles.includes(role) || roles.includes('ADMIN');
  }

  public quickLoginAs(role: 'ADMIN' | 'EVALUATOR' | 'EXPERT'): void {
    const profileMap = {
      ADMIN: {
        username: 'admin',
        fullName: 'مهندس حسینی (مدیر ارشد سامانه)',
        roles: ['ADMIN', 'EVALUATOR', 'EXPERT'],
        token: 'mock-jwt-admin-token',
        tokenType: 'Bearer'
      },
      EVALUATOR: {
        username: 'evaluator',
        fullName: 'دکتر صادقی (ارزیاب و داور ارشد)',
        roles: ['EVALUATOR'],
        token: 'mock-jwt-evaluator-token',
        tokenType: 'Bearer'
      },
      EXPERT: {
        username: 'expert',
        fullName: 'مهندس ابراهیمی (کارشناس و خبره)',
        roles: ['EXPERT'],
        token: 'mock-jwt-expert-token',
        tokenType: 'Bearer'
      }
    };

    this.setSession(profileMap[role]);
  }

  constructor() {
    this.restoreSession();
  }

  public restoreSession(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        const storedUser = localStorage.getItem('km_user');
        const storedToken = localStorage.getItem('km_token');
        if (storedUser && storedToken) {
          this.currentUser.set(JSON.parse(storedUser));
          this.token.set(storedToken);
        }
      } catch (e) {
        console.error('Failed to restore user session:', e);
      }
    }
  }

  public setSession(session: UserSession): void {
    this.currentUser.set(session);
    this.token.set(session.token);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('km_token', session.token);
      localStorage.setItem('km_user', JSON.stringify(session));
    }
  }

  public logout(): void {
    this.currentUser.set(null);
    this.token.set(null);
    if (isPlatformBrowser(this.platformId)) {
      localStorage.removeItem('km_token');
      localStorage.removeItem('km_user');
    }
    this.router.navigate(['/auth/login']);
  }
}

