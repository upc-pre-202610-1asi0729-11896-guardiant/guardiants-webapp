import {
  ConnectivityStatus,
  ConnectivityValue,
  DrivingReport,
  GeoPoint,
  ProlongedStop,
  RouteDeviation,
  RouteSegment,
  TelemetryPoint,
  VehicleGeneralStatus,
} from '../domain/model/telemetry.entities';
import {
  DrivingReportResource,
  DrivingReportResponse,
  GeoPointResource,
  ProlongedStopResource,
  ProlongedStopResponse,
  RouteDeviationResource,
  RouteDeviationResponse,
  RouteHistoryResponse,
  RouteSegmentResource,
  TelemetryPointResource,
  TelemetryStreamResponse,
  VehicleStatusResource,
  VehicleStatusResponse,
} from './telemetry-response';

function toGeoPoint(r: GeoPointResource): GeoPoint {
  return new GeoPoint(r.lat, r.lng, r.recordedAt);
}

export class TelemetryPointAssembler {
  static toEntityFromResource(resource: TelemetryPointResource): TelemetryPoint | null {
    if (!resource) return null;
    return new TelemetryPoint(
      resource.id,
      resource.vehicleId,
      resource.deviceId,
      resource.timestamp,
      resource.lat,
      resource.lng,
      resource.heading,
      resource.speedKmh,
      resource.fuelLevelPercent,
      resource.engineTemperatureC,
      resource.batteryLevelPercent,
      resource.odometerKm,
      resource.rpm,
      resource.engineOn,
      new ConnectivityStatus(resource.connectivity as ConnectivityValue, resource.timestamp),
    );
  }
  static toEntitiesFromResponse(response: TelemetryStreamResponse): TelemetryPoint[] {
    return (response?.points ?? [])
      .map((r) => TelemetryPointAssembler.toEntityFromResource(r))
      .filter((e): e is TelemetryPoint => e !== null);
  }
}

export class VehicleGeneralStatusAssembler {
  static toEntityFromResource(resource: VehicleStatusResource): VehicleGeneralStatus | null {
    if (!resource) return null;
    return new VehicleGeneralStatus(
      resource.vehicleId,
      resource.latestPoint ? TelemetryPointAssembler.toEntityFromResource(resource.latestPoint) : null,
      resource.activeAlertCount,
      resource.isLocked,
      resource.lastUpdatedAt,
    );
  }
  static toEntityFromResponse(response: VehicleStatusResponse): VehicleGeneralStatus | null {
    return VehicleGeneralStatusAssembler.toEntityFromResource(response?.vehicle);
  }
}

export class RouteSegmentAssembler {
  static toEntityFromResource(resource: RouteSegmentResource): RouteSegment | null {
    if (!resource) return null;
    return new RouteSegment(
      resource.id,
      resource.vehicleId,
      resource.startedAt,
      resource.endedAt,
      (resource.points ?? []).map(toGeoPoint),
      resource.distanceKm,
    );
  }
  static toEntitiesFromResponse(response: RouteHistoryResponse): RouteSegment[] {
    return (response?.segments ?? [])
      .map((r) => RouteSegmentAssembler.toEntityFromResource(r))
      .filter((e): e is RouteSegment => e !== null);
  }
}

export class RouteDeviationAssembler {
  static toEntityFromResource(resource: RouteDeviationResource): RouteDeviation | null {
    if (!resource) return null;
    return new RouteDeviation(
      resource.id,
      resource.vehicleId,
      resource.expectedRouteId,
      resource.detectedAt,
      toGeoPoint(resource.location),
      resource.deviationDistanceMeters,
    );
  }
  static toEntitiesFromResponse(response: RouteDeviationResponse): RouteDeviation[] {
    return (response?.deviations ?? [])
      .map((r) => RouteDeviationAssembler.toEntityFromResource(r))
      .filter((e): e is RouteDeviation => e !== null);
  }
}

export class ProlongedStopAssembler {
  static toEntityFromResource(resource: ProlongedStopResource): ProlongedStop | null {
    if (!resource) return null;
    return new ProlongedStop(
      resource.id,
      resource.vehicleId,
      toGeoPoint(resource.location),
      resource.startedAt,
      resource.endedAt,
      resource.thresholdMinutes,
    );
  }
  static toEntitiesFromResponse(response: ProlongedStopResponse): ProlongedStop[] {
    return (response?.stops ?? [])
      .map((r) => ProlongedStopAssembler.toEntityFromResource(r))
      .filter((e): e is ProlongedStop => e !== null);
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
      resource.summary,
    );
  }
  static toEntitiesFromResponse(response: DrivingReportResponse): DrivingReport[] {
    return (response?.reports ?? [])
      .map((r) => DrivingReportAssembler.toEntityFromResource(r))
      .filter((e): e is DrivingReport => e !== null);
  }
}
