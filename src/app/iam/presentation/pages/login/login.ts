// src/app/iam/presentation/pages/login/login.ts

import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatRippleModule } from '@angular/material/core';
import { TranslatePipe } from '@ngx-translate/core';

// Store
import { IamStore } from '../../../application/iam.store';
import { LanguageSwitcher } from '../../../../shared/presentation/components/language-switcher/language-switcher';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatRippleModule,
    TranslatePipe,
    LanguageSwitcher,
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
})
export class Login implements OnInit {
  protected readonly store = inject(IamStore);
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);

  protected readonly showPassword = signal(false);

  protected form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
    });
  }

  protected togglePassword(): void {
    this.showPassword.update((v) => !v);
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.store.clearError();
    this.store.login(this.form.getRawValue()).subscribe();
  }

  // Convenience getters for template
  protected get emailCtrl() {
    return this.form.get('email')!;
  }
  protected get passCtrl() {
    return this.form.get('password')!;
  }

  // Fill demo credentials
  protected fillDemo(type: 'empresa' | 'persona'): void {
    const creds =
      type === 'empresa'
        ? { email: 'empresa@godstrack.com', password: 'Demo1234!' }
        : { email: 'enrique@godstrack.com', password: 'Demo1234!' };
    this.form.patchValue(creds);
  }
}
