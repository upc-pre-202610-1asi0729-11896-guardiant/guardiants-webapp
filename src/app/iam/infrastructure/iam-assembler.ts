import {
  Account,
  ProfileType,
  Session,
  SessionStatus,
  User,
  UserPreferences,
  LanguageValue,
  ThemeValue,
} from '../domain/model/iam.entities';
import {
  AccountResource,
  AccountResponse,
  RegisterAccountResource,
  SessionResource,
  SessionResponse,
  UserPreferencesResource,
  UserResource,
  UserResponse,
} from './iam-response';

export class AccountAssembler {
  static toEntityFromResource(resource: AccountResource): Account | null {
    if (!resource) return null;
    return new Account(
      resource.id,
      resource.email,
      resource.profileType as ProfileType,
      resource.emailVerified,
      resource.createdAt,
    );
  }
  static toEntityFromResponse(response: AccountResponse): Account | null {
    return AccountAssembler.toEntityFromResource(response?.account);
  }
  static toResourceFromRegistration(
    email: string,
    password: string,
    profileType: string,
    name: string,
  ): RegisterAccountResource {
    return { email, password, profileType, name };
  }
}

export class UserAssembler {
  static toPreferencesFromResource(resource: UserPreferencesResource): UserPreferences | null {
    if (!resource) return null;
    return new UserPreferences(resource.language as LanguageValue, resource.theme as ThemeValue);
  }
  static toEntityFromResource(resource: UserResource): User | null {
    if (!resource) return null;
    return new User(
      resource.id,
      resource.accountId,
      resource.name,
      resource.email,
      resource.profileType as ProfileType,
      UserAssembler.toPreferencesFromResource(resource.preferences) ??
        new UserPreferences(LanguageValue.ES, ThemeValue.LIGHT),
      resource.createdAt,
      resource.updatedAt,
    );
  }
  static toEntityFromResponse(response: UserResponse): User | null {
    return UserAssembler.toEntityFromResource(response?.user);
  }
}

export class SessionAssembler {
  static toEntityFromResource(resource: SessionResource | null): Session | null {
    if (!resource) return null;
    return new Session(
      resource.id,
      resource.userId,
      resource.accessToken,
      resource.refreshToken,
      resource.issuedAt,
      resource.expiresAt,
      resource.status as SessionStatus,
    );
  }
  static toEntityFromResponse(response: SessionResponse): Session | null {
    return SessionAssembler.toEntityFromResource(response?.session ?? null);
  }
}
