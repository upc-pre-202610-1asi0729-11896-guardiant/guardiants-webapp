import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';
import { UserPlan, UserRole } from '../domain/model/user.entity';

export interface UserResource extends BaseResource {
  organizationId: string;
  roleId: number;
  firstName: string;
  lastName: string;
  email: string;
  passwordHash?: string;
  status: string;
  createdAt: string;
  role?: UserRole;
  plan?: UserPlan;
  companyName?: string;
  ruc?: string;
  phone?: string;
}

export interface UserResponse extends BaseResponse {
  users: UserResource[];
}
