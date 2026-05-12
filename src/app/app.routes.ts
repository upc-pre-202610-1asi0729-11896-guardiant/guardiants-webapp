import { Routes } from '@angular/router';
import { Login } from './iam/presentation/pages/login/login';
import { Register } from './iam/presentation/pages/register/register';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full',
  },

  {
    path: 'login',
    component: Login,
  },

  {
    path: 'register',
    component: Register,
  },
];
