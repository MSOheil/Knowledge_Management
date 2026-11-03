import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { I18nService } from '../../../core/services/i18n.service';
import { SeoService } from '../../../core/services/seo.service';
import { AuthService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  protected i18n = inject(I18nService);
  protected auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);
  private seo = inject(SeoService);

  public isLoading = signal<boolean>(false);
  public errorMessage = signal<string | null>(null);
  public showPassword = signal<boolean>(false);

  public loginForm = this.fb.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    password: ['', [Validators.required, Validators.minLength(6)]],
    rememberMe: [false]
  });

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'ورود به سامانه',
      description: 'ورود پرسنل و مدیران شهرداری اصفهان به سامانه جامع مدیریت دانش',
      canonicalUrl: 'https://km.isfahan.ir/auth/login'
    });
  }

  public toggleShowPassword(): void {
    this.showPassword.update(v => !v);
  }

  public fillAdminCredentials(): void {
    this.loginForm.patchValue({
      username: 'admin',
      password: '123456'
    });
  }

  public quickRoleLogin(role: 'ADMIN' | 'EVALUATOR' | 'EXPERT'): void {
    this.auth.quickLoginAs(role);
    this.router.navigate(['/']);
  }

  public onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set(null);

    const payload = {
      username: this.loginForm.value.username,
      password: this.loginForm.value.password
    };

    this.http.post<any>(`${environment.apiUrl}/auth/login`, payload).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res?.token) {
          this.auth.setSession(res);
        }
        this.router.navigate(['/']);
      },
      error: (err) => {
        this.isLoading.set(false);
        this.errorMessage.set(
          err.error?.message || 'نام کاربری یا رمز عبور اشتباه است.'
        );
      }
    });
  }
}
