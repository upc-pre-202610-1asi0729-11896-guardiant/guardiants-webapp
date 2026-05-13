// src/app/iam/application/auth.guard.ts

import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { IamStore } from './iam.store';

export const authGuard: CanActivateFn = () => {
  const store = inject(IamStore);
  const router = inject(Router);

  if (store.isAuthenticated()) return true;

  router.navigate(['/login']);
  return false;
};

export const guestGuard: CanActivateFn = () => {
  const store = inject(IamStore);
  const router = inject(Router);

  if (!store.isAuthenticated()) return true;

  router.navigate([store.dashboardRoute()]);
  return false;
};
