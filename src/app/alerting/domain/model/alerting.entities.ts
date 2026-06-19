import { BaseEntity } from '../../../shared/domain/model/base.entity';

export enum AlertRuleType {
  GEOFENCE = 'GEOFENCE',
  SPEED_LIMIT = 'SPEED_LIMIT',
  GPS_JAMMING = 'GPS_JAMMING',
  PROLONGED_STOP = 'PROLONGED_STOP',
  SUSPICIOUS_MOVEMENT = 'SUSPICIOUS_MOVEMENT',
}

export enum TelemetryEventType {
  GEOFENCE_EXIT = 'GEOFENCE_EXIT',
  ROUTE_DEVIATION = 'ROUTE_DEVIATION',
  PROLONGED_STOP = 'PROLONGED_STOP',
  GPS_SIGNAL_LOST = 'GPS_SIGNAL_LOST',
  SPEED_EXCEEDED = 'SPEED_EXCEEDED',
}

export enum AlertType {
  SUSPICIOUS_MOVEMENT = 'SUSPICIOUS_MOVEMENT',
  GPS_SPOOFING = 'GPS_SPOOFING',
  SPEED_EXCEEDED = 'SPEED_EXCEEDED',
  ROUTE_DEVIATION = 'ROUTE_DEVIATION',
  PROLONGED_STOP = 'PROLONGED_STOP',
  GEOFENCE_EXIT = 'GEOFENCE_EXIT',
  THEFT_REPORTED = 'THEFT_REPORTED',
}

export enum AlertSeverity {
  INFO = 'INFO',
  WARNING = 'WARNING',
  CRITICAL = 'CRITICAL',
}

export enum AlertStatus {
  GENERATED = 'GENERATED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  CLOSED = 'CLOSED',
}

export enum AlertPeriod {
  LAST_HOUR = 'LAST_HOUR',
  TODAY = 'TODAY',
  LAST_7_DAYS = 'LAST_7_DAYS',
  LAST_30_DAYS = 'LAST_30_DAYS',
}

export enum AlertFilterCategory {
  ALL = 'ALL',
  UNREAD = 'UNREAD',
  URGENT = 'URGENT',
}

export enum DefenseActionType {
  ENGINE_BLOCK = 'ENGINE_BLOCK',
  NOTIFY_AUTHORITIES = 'NOTIFY_AUTHORITIES',
}

export enum DefenseActionResult {
  PENDING = 'PENDING',
  DISPATCHED = 'DISPATCHED',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export class GeoPoint {
  constructor(
    public lat: number,
    public lng: number,
  ) {}
}

export class Geofence {
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
    return 2 * R * Math.asin(Math.sqrt(a)) <= this.radiusMeters;
  }
}

export class RuleEvaluationInput {
  constructor(
    public vehicleId: string,
    public eventType: TelemetryEventType,
    public lat: number,
    public lng: number,
    public speedKmh: number | null,
    public stopDurationMinutes: number | null,
  ) {}
}

export class AlertRule extends BaseEntity {
  constructor(
    id: string,
    public ownerId: string,
    public vehicleId: string | null,
    public type: AlertRuleType,
    public geofence: Geofence | null,
    public speedThresholdKmh: number | null,
    public prolongedStopThresholdMinutes: number | null,
    public enabled: boolean,
    public createdAt: string,
    public updatedAt: string,
  ) {
    super(id);
  }
  appliesToVehicle(vehicleId: string): boolean {
    return this.enabled && (this.vehicleId === null || this.vehicleId === vehicleId);
  }
  isViolatedBy(event: RuleEvaluationInput): boolean {
    if (!this.enabled) return false;
    switch (this.type) {
      case AlertRuleType.GEOFENCE:
        return this.geofence ? !this.geofence.contains(event.lat, event.lng) : false;
      case AlertRuleType.SPEED_LIMIT:
        return (
          this.speedThresholdKmh !== null &&
          event.speedKmh !== null &&
          event.speedKmh > this.speedThresholdKmh
        );
      case AlertRuleType.PROLONGED_STOP:
        return (
          this.prolongedStopThresholdMinutes !== null &&
          event.stopDurationMinutes !== null &&
          event.stopDurationMinutes > this.prolongedStopThresholdMinutes
        );
      case AlertRuleType.GPS_JAMMING:
        return event.eventType === TelemetryEventType.GPS_SIGNAL_LOST;
      default:
        return false;
    }
  }
}

