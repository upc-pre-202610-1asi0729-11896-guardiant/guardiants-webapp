import { BaseEntity } from '../../../shared/domain/model/base.entity';

export enum ConnectivityValue {
  ONLINE = 'ONLINE',
  OFFLINE = 'OFFLINE',
  GPS_SIGNAL_LOST = 'GPS_SIGNAL_LOST',
  RECONNECTED = 'RECONNECTED',
}

export class ConnectivityStatus {
  constructor(
    public value: ConnectivityValue,
    public lastSeenAt: string,
  ) {}

  isOnline(): boolean {
    return this.value === ConnectivityValue.ONLINE || this.value === ConnectivityValue.RECONNECTED;
  }

  isJammed(): boolean {
    return this.value === ConnectivityValue.GPS_SIGNAL_LOST;
  }
}

/** A timestamped geographic point along a route. */
export class GeoPoint {
  constructor(
    public lat: number,
    public lng: number,
    public recordedAt: string,
  ) {}
}

export class TelemetryPoint extends BaseEntity {
  constructor(
    id: string,
    public vehicleId: string,
    public deviceId: string,
    public timestamp: string,
    public lat: number,
    public lng: number,
    public heading: number | null,
    public speedKmh: number,
    public fuelLevelPercent: number | null,
    public engineTemperatureC: number | null,
    public batteryLevelPercent: number,
    public odometerKm: number | null,
    public rpm: number | null,
    public engineOn: boolean,
    public connectivity: ConnectivityStatus,
  ) {
    super(id);
  }

  isLowFuel(thresholdPercent: number): boolean {
    return this.fuelLevelPercent !== null && this.fuelLevelPercent <= thresholdPercent;
  }
  isOverheating(thresholdC: number): boolean {
    return this.engineTemperatureC !== null && this.engineTemperatureC >= thresholdC;
  }
  isLowBattery(thresholdPercent: number): boolean {
    return this.batteryLevelPercent <= thresholdPercent;
  }
  isStale(thresholdMinutes: number): boolean {
    return (Date.now() - new Date(this.timestamp).getTime()) / 60_000 > thresholdMinutes;
  }
}

export class VehicleGeneralStatus extends BaseEntity {
  constructor(
    public vehicleId: string,
    public latestPoint: TelemetryPoint | null,
    public activeAlertCount: number,
    public isLocked: boolean,
    public lastUpdatedAt: string,
  ) {
    super(vehicleId);
  }

  isOnline(): boolean {
    return this.latestPoint?.connectivity.isOnline() ?? false;
  }
  summary(): string {
    return `${this.vehicleId}: ${this.isOnline() ? 'online' : 'offline'}, ${this.activeAlertCount} alerts`;
  }
}

export class RouteSegment extends BaseEntity {
  constructor(
    id: string,
    public vehicleId: string,
    public startedAt: string,
    public endedAt: string | null,
    public points: GeoPoint[],
    public distanceKm: number,
  ) {
    super(id);
  }

  durationMinutes(): number {
    const end = this.endedAt ? new Date(this.endedAt).getTime() : Date.now();
    return Math.round((end - new Date(this.startedAt).getTime()) / 60_000);
  }
  isOngoing(): boolean {
    return this.endedAt === null;
  }
}

export class RouteDeviation extends BaseEntity {
  constructor(
    id: string,
    public vehicleId: string,
    public expectedRouteId: string | null,
    public detectedAt: string,
    public location: GeoPoint,
    public deviationDistanceMeters: number,
  ) {
    super(id);
  }
  exceedsThreshold(thresholdMeters: number): boolean {
    return this.deviationDistanceMeters > thresholdMeters;
  }
}

export class ProlongedStop extends BaseEntity {
  constructor(
    id: string,
    public vehicleId: string,
    public location: GeoPoint,
    public startedAt: string,
    public endedAt: string | null,
    public thresholdMinutes: number,
  ) {
    super(id);
  }
  durationMinutes(): number {
    const end = this.endedAt ? new Date(this.endedAt).getTime() : Date.now();
    return Math.round((end - new Date(this.startedAt).getTime()) / 60_000);
  }
  isResolved(): boolean {
    return this.endedAt !== null;
  }
}

export class DrivingReport extends BaseEntity {
  constructor(
    id: string,
    public vehicleId: string,
    public periodStart: string,
    public periodEnd: string,
    public totalDistanceKm: number,
    public totalDurationMinutes: number,
    public averageSpeedKmh: number,
    public drivingScore: number,
    public harshBrakingEvents: number,
    public harshAccelerationEvents: number,
    public summaryJson: string,
  ) {
    super(id);
  }
  isHighRisk(thresholdScore: number): boolean {
    return this.drivingScore < thresholdScore;
  }
}
