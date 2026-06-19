import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint';
import { environment } from '../../../environments/environment';
import {
  CommandListResponse,
  CommandResponse,
  DeviceHealthResponse,
  LocationShareLinkResponse,
  TheftReportListResponse,
  TheftReportResponse,
} from './commands-response';

@Injectable({ providedIn: 'root' })
export class CommandsApi extends BaseApi {
  private readonly commands: BaseEndpoint;
  private readonly deviceHealth: BaseEndpoint;
  private readonly theftReports: BaseEndpoint;
  private readonly shareLinks: BaseEndpoint;

  constructor(http: HttpClient) {
    super(http, environment.apiBaseUrl);
    this.commands = this.buildEndpoint('commands');
    this.deviceHealth = this.buildEndpoint('device-health');
    this.theftReports = this.buildEndpoint('theft-reports');
    this.shareLinks = this.buildEndpoint('location-share-links');
  }

  issueEngineBlock(vehicleId: string, issuedByUserId: string, triggeredByAlertId: string | null): Promise<CommandResponse> {
    return this.commands.create({ vehicleId, issuedByUserId, type: 'ENGINE_BLOCK', triggeredByAlertId }) as Promise<CommandResponse>;
  }
  issueEngineUnblock(vehicleId: string, issuedByUserId: string): Promise<CommandResponse> {
    return this.commands.create({ vehicleId, issuedByUserId, type: 'ENGINE_UNBLOCK' }) as Promise<CommandResponse>;
  }
  issueDeviceRestart(vehicleId: string, issuedByUserId: string): Promise<CommandResponse> {
    return this.commands.create({ vehicleId, issuedByUserId, type: 'DEVICE_RESTART' }) as Promise<CommandResponse>;
  }
  getCommandById(id: string): Promise<CommandResponse> {
    return this.commands.getById(id) as Promise<CommandResponse>;
  }
  getCommandsForVehicle(vehicleId: string): Promise<CommandListResponse> {
    return this.commands.getPath(`?vehicleId=${vehicleId}`) as Promise<CommandListResponse>;
  }
  getDeviceHealth(vehicleId: string): Promise<DeviceHealthResponse> {
    return this.deviceHealth.getById(vehicleId) as Promise<DeviceHealthResponse>;
  }
  reportTheft(vehicleId: string, reportedByUserId: string): Promise<TheftReportResponse> {
    return this.theftReports.create({ vehicleId, reportedByUserId }) as Promise<TheftReportResponse>;
  }
  getActiveTheftReports(): Promise<TheftReportListResponse> {
    return this.theftReports.getPath('?status=ACTIVE') as Promise<TheftReportListResponse>;
  }
  resolveTheftReport(id: string): Promise<TheftReportResponse> {
    return this.theftReports.postPath(`/${id}/resolve`, {}) as Promise<TheftReportResponse>;
  }
  generateLocationShareLink(vehicleId: string, createdByUserId: string, expiresAt: string | null): Promise<LocationShareLinkResponse> {
    return this.shareLinks.create({ vehicleId, createdByUserId, expiresAt }) as Promise<LocationShareLinkResponse>;
  }
}
