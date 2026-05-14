import { BaseAssembler } from '../../shared/infrastructure/base-assembler';
import { UserEntity } from '../domain/model/user.entity';
import { UserResource } from './user-response';

export class UserAssembler implements BaseAssembler<UserEntity, UserResource, UserResource[]> {
  toEntityFromResource(resource: UserResource): UserEntity {
    return new UserEntity({
      id: resource.id,
      organizationId: resource.organizationId,
      roleId: resource.roleId,
      firstName: resource.firstName,
      lastName: resource.lastName,
      email: resource.email,
      passwordHash: resource.passwordHash,
      status: resource.status,
      createdAt: new Date(resource.createdAt),
      role: resource.role,
      plan: resource.plan,
      companyName: resource.companyName,
      ruc: resource.ruc,
      phone: resource.phone,
    });
  }

  toResourceFromEntity(entity: UserEntity): UserResource {
    return {
      id: entity.id,
      organizationId: entity.organizationId,
      roleId: entity.roleId,
      firstName: entity.firstName,
      lastName: entity.lastName,
      email: entity.email,
      passwordHash: entity.passwordHash,
      status: entity.status,
      createdAt: entity.createdAt.toISOString(),
      role: entity.role,
      plan: entity.plan,
      companyName: entity.companyName,
      ruc: entity.ruc,
      phone: entity.phone,
    };
  }

  toEntitiesFromResponse(response: UserResource[]): UserEntity[] {
    return response.map((resource) => this.toEntityFromResource(resource));
  }
}
