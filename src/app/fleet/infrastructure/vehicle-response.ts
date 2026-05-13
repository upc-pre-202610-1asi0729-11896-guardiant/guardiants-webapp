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

  /**
   * Vehicle last known location.
   */
  lastLocation?: string;

  /**
   * Vehicle last update time.
   */
  lastUpdated?: string;

  /**
   * Vehicle mileage in kilometers.
   */
  mileageKm?: number;

  /**
   * Last latitude captured for the vehicle.
   */
  lastLat?: number;

  /**
   * Last longitude captured for the vehicle.
   */
  lastLng?: number;

  /**
   * Current speed in kilometers per hour.
   */
  speedKmh?: number;

  /**
   * Current battery percentage.
   */
  batteryPct?: number;

  /**
   * Device connection state.
   */
  deviceStatus?: string;
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
