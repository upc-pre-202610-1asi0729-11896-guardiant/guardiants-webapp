import { BaseAssembler } from '../../shared/infrastructure/base-assembler';

import { Vehicle } from '../domain/model/vehicle.entity';

import { VehicleResponse, VehicleResource } from './vehicle-response';

/**
 * Maps vehicle entities to and from API resources.
 */
export class VehicleAssembler implements BaseAssembler<Vehicle, VehicleResource, VehicleResponse> {
  /**
   * Converts VehicleResponse into vehicle entities.
   * @param response - API response containing vehicles.
   * @returns Array of vehicle entities.
   */
  toEntitiesFromResponse(response: VehicleResponse): Vehicle[] {
    return response.vehicles.map((resource) =>
      this.toEntityFromResource(resource as VehicleResource),
    );
  }

  /**
   * Converts VehicleResource into Vehicle entity.
   * @param resource - Resource to convert.
   * @returns Converted vehicle entity.
   */
  toEntityFromResource(resource: VehicleResource): Vehicle {
    return new Vehicle({
      id: resource.id,
      organizationId: resource.organizationId,
      plate: resource.plate,
      model: resource.model,
      brand: resource.brand,
      status: resource.status,
      capacity: resource.capacity,
      createdAt: resource.createdAt,
    });
  }

  /**
   * Converts Vehicle entity into VehicleResource.
   * @param entity - Entity to convert.
   * @returns Converted resource.
   */
  toResourceFromEntity(entity: Vehicle): VehicleResource {
    return {
      id: entity.id,
      organizationId: entity.organizationId,
      plate: entity.plate,
      model: entity.model,
      brand: entity.brand,
      status: entity.status,
      capacity: entity.capacity,
      createdAt: entity.createdAt,
    } as VehicleResource;
  }
}
