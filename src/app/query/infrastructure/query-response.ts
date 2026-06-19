export interface RouteSegmentResource {
  segmentId: string;
  startedAt: string;
  endedAt: string | null;
  startLat: number;
  startLng: number;
  endLat: number;
  endLng: number;
  distanceKm: number;
  durationMinutes: number;
}
export interface RouteHistoryResource {
  id: string;
  vehicleId: string;
  periodStart: string;
  periodEnd: string;
  segments: RouteSegmentResource[];
  totalDistanceKm: number;
  totalDurationMinutes: number;
  totalTripsCount: number;
}
export interface RouteHistoryResponse {
  status: string;
  view: RouteHistoryResource | null;
}
export interface RiskPatternResource {
  type: string;
  occurrences: number;
  lastDetectedAt: string;
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
  riskPatterns: RiskPatternResource[];
}
export interface DrivingReportResponse {
  status: string;
  view: DrivingReportResource | null;
}
export interface VehicleOperationalSummaryResource {
  vehicleId: string;
  plate: string;
  totalDistanceKm: number;
  totalTripsCount: number;
  alertsCount: number;
  loansCount: number;
  drivingScore: number | null;
}
export interface OperationalReportResource {
  id: string;
  fleetId: string;
  periodStart: string;
  periodEnd: string;
  vehicleSummaries: VehicleOperationalSummaryResource[];
  totalAlertsCount: number;
  totalLoansCount: number;
  generatedAt: string;
}
export interface OperationalReportResponse {
  status: string;
  view: OperationalReportResource | null;
}
export interface SearchResultResource {
  entityType: string;
  entityId: string;
  label: string;
  subtitle: string;
  lat: number | null;
  lng: number | null;
  occurredAt: string | null;
}
export interface SearchResponse {
  status: string;
  results: SearchResultResource[];
}
export interface ReportExportResource {
  id: string;
  sourceReportId: string;
  format: string;
  generatedAt: string;
  downloadUrl: string;
}
export interface ReportExportResponse {
  status: string;
  export: ReportExportResource;
}
