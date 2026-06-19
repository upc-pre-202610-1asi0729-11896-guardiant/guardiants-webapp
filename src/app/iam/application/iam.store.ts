import { Injectable, computed, inject, signal } from '@angular/core';
import {
  LanguageValue,
  ProfileType,
  Session,
  SessionStatus,
  ThemeValue,
  User,
} from '../domain/model/iam.entities';
import { IamApi } from '../infrastructure/iam-api';
import {
  AccountAssembler,
  SessionAssembler,
  UserAssembler,
} from '../infrastructure/iam-assembler';
import { ApiError } from '../../shared/domain/model/value-objects';

const SESSION_KEY = 'god-tracker.session';
const EXPIRING_SOON_MINUTES = 5;

@Injectable({ providedIn: 'root' })
export class useIamStore {
  private readonly api = inject(IamApi);

  // ----- state -----
  readonly currentUser = signal<User | null>(null);
  readonly session = signal<Session | null>(null);
  readonly registrationProfileType = signal<ProfileType | null>(null);
  readonly loading = signal(false);
  readonly errors = signal<ApiError[]>([]);

  // ----- computed -----
  readonly isAuthenticated = computed(() => {
    const s = this.session();
    return s !== null && s.isActive();
  });
  readonly isSessionExpiringSoon = computed(() => {
    const s = this.session();
    return s !== null && s.isActive() && s.remainingMinutes() <= EXPIRING_SOON_MINUTES;
  });
  readonly currentLanguage = computed(
    () => this.currentUser()?.preferences.language ?? LanguageValue.ES,
  );
  readonly currentTheme = computed(() => this.currentUser()?.preferences.theme ?? ThemeValue.LIGHT);

  // ----- actions -----
  async register(email: string, password: string, profileType: string, name: string): Promise<void> {
    this.registrationProfileType.set(profileType as ProfileType);
    await this.run(async () => {
      const resource = AccountAssembler.toResourceFromRegistration(email, password, profileType, name);
      await this.api.register(resource);
    });
  }
  async verifyEmail(accountId: string, token: string): Promise<void> {
    await this.run(async () => {
      await this.api.verifyEmail({ accountId, verificationToken: token });
    });
  }
  async login(email: string, password: string): Promise<void> {
    await this.run(async () => {
      const res = await this.api.login({ email, password });
      this.applySession(SessionAssembler.toEntityFromResponse(res));
      this.currentUser.set(UserAssembler.toEntityFromResource(res.user!));
    });
  }
  async refreshSession(): Promise<void> {
    const current = this.session();
    if (!current) return;
    await this.run(async () => {
      const res = await this.api.refreshSession(current.refreshToken);
      this.applySession(SessionAssembler.toEntityFromResponse(res));
    });
  }
  async logout(): Promise<void> {
    const current = this.session();
    await this.run(async () => {
      if (current) await this.api.logout(current.id);
      this.applySession(null);
      this.currentUser.set(null);
    });
  }
  async loadCurrentUser(): Promise<void> {
    const userId = this.session()?.userId;
    if (!userId) return;
    await this.run(async () => this.currentUser.set(UserAssembler.toEntityFromResponse(await this.api.getCurrentUser(userId))));
  }
  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const userId = this.currentUser()?.id;
    if (!userId) return;
    await this.run(async () => { await this.api.changePassword(userId, { currentPassword, newPassword }); });
  }
  async updateProfile(name: string, email: string): Promise<void> {
    const userId = this.currentUser()?.id;
    if (!userId) return;
    await this.run(async () => this.currentUser.set(UserAssembler.toEntityFromResponse(await this.api.updateProfile(userId, { name, email }))));
  }
  async updatePreferences(language: string, theme: string): Promise<void> {
    const userId = this.currentUser()?.id;
    if (!userId) return;
    await this.run(async () => this.currentUser.set(UserAssembler.toEntityFromResponse(await this.api.updatePreferences(userId, { language, theme }))));
  }
  setSessionExpired(): void {
    const s = this.session();
    if (s) {
      this.session.set(
        new Session(s.id, s.userId, s.accessToken, s.refreshToken, s.issuedAt, s.expiresAt, SessionStatus.EXPIRED),
      );
    }
  }
  clearErrors(): void {
    this.errors.set([]);
  }

  // ----- helpers -----
  private applySession(session: Session | null): void {
    this.session.set(session);
    if (session) localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else localStorage.removeItem(SESSION_KEY);
  }
  private async run(work: () => Promise<void>): Promise<void> {
    this.loading.set(true);
    try {
      await work();
    } catch (e) {
      const err = e instanceof ApiError ? e : new ApiError('UNKNOWN', (e as Error)?.message ?? 'Error', 0);
      this.errors.set([...this.errors(), err]);
    } finally {
      this.loading.set(false);
    }
  }
}
