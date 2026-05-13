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

// Angular Material
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatStepperModule } from '@angular/material/stepper';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatTooltipModule } from '@angular/material/tooltip';

// Store
import { IamStore } from '../../../application/iam.store';
import { UserRole } from '../../../domain/model/user.entity';

// Custom validator: passwords must match
function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const pass = control.get('password')?.value;
  const confirm = control.get('confirmPassword')?.value;
  return pass && confirm && pass !== confirm ? { passwordsMismatch: true } : null;
}

// Custom validator: strong password
function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value ?? '';
  if (!val) return null;
  const hasUpper = /[A-Z]/.test(val);
  const hasLower = /[a-z]/.test(val);
  const hasNumber = /[0-9]/.test(val);
  const hasSpecial = /[^A-Za-z0-9]/.test(val);
  return hasUpper && hasLower && hasNumber && hasSpecial ? null : { weakPassword: true };
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
    MatStepperModule,
    MatButtonToggleModule,
    MatTooltipModule,
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.scss'],
})
export class Register implements OnInit {
  protected readonly store = inject(IamStore);
  private readonly fb = inject(FormBuilder);

  protected readonly showPass = signal(false);
  protected readonly showConfirm = signal(false);

  protected stepOneForm!: FormGroup;
  protected stepTwoForm!: FormGroup;

  protected readonly selectedRole = signal<UserRole>('PERSONA_NATURAL');
  protected readonly isEmpresa = computed(() => this.selectedRole() === 'EMPRESA');

  ngOnInit(): void {
    this.stepOneForm = this.fb.group({
      role: ['PERSONA_NATURAL', Validators.required],
    });

    this.stepTwoForm = this.fb.group(
      {
        name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(80)]],
        companyName: [''],
        ruc: [''],
        phone: ['', [Validators.pattern(/^\+?[0-9\s\-]{7,15}$/)]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator]],
        confirmPassword: ['', Validators.required],
      },
      { validators: passwordsMatchValidator },
    );

    // Update conditional validators when role changes
    this.stepOneForm.get('role')!.valueChanges.subscribe((role: UserRole) => {
      this.selectedRole.set(role);
      this._updateConditionalValidators(role);
    });
  }

  private _updateConditionalValidators(role: UserRole): void {
    const companyCtrl = this.stepTwoForm.get('companyName')!;
    const rucCtrl = this.stepTwoForm.get('ruc')!;

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

  protected selectRole(role: UserRole): void {
    this.selectedRole.set(role);
    this.stepOneForm.patchValue({ role });
    this._updateConditionalValidators(role);
  }

  protected onSubmit(): void {
    if (this.stepTwoForm.invalid) {
      this.stepTwoForm.markAllAsTouched();
      return;
    }

    const { confirmPassword, ...rest } = this.stepTwoForm.getRawValue();
    void confirmPassword; // unused

    this.store.clearError();
    this.store
      .register({
        ...rest,
        role: this.selectedRole(),
      })
      .subscribe();
  }

  // Getters
  protected get nameCtrl() {
    return this.stepTwoForm.get('name')!;
  }
  protected get emailCtrl() {
    return this.stepTwoForm.get('email')!;
  }
  protected get passCtrl() {
    return this.stepTwoForm.get('password')!;
  }
  protected get confirmCtrl() {
    return this.stepTwoForm.get('confirmPassword')!;
  }
  protected get companyCtrl() {
    return this.stepTwoForm.get('companyName')!;
  }
  protected get rucCtrl() {
    return this.stepTwoForm.get('ruc')!;
  }
  protected get phoneCtrl() {
    return this.stepTwoForm.get('phone')!;
  }

  protected togglePass(): void {
    this.showPass.update((v) => !v);
  }
  protected toggleConfirm(): void {
    this.showConfirm.update((v) => !v);
  }
}
