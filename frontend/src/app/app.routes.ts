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
      }
    ]
  },
  {
    path: '**',
    redirectTo: ''
  }
];
