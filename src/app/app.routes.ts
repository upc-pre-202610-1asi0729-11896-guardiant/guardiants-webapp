// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './iam/application/auth.guard';

export const routes: Routes = [
  // ── Default redirect ──────────────────────────────────────────────────────
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ── Guest-only ────────────────────────────────────────────────────────────
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./iam/presentation/pages/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./iam/presentation/pages/register/register').then((m) => m.Register),
  },

  // ── Protected shell (sidebar + topbar viven aquí) ─────────────────────────
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/presentation/shell/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      {
        path: 'home',
        loadComponent: () => import('./fleet/presentation/pages/home/home').then((m) => m.Home),
      },
      {
        path: 'live-status',
        loadComponent: () =>
          import('./fleet/presentation/pages/live-status/live-status').then((m) => m.LiveStatus),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./iam/presentation/pages/profile/profile').then((m) => m.Profile),
      },
       {
         path: 'security-alert',
         loadComponent: () =>
           import('./alerting/presentation/pages/security-alert/security-alert').then(
             (m) => m.SecurityAlert,
           ),
       },
       {
         path: 'devices',
         loadComponent: () =>
           import('./fleet/presentation/pages/devices/devices').then((m) => m.Devices),
       },
       {
         path: 'subscriptions',
         loadComponent: () =>
           import('./suscription/presentation/pages/subscriptions/subscriptions').then(
             (m) => m.Subscriptions,
           ),
       },
       {
         path: 'operational-reports',
         loadComponent: () =>
           import('./query/presentation/pages/operational-reports/operational-reports').then(
             (m) => m.OperationalReports,
           ),
       },
      // Aquí irán las futuras rutas protegidas: routes-history, configuration, etc.
      { path: '', redirectTo: 'home', pathMatch: 'full' },
    ],
  },

  // ── Catch-all ─────────────────────────────────────────────────────────────
  { path: '**', redirectTo: 'login' },
];
