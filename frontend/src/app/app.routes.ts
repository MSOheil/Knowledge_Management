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
        path: 'admin/users',
        loadComponent: () => import('./features/admin/user-management/user-management.component').then(m => m.UserManagementComponent),
        title: 'مدیریت کاربران و دسترسی‌ها | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'users',
        redirectTo: 'admin/users'
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
        path: 'dashboard',
        redirectTo: 'admin/analytics'
      },
      {
        path: 'knowledge',
        loadComponent: () => import('./features/knowledge/knowledge-search/knowledge-search.component').then(m => m.KnowledgeSearchComponent),
        title: 'پایگاه دانش و تجارب سازمانی | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'knowledge/catalog',
        loadComponent: () => import('./features/knowledge/knowledge-search/knowledge-search.component').then(m => m.KnowledgeSearchComponent),
        title: 'فهرست تجارب و دانش سازمانی | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'search',
        loadComponent: () => import('./features/knowledge/knowledge-search/knowledge-search.component').then(m => m.KnowledgeSearchComponent),
        title: 'پایگاه دانش و تجارب سازمانی | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'knowledge/search',
        loadComponent: () => import('./features/knowledge/knowledge-search/knowledge-search.component').then(m => m.KnowledgeSearchComponent),
        title: 'پایگاه دانش و تجارب سازمانی | سامانه مدیریت دانش شهرداری اصفهان'
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
      },
      {
        path: 'admin/analytics',
        loadComponent: () => import('./features/admin/analytics-dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
        title: 'داشبورد هوش سازمانی | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'analytics',
        loadComponent: () => import('./features/admin/analytics-dashboard/analytics-dashboard.component').then(m => m.AnalyticsDashboardComponent),
        title: 'داشبورد هوش سازمانی | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'transcript',
        loadComponent: () => import('./features/gamification/knowledge-transcript/knowledge-transcript.component').then(m => m.KnowledgeTranscriptComponent),
        title: 'کارنامه دانشی همکار | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'gamification/transcript',
        loadComponent: () => import('./features/gamification/knowledge-transcript/knowledge-transcript.component').then(m => m.KnowledgeTranscriptComponent),
        title: 'کارنامه دانشی همکار | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'admin/bonuses',
        loadComponent: () => import('./features/admin/bonus-export/bonus-export.component').then(m => m.BonusExportComponent),
        title: 'گزارش پاداش‌های انگیزشی | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'admin/committee-ranking',
        loadComponent: () => import('./features/admin/committee-ranking/committee-ranking.component').then(m => m.CommitteeRankingComponent),
        title: 'رتبه‌بندی کمیته‌های داوری | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'panels',
        loadComponent: () => import('./features/panels/panel-explorer/panel-explorer.component').then(m => m.PanelExplorerComponent),
        title: 'پویش‌های تجربه سازمانی | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'panels/:id',
        loadComponent: () => import('./features/panels/panel-detail/panel-detail.component').then(m => m.PanelDetailComponent),
        title: 'جزییات پویش تجربی | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'panels/:id/synthesis',
        loadComponent: () => import('./features/panels/panel-synthesis/panel-synthesis.component').then(m => m.PanelSynthesisComponent),
        title: 'سنتز و تجمیع تجارب پویش | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'admin/workflows',
        loadComponent: () => import('./features/admin/workflow-builder/workflow-builder.component').then(m => m.WorkflowBuilderComponent),
        title: 'طراحی گردش‌کارهای پویا | سامانه مدیریت دانش شهرداری اصفهان'
      },
      {
        path: 'admin/secretariats',
        loadComponent: () => import('./features/admin/secretariats/secretariat-list.component').then(m => m.SecretariatListComponent),
        title: 'مدیریت دبیرخانه‌های تخصصی | سامانه مدیریت دانش شهرداری اصفهان'
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
