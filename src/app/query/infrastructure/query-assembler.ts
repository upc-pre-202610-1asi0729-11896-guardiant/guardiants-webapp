import {
  DrivingReportView,
  ExportFormat,
  GeoPoint,
  OperationalReportView,
  ReportExport,
  RiskPattern,
  RiskPatternType,
  RouteHistoryView,
  RouteSegmentSummary,
  SearchEntityType,
  SearchResult,
  VehicleOperationalSummary,
} from '../domain/model/query.entities';
import {
  DrivingReportResponse,
  OperationalReportResponse,
  ReportExportResponse,
  RouteHistoryResponse,
  SearchResponse,
} from './query-response';

export class RouteHistoryAssembler {
  static toEntityFromResponse(response: RouteHistoryResponse): RouteHistoryView | null {
    const v = response?.view;
    if (!v) return null;
    return new RouteHistoryView(
      v.id,
      v.vehicleId,
      v.periodStart,
      v.periodEnd,
      (v.segments ?? []).map(
        (s) =>
          new RouteSegmentSummary(
            s.segmentId,
            s.startedAt,
            s.endedAt,
            new GeoPoint(s.startLat, s.startLng),
            new GeoPoint(s.endLat, s.endLng),
            s.distanceKm,
            s.durationMinutes,
          ),
      ),
      v.totalDistanceKm,
      v.totalDurationMinutes,
      v.totalTripsCount,
    );
  }
}

export class DrivingReportAssembler {
  static toEntityFromResponse(response: DrivingReportResponse): DrivingReportView | null {
    const v = response?.view;
    if (!v) return null;
    return new DrivingReportView(
      v.id,
      v.vehicleId,
      v.periodStart,
      v.periodEnd,
      v.totalDistanceKm,
      v.totalDurationMinutes,
      v.averageSpeedKmh,
      v.drivingScore,
      v.harshBrakingEvents,
      v.harshAccelerationEvents,
      (v.riskPatterns ?? []).map(
        (p) => new RiskPattern(p.type as RiskPatternType, p.occurrences, p.lastDetectedAt),
      ),
    );
  }
}

export class OperationalReportAssembler {
  static toEntityFromResponse(response: OperationalReportResponse): OperationalReportView | null {
    const v = response?.view;
    if (!v) return null;
    return new OperationalReportView(
      v.id,
      v.fleetId,
      v.periodStart,
      v.periodEnd,
      (v.vehicleSummaries ?? []).map(
        (s) =>
          new VehicleOperationalSummary(
            s.vehicleId,
            s.plate,
            s.totalDistanceKm,
            s.totalTripsCount,
            s.alertsCount,
            s.loansCount,
            s.drivingScore,
          ),
      ),
      v.totalAlertsCount,
      v.totalLoansCount,
      v.generatedAt,
    );
  }
}

export class SearchResultAssembler {
  static toEntitiesFromResponse(response: SearchResponse): SearchResult[] {
    return (response?.results ?? []).map(
      (r) =>
        new SearchResult(
          r.entityType as SearchEntityType,
          r.entityId,
          r.label,
          r.subtitle,
          r.lat !== null && r.lng !== null ? new GeoPoint(r.lat, r.lng) : null,
          r.occurredAt,
        ),
    );
  }
}

export class ReportExportAssembler {
  static toEntityFromResponse(response: ReportExportResponse): ReportExport | null {
    const e = response?.export;
    if (!e) return null;
    return new ReportExport(e.id, e.sourceReportId, e.format as ExportFormat, e.generatedAt, e.downloadUrl);
  }
}
