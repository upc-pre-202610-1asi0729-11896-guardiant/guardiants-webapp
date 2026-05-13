// src/app/shared/presentation/components/app-shell/app-shell.ts
//
// Extrae el layout (sidebar + topbar) de home.html a un componente reutilizable.
// Home y SecurityAlert solo necesitan proyectar su contenido con <ng-content>.

import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { IamStore } from '../../../../iam/application/iam.store';
import { LanguageSwitcher } from '../language-switcher/language-switcher';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, LanguageSwitcher],
  templateUrl: './app-shell.html',
  styleUrls: ['./app-shell.css'],
})
export class AppShell {
  private readonly iamStore = inject(IamStore);

  readonly userName = this.iamStore.userName;
  readonly userPlan = this.iamStore.userPlan;

  logout(): void {
    this.iamStore.logout();
  }
}
