// src/app/alerting/domain/model/alert.entity.ts

export type AlertType =
  | 'SUSPICIOUS_MOVEMENT'
  | 'TAMPERED_GPS'
  | 'SPEED_LIMIT_EXCEEDED'
  | 'GEOFENCE_BREACH'
  | 'DEVICE_OFFLINE';

export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type AlertStatus = 'UNREAD' | 'READ' | 'RESOLVED';

export class AlertEntity {
  constructor(
    public readonly id: string,
    public readonly organizationId: string,
    public readonly vehicleId: string,
    public readonly ruleId: string,
    public readonly type: AlertType,
    public readonly severity: AlertSeverity,
    public readonly status: AlertStatus,
    public readonly description: string,
    public readonly location: string,
    public readonly detail: string,
    public readonly createdAt: Date,
  ) {}

  get isUnread(): boolean {
    return this.status === 'UNREAD';
  }

  get isHighPriority(): boolean {
    return this.severity === 'HIGH' || this.severity === 'CRITICAL';
  }

  get typeLabel(): string {
    const labels: Record<AlertType, string> = {
      SUSPICIOUS_MOVEMENT: 'Suspicious movement',
      TAMPERED_GPS: 'Tampered GPS',
      SPEED_LIMIT_EXCEEDED: 'Vehicle exceed limit speed',
      GEOFENCE_BREACH: 'Geofence breach',
      DEVICE_OFFLINE: 'Device offline',
    };
    return labels[this.type];
  }

  get typeIcon(): string {
    const icons: Record<AlertType, string> = {
      SUSPICIOUS_MOVEMENT: '⚠',
      TAMPERED_GPS: '⊘',
      SPEED_LIMIT_EXCEEDED: '🚗',
      GEOFENCE_BREACH: '📍',
      DEVICE_OFFLINE: '📡',
    };
    return icons[this.type];
  }

  static fromJson(data: Record<string, unknown>): AlertEntity {
    return new AlertEntity(
      data['id'] as string,
      data['organizationId'] as string,
      data['vehicleId'] as string,
      data['ruleId'] as string,
      data['type'] as AlertType,
      data['severity'] as AlertSeverity,
      data['status'] as AlertStatus,
      data['description'] as string,
      data['location'] as string,
      data['detail'] as string,
      new Date(data['createdAt'] as string),
    );
  }
}
