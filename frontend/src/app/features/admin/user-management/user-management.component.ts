import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth.service';
import { SeoService } from '../../../core/services/seo.service';
import { environment } from '../../../../environments/environment';

export interface UserItem {
  id: string;
  fullName: string;
  username: string;
  email: string;
  phoneNumber?: string;
  department: string;
  roles: string[];
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: string;
  knowledgeCount?: number;
  evaluationsCount?: number;
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './user-management.component.html',
  styleUrl: './user-management.component.scss'
})
export class UserManagementComponent implements OnInit {
  public auth = inject(AuthService);
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private seo = inject(SeoService);

  public searchQuery = signal<string>('');
  public selectedRole = signal<string>('all');
  public selectedStatus = signal<string>('all');
  public isModalOpen = signal<boolean>(false);
  public editingUserId = signal<string | null>(null);
  public isLoading = signal<boolean>(false);
  public successMessage = signal<string | null>(null);

  // Mock initial enterprise users + backend synchronization
  public users = signal<UserItem[]>([
    {
      id: 'u1',
      fullName: 'مهندس محمدرضا حسینی',
      username: 'admin',
      email: 'm.hosseini@isfahan.ir',
      phoneNumber: '09131112233',
      department: 'معاونت برنامه‌ریزی و فاوا',
      roles: ['ADMIN', 'EVALUATOR', 'EXPERT'],
      status: 'ACTIVE',
      createdAt: '۱۴۰۲/۰۶/۱۵',
      knowledgeCount: 24,
      evaluationsCount: 88
    },
    {
      id: 'u2',
      fullName: 'دکتر علی صادقی',
      username: 'evaluator',
      email: 'a.sadeghi@isfahan.ir',
      phoneNumber: '09132223344',
      department: 'شورای عالی ممیزی و پژوهش',
      roles: ['EVALUATOR'],
      status: 'ACTIVE',
      createdAt: '۱۴۰۲/۰۸/۱۰',
      knowledgeCount: 12,
      evaluationsCount: 142
    },
    {
      id: 'u3',
      fullName: 'مهندس سارا ابراهیمی',
      username: 'expert',
      email: 's.ebrahimi@isfahan.ir',
      phoneNumber: '09133334455',
      department: 'شهرداری منطقه ۳ اصفهان',
      roles: ['EXPERT'],
      status: 'ACTIVE',
      createdAt: '۱۴۰۳/۰۱/۲۰',
      knowledgeCount: 31,
      evaluationsCount: 0
    },
    {
      id: 'u4',
      fullName: 'دکتر بهنام رجبی',
      username: 'b.rajabi',
      email: 'b.rajabi@isfahan.ir',
      phoneNumber: '09134445566',
      department: 'سازمان فاوا (فناوری اطلاعات)',
      roles: ['EVALUATOR', 'EXPERT'],
      status: 'ACTIVE',
      createdAt: '۱۴۰۲/۱۱/۰۴',
      knowledgeCount: 19,
      evaluationsCount: 65
    },
    {
      id: 'u5',
      fullName: 'مهندس مریم کاظمی',
      username: 'm.kazemi',
      email: 'm.kazemi@isfahan.ir',
      phoneNumber: '09135556677',
      department: 'معاونت خدمات شهری و محیط زیست',
      roles: ['EXPERT'],
      status: 'INACTIVE',
      createdAt: '۱۴۰۳/۰۴/۱۲',
      knowledgeCount: 6,
      evaluationsCount: 0
    },
    {
      id: 'u6',
      fullName: 'دکتر وحید رحمانی',
      username: 'v.rahmani',
      email: 'v.rahmani@isfahan.ir',
      phoneNumber: '09136667788',
      department: 'معاونت حمل و نقل و ترافیک',
      roles: ['EVALUATOR'],
      status: 'ACTIVE',
      createdAt: '۱۴۰۳/۰۲/۱۸',
      knowledgeCount: 8,
      evaluationsCount: 42
    }
  ]);

