import { BaseEntity } from '../../../shared/domain/model/base.entity';

export enum AlertRuleType {
  GEOFENCE = 'GEOFENCE',
  SPEED_LIMIT = 'SPEED_LIMIT',
  GPS_JAMMING = 'GPS_JAMMING',
  PROLONGED_STOP = 'PROLONGED_STOP',
}

/** A circular geofence area. */
export class GeoArea {
  constructor(
    public centerLat: number,
    public centerLng: number,
    public radiusMeters: number,
  ) {}

  contains(lat: number, lng: number): boolean {
    const R = 6_371_000;
    const dLat = ((lat - this.centerLat) * Math.PI) / 180;
    const dLng = ((lng - this.centerLng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((this.centerLat * Math.PI) / 180) *
        Math.cos((lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    const distance = 2 * R * Math.asin(Math.sqrt(a));
    return distance <= this.radiusMeters;
  }
}

/** A configurable alert rule applied to a fleet or a single vehicle. */
export class AlertRule extends BaseEntity {
  constructor(
    id: string,
    public fleetId: string,
    public vehicleId: string | null,
    public type: AlertRuleType,
    public threshold: number | null,
    public geofenceArea: GeoArea | null,
    public enabled: boolean,
  ) {
    super(id);
  }

  appliesToVehicle(vehicleId: string): boolean {
    return this.enabled && (this.vehicleId === null || this.vehicleId === vehicleId);
  }

  isViolatedBy(value: number): boolean {
    if (!this.enabled || this.threshold === null) return false;
    return value > this.threshold;
  }
}
