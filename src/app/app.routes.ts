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

  // ── IAM (guest-only) ───────────────────────────────────────────────────────
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

  // ── Profile (protected, standalone) ───────────────────────────────────────
  {
    path: 'profile',
    canActivate: [authGuard],
    loadComponent: () => import('./iam/presentation/pages/profile/profile').then((m) => m.Profile),
  },

  // ── Fleet / dashboard routes (protected) ──────────────────────────────────
  // Agrega aquí las rutas de src/app/fleet/ una vez que crees los componentes.
  // Ejemplo:
  // {
  //   path: 'dashboard',
  //   canActivate: [authGuard],
  //   loadComponent: () =>
  //     import('./fleet/presentation/shell/fleet-shell').then(m => m.FleetShell),
  //   children: [ ... ],
  // },

  // ── Catch-all ──────────────────────────────────────────────────────────────
  {
    path: '**',
    redirectTo: 'login',
  },
];
