import { Injectable, computed, inject, signal } from '@angular/core';
import { DateRange } from '../../shared/domain/model/value-objects';
import {
  DrivingReportView,
  OperationalReportView,
  ReportExport,
  RouteHistoryView,
  SearchCriteria,
  SearchEntityType,
  SearchResult,
} from '../domain/model/query.entities';
import { QueryApi } from '../infrastructure/query-api';
import {
  DrivingReportAssembler,
  OperationalReportAssembler,
  ReportExportAssembler,
  RouteHistoryAssembler,
  SearchResultAssembler,
} from '../infrastructure/query-assembler';
import { ApiError } from '../../shared/domain/model/value-objects';

@Injectable({ providedIn: 'root' })
export class useQueryStore {
  private readonly api = inject(QueryApi);
  private lastReportId: string | null = null;

  // ----- state -----
  readonly routeHistory = signal<RouteHistoryView | null>(null);
  readonly drivingReport = signal<DrivingReportView | null>(null);
  readonly operationalReport = signal<OperationalReportView | null>(null);
  readonly searchResults = signal<SearchResult[]>([]);
  readonly searchCriteria = signal<SearchCriteria>(new SearchCriteria('', []));
  readonly selectedDateRange = signal<DateRange | null>(null);
  readonly pendingExport = signal<ReportExport | null>(null);
  readonly loading = signal(false);
  readonly errors = signal<ApiError[]>([]);

  // ----- computed -----
  readonly hasRouteHistory = computed(() => this.routeHistory()?.hasData() ?? false);
  readonly hasDrivingReport = computed(() => this.drivingReport()?.hasData() ?? false);
  readonly hasOperationalReport = computed(() => this.operationalReport()?.hasData() ?? false);
  readonly searchHasNoResults = computed(
    () => !this.searchCriteria().isEmpty() && this.searchResults().length === 0,
  );
  readonly groupedSearchResults = computed(() => {
    const groups: Record<string, SearchResult[]> = {};
    for (const result of this.searchResults()) {
      (groups[result.entityType] ??= []).push(result);
    }
    return groups;
  });

  // ----- actions -----
  async fetchRouteHistory(vehicleId: string, startDate: string, endDate: string): Promise<void> {
    await this.run(async () => {
      const view = RouteHistoryAssembler.toEntityFromResponse(await this.api.getRouteHistory(vehicleId, startDate, endDate));
      this.routeHistory.set(view);
      this.lastReportId = view?.id ?? null;
    });
  }
  async fetchDrivingReport(vehicleId: string, startDate: string, endDate: string): Promise<void> {
    await this.run(async () => {
      const view = DrivingReportAssembler.toEntityFromResponse(await this.api.getDrivingReport(vehicleId, startDate, endDate));
      this.drivingReport.set(view);
      this.lastReportId = view?.id ?? null;
    });
  }
  async fetchOperationalReport(fleetId: string, startDate: string, endDate: string): Promise<void> {
    await this.run(async () => {
      const view = OperationalReportAssembler.toEntityFromResponse(await this.api.getOperationalReport(fleetId, startDate, endDate));
      this.operationalReport.set(view);
      this.lastReportId = view?.id ?? null;
    });
  }
  setSearchCriteria(criteria: SearchCriteria): void {
    this.searchCriteria.set(criteria);
  }
  async executeSearch(): Promise<void> {
    const criteria = this.searchCriteria();
    if (criteria.isEmpty()) {
      this.searchResults.set([]);
      return;
    }
    await this.run(async () => this.searchResults.set(SearchResultAssembler.toEntitiesFromResponse(await this.api.search(criteria))));
  }
  clearSearch(): void {
    this.searchCriteria.set(new SearchCriteria('', [] as SearchEntityType[]));
    this.searchResults.set([]);
  }
  setSelectedDateRange(start: string, end: string): void {
    this.selectedDateRange.set(new DateRange(start, end));
  }
  async exportCurrentReport(format: string): Promise<void> {
    if (!this.lastReportId) return;
    await this.run(async () => {
      const exp = ReportExportAssembler.toEntityFromResponse(await this.api.exportReport(this.lastReportId!, format));
      this.pendingExport.set(exp);
      if (exp?.isReady()) window.open(exp.downloadUrl, '_blank');
    });
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
