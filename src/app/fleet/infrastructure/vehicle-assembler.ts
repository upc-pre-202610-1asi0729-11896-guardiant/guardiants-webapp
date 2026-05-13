import { BaseAssembler } from '../../shared/infrastructure/base-assembler';

import { Vehicle } from '../domain/model/vehicle.entity';

import { VehicleResource } from './vehicle-response';

/**
 * Maps vehicle entities to and from API resources.
 */
export class VehicleAssembler implements BaseAssembler<Vehicle, VehicleResource, VehicleResource[]> {
  /**
   * Converts a vehicle collection into vehicle entities.
   * @param resources - API collection containing vehicles.
   * @returns Array of vehicle entities.
   */
  toEntitiesFromResponse(resources: VehicleResource[]): Vehicle[] {
    return resources.map((resource) => this.toEntityFromResource(resource));
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
      createdAt: new Date(resource.createdAt as unknown as string),
      lastLocation: resource.lastLocation,
      lastUpdated: resource.lastUpdated,
      mileageKm: resource.mileageKm,
      lastLat: resource.lastLat,
      lastLng: resource.lastLng,
      speedKmh: resource.speedKmh,
      batteryPct: resource.batteryPct,
      deviceStatus: resource.deviceStatus,
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
      lastLocation: entity.lastLocation,
      lastUpdated: entity.lastUpdated,
      mileageKm: entity.mileageKm,
      lastLat: entity.lastLat,
      lastLng: entity.lastLng,
      speedKmh: entity.speedKmh,
      batteryPct: entity.batteryPct,
      deviceStatus: entity.deviceStatus,
    } as VehicleResource;
  }
}
