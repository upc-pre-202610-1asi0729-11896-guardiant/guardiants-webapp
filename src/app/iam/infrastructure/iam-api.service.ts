import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, map, switchMap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { UserEntity, UserRole } from '../domain/model/user.entity';
import { UserAssembler } from './user-assembler';
import { UserResource } from './user-response';

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

@Injectable({ providedIn: 'root' })
export class IamApiService {
  private readonly http = inject(HttpClient);
  private readonly assembler = new UserAssembler();
  private readonly baseUrl = environment.apiBaseUrl;

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http
      .get<UserResource[]>(`${this.baseUrl}/users`, {
        params: { email: payload.email.toLowerCase() },
      })
      .pipe(
        map((users) => {
          const record = users[0];
          if (!record || record.passwordHash !== payload.password || record.status !== 'ACTIVE') {
            throw { status: 401, message: 'Credenciales invalidas. Verifica tu email y contrasena.' };
          }
          const user = this.assembler.toEntityFromResource(record);
          return { token: this.createToken(user), user };
        }),
      );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http
      .get<UserResource[]>(`${this.baseUrl}/users`, {
        params: { email: payload.email.toLowerCase() },
      })
      .pipe(
        switchMap((users) => {
          if (users.length > 0) {
            return throwError(() => ({
              status: 409,
              message: 'Este email ya esta registrado. Intenta iniciar sesion.',
            }));
          }

          const [firstName, ...lastNameParts] = payload.name.trim().split(/\s+/);
          const user = new UserEntity({
            id: `USR-${Date.now()}`,
            organizationId: 'ORG-001',
            roleId: payload.role === 'EMPRESA' ? 2 : 1,
            firstName: firstName ?? payload.name,
            lastName: lastNameParts.join(' '),
            email: payload.email.toLowerCase(),
            passwordHash: payload.password,
            status: 'ACTIVE',
            createdAt: new Date(),
            role: payload.role,
            plan: 'BASIC',
            companyName: payload.companyName,
            ruc: payload.ruc,
            phone: payload.phone,
          });

          return this.http.post<UserResource>(`${this.baseUrl}/users`, this.assembler.toResourceFromEntity(user));
        }),
        map((resource) => {
          const user = this.assembler.toEntityFromResource(resource);
          return { token: this.createToken(user), user };
        }),
      );
  }

  updateProfile(userId: string, payload: UpdateProfileRequest, token: string): Observable<UserEntity> {
    const [firstName, ...lastNameParts] = payload.name.trim().split(/\s+/);
    return this.http
      .patch<UserResource>(
        `${this.baseUrl}/users/${userId}`,
        {
          firstName: firstName ?? payload.name,
          lastName: lastNameParts.join(' '),
          email: payload.email.toLowerCase(),
          phone: payload.phone,
        },
        { headers: this.authHeaders(token) },
      )
      .pipe(map((resource) => this.assembler.toEntityFromResource(resource)));
  }

  changePassword(payload: ChangePasswordRequest, token: string): Observable<void> {
    void token;
    if (payload.currentPassword === payload.newPassword) {
      return throwError(() => ({
        status: 400,
        message: 'La nueva contrasena debe ser diferente a la actual.',
      }));
    }
    return new Observable<void>((subscriber) => {
      subscriber.next();
      subscriber.complete();
    });
  }

  private createToken(user: UserEntity): string {
    return `mock_jwt_${btoa(user.email)}_${Date.now()}`;
  }

  private authHeaders(token: string): HttpHeaders {
    return new HttpHeaders({ Authorization: `Bearer ${token}` });
  }
}
