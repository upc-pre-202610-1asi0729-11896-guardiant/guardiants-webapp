import { Injectable, computed, inject, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import {
  DrivingReport,
  ProlongedStop,
  RouteDeviation,
  RouteSegment,
  VehicleGeneralStatus,
} from '../domain/model/telemetry.entities';
import { TelemetryApi } from '../infrastructure/telemetry-api';
import {
  DrivingReportAssembler,
  ProlongedStopAssembler,
  RouteDeviationAssembler,
  RouteSegmentAssembler,
  TelemetryPointAssembler,
  VehicleGeneralStatusAssembler,
} from '../infrastructure/telemetry-assembler';
import { ApiError } from '../../shared/domain/model/value-objects';

@Injectable({ providedIn: 'root' })
export class useTelemetryStore {
  private readonly api = inject(TelemetryApi);
  private streamSub: Subscription | null = null;

  // ----- state -----
  readonly liveStatusByVehicle = signal<Record<string, VehicleGeneralStatus>>({});
  readonly routeHistory = signal<RouteSegment[]>([]);
  readonly routeDeviations = signal<RouteDeviation[]>([]);
  readonly prolongedStops = signal<ProlongedStop[]>([]);
  readonly drivingReports = signal<DrivingReport[]>([]);
  readonly selectedVehicleId = signal<string | null>(null);
  readonly selectedDateRange = signal<{ start: string; end: string } | null>(null);
  readonly liveStreamConnected = signal(false);
  readonly loading = signal(false);
  readonly errors = signal<ApiError[]>([]);

  // ----- computed -----
  readonly activeVehicleStatus = computed(() => {
    const id = this.selectedVehicleId();
    return id ? (this.liveStatusByVehicle()[id] ?? null) : null;
  });
  readonly activeRouteDistanceKm = computed(() =>
    this.routeHistory().reduce((sum, s) => sum + s.distanceKm, 0),
  );
  readonly activeDrivingScore = computed(() => {
    const reports = this.drivingReports();
    if (reports.length === 0) return null;
    return reports.reduce((sum, r) => sum + r.drivingScore, 0) / reports.length;
  });
  readonly hasActiveDeviation = computed(() => this.routeDeviations().length > 0);
  readonly hasActiveProlongedStop = computed(() =>
    this.prolongedStops().some((s) => !s.isResolved()),
  );

  chartSeriesForMetric(metric: string): { timestamp: string; value: number }[] {
    const status = this.activeVehicleStatus();
    const point = status?.latestPoint;
    if (!point) return [];
    const value = (point as unknown as Record<string, number>)[metric] ?? 0;
    return [{ timestamp: point.timestamp, value }];
  }

  // ----- actions -----
  async fetchLiveStatus(vehicleId: string): Promise<void> {
    await this.run(async () => {
      const status = VehicleGeneralStatusAssembler.toEntityFromResponse(await this.api.getLiveStatus(vehicleId));
      if (status) this.liveStatusByVehicle.update((m) => ({ ...m, [vehicleId]: status }));
    });
  }
  connectLiveStream(vehicleId: string): void {
    this.disconnectLiveStream();
    this.streamSub = this.api.subscribeLiveStream(vehicleId).subscribe((resource) => {
      const point = TelemetryPointAssembler.toEntityFromResource(resource);
      const existing = this.liveStatusByVehicle()[vehicleId];
      if (point) {
        const status = new VehicleGeneralStatus(
          vehicleId,
          point,
          existing?.activeAlertCount ?? 0,
          existing?.isLocked ?? false,
          point.timestamp,
        );
        this.liveStatusByVehicle.update((m) => ({ ...m, [vehicleId]: status }));
      }
    });
    this.liveStreamConnected.set(true);
  }
  disconnectLiveStream(): void {
    this.streamSub?.unsubscribe();
    this.streamSub = null;
    this.liveStreamConnected.set(false);
  }
  async fetchRouteHistory(vehicleId: string, startDate: string, endDate: string): Promise<void> {
    await this.run(async () => this.routeHistory.set(RouteSegmentAssembler.toEntitiesFromResponse(await this.api.getRouteHistory(vehicleId, startDate, endDate))));
  }
  async fetchRouteDeviations(vehicleId: string, startDate: string, endDate: string): Promise<void> {
    await this.run(async () => this.routeDeviations.set(RouteDeviationAssembler.toEntitiesFromResponse(await this.api.getRouteDeviations(vehicleId, startDate, endDate))));
  }
  async fetchProlongedStops(vehicleId: string, startDate: string, endDate: string): Promise<void> {
    await this.run(async () => this.prolongedStops.set(ProlongedStopAssembler.toEntitiesFromResponse(await this.api.getProlongedStops(vehicleId, startDate, endDate))));
  }
  async fetchDrivingReports(vehicleId: string, startDate: string, endDate: string): Promise<void> {
    await this.run(async () => this.drivingReports.set(DrivingReportAssembler.toEntitiesFromResponse(await this.api.getDrivingReports(vehicleId, startDate, endDate))));
  }
  setSelectedVehicle(vehicleId: string): void {
    this.selectedVehicleId.set(vehicleId);
  }
  setSelectedDateRange(start: string, end: string): void {
    this.selectedDateRange.set({ start, end });
  }
  exportRouteHistory(format: string): void {
    const blob = new Blob([JSON.stringify(this.routeHistory(), null, 2)], {
      type: format === 'csv' ? 'text/csv' : 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `route-history.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  }
  clearErrors(): void {
    this.errors.set([]);
  }

  private async run(work: () => Promise<void>): Promise<void> {
    this.loading.set(true);
    try {
      await work();
    } catch (e) {
      const err = e instanceof ApiError ? e : new ApiError('UNKNOWN', (e as Error)?.message ?? 'Error', 0);
      this.errors.set([...this.errors(), err]);
    } finally {
      this.loading.set(false);
    }
  }
}
