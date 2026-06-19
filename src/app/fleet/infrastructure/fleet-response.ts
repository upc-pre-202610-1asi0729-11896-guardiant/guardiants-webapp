/** REST resource/response contracts for the Fleet bounded context. */

export interface FleetResource {
  id: string;
  ownerId: string;
  name: string;
  organizationType: string;
  createdAt: string;
}
export interface FleetResponse {
  status: string;
  fleets: FleetResource[];
}

export interface DeviceAssignmentResource {
  id: string;
  vehicleId: string;
  deviceSerial: string;
  assignedAt: string;
  unassignedAt: string | null;
}
export interface DeviceAssignmentResponse {
  status: string;
  assignment: DeviceAssignmentResource;
}

export interface VehicleResource {
  id: string;
  fleetId: string;
  plate: string;
  model: string;
  brand: string;
  year: number;
  status: string;
  deviceAssignment: DeviceAssignmentResource | null;
  currentLoanId: string | null;
}
export interface VehicleResponse {
  status: string;
  vehicles: VehicleResource[];
}

export interface GeoAreaResource {
  centerLat: number;
  centerLng: number;
  radiusMeters: number;
}
export interface AlertRuleResource {
  id: string;
  fleetId: string;
  vehicleId: string | null;
  type: string;
  threshold: number | null;
  geofenceArea: GeoAreaResource | null;
  enabled: boolean;
}
export interface AlertRuleResponse {
  status: string;
  rules: AlertRuleResource[];
}

export interface VehicleLoanResource {
  id: string;
  vehicleId: string;
  fleetId: string;
  requestedByPersonnelId: string;
  approvedByApproverId: string | null;
  status: string;
  requestedAt: string;
  decidedAt: string | null;
  assignedAt: string | null;
  returnRequestedAt: string | null;
  returnConfirmedAt: string | null;
  rejectionReason: string | null;
  expectedReturnDate: string;
}
export interface VehicleLoanResponse {
  status: string;
  loans: VehicleLoanResource[];
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
}
export interface DrivingReportResponse {
  status: string;
  reports: DrivingReportResource[];
}
