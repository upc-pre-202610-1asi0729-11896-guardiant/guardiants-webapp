// src/app/iam/presentation/pages/register/register.ts

import { Component, inject, signal, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';

import { IamStore } from '../../../application/iam.store';
import { UserRole } from '../../../domain/model/user.entity';

function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pass = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pass && confirm && pass !== confirm ? { passwordsMismatch: true } : null;
}

function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value ?? '';
  if (!val) return null;
  const ok =
    /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val);
  return ok ? null : { weakPassword: true };
}

@Component({
  selector: 'app-register',
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
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register implements OnInit {
  protected readonly store = inject(IamStore);
  private readonly fb = inject(FormBuilder);

  protected readonly showPass = signal(false);
  protected readonly showConfirm = signal(false);
  protected readonly selectedRole = signal<UserRole>('PERSONA_NATURAL');
  protected readonly isEmpresa = computed(() => this.selectedRole() === 'EMPRESA');

  protected form!: FormGroup;

  ngOnInit(): void {
    this.form = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3)]],
        companyName: [''],
        ruc: [''],
        phone: [''],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatchValidator },
    );
  }

  protected selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    const companyCtrl = this.form.get('companyName')!;
    const rucCtrl = this.form.get('ruc')!;

    if (role === 'EMPRESA') {
      companyCtrl.setValidators([Validators.required, Validators.minLength(3)]);
      rucCtrl.setValidators([Validators.required, Validators.pattern(/^[0-9]{11}$/)]);
    } else {
      companyCtrl.clearValidators();
      rucCtrl.clearValidators();
    }
    companyCtrl.updateValueAndValidity();
    rucCtrl.updateValueAndValidity();
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...rest } = this.form.getRawValue();
    void confirmPassword;

    this.store.clearError();

    // ✅ takeUntil evitado intencionalmente — el observable mock completa solo.
    // Con zoneless NO usamos subscribe() vacío; manejamos next/error explícitamente.
    this.store.register({ ...rest, role: this.selectedRole() }).subscribe({
      next: () => {},
      error: () => {},
    });
  }

  protected get nameCtrl() {
    return this.form.get('name')!;
  }
  protected get emailCtrl() {
    return this.form.get('email')!;
  }
  protected get passCtrl() {
    return this.form.get('password')!;
  }
  protected get confirmCtrl() {
    return this.form.get('confirmPassword')!;
  }
  protected get companyCtrl() {
    return this.form.get('companyName')!;
  }
  protected get rucCtrl() {
    return this.form.get('ruc')!;
  }
  protected get phoneCtrl() {
    return this.form.get('phone')!;
  }

  protected togglePass(): void {
    this.showPass.update((v) => !v);
  }
  protected toggleConfirm(): void {
    this.showConfirm.update((v) => !v);
  }
}
