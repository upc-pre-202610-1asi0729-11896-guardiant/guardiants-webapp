import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint';
import { environment } from '../../../environments/environment';
import {
  AlertRuleResource,
  AlertRuleResponse,
  DeviceAssignmentResponse,
  DrivingReportResponse,
  FleetResource,
  FleetResponse,
  VehicleLoanResource,
  VehicleLoanResponse,
  VehicleResource,
  VehicleResponse,
} from './fleet-response';

@Injectable({ providedIn: 'root' })
export class FleetApi extends BaseApi {
  private readonly fleets: BaseEndpoint;
  private readonly vehicles: BaseEndpoint;
  private readonly deviceAssignments: BaseEndpoint;
  private readonly alertRules: BaseEndpoint;
  private readonly vehicleLoans: BaseEndpoint;
  private readonly drivingReports: BaseEndpoint;

  constructor(http: HttpClient) {
    super(http, environment.apiBaseUrl);
    this.fleets = this.buildEndpoint('fleets');
    this.vehicles = this.buildEndpoint('vehicles');
    this.deviceAssignments = this.buildEndpoint('device-assignments');
    this.alertRules = this.buildEndpoint('alert-rules');
    this.vehicleLoans = this.buildEndpoint('vehicle-loans');
    this.drivingReports = this.buildEndpoint('driving-reports');
  }

  getFleets(ownerId: string): Promise<FleetResponse> {
    return this.fleets.getPath(`?ownerId=${ownerId}`) as Promise<FleetResponse>;
  }
  createFleet(resource: Partial<FleetResource>): Promise<FleetResponse> {
    return this.fleets.create(resource) as Promise<FleetResponse>;
  }

  getVehicles(fleetId: string): Promise<VehicleResponse> {
    return this.vehicles.getPath(`?fleetId=${fleetId}`) as Promise<VehicleResponse>;
  }
  getVehicleByPlate(plate: string): Promise<VehicleResponse> {
    return this.vehicles.getPath(`?plate=${encodeURIComponent(plate)}`) as Promise<VehicleResponse>;
  }
  createVehicle(resource: Partial<VehicleResource>): Promise<VehicleResponse> {
    return this.vehicles.create(resource) as Promise<VehicleResponse>;
  }
  updateVehicle(id: string, patch: object): Promise<VehicleResponse> {
    return this.vehicles.update(id, patch) as Promise<VehicleResponse>;
  }
  deactivateVehicle(id: string): Promise<VehicleResponse> {
    return this.vehicles.update(id, { status: 'INACTIVE' }) as Promise<VehicleResponse>;
  }

  assignDevice(vehicleId: string, deviceSerial: string): Promise<DeviceAssignmentResponse> {
    return this.deviceAssignments.create({ vehicleId, deviceSerial }) as Promise<DeviceAssignmentResponse>;
  }
  unassignDevice(assignmentId: string): Promise<DeviceAssignmentResponse> {
    return this.deviceAssignments.update(assignmentId, {
      unassignedAt: new Date().toISOString(),
    }) as Promise<DeviceAssignmentResponse>;
  }

  getAlertRules(fleetId: string): Promise<AlertRuleResponse> {
    return this.alertRules.getPath(`?fleetId=${fleetId}`) as Promise<AlertRuleResponse>;
  }
  createAlertRule(resource: Partial<AlertRuleResource>): Promise<AlertRuleResponse> {
    return this.alertRules.create(resource) as Promise<AlertRuleResponse>;
  }
  updateAlertRule(id: string, patch: object): Promise<AlertRuleResponse> {
    return this.alertRules.update(id, patch) as Promise<AlertRuleResponse>;
  }

  getVehicleLoans(fleetId: string, statusFilter: string | null): Promise<VehicleLoanResponse> {
    const filter = statusFilter ? `&status=${statusFilter}` : '';
    return this.vehicleLoans.getPath(`?fleetId=${fleetId}${filter}`) as Promise<VehicleLoanResponse>;
  }
  requestVehicleLoan(resource: Partial<VehicleLoanResource>): Promise<VehicleLoanResponse> {
    return this.vehicleLoans.create(resource) as Promise<VehicleLoanResponse>;
  }
  approveVehicleLoan(loanId: string, approverId: string): Promise<VehicleLoanResponse> {
    return this.vehicleLoans.postPath(`/${loanId}/approve`, { approverId }) as Promise<VehicleLoanResponse>;
  }
  rejectVehicleLoan(loanId: string, approverId: string, reason: string): Promise<VehicleLoanResponse> {
    return this.vehicleLoans.postPath(`/${loanId}/reject`, {
      approverId,
      reason,
    }) as Promise<VehicleLoanResponse>;
  }
  assignVehicleToPersonnel(loanId: string): Promise<VehicleLoanResponse> {
    return this.vehicleLoans.postPath(`/${loanId}/assign`, {}) as Promise<VehicleLoanResponse>;
  }
  requestVehicleReturn(loanId: string): Promise<VehicleLoanResponse> {
    return this.vehicleLoans.postPath(`/${loanId}/return-request`, {}) as Promise<VehicleLoanResponse>;
  }
  confirmVehicleReturn(loanId: string, supervisorId: string): Promise<VehicleLoanResponse> {
    return this.vehicleLoans.postPath(`/${loanId}/return-confirm`, {
      supervisorId,
    }) as Promise<VehicleLoanResponse>;
  }

  getDrivingReports(vehicleId: string, startDate: string, endDate: string): Promise<DrivingReportResponse> {
    return this.drivingReports.getPath(
      `?vehicleId=${vehicleId}&start=${startDate}&end=${endDate}`,
    ) as Promise<DrivingReportResponse>;
  }
}
