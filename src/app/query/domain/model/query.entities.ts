import { BaseEntity } from '../../../shared/domain/model/base.entity';
import { DateRange } from '../../../shared/domain/model/value-objects';

export enum RiskPatternType {
  HARSH_BRAKING = 'HARSH_BRAKING',
  HARSH_ACCELERATION = 'HARSH_ACCELERATION',
  SPEEDING = 'SPEEDING',
  FREQUENT_DEVIATIONS = 'FREQUENT_DEVIATIONS',
}

export enum SearchEntityType {
  VEHICLE = 'VEHICLE',
  ROUTE = 'ROUTE',
  SECURITY_EVENT = 'SECURITY_EVENT',
  OPERATIONAL_REPORT = 'OPERATIONAL_REPORT',
}

export enum ExportFormat {
  PDF = 'PDF',
  CSV = 'CSV',
}

export class GeoPoint {
  constructor(
    public lat: number,
    public lng: number,
  ) {}
}

export class RouteSegmentSummary {
  constructor(
    public segmentId: string,
    public startedAt: string,
    public endedAt: string | null,
    public startLocation: GeoPoint,
    public endLocation: GeoPoint,
    public distanceKm: number,
    public durationMinutes: number,
  ) {}
}

export class RouteHistoryView extends BaseEntity {
  constructor(
    id: string,
    public vehicleId: string,
    public periodStart: string,
    public periodEnd: string,
    public segments: RouteSegmentSummary[],
    public totalDistanceKm: number,
    public totalDurationMinutes: number,
    public totalTripsCount: number,
  ) {
    super(id);
  }
  hasData(): boolean {
    return this.segments.length > 0;
  }
  isEmpty(): boolean {
    return !this.hasData();
  }
}

export class RiskPattern {
  constructor(
    public type: RiskPatternType,
    public occurrences: number,
    public lastDetectedAt: string,
  ) {}
}

export class DrivingReportView extends BaseEntity {
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
    public riskPatterns: RiskPattern[],
  ) {
    super(id);
  }
  isHighRisk(thresholdScore: number): boolean {
    return this.drivingScore < thresholdScore;
  }
  hasData(): boolean {
    return this.totalDistanceKm > 0;
  }
}

export class VehicleOperationalSummary {
  constructor(
    public vehicleId: string,
    public plate: string,
    public totalDistanceKm: number,
    public totalTripsCount: number,
    public alertsCount: number,
    public loansCount: number,
    public drivingScore: number | null,
  ) {}
}

export class OperationalReportView extends BaseEntity {
  constructor(
    id: string,
    public fleetId: string,
    public periodStart: string,
    public periodEnd: string,
    public vehicleSummaries: VehicleOperationalSummary[],
    public totalAlertsCount: number,
    public totalLoansCount: number,
    public generatedAt: string,
  ) {
    super(id);
  }
  hasData(): boolean {
    return this.vehicleSummaries.length > 0;
  }
  exportableSections(): string[] {
    return ['vehicles', 'alerts', 'loans'];
  }
}

export class SearchResult {
  constructor(
    public entityType: SearchEntityType,
    public entityId: string,
    public label: string,
    public subtitle: string,
    public location: GeoPoint | null,
    public occurredAt: string | null,
  ) {}
}

export class SearchCriteria {
  constructor(
    public queryText: string,
    public entityTypes: SearchEntityType[],
    public dateRange: DateRange | null = null,
    public vehicleStatus: string | null = null,
    public eventType: string | null = null,
    public location: GeoPoint | null = null,
  ) {}
  isEmpty(): boolean {
    return this.queryText.trim() === '' && this.entityTypes.length === 0;
  }
}

export class ReportExport extends BaseEntity {
  constructor(
    id: string,
    public sourceReportId: string,
    public format: ExportFormat,
    public generatedAt: string,
    public downloadUrl: string,
  ) {
    super(id);
  }
  isReady(): boolean {
    return this.downloadUrl.length > 0;
  }
}
