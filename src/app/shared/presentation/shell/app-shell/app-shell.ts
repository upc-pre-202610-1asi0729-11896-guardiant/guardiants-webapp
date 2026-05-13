// src/app/shared/presentation/components/app-shell/app-shell.ts
import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { IamStore } from '../../../../iam/application/iam.store';
import { LanguageSwitcher } from '../../components/language-switcher/language-switcher';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, RouterOutlet, LanguageSwitcher],
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
