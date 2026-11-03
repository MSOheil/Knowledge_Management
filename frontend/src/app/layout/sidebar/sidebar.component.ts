import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LayoutService } from '../../core/services/layout.service';
import { AuthService } from '../../core/services/auth.service';

export interface NavItem {
  id: string;
  label: string;
  route: string;
  piIcon: string;
  icon?: string;
  badge?: string;
  badgeClass?: string;
  exact?: boolean;
  group: 'public' | 'workspace' | 'evaluation' | 'admin';
  roles?: string[];
  requiresAuth?: boolean;
}

export interface NavGroup {
  key: string;
  title: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  public layout = inject(LayoutService);
  public auth = inject(AuthService);
  private router = inject(Router);

  public readonly allNavItems: NavItem[] = [
    // 1. Public Group
    {
      id: 'home',
      label: 'معرفی سامانه (صفحه اصلی)',
      route: '/',
      exact: true,
      group: 'public',
      piIcon: 'pi pi-home'
    },
    {
      id: 'dashboard',
      label: 'داشبورد هوش سازمانی',
      route: '/admin/analytics',
      group: 'public',
      piIcon: 'pi pi-chart-bar'
    },
    {
      id: 'knowledge-base',
      label: 'پایگاه تجارب و دانش کاربران',
      route: '/search',
      group: 'public',
      piIcon: 'pi pi-book'
    },
    {
      id: 'categories',
      label: 'درخت دانش شهرداری',
      route: '/knowledge-tree',
      group: 'public',
      piIcon: 'pi pi-sitemap'
    },
    {
      id: 'experts',
      label: 'بانک خبرگان سازمانی',
      route: '/experts',
      group: 'public',
      piIcon: 'pi pi-users'
    },

    // 2. Workspace Group
    {
      id: 'submit-knowledge',
      label: 'ثبت تجربه دانش جدید',
      route: '/submit-knowledge',
      group: 'workspace',
      requiresAuth: true,
      roles: ['EXPERT', 'EVALUATOR', 'ADMIN'],
      piIcon: 'pi pi-sparkles'
    },
    {
      id: 'karbest',
      label: 'ثبت کاربست و اثربخشی',
      route: '/karbest',
      group: 'workspace',
      requiresAuth: true,
      roles: ['EXPERT', 'EVALUATOR', 'ADMIN'],
      piIcon: 'pi pi-check-circle'
    },
    {
      id: 'communities',
      label: 'تالار گفتگو و هم‌اندیشی',
      route: '/communities',
      group: 'workspace',
      requiresAuth: true,
      roles: ['EXPERT', 'EVALUATOR', 'ADMIN'],
      piIcon: 'pi pi-comments'
    },
    {
      id: 'campaigns',
      label: 'پویش‌های تجربی شهری',
      route: '/panels',
      group: 'workspace',
      requiresAuth: true,
      badge: 'فعال',
      roles: ['EXPERT', 'EVALUATOR', 'ADMIN'],
      piIcon: 'pi pi-megaphone'
    },
    {
      id: 'transcript',
      label: 'کارنامه دانشی من',
      route: '/transcript',
      group: 'workspace',
      requiresAuth: true,
      roles: ['EXPERT', 'EVALUATOR', 'ADMIN'],
      piIcon: 'pi pi-id-card'
    },

    // 3. Evaluation Group
    {
      id: 'evaluations',
      label: 'کارتابل داوری و ممیزی',
      route: '/evaluations',
      group: 'evaluation',
      requiresAuth: true,
      badge: '۳۴',
      roles: ['EVALUATOR', 'ADMIN'],
      piIcon: 'pi pi-shield'
    },

    // 4. Admin Group
    {
      id: 'admin-users',
      label: 'مدیریت کاربران و دسترسی‌ها',
      route: '/admin/users',
      group: 'admin',
      requiresAuth: true,
      badge: 'ادمین',
      roles: ['ADMIN'],
      piIcon: 'pi pi-user-plus'
    },
    {
      id: 'admin-forms',
      label: 'طراحی فرم‌های پویا',
      route: '/admin/form-builder',
      group: 'admin',
      requiresAuth: true,
      roles: ['ADMIN'],
      piIcon: 'pi pi-sliders-h'
    },
    {
      id: 'admin-workflows',
      label: 'گردش‌کار و فرآیندساز',
      route: '/admin/workflows',
      group: 'admin',
      requiresAuth: true,
      roles: ['ADMIN'],
      piIcon: 'pi pi-sync'
    },
    {
      id: 'admin-secretariats',
      label: 'دبیرخانه‌های تخصصی',
      route: '/admin/secretariats',
      group: 'admin',
      requiresAuth: true,
      roles: ['ADMIN'],
      piIcon: 'pi pi-building'
    },
    {
      id: 'admin-ranking',
      label: 'پاداش‌ها و رتبه‌بندی',
      route: '/admin/committee-ranking',
      group: 'admin',
      requiresAuth: true,
      roles: ['ADMIN'],
      piIcon: 'pi pi-wallet'
    }
  ];

  public visibleNavGroups = computed<NavGroup[]>(() => {
    const isLoggedIn = this.auth.isLoggedIn();
    const isAdmin = this.auth.isAdmin();
    const isEvaluator = this.auth.isEvaluator();

    const filterItems = (groupKey: string) => {
      return this.allNavItems.filter(item => {
        if (item.group !== groupKey) return false;
        if (item.requiresAuth && !isLoggedIn) return false;
        if (item.roles && item.roles.length > 0) {
          if (item.roles.includes('ADMIN') && isAdmin) return true;
          if (item.roles.includes('EVALUATOR') && isEvaluator) return true;
          if (item.roles.includes('EXPERT') && isLoggedIn) return true;
          return false;
        }
        return true;
      });
    };

    const groups: NavGroup[] = [
      { key: 'public', title: 'بخش عمومی', items: filterItems('public') },
      { key: 'workspace', title: 'میز کار همکاران', items: filterItems('workspace') },
      { key: 'evaluation', title: 'داوری و ممیزی', items: filterItems('evaluation') },
      { key: 'admin', title: 'مدیریت و حاکمیت سیستم', items: filterItems('admin') }
    ];

    return groups.filter(g => g.items.length > 0);
  });

  public handleItemClick(item: NavItem): void {
    this.layout.closeMobileSidebar();
    this.layout.openTab({
      id: item.id,
      title: item.label,
      route: item.route
    });
  }

  public logout(): void {
    this.auth.logout();
    this.layout.closeMobileSidebar();
    this.router.navigate(['/']);
  }

  public onRoleChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    const role = select.value;
    if (role === 'ADMIN') {
      this.auth.quickLoginAs('ADMIN');
    } else if (role === 'EVALUATOR') {
      this.auth.quickLoginAs('EVALUATOR');
    } else {
      this.auth.quickLoginAs('EXPERT');
    }
  }
}
