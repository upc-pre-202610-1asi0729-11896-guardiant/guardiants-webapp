export interface AccountResource {
  id: string;
  email: string;
  profileType: string;
  emailVerified: boolean;
  createdAt: string;
}
export interface RegisterAccountResource {
  email: string;
  password: string;
  profileType: string;
  name: string;
}
export interface AccountResponse {
  status: string;
  account: AccountResource;
}
export interface VerifyEmailResource {
  accountId: string;
  verificationToken: string;
}
export interface VerifyEmailResponse {
  status: string;
  account: AccountResource;
}
export interface UserPreferencesResource {
  language: string;
  theme: string;
}
export interface UserResource {
  id: string;
  accountId: string;
  name: string;
  email: string;
  profileType: string;
  preferences: UserPreferencesResource;
  createdAt: string;
  updatedAt: string;
}
export interface UserResponse {
  status: string;
  user: UserResource;
}
export interface LoginResource {
  email: string;
  password: string;
}
export interface SessionResource {
  id: string;
  userId: string;
  accessToken: string;
  refreshToken: string;
  issuedAt: string;
  expiresAt: string;
  status: string;
}
export interface SessionResponse {
  status: string;
  session: SessionResource | null;
  user: UserResource | null;
}
export interface PasswordChangeResource {
  currentPassword: string;
  newPassword: string;
}
export interface PasswordChangeResponse {
  status: string;
}
export interface ProfileUpdateResource {
  name: string;
  email: string;
}
export interface PreferencesUpdateResource {
  language: string;
  theme: string;
}
