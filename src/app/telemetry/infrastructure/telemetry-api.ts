import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint';
import { environment } from '../../../environments/environment';
import {
  DrivingReportResponse,
  ProlongedStopResponse,
  RouteDeviationResponse,
  RouteHistoryResponse,
  TelemetryPointResource,
  TelemetryStreamResponse,
  VehicleStatusResponse,
} from './telemetry-response';

@Injectable({ providedIn: 'root' })
export class TelemetryApi extends BaseApi {
  private readonly telemetryPoints: BaseEndpoint;
  private readonly vehicleStatus: BaseEndpoint;
  private readonly routeSegments: BaseEndpoint;
  private readonly routeDeviations: BaseEndpoint;
  private readonly prolongedStops: BaseEndpoint;
  private readonly drivingReports: BaseEndpoint;

  constructor(http: HttpClient) {
    super(http, environment.apiBaseUrl);
    this.telemetryPoints = this.buildEndpoint('telemetry-points');
    this.vehicleStatus = this.buildEndpoint('vehicle-status');
    this.routeSegments = this.buildEndpoint('route-segments');
    this.routeDeviations = this.buildEndpoint('route-deviations');
    this.prolongedStops = this.buildEndpoint('prolonged-stops');
    this.drivingReports = this.buildEndpoint('driving-reports');
  }

  private range(vehicleId: string, startDate: string, endDate: string): string {
    return `?vehicleId=${vehicleId}&start=${startDate}&end=${endDate}`;
  }

  getLatestTelemetryPoint(vehicleId: string): Promise<TelemetryStreamResponse> {
    return this.telemetryPoints.getPath(`?vehicleId=${vehicleId}&latest=true`) as Promise<TelemetryStreamResponse>;
  }
  getLiveStatus(vehicleId: string): Promise<VehicleStatusResponse> {
    return this.vehicleStatus.getById(vehicleId) as Promise<VehicleStatusResponse>;
  }
  getRouteHistory(vehicleId: string, startDate: string, endDate: string): Promise<RouteHistoryResponse> {
    return this.routeSegments.getPath(this.range(vehicleId, startDate, endDate)) as Promise<RouteHistoryResponse>;
  }
  getRouteDeviations(vehicleId: string, startDate: string, endDate: string): Promise<RouteDeviationResponse> {
    return this.routeDeviations.getPath(this.range(vehicleId, startDate, endDate)) as Promise<RouteDeviationResponse>;
  }
  getProlongedStops(vehicleId: string, startDate: string, endDate: string): Promise<ProlongedStopResponse> {
    return this.prolongedStops.getPath(this.range(vehicleId, startDate, endDate)) as Promise<ProlongedStopResponse>;
  }
  getDrivingReports(vehicleId: string, startDate: string, endDate: string): Promise<DrivingReportResponse> {
    return this.drivingReports.getPath(this.range(vehicleId, startDate, endDate)) as Promise<DrivingReportResponse>;
  }
  subscribeLiveStream(vehicleId: string): Observable<TelemetryPointResource> {
    return this.telemetryPoints.subscribe().pipe(
      map((o) => (o as { point: TelemetryPointResource }).point ?? (o as TelemetryPointResource)),
    );
  }
}