export class SecurityAlert extends BaseEntity {
  constructor(
    id: string,
    public ownerId: string,
    public vehicleId: string,
    public ruleId: string | null,
    public type: AlertType,
    public severity: AlertSeverity,
    public location: GeoPoint,
    public description: string,
    public generatedAt: string,
    public status: AlertStatus,
    public acknowledgedAt: string | null,
    public closedAt: string | null,
  ) {
    super(id);
  }
  isUnread(): boolean {
    return this.status === AlertStatus.GENERATED;
  }
  isUrgent(): boolean {
    return this.severity === AlertSeverity.CRITICAL && this.status !== AlertStatus.CLOSED;
  }
  isWithinPeriod(period: AlertPeriod): boolean {
    const generated = new Date(this.generatedAt).getTime();
    const now = Date.now();
    const spans: Record<AlertPeriod, number> = {
      [AlertPeriod.LAST_HOUR]: 3_600_000,
      [AlertPeriod.TODAY]: 86_400_000,
      [AlertPeriod.LAST_7_DAYS]: 7 * 86_400_000,
      [AlertPeriod.LAST_30_DAYS]: 30 * 86_400_000,
    };
    return now - generated <= spans[period];
  }
  canBeAcknowledged(): boolean {
    return this.status === AlertStatus.GENERATED;
  }
  canBeClosed(): boolean {
    return this.status !== AlertStatus.CLOSED;
  }
}

export class AlertFilter {
  constructor(
    public category: AlertFilterCategory,
    public period: AlertPeriod | null,
  ) {}
  matches(alert: SecurityAlert): boolean {
    if (this.period && !alert.isWithinPeriod(this.period)) return false;
    switch (this.category) {
      case AlertFilterCategory.UNREAD:
        return alert.isUnread();
      case AlertFilterCategory.URGENT:
        return alert.isUrgent();
      default:
        return true;
    }
  }
}

export class AutomaticDefenseAction extends BaseEntity {
  constructor(
    id: string,
    public vehicleId: string,
    public triggeredByAlertId: string,
    public actionType: DefenseActionType,
    public commandId: string | null,
    public result: DefenseActionResult,
    public triggeredAt: string,
    public deactivatedAt: string | null,
  ) {
    super(id);
  }
  isActive(): boolean {
    return this.deactivatedAt === null;
  }
  logSummary(): string {
    return `[${this.triggeredAt}] ${this.actionType} -> ${this.result}`;
  }
}

export class SecurityOptions extends BaseEntity {
  constructor(
    public ownerId: string,
    public suspiciousMovementEnabled: boolean,
    public autoEngineShutdownEnabled: boolean,
    public autoSafeModeEnabled: boolean,
    public updatedAt: string,
  ) {
    super(ownerId);
  }
  shouldTriggerAutoDefense(alert: SecurityAlert): boolean {
    return this.autoEngineShutdownEnabled && alert.isUrgent();
  }
}

export class NotificationPreferences extends BaseEntity {
  constructor(
    public ownerId: string,
    public securityAlertsEnabled: boolean,
    public liveLocationEnabled: boolean,
    public maintenanceRemindersEnabled: boolean,
    public updatedAt: string,
  ) {
    super(ownerId);
  }
  allows(alertType: AlertType): boolean {
    void alertType;
    return this.securityAlertsEnabled;
  }
}
