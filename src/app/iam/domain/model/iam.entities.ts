import { BaseEntity } from '../../../shared/domain/model/base.entity';

export enum ProfileType {
  NATURAL_PERSON = 'NATURAL_PERSON',
  COMPANY = 'COMPANY',
  GOVERNMENT = 'GOVERNMENT',
}

export enum LanguageValue {
  ES = 'ES',
  EN = 'EN',
}

export enum ThemeValue {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
}

export enum SessionStatus {
  ACTIVE = 'ACTIVE',
  EXPIRED = 'EXPIRED',
  CLOSED = 'CLOSED',
}

export class Account extends BaseEntity {
  constructor(
    id: string,
    public email: string,
    public profileType: ProfileType,
    public emailVerified: boolean,
    public createdAt: string,
  ) {
    super(id);
  }

  isVerified(): boolean {
    return this.emailVerified;
  }

  isOrganization(): boolean {
    return this.profileType === ProfileType.COMPANY || this.profileType === ProfileType.GOVERNMENT;
  }
}

export class UserPreferences {
  constructor(
    public language: LanguageValue,
    public theme: ThemeValue,
  ) {}

  isDarkMode(): boolean {
    return this.theme === ThemeValue.DARK;
  }
}

export class User extends BaseEntity {
  constructor(
    id: string,
    public accountId: string,
    public name: string,
    public email: string,
    public profileType: ProfileType,
    public preferences: UserPreferences,
    public createdAt: string,
    public updatedAt: string,
  ) {
    super(id);
  }

  displayName(): string {
    return this.name?.trim() || this.email;
  }

  isAdmin(): boolean {
    return this.profileType === ProfileType.GOVERNMENT || this.profileType === ProfileType.COMPANY;
  }
}

export class Session extends BaseEntity {
  constructor(
    id: string,
    public userId: string,
    public accessToken: string,
    public refreshToken: string,
    public issuedAt: string,
    public expiresAt: string,
    public status: SessionStatus,
  ) {
    super(id);
  }

  isExpired(): boolean {
    return this.status === SessionStatus.EXPIRED || new Date(this.expiresAt).getTime() <= Date.now();
  }

  isActive(): boolean {
    return this.status === SessionStatus.ACTIVE && !this.isExpired();
  }

  remainingMinutes(): number {
    return Math.max(0, Math.round((new Date(this.expiresAt).getTime() - Date.now()) / 60_000));
  }
}

export class Credentials {
  constructor(
    public email: string,
    public password: string,
  ) {}

  isValid(): boolean {
    return /.+@.+\..+/.test(this.email) && this.password.length >= 8;
  }
}

export class PasswordChangeRequest {
  constructor(
    public currentPassword: string,
    public newPassword: string,
  ) {}

  isValid(): boolean {
    return this.currentPassword.length > 0 && this.meetsComplexityRequirements();
  }

  meetsComplexityRequirements(): boolean {
    return (
      this.newPassword.length >= 8 &&
      /[A-Z]/.test(this.newPassword) &&
      /[a-z]/.test(this.newPassword) &&
      /\d/.test(this.newPassword)
    );
  }
}
