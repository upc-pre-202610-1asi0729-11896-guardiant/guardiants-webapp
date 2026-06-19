export interface CommandResource {
  id: string;
  vehicleId: string;
  issuedByUserId: string;
  type: string;
  triggeredByAlertId: string | null;
  status: string;
  issuedAt: string;
  dispatchedAt: string | null;
  acknowledgedAt: string | null;
  completedAt: string | null;
  result: string | null;
}
export interface CommandResponse {
  status: string;
  command: CommandResource;
}
export interface CommandListResponse {
  status: string;
  commands: CommandResource[];
}
export interface DeviceHealthResource {
  vehicleId: string;
  deviceSerial: string;
  model: string;
  imei: string;
  status: string;
  lastConnectionAt: string;
  batteryLevelPercent: number | null;
}
export interface DeviceHealthResponse {
  status: string;
  device: DeviceHealthResource;
}
export interface TheftReportResource {
  id: string;
  vehicleId: string;
  reportedByUserId: string;
  reportedAt: string;
  status: string;
  relatedCommandIds: string[];
  relatedAlertId: string | null;
}
export interface TheftReportResponse {
  status: string;
  report: TheftReportResource;
}
export interface TheftReportListResponse {
  status: string;
  reports: TheftReportResource[];
}
export interface LocationShareLinkResource {
  id: string;
  vehicleId: string;
  createdByUserId: string;
  token: string;
  createdAt: string;
  expiresAt: string | null;
}
export interface LocationShareLinkResponse {
  status: string;
  link: LocationShareLinkResource;
}
