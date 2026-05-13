// src/app/iam/domain/model/user.entity.ts

export type UserRole = 'EMPRESA' | 'PERSONA_NATURAL';
export type UserPlan = 'BASIC' | 'PRO' | 'ENTERPRISE';

export class UserEntity {
  constructor(
    public readonly id: string,
    public name: string,
    public email: string,
    public role: UserRole,
    public plan: UserPlan,
    public companyName?: string,
    public ruc?: string,
    public phone?: string,
    public createdAt?: Date,
  ) {}

  get isEmpresa(): boolean {
    return this.role === 'EMPRESA';
  }

  get isPersonaNatural(): boolean {
    return this.role === 'PERSONA_NATURAL';
  }

  get dashboardRoute(): string {
    return '/home';
  }

  static fromJson(data: Record<string, unknown>): UserEntity {
    return new UserEntity(
      data['id'] as string,
      data['name'] as string,
      data['email'] as string,
      data['role'] as UserRole,
      (data['plan'] as UserPlan) ?? 'BASIC',
      data['companyName'] as string | undefined,
      data['ruc'] as string | undefined,
      data['phone'] as string | undefined,
      data['createdAt'] ? new Date(data['createdAt'] as string) : undefined,
    );
  }

  toJson(): Record<string, unknown> {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      role: this.role,
      plan: this.plan,
      companyName: this.companyName,
      ruc: this.ruc,
      phone: this.phone,
      createdAt: this.createdAt?.toISOString(),
    };
  }
}
