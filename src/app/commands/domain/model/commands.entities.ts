import { BaseEntity } from '../../../shared/domain/model/base.entity';

export enum CommandType {
  ENGINE_BLOCK = 'ENGINE_BLOCK',
  ENGINE_UNBLOCK = 'ENGINE_UNBLOCK',
  DEVICE_RESTART = 'DEVICE_RESTART',
}

export enum CommandStatus {
  ISSUED = 'ISSUED',
  DISPATCHED = 'DISPATCHED',
  ACKNOWLEDGED = 'ACKNOWLEDGED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

export enum CommandResult {
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
  TIMED_OUT = 'TIMED_OUT',
}

export enum DeviceConnectionStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export enum IncidentStatus {
  ACTIVE = 'ACTIVE',
  RESOLVED = 'RESOLVED',
}

export class Command extends BaseEntity {
  constructor(
    id: string,
    public vehicleId: string,
    public issuedByUserId: string,
    public type: CommandType,
    public triggeredByAlertId: string | null,
    public status: CommandStatus,
    public issuedAt: string,
    public dispatchedAt: string | null,
    public acknowledgedAt: string | null,
    public completedAt: string | null,
    public result: CommandResult | null,
  ) {
    super(id);
  }
  isPending(): boolean {
    return this.status === CommandStatus.ISSUED || this.status === CommandStatus.DISPATCHED;
  }
  isAcknowledged(): boolean {
    return this.status === CommandStatus.ACKNOWLEDGED;
  }
  isCompleted(): boolean {
    return this.status === CommandStatus.COMPLETED;
  }
  wasTriggeredAutomatically(): boolean {
    return this.triggeredByAlertId !== null;
  }
  logSummary(): string {
    return `[${this.issuedAt}] ${this.type} -> ${this.status}${this.result ? ` (${this.result})` : ''}`;
  }
}

export class DeviceHealth extends BaseEntity {
  constructor(
    public vehicleId: string,
    public deviceSerial: string,
    public model: string,
    public imei: string,
    public status: DeviceConnectionStatus,
    public lastConnectionAt: string,
    public batteryLevelPercent: number | null,
  ) {
    super(vehicleId);
  }
  isOperational(): boolean {
    return this.status === DeviceConnectionStatus.ACTIVE;
  }
  isStale(thresholdMinutes: number): boolean {
    return (Date.now() - new Date(this.lastConnectionAt).getTime()) / 60_000 > thresholdMinutes;
  }
}

export class TheftReport extends BaseEntity {
  constructor(
    id: string,
    public vehicleId: string,
    public reportedByUserId: string,
    public reportedAt: string,
    public status: IncidentStatus,
    public relatedCommandIds: string[],
    public relatedAlertId: string | null,
  ) {
    super(id);
  }
  isActive(): boolean {
    return this.status === IncidentStatus.ACTIVE;
  }
  activatesEmergencyProtocol(): boolean {
    return this.isActive();
  }
}

export class LocationShareLink extends BaseEntity {
  constructor(
    id: string,
    public vehicleId: string,
    public createdByUserId: string,
    public token: string,
    public createdAt: string,
    public expiresAt: string | null,
  ) {
    super(id);
  }
  isExpired(): boolean {
    return this.expiresAt !== null && new Date(this.expiresAt).getTime() < Date.now();
  }
  toShareableUrl(): string {
    return `${window.location.origin}/share/${this.token}`;
  }
}