  // Reactive Form for Create / Edit
  public userForm = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    phoneNumber: ['', [Validators.pattern(/^09\d{9}$/)]],
    department: ['', Validators.required],
    password: [''],
    status: ['ACTIVE', Validators.required],
    roleAdmin: [false],
    roleEvaluator: [false],
    roleExpert: [true]
  });

  // Filtered Users Computed List
  public filteredUsers = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    const role = this.selectedRole();
    const status = this.selectedStatus();

    return this.users().filter(u => {
      const matchQuery = !q ||
        u.fullName.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.department.toLowerCase().includes(q);

      const matchRole = role === 'all' || u.roles.includes(role);
      const matchStatus = status === 'all' || u.status === status;

      return matchQuery && matchRole && matchStatus;
    });
  });

  // Quick statistics
  public stats = computed(() => {
    const all = this.users();
    return {
      total: all.length,
      admins: all.filter(u => u.roles.includes('ADMIN')).length,
      evaluators: all.filter(u => u.roles.includes('EVALUATOR')).length,
      active: all.filter(u => u.status === 'ACTIVE').length
    };
  });

  ngOnInit(): void {
    this.seo.updateMetadata({
      title: 'مدیریت کاربران و دسترسی‌ها | سامانه مدیریت دانش شهرداری اصفهان',
      description: 'مدیریت پرسنل، سطوح دسترسی، نقش‌های ارزیابی و وضعیت کاربران سامانه مدیریت دانش',
      canonicalUrl: 'https://km.isfahan.ir/admin/users'
    });

    this.fetchUsersFromBackend();
  }

  public fetchUsersFromBackend(): void {
    this.isLoading.set(true);
    this.http.get<any>(`${environment.apiUrl}/users`).subscribe({
      next: (res) => {
        this.isLoading.set(false);
        if (res?.content && Array.isArray(res.content) && res.content.length > 0) {
          const mapped: UserItem[] = res.content.map((item: any) => ({
            id: item.id,
            fullName: item.fullName || item.username,
            username: item.username,
            email: item.email || `${item.username}@isfahan.ir`,
            phoneNumber: item.phoneNumber || '-',
            department: 'شهرداری اصفهان',
            roles: Array.isArray(item.roles) ? item.roles.map((r: any) => r.name || r) : ['EXPERT'],
            status: item.status === 'ACTIVE' ? 'ACTIVE' : 'INACTIVE',
            createdAt: '۱۴۰۳/۰۱/۰۱',
            knowledgeCount: 0,
            evaluationsCount: 0
          }));
          this.users.set(mapped);
        }
      },
      error: () => {
        // Fallback to local default users for demo / resilience
        this.isLoading.set(false);
      }
    });
  }

  public openCreateModal(): void {
    this.editingUserId.set(null);
    this.userForm.reset({
      fullName: '',
      username: '',
      email: '',
      phoneNumber: '',
      department: 'معاونت خدمات شهری',
      password: '',
      status: 'ACTIVE',
      roleAdmin: false,
      roleEvaluator: false,
      roleExpert: true
    });
    this.isModalOpen.set(true);
  }

  public openEditModal(user: UserItem): void {
    this.editingUserId.set(user.id);
    this.userForm.patchValue({
      fullName: user.fullName,
      username: user.username,
      email: user.email,
      phoneNumber: user.phoneNumber || '',
      department: user.department,
      password: '',
      status: user.status,
      roleAdmin: user.roles.includes('ADMIN'),
      roleEvaluator: user.roles.includes('EVALUATOR'),
      roleExpert: user.roles.includes('EXPERT')
    });
    this.isModalOpen.set(true);
  }

  public closeModal(): void {
    this.isModalOpen.set(false);
    this.editingUserId.set(null);
  }

  public toggleUserStatus(user: UserItem): void {
    const nextStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    this.users.update(list => list.map(u => u.id === user.id ? { ...u, status: nextStatus } : u));
    this.showToast(`وضعیت کاربر "${user.fullName}" به ${nextStatus === 'ACTIVE' ? 'فعال' : 'غیرفعال'} تغییر یافت.`);
  }

  public deleteUser(user: UserItem): void {
    if (confirm(`آیا از حذف دسترسی کاربر "${user.fullName}" اطمینان دارید؟`)) {
      this.users.update(list => list.filter(u => u.id !== user.id));
      this.showToast(`کاربر "${user.fullName}" با موفقیت حذف شد.`);
    }
  }

  public onSaveUser(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    const val = this.userForm.value;
    const roles: string[] = [];
    if (val.roleAdmin) roles.push('ADMIN');
    if (val.roleEvaluator) roles.push('EVALUATOR');
    if (val.roleExpert || roles.length === 0) roles.push('EXPERT');

    const editId = this.editingUserId();

    if (editId) {
      // Update
      this.users.update(list => list.map(u => {
        if (u.id === editId) {
          return {
            ...u,
            fullName: val.fullName!,
            username: val.username!,
            email: val.email!,
            phoneNumber: val.phoneNumber || '',
            department: val.department!,
            status: val.status as 'ACTIVE' | 'INACTIVE',
            roles
          };
        }
        return u;
      }));
      this.showToast('اطلاعات کاربر با موفقیت ویرایش شد.');
    } else {
      // Create new
      const newUser: UserItem = {
        id: 'u_' + Date.now(),
        fullName: val.fullName!,
        username: val.username!,
        email: val.email!,
        phoneNumber: val.phoneNumber || '',
        department: val.department || 'شهرداری اصفهان',
        roles,
        status: (val.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
        createdAt: 'امروز',
        knowledgeCount: 0,
        evaluationsCount: 0
      };
      this.users.update(list => [newUser, ...list]);
      this.showToast('کاربر جدید با موفقیت به سامانه افزوده شد.');
    }

    this.closeModal();
  }

  public getRoleBadgeClass(role: string): string {
    switch (role) {
      case 'ADMIN':
        return 'bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-900/60';
      case 'EVALUATOR':
        return 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/60';
      case 'EXPERT':
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700';
    }
  }

  public getRoleLabel(role: string): string {
    switch (role) {
      case 'ADMIN': return 'مدیر سیستم';
      case 'EVALUATOR': return 'ارزیاب / داور';
      case 'EXPERT': return 'خبره / کارشناس';
      default: return role;
    }
  }

  private showToast(msg: string): void {
    this.successMessage.set(msg);
    setTimeout(() => this.successMessage.set(null), 4000);
  }
}

