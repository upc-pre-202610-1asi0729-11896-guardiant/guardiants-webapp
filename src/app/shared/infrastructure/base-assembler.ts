import { BaseEntity } from './base-entity';
import { BaseResource } from './base-response';

/**
 * Converts resources into entities and vice versa.
 */
export interface BaseAssembler<
  TEntity extends BaseEntity,
  TResource extends BaseResource,
  TResponse,
> {
  /**
   * Converts resource into entity.
   */
  toEntityFromResource(resource: TResource): TEntity;

  /**
   * Converts entity into resource.
   */
  toResourceFromEntity(entity: TEntity): TResource;

  /**
   * Converts response into entities.
   */
  toEntitiesFromResponse(response: TResponse): TEntity[];
}
