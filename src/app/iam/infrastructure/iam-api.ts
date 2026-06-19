import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint';
import { environment } from '../../../environments/environment';
import {
  AccountResponse,
  PasswordChangeResource,
  PasswordChangeResponse,
  PreferencesUpdateResource,
  ProfileUpdateResource,
  RegisterAccountResource,
  SessionResponse,
  UserResponse,
  VerifyEmailResource,
  VerifyEmailResponse,
  LoginResource,
} from './iam-response';

@Injectable({ providedIn: 'root' })
export class IamApi extends BaseApi {
  private readonly accounts: BaseEndpoint;
  private readonly users: BaseEndpoint;
  private readonly sessions: BaseEndpoint;

  constructor(http: HttpClient) {
    super(http, environment.apiBaseUrl);
    this.accounts = this.buildEndpoint('accounts');
    this.users = this.buildEndpoint('users');
    this.sessions = this.buildEndpoint('sessions');
  }

  register(resource: RegisterAccountResource): Promise<AccountResponse> {
    return this.accounts.create(resource) as Promise<AccountResponse>;
  }
  verifyEmail(resource: VerifyEmailResource): Promise<VerifyEmailResponse> {
    return this.accounts.postPath('/verify-email', resource) as Promise<VerifyEmailResponse>;
  }
  login(resource: LoginResource): Promise<SessionResponse> {
    return this.sessions.create(resource) as Promise<SessionResponse>;
  }
  refreshSession(refreshToken: string): Promise<SessionResponse> {
    return this.sessions.postPath('/refresh', { refreshToken }) as Promise<SessionResponse>;
  }
  logout(sessionId: string): Promise<{ status: string }> {
    return this.sessions.delete(sessionId) as Promise<{ status: string }>;
  }
  getCurrentUser(userId: string): Promise<UserResponse> {
    return this.users.getById(userId) as Promise<UserResponse>;
  }
  changePassword(userId: string, resource: PasswordChangeResource): Promise<PasswordChangeResponse> {
    return this.users.postPath(`/${userId}/change-password`, resource) as Promise<PasswordChangeResponse>;
  }
  updateProfile(userId: string, resource: ProfileUpdateResource): Promise<UserResponse> {
    return this.users.update(userId, resource) as Promise<UserResponse>;
  }
  updatePreferences(userId: string, resource: PreferencesUpdateResource): Promise<UserResponse> {
    return this.users.postPath(`/${userId}/preferences`, resource) as Promise<UserResponse>;
  }
}
