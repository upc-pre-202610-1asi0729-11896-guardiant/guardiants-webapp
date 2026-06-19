import { Fleet, OrganizationType } from '../domain/model/fleet.entity';
import {
  DeviceAssignment,
  Vehicle,
  VehicleStatusValue,
} from '../domain/model/vehicle.entity';
import { AlertRule, AlertRuleType, GeoArea } from '../domain/model/alert-rule.entity';
import { VehicleLoan, LoanStatus } from '../domain/model/vehicle-loan.entity';
import { DrivingReport } from '../domain/model/driving-report.entity';
import {
  AlertRuleResource,
  AlertRuleResponse,
  DeviceAssignmentResource,
  DeviceAssignmentResponse,
  DrivingReportResource,
  DrivingReportResponse,
  FleetResource,
  FleetResponse,
  VehicleLoanResource,
  VehicleLoanResponse,
  VehicleResource,
  VehicleResponse,
} from './fleet-response';

export class FleetAssembler {
  static toEntityFromResource(resource: FleetResource): Fleet | null {
    if (!resource) return null;
    return new Fleet(
      resource.id,
      resource.ownerId,
      resource.name,
      resource.organizationType as OrganizationType,
      resource.createdAt,
    );
  }
  static toEntitiesFromResponse(response: FleetResponse): Fleet[] {
    return (response?.fleets ?? [])
      .map((r) => FleetAssembler.toEntityFromResource(r))
      .filter((e): e is Fleet => e !== null);
  }
}

export class DeviceAssignmentAssembler {
  static toEntityFromResource(resource: DeviceAssignmentResource | null): DeviceAssignment | null {
    if (!resource) return null;
    return new DeviceAssignment(
      resource.id,
      resource.vehicleId,
      resource.deviceSerial,
      resource.assignedAt,
      resource.unassignedAt,
    );
  }
  static toEntityFromResponse(response: DeviceAssignmentResponse): DeviceAssignment | null {
    return DeviceAssignmentAssembler.toEntityFromResource(response?.assignment ?? null);
  }
}

export class VehicleAssembler {
  static toEntityFromResource(resource: VehicleResource): Vehicle | null {
    if (!resource) return null;
    return new Vehicle(
      resource.id,
      resource.fleetId,
      resource.plate,
      resource.model,
      resource.brand,
      resource.year,
      resource.status as VehicleStatusValue,
      null,
      DeviceAssignmentAssembler.toEntityFromResource(resource.deviceAssignment),
    );
  }
  static toEntitiesFromResponse(response: VehicleResponse): Vehicle[] {
    return (response?.vehicles ?? [])
      .map((r) => VehicleAssembler.toEntityFromResource(r))
      .filter((e): e is Vehicle => e !== null);
  }
}

export class AlertRuleAssembler {
  static toEntityFromResource(resource: AlertRuleResource): AlertRule | null {
    if (!resource) return null;
    const area = resource.geofenceArea
      ? new GeoArea(
          resource.geofenceArea.centerLat,
          resource.geofenceArea.centerLng,
          resource.geofenceArea.radiusMeters,
        )
      : null;
    return new AlertRule(
      resource.id,
      resource.fleetId,
      resource.vehicleId,
      resource.type as AlertRuleType,
      resource.threshold,
      area,
      resource.enabled,
    );
  }
  static toEntitiesFromResponse(response: AlertRuleResponse): AlertRule[] {
    return (response?.rules ?? [])
      .map((r) => AlertRuleAssembler.toEntityFromResource(r))
      .filter((e): e is AlertRule => e !== null);
  }
}

export class VehicleLoanAssembler {
  static toEntityFromResource(resource: VehicleLoanResource): VehicleLoan | null {
    if (!resource) return null;
    return new VehicleLoan(
      resource.id,
      resource.vehicleId,
      resource.fleetId,
      resource.requestedByPersonnelId,
      resource.approvedByApproverId,
      resource.status as LoanStatus,
      resource.requestedAt,
      resource.decidedAt,
      resource.assignedAt,
      resource.returnRequestedAt,
      resource.returnConfirmedAt,
      resource.rejectionReason,
      resource.expectedReturnDate,
    );
  }
  static toEntitiesFromResponse(response: VehicleLoanResponse): VehicleLoan[] {
    return (response?.loans ?? [])
      .map((r) => VehicleLoanAssembler.toEntityFromResource(r))
      .filter((e): e is VehicleLoan => e !== null);
  }
}

export class DrivingReportAssembler {
  static toEntityFromResource(resource: DrivingReportResource): DrivingReport | null {
    if (!resource) return null;
    return new DrivingReport(
      resource.id,
      resource.vehicleId,
      resource.periodStart,
      resource.periodEnd,
      resource.totalDistanceKm,
      resource.totalDurationMinutes,
      resource.averageSpeedKmh,
      resource.drivingScore,
      resource.harshBrakingEvents,
      resource.harshAccelerationEvents,
    );
  }
  static toEntitiesFromResponse(response: DrivingReportResponse): DrivingReport[] {
    return (response?.reports ?? [])
      .map((r) => DrivingReportAssembler.toEntityFromResource(r))
      .filter((e): e is DrivingReport => e !== null);
  }
}
