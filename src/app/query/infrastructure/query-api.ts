import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint';
import { environment } from '../../../environments/environment';
import { SearchCriteria } from '../domain/model/query.entities';
import {
  DrivingReportResponse,
  OperationalReportResponse,
  ReportExportResponse,
  RouteHistoryResponse,
  SearchResponse,
} from './query-response';

@Injectable({ providedIn: 'root' })
export class QueryApi extends BaseApi {
  private readonly routeHistory: BaseEndpoint;
  private readonly drivingReports: BaseEndpoint;
  private readonly operationalReports: BaseEndpoint;
  private readonly searchEndpoint: BaseEndpoint;
  private readonly exports: BaseEndpoint;

  constructor(http: HttpClient) {
    super(http, environment.apiBaseUrl);
    this.routeHistory = this.buildEndpoint('query/route-history');
    this.drivingReports = this.buildEndpoint('query/driving-reports');
    this.operationalReports = this.buildEndpoint('query/operational-reports');
    this.searchEndpoint = this.buildEndpoint('query/search');
    this.exports = this.buildEndpoint('query/exports');
  }

  private range(id: string, key: string, startDate: string, endDate: string): string {
    return `?${key}=${id}&start=${startDate}&end=${endDate}`;
  }

  getRouteHistory(vehicleId: string, startDate: string, endDate: string): Promise<RouteHistoryResponse> {
    return this.routeHistory.getPath(this.range(vehicleId, 'vehicleId', startDate, endDate)) as Promise<RouteHistoryResponse>;
  }
  getDrivingReport(vehicleId: string, startDate: string, endDate: string): Promise<DrivingReportResponse> {
    return this.drivingReports.getPath(this.range(vehicleId, 'vehicleId', startDate, endDate)) as Promise<DrivingReportResponse>;
  }
  getOperationalReport(fleetId: string, startDate: string, endDate: string): Promise<OperationalReportResponse> {
    return this.operationalReports.getPath(this.range(fleetId, 'fleetId', startDate, endDate)) as Promise<OperationalReportResponse>;
  }
  search(criteria: SearchCriteria): Promise<SearchResponse> {
    return this.searchEndpoint.create({
      queryText: criteria.queryText,
      entityTypes: criteria.entityTypes,
      dateRange: criteria.dateRange,
      vehicleStatus: criteria.vehicleStatus,
      eventType: criteria.eventType,
      location: criteria.location,
    }) as Promise<SearchResponse>;
  }
  exportReport(sourceReportId: string, format: string): Promise<ReportExportResponse> {
    return this.exports.create({ sourceReportId, format }) as Promise<ReportExportResponse>;
  }
}
