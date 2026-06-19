export interface TelemetryPointResource {
  id: string;
  vehicleId: string;
  deviceId: string;
  timestamp: string;
  lat: number;
  lng: number;
  heading: number | null;
  speedKmh: number;
  fuelLevelPercent: number | null;
  engineTemperatureC: number | null;
  batteryLevelPercent: number;
  odometerKm: number | null;
  rpm: number | null;
  engineOn: boolean;
  connectivity: string;
}
export interface TelemetryStreamResponse {
  status: string;
  points: TelemetryPointResource[];
}
export interface VehicleStatusResource {
  vehicleId: string;
  latestPoint: TelemetryPointResource | null;
  activeAlertCount: number;
  isLocked: boolean;
  lastUpdatedAt: string;
}
export interface VehicleStatusResponse {
  status: string;
  vehicle: VehicleStatusResource;
}
export interface GeoPointResource {
  lat: number;
  lng: number;
  recordedAt: string;
}
export interface RouteSegmentResource {
  id: string;
  vehicleId: string;
  startedAt: string;
  endedAt: string | null;
  points: GeoPointResource[];
  distanceKm: number;
}
export interface RouteHistoryResponse {
  status: string;
  vehicleId: string;
  segments: RouteSegmentResource[];
}
export interface RouteDeviationResource {
  id: string;
  vehicleId: string;
  expectedRouteId: string | null;
  detectedAt: string;
  location: GeoPointResource;
  deviationDistanceMeters: number;
}
export interface RouteDeviationResponse {
  status: string;
  deviations: RouteDeviationResource[];
}
export interface ProlongedStopResource {
  id: string;
  vehicleId: string;
  location: GeoPointResource;
  startedAt: string;
  endedAt: string | null;
  thresholdMinutes: number;
}
export interface ProlongedStopResponse {
  status: string;
  stops: ProlongedStopResource[];
}
export interface DrivingReportResource {
  id: string;
  vehicleId: string;
  periodStart: string;
  periodEnd: string;
  totalDistanceKm: number;
  totalDurationMinutes: number;
  averageSpeedKmh: number;
  drivingScore: number;
  harshBrakingEvents: number;
  harshAccelerationEvents: number;
  summary: string;
}
export interface DrivingReportResponse {
  status: string;
  reports: DrivingReportResource[];
}
