// src/app/app.routes.ts

import { Routes } from '@angular/router';
import { authGuard, guestGuard } from './iam/application/auth.guard';

export const routes: Routes = [
  // ── Default redirect ───────────────────────────────────────────────────────
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },


  {
    path: 'home',
    loadComponent: () => import('./fleet/presentation/pages/home/home').then((m) => m.Home),
  },
  // ── IAM (guest-only) ───────────────────────────────────────────────────────

  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./iam/presentation/pages/register/register').then((m) => m.Register),
  },

  // ── Profile (protected, standalone) ───────────────────────────────────────
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./iam/presentation/pages/profile/profile').then((m) => m.Profile),
  },
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./iam/presentation/pages/login/login').then((m) => m.Login),
  },


  // ── Catch-all ──────────────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'login',
  },
];
