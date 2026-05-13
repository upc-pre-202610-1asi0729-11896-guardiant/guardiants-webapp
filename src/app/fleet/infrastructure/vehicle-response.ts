import { BaseResource, BaseResponse } from '../../shared/infrastructure/base-response';

/**
 * Resource representation of a vehicle.
 */
export interface VehicleResource extends BaseResource {
  /**
   * Organization identifier.
   */
  organizationId: string;

  /**
   * Vehicle plate.
   */
  plate: string;

  /**
   * Vehicle model.
   */
  model: string;

  /**
   * Vehicle brand.
   */
  brand: string;

  /**
   * Vehicle status.
   */
  status: string;

  /**
   * Vehicle capacity.
   */
  capacity: number;

  /**
   * Vehicle creation date.
   */
  createdAt: Date;
}

/**
 * Response envelope for vehicle collection queries.
 */
export interface VehicleResponse extends BaseResponse {
  /**
   * List of vehicles returned by API.
   */
  vehicles: VehicleResource[];
}
