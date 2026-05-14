import { BaseEntity } from '../../../shared/infrastructure/base-entity';

export type UserRole = 'EMPRESA' | 'PERSONA_NATURAL';
export type UserPlan = 'BASIC' | 'PRO' | 'ENTERPRISE';

export class UserEntity implements BaseEntity {
  constructor(props: {
    id: string;
    organizationId: string;
    roleId: number;
    firstName: string;
    lastName: string;
    email: string;
    passwordHash?: string;
    status: string;
    createdAt: Date;
    role?: UserRole;
    plan?: UserPlan;
    companyName?: string;
    ruc?: string;
    phone?: string;
  }) {
    this._id = props.id;
    this._organizationId = props.organizationId;
    this._roleId = props.roleId;
    this._firstName = props.firstName;
    this._lastName = props.lastName;
    this._email = props.email;
    this._passwordHash = props.passwordHash;
    this._status = props.status;
    this._createdAt = props.createdAt;
    this._role = props.role ?? (props.roleId === 2 ? 'EMPRESA' : 'PERSONA_NATURAL');
    this._plan = props.plan ?? 'BASIC';
    this._companyName = props.companyName;
    this._ruc = props.ruc;
    this._phone = props.phone;
  }

  private _id: string;
  get id(): string {
    return this._id;
  }
  set id(value: string) {
    this._id = value;
  }

  private _organizationId: string;
  get organizationId(): string {
    return this._organizationId;
  }
  set organizationId(value: string) {
    this._organizationId = value;
  }

  private _roleId: number;
  get roleId(): number {
    return this._roleId;
  }
  set roleId(value: number) {
    this._roleId = value;
  }

  private _firstName: string;
  get firstName(): string {
    return this._firstName;
  }
  set firstName(value: string) {
    this._firstName = value;
  }

  private _lastName: string;
  get lastName(): string {
    return this._lastName;
  }
  set lastName(value: string) {
    this._lastName = value;
  }

  private _email: string;
  get email(): string {
    return this._email;
  }
  set email(value: string) {
    this._email = value;
  }

  private _passwordHash?: string;
  get passwordHash(): string | undefined {
    return this._passwordHash;
  }
  set passwordHash(value: string | undefined) {
    this._passwordHash = value;
  }

  private _status: string;
  get status(): string {
    return this._status;
  }
  set status(value: string) {
    this._status = value;
  }

  private _createdAt: Date;
  get createdAt(): Date {
    return this._createdAt;
  }
  set createdAt(value: Date) {
    this._createdAt = value;
  }

  private _role: UserRole;
  get role(): UserRole {
    return this._role;
  }
  set role(value: UserRole) {
    this._role = value;
    this._roleId = value === 'EMPRESA' ? 2 : 1;
  }

  private _plan: UserPlan;
  get plan(): UserPlan {
    return this._plan;
  }
  set plan(value: UserPlan) {
    this._plan = value;
  }

  private _companyName?: string;
  get companyName(): string | undefined {
    return this._companyName;
  }
  set companyName(value: string | undefined) {
    this._companyName = value;
  }

  private _ruc?: string;
  get ruc(): string | undefined {
    return this._ruc;
  }
  set ruc(value: string | undefined) {
    this._ruc = value;
  }

  private _phone?: string;
  get phone(): string | undefined {
    return this._phone;
  }
  set phone(value: string | undefined) {
    this._phone = value;
  }

  get name(): string {
    return `${this.firstName} ${this.lastName}`.trim();
  }

  set name(value: string) {
    const [firstName, ...rest] = value.trim().split(/\s+/);
    this.firstName = firstName ?? '';
    this.lastName = rest.join(' ');
  }

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
    const fullName = (data['name'] as string | undefined)?.trim();
    const splitName = fullName ? fullName.split(/\s+/) : [];
    const role = data['role'] as UserRole | undefined;

    return new UserEntity({
      id: data['id'] as string,
      organizationId: (data['organizationId'] as string | undefined) ?? 'ORG-001',
      roleId: (data['roleId'] as number | undefined) ?? (role === 'EMPRESA' ? 2 : 1),
      firstName: (data['firstName'] as string | undefined) ?? splitName[0] ?? '',
      lastName: (data['lastName'] as string | undefined) ?? splitName.slice(1).join(' '),
      email: data['email'] as string,
      passwordHash: data['passwordHash'] as string | undefined,
      status: (data['status'] as string | undefined) ?? 'ACTIVE',
      createdAt: data['createdAt'] ? new Date(data['createdAt'] as string) : new Date(),
      role: role ?? ((data['roleId'] as number | undefined) === 2 ? 'EMPRESA' : 'PERSONA_NATURAL'),
      plan: (data['plan'] as UserPlan | undefined) ?? 'BASIC',
      companyName: data['companyName'] as string | undefined,
      ruc: data['ruc'] as string | undefined,
      phone: data['phone'] as string | undefined,
    });
  }

  toJson(): Record<string, unknown> {
    return {
      id: this.id,
      organizationId: this.organizationId,
      roleId: this.roleId,
      firstName: this.firstName,
      lastName: this.lastName,
      name: this.name,
      email: this.email,
      passwordHash: this.passwordHash,
      status: this.status,
      role: this.role,
      plan: this.plan,
      companyName: this.companyName,
      ruc: this.ruc,
      phone: this.phone,
      createdAt: this.createdAt.toISOString(),
    };
  }
}
