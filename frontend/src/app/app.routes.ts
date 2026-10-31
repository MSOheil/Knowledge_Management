import { Routes } from '@angular/router';
import { AppLayoutComponent } from './layout/app-layout.component';

export const routes: Routes = [
  {
    path: '',
    component: AppLayoutComponent,
    children: [
      {
        path: '',
        loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent),
        title: 'صفحه نخست | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'auth/login',
        loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
        title: 'ورود به سامانه | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'admin/knowledge-tree',
        loadComponent: () => import('./features/admin/knowledge-tree/knowledge-tree.component').then(m => m.KnowledgeTreeComponent),
        title: 'مدیریت درخت دانش | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'knowledge-tree',
        loadComponent: () => import('./features/admin/knowledge-tree/knowledge-tree.component').then(m => m.KnowledgeTreeComponent),
        title: 'درخت دانش | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'knowledge/submit',
        loadComponent: () => import('./features/knowledge/knowledge-form/knowledge-form.component').then(m => m.KnowledgeFormComponent),
        title: 'ثبت دانش جدید | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'submit-knowledge',
        loadComponent: () => import('./features/knowledge/knowledge-form/knowledge-form.component').then(m => m.KnowledgeFormComponent),
        title: 'ثبت دانش جدید | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'admin/form-builder',
        loadComponent: () => import('./features/admin/form-builder/form-builder.component').then(m => m.FormBuilderComponent),
        title: 'طراحی فرم‌های پویا | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'admin/evaluations',
        loadComponent: () => import('./features/admin/evaluator-cartable/evaluator-cartable.component').then(m => m.EvaluatorCartableComponent),
        title: 'کارتابل ارزیابی دانش | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'evaluations',
        loadComponent: () => import('./features/admin/evaluator-cartable/evaluator-cartable.component').then(m => m.EvaluatorCartableComponent),
        title: 'کارتابل ارزیابی دانش | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'evaluation',
        loadComponent: () => import('./features/admin/evaluator-cartable/evaluator-cartable.component').then(m => m.EvaluatorCartableComponent),
        title: 'کارتابل ارزیابی دانش | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'search',
        loadComponent: () => import('./features/knowledge/knowledge-search/knowledge-search.component').then(m => m.KnowledgeSearchComponent),
        title: 'جستجوی پیشرفته دانش | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'knowledge/search',
        loadComponent: () => import('./features/knowledge/knowledge-search/knowledge-search.component').then(m => m.KnowledgeSearchComponent),
        title: 'جستجوی پیشرفته دانش | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'karbest',
        loadComponent: () => import('./features/knowledge/karbest-form/karbest-form.component').then(m => m.KarbestFormComponent),
        title: 'ثبت کاربست دانش | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'knowledge/karbest',
        loadComponent: () => import('./features/knowledge/karbest-form/karbest-form.component').then(m => m.KarbestFormComponent),
        title: 'ثبت کاربست دانش | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'forum',
        loadComponent: () => import('./features/forum/forum.component').then(m => m.ForumComponent),
        title: 'تالار پرسش و پاسخ سازمانی | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'communities',
        loadComponent: () => import('./features/forum/forum.component').then(m => m.ForumComponent),
        title: 'تالار پرسش و پاسخ سازمانی | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'experts',
        loadComponent: () => import('./features/experts/expert-directory/expert-directory.component').then(m => m.ExpertDirectoryComponent),
        title: 'بانک خبرگان سازمانی | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'expert-directory',
        loadComponent: () => import('./features/experts/expert-directory/expert-directory.component').then(m => m.ExpertDirectoryComponent),
        title: 'بانک خبرگان سازمانی | سامانه مدیریت دانش شهرداری اصفهان'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
