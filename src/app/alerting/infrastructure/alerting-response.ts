export interface GeofenceResource {
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
}
export interface GeoPointResource {
  lat: number;
  lng: number;
}
export interface AlertRuleResource {
  id: string;
  ownerId: string;
  vehicleId: string | null;
  type: string;
  geofence: GeofenceResource | null;
  speedThresholdKmh: number | null;
  prolongedStopThresholdMinutes: number | null;
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface AlertRuleResponse {
  status: string;
  rules: AlertRuleResource[];
}
export interface SecurityAlertResource {
  id: string;
  ownerId: string;
  vehicleId: string;
  ruleId: string | null;
  type: string;
  severity: string;
  location: GeoPointResource;
  description: string;
  generatedAt: string;
  status: string;
  acknowledgedAt: string | null;
  closedAt: string | null;
}
export interface SecurityAlertResponse {
  status: string;
  alerts?: SecurityAlertResource[];
  alert?: SecurityAlertResource;
}
export interface AutomaticDefenseActionResource {
  id: string;
  vehicleId: string;
  triggeredByAlertId: string;
  actionType: string;
  commandId: string | null;
  result: string;
  triggeredAt: string;
  deactivatedAt: string | null;
}
export interface AutomaticDefenseActionResponse {
  status: string;
  actions?: AutomaticDefenseActionResource[];
  action?: AutomaticDefenseActionResource;
}
export interface SecurityOptionsResource {
  ownerId: string;
  suspiciousMovementEnabled: boolean;
  autoEngineShutdownEnabled: boolean;
  autoSafeModeEnabled: boolean;
  updatedAt: string;
}
export interface SecurityOptionsResponse {
  status: string;
  options: SecurityOptionsResource;
}
export interface NotificationPreferencesResource {
  ownerId: string;
  securityAlertsEnabled: boolean;
  liveLocationEnabled: boolean;
  maintenanceRemindersEnabled: boolean;
  updatedAt: string;
}
export interface NotificationPreferencesResponse {
  status: string;
  preferences: NotificationPreferencesResource;
}
