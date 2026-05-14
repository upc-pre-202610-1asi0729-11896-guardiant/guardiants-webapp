import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IamStore } from '../../../application/iam.store';

function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const val: string = control.value ?? '';
  if (!val) return null;
  const ok =
    /[A-Z]/.test(val) && /[a-z]/.test(val) && /[0-9]/.test(val) && /[^A-Za-z0-9]/.test(val);
  return ok ? null : { weakPassword: true };
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule,
    MatSnackBarModule,
    TranslatePipe,
  ],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss'],
})
export class Profile implements OnInit {
  protected readonly store = inject(IamStore);
  private readonly fb = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);
  private readonly translate = inject(TranslateService);

  protected profileForm!: FormGroup;
  protected passwordForm!: FormGroup;

  protected readonly showCurrent = signal(false);
  protected readonly showNew = signal(false);

  ngOnInit(): void {
    const user = this.store.user();

    this.profileForm = this.fb.group({
      name: [user?.name ?? '', [Validators.required, Validators.minLength(3)]],
      email: [user?.email ?? '', [Validators.required, Validators.email]],
      phone: [user?.phone ?? '', [Validators.pattern(/^\+?[0-9\s\-]{7,15}$/)]],
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8), strongPasswordValidator]],
    });
  }

  protected saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }
    this.store.updateProfile(this.profileForm.getRawValue()).subscribe({
      next: () =>
        this.snackBar.open(
          this.translate.instant('profile.profileUpdated'),
          this.translate.instant('common.ok'),
          { duration: 3000 },
        ),
      error: () => {},
    });
  }

  protected changePassword(): void {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    this.store.changePassword(this.passwordForm.getRawValue()).subscribe({
      next: () => {
        this.passwordForm.reset();
        this.snackBar.open(
          this.translate.instant('profile.passwordChanged'),
          this.translate.instant('common.ok'),
          { duration: 3000 },
        );
      },
      error: () => {},
    });
  }

  protected get nameCtrl() {
    return this.profileForm.get('name')!;
  }
  protected get emailCtrl() {
    return this.profileForm.get('email')!;
  }
  protected get phoneCtrl() {
    return this.profileForm.get('phone')!;
  }
  protected get currCtrl() {
    return this.passwordForm.get('currentPassword')!;
  }
  protected get newCtrl() {
    return this.passwordForm.get('newPassword')!;
  }
}
