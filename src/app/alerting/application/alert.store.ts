// src/app/alerting/application/alert.store.ts

import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, tap, throwError } from 'rxjs';
import { AlertEntity, AlertStatus } from '../domain/model/alert.entity';
import { AlertAssembler } from '../infrastructure/alert-assembler';
import { AlertResource } from '../infrastructure/alert-response';
import { environment } from '../../../environments/environment';

// ── Time filter options ───────────────────────────────────────────────────────
export type AlertTimeFilter = 'last_hour' | 'today' | 'last_7_days' | 'last_30_days';
export type AlertReadFilter = 'all' | 'unread';

// ── State shape ───────────────────────────────────────────────────────────────
interface AlertState {
  alerts: AlertEntity[];
  isLoading: boolean;
  error: string | null;
  timeFilter: AlertTimeFilter;
  readFilter: AlertReadFilter;
}

@Injectable({ providedIn: 'root' })
export class AlertStore {
  private readonly http = inject(HttpClient);
  private readonly assembler = new AlertAssembler();

  // ── Internal state ────────────────────────────────────────────────────────
  private readonly _state = signal<AlertState>({
    alerts: [],
    isLoading: false,
    error: null,
    timeFilter: 'today',
    readFilter: 'all',
  });

  // ── Public read-only projections ──────────────────────────────────────────
  readonly isLoading = computed(() => this._state().isLoading);
  readonly error = computed(() => this._state().error);
  readonly timeFilter = computed(() => this._state().timeFilter);
  readonly readFilter = computed(() => this._state().readFilter);

  /** All alerts currently in store */
  readonly allAlerts = computed(() => this._state().alerts);

  /** Filtered view respecting readFilter */
  readonly filteredAlerts = computed(() => {
    const { alerts, readFilter } = this._state();
    if (readFilter === 'unread') return alerts.filter((a) => a.isUnread);
    return alerts;
  });

  /** Two most recent alerts for the "Recent Alerts" sidebar panel */
  readonly recentAlerts = computed(() =>
    [...this._state().alerts]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 2),
  );

  readonly unreadCount = computed(
    () => this._state().alerts.filter((a) => a.status === 'UNREAD').length,
  );

  // ── Actions ───────────────────────────────────────────────────────────────

  loadAlerts(): Observable<AlertEntity[]> {
    this._patch({ isLoading: true, error: null });

    return this.http.get<AlertResource[]>(`${environment.apiBaseUrl}/alerts`).pipe(
      tap((resources) => {
        const alerts = this.assembler.toEntities(resources);
        this._patch({ alerts, isLoading: false });
      }),
      map(() => this._state().alerts),
      catchError((err) => {
        const errorMsg = err?.message ?? 'Error al cargar alertas.';
        this._patch({ isLoading: false, error: errorMsg });
        return throwError(() => err);
      }),
    );
  }

  markAsRead(alertId: string): Observable<void> {
    return this.http
      .patch<void>(`${environment.apiBaseUrl}/alerts/${alertId}`, { status: 'READ' as AlertStatus })
      .pipe(
        tap(() => {
          this._state.update((s) => ({
            ...s,
            alerts: s.alerts.map((a) =>
              a.id === alertId
                ? AlertEntity.fromJson({
                    ...this._toPlain(a),
                    status: 'READ',
                  })
                : a,
            ),
          }));
        }),
        map(() => void 0),
        catchError((err) => throwError(() => err)),
      );
  }

  resolveAlert(alertId: string): Observable<void> {
    return this.http
      .patch<void>(`${environment.apiBaseUrl}/alerts/${alertId}`, { status: 'RESOLVED' as AlertStatus })
      .pipe(
        tap(() => {
          this._state.update((s) => ({
            ...s,
            alerts: s.alerts.map((a) =>
              a.id === alertId
                ? AlertEntity.fromJson({
                    ...this._toPlain(a),
                    status: 'RESOLVED',
                  })
                : a,
            ),
          }));
        }),
        map(() => void 0),
        catchError((err) => throwError(() => err)),
      );
  }

  setTimeFilter(filter: AlertTimeFilter): void {
    this._patch({ timeFilter: filter });
  }

  setReadFilter(filter: AlertReadFilter): void {
    this._patch({ readFilter: filter });
  }

  // ── Private helpers ───────────────────────────────────────────────────────
  private _patch(partial: Partial<AlertState>): void {
    this._state.update((s) => ({ ...s, ...partial }));
  }

  private _toPlain(a: AlertEntity): Record<string, unknown> {
    return {
      id: a.id,
      organizationId: a.organizationId,
      vehicleId: a.vehicleId,
      ruleId: a.ruleId,
      type: a.type,
      severity: a.severity,
      status: a.status,
      description: a.description,
      location: a.location,
      detail: a.detail,
      createdAt: a.createdAt.toISOString(),
    };
  }
}
