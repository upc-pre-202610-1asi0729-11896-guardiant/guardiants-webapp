// src/app/iam/application/iam.store.ts

import { Injectable, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError } from 'rxjs';
import { UserEntity } from '../domain/model/user.entity';
import {
  IamApiService,
  LoginRequest,
  RegisterRequest,
  UpdateProfileRequest,
  ChangePasswordRequest,
  AuthResponse,
} from '../infrastructure/iam-api.service';

// ─── State Shape ─────────────────────────────────────────────────────────────
interface IamState {
  user: UserEntity | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
}

const STORAGE_KEY_TOKEN = 'gods_tracker_token';
const STORAGE_KEY_USER = 'gods_tracker_user';

// ─── Helpers ─────────────────────────────────────────────────────────────────
function loadFromStorage(): Pick<IamState, 'user' | 'token'> {
  try {
    const token = localStorage.getItem(STORAGE_KEY_TOKEN);
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (token && raw) {
      const user = UserEntity.fromJson(JSON.parse(raw));
      return { token, user };
    }
  } catch {
    // corrupted storage – ignore
  }
  return { token: null, user: null };
}

function saveToStorage(token: string, user: UserEntity): void {
  localStorage.setItem(STORAGE_KEY_TOKEN, token);
  localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user.toJson()));
}

function clearStorage(): void {
  localStorage.removeItem(STORAGE_KEY_TOKEN);
  localStorage.removeItem(STORAGE_KEY_USER);
}

// ─── Store ────────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class IamStore {
  private readonly api = inject(IamApiService);
  private readonly router = inject(Router);

  // ── State ────────────────────────────────────────────────────────────────
  private readonly _state = signal<IamState>({
    ...loadFromStorage(),
    isLoading: false,
    error: null,
  });

  // ── Public signals (read-only projections) ───────────────────────────────
  readonly user = computed(() => this._state().user);
  readonly token = computed(() => this._state().token);
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);

  readonly isAuthenticated = computed(() => !!this._state().token && !!this._state().user);
  readonly isEmpresa = computed(() => this._state().user?.role === 'EMPRESA');
  readonly userName = computed(() => this._state().user?.name ?? '');
  readonly userPlan = computed(() => this._state().user?.plan ?? 'BASIC');
  readonly dashboardRoute = computed(() => this._state().user?.dashboardRoute ?? '/home');

  // ── Actions ───────────────────────────────────────────────────────────────

  login(payload: LoginRequest): Observable<AuthResponse> {
    this._patch({ isLoading: true, error: null });

    return this.api.login(payload).pipe(
      tap(({ token, user }) => {
        saveToStorage(token, user);
        this._patch({ user, token, isLoading: false });
        this.router.navigate([user.dashboardRoute]);
      }),
      catchError((err) => {
        this._patch({ isLoading: false, error: err?.message ?? 'Error al iniciar sesión.' });
        return throwError(() => err);
      }),
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    this._patch({ isLoading: true, error: null });

    return this.api.register(payload).pipe(
      tap(({ token, user }) => {
        saveToStorage(token, user);
        this._patch({ user, token, isLoading: false });
        this.router.navigate([user.dashboardRoute]);
      }),
      catchError((err) => {
        this._patch({ isLoading: false, error: err?.message ?? 'Error al registrarse.' });
        return throwError(() => err);
      }),
    );
  }

  updateProfile(payload: UpdateProfileRequest): Observable<UserEntity> {
    const userId = this._state().user?.id;
    const token = this._state().token;
    if (!userId || !token) return throwError(() => new Error('No autenticado'));

    this._patch({ isLoading: true, error: null });

    return this.api.updateProfile(userId, payload, token).pipe(
      tap((updated) => {
        saveToStorage(token, updated);
        this._patch({ user: updated, isLoading: false });
      }),
      catchError((err) => {
        this._patch({ isLoading: false, error: err?.message ?? 'Error al actualizar perfil.' });
        return throwError(() => err);
      }),
    );
  }

  changePassword(payload: ChangePasswordRequest): Observable<void> {
    const token = this._state().token;
    if (!token) return throwError(() => new Error('No autenticado'));

    this._patch({ isLoading: true, error: null });

    return this.api.changePassword(payload, token).pipe(
      tap(() => this._patch({ isLoading: false })),
      catchError((err) => {
        this._patch({ isLoading: false, error: err?.message ?? 'Error al cambiar contraseña.' });
        return throwError(() => err);
      }),
    );
  }

  logout(): void {
    clearStorage();
    this._patch({ user: null, token: null, error: null, isLoading: false });
    this.router.navigate(['/login']);
  }

  clearError(): void {
    this._patch({ error: null });
  }

  // ── Private helpers ───────────────────────────────────────────────────────
  private _patch(partial: Partial<IamState>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }
}
