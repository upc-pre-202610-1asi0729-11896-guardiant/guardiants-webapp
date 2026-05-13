// src/app/alerting/infrastructure/alert-response.ts

import { AlertSeverity, AlertStatus, AlertType } from '../domain/model/alert.entity';

/**
 * Raw JSON shape returned by json-server / backend for a single alert.
 */
export interface AlertResource {
  id: string;
  organizationId: string;
  vehicleId: string;
  ruleId: string;
  type: AlertType;
  severity: AlertSeverity;
  status: AlertStatus;
  description: string;
  location: string;
  detail: string;
  createdAt: string; // ISO 8601
}

/**
 * Envelope used when the API wraps alerts in a collection object.
 * json-server returns a plain array, so we also support that pattern.
 */
export interface AlertListResponse {
  alerts: AlertResource[];
}
