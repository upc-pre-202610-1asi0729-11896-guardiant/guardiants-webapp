// src/app/iam/infrastructure/iam-api.service.ts

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, map, tap } from 'rxjs/operators';
import { UserEntity, UserRole, UserPlan } from '../domain/model/user.entity';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyName?: string;
  ruc?: string;
  phone?: string;
}

export interface AuthResponse {
  token: string;
  user: UserEntity;
}

export interface UpdateProfileRequest {
  name: string;
  email: string;
  phone?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ─── Mock data for simulation ────────────────────────────────────────────────
const MOCK_USERS: Record<string, { password: string; user: Record<string, unknown> }> = {
  'empresa@godstrack.com': {
    password: 'Demo1234!',
    user: {
      id: 'usr_001',
      name: 'Transportes Lima S.A.C.',
      email: 'empresa@godstrack.com',
      role: 'EMPRESA' as UserRole,
      plan: 'PRO' as UserPlan,
      companyName: 'Transportes Lima S.A.C.',
      ruc: '20512345678',
      phone: '+51 999 888 777',
      createdAt: new Date().toISOString(),
    },
  },
  'enrique@godstrack.com': {
    password: 'Demo1234!',
    user: {
      id: 'usr_002',
      name: 'Enrique Castillo',
      email: 'enrique@godstrack.com',
      role: 'PERSONA_NATURAL' as UserRole,
      plan: 'BASIC' as UserPlan,
      phone: '+51 911 222 333',
      createdAt: new Date().toISOString(),
    },
  },
};

// ─── Service ─────────────────────────────────────────────────────────────────
@Injectable({ providedIn: 'root' })
export class IamApiService {
  // Swap this for your real API base URL
  private readonly baseUrl = 'https://api.godstracker.io/v1';

  // Injecting HttpClient for when the real API is ready
  private readonly http = inject(HttpClient);

  /**
   * Simulates a login request.
   * Replace the body with: return this.http.post<AuthResponse>(`${this.baseUrl}/auth/login`, payload)
   */
  login(payload: LoginRequest): Observable<AuthResponse> {
    const record = MOCK_USERS[payload.email.toLowerCase()];

    if (!record || record.password !== payload.password) {
      return throwError(() => ({
        status: 401,
        message: 'Credenciales inválidas. Verifica tu email y contraseña.',
      })).pipe(delay(800));
    }

    const user = UserEntity.fromJson(record.user);
    const token = `mock_jwt_${btoa(user.email)}_${Date.now()}`;

    return of({ token, user }).pipe(delay(900));
  }

  /**
   * Simulates a register request.
   * Replace with: return this.http.post<AuthResponse>(`${this.baseUrl}/auth/register`, payload)
   */
  register(payload: RegisterRequest): Observable<AuthResponse> {
    if (MOCK_USERS[payload.email.toLowerCase()]) {
      return throwError(() => ({
        status: 409,
        message: 'Este email ya está registrado. Intenta iniciar sesión.',
      })).pipe(delay(800));
    }

    const newUser = new UserEntity(
      `usr_${Date.now()}`,
      payload.name,
      payload.email,
      payload.role,
      'BASIC',
      payload.companyName,
      payload.ruc,
      payload.phone,
      new Date(),
    );

    const token = `mock_jwt_${btoa(newUser.email)}_${Date.now()}`;
    return of({ token, user: newUser }).pipe(delay(1000));
  }

  /**
   * Updates the user profile.
   * Replace with: return this.http.patch<UserEntity>(`${this.baseUrl}/users/me`, payload, { headers: this.authHeaders(token) })
   */
  updateProfile(
    userId: string,
    payload: UpdateProfileRequest,
    token: string,
  ): Observable<UserEntity> {
    void token; // used by real implementation
    const existingRecord = Object.values(MOCK_USERS).find(
      (r) => (r.user['id'] as string) === userId,
    );
    if (!existingRecord) {
      return throwError(() => ({ status: 404, message: 'Usuario no encontrado.' }));
    }
    const updated = UserEntity.fromJson({ ...existingRecord.user, ...payload });
    return of(updated).pipe(delay(700));
  }

  /**
   * Changes the password.
   * Replace with: return this.http.post(`${this.baseUrl}/auth/change-password`, payload, { headers: this.authHeaders(token) })
   */
  changePassword(payload: ChangePasswordRequest, token: string): Observable<void> {
    void token;
    if (payload.currentPassword === payload.newPassword) {
      return throwError(() => ({
        status: 400,
        message: 'La nueva contraseña debe ser diferente a la actual.',
      }));
    }
    return of(undefined).pipe(delay(700));
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
