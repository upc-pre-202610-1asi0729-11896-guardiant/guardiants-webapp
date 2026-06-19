import { Injectable, computed, inject, signal } from '@angular/core';
import {
  AlertFilter,
  AlertFilterCategory,
  AlertPeriod,
  AlertRule,
  AutomaticDefenseAction,
  DefenseActionType,
  NotificationPreferences,
  SecurityAlert,
  SecurityOptions,
} from '../domain/model/alerting.entities';
import { AlertingApi } from '../infrastructure/alerting-api';
import {
  AlertRuleAssembler,
  AutomaticDefenseActionAssembler,
  NotificationPreferencesAssembler,
  SecurityAlertAssembler,
  SecurityOptionsAssembler,
} from '../infrastructure/alerting-assembler';
import { ApiError } from '../../shared/domain/model/value-objects';
import { useCommandsStore } from '../../commands/application/commands.store';

@Injectable({ providedIn: 'root' })
export class useAlertingStore {
  private readonly api = inject(AlertingApi);
  private readonly commandsStore = inject(useCommandsStore);
  private currentOwnerId: string | null = null;

  // ----- state -----
  readonly alertRules = signal<AlertRule[]>([]);
  readonly securityAlerts = signal<SecurityAlert[]>([]);
  readonly defenseActions = signal<AutomaticDefenseAction[]>([]);
  readonly securityOptions = signal<SecurityOptions | null>(null);
  readonly notificationPreferences = signal<NotificationPreferences | null>(null);
  readonly activeFilter = signal<AlertFilter>(new AlertFilter(AlertFilterCategory.ALL, null));
  readonly selectedAlertId = signal<string | null>(null);
  readonly liveStreamConnected = signal(false);
  readonly loading = signal(false);
  readonly errors = signal<ApiError[]>([]);

  // ----- computed -----
  readonly filteredAlerts = computed(() => {
    const filter = this.activeFilter();
    return this.securityAlerts().filter((a) => filter.matches(a));
  });
  readonly unreadCount = computed(() => this.securityAlerts().filter((a) => a.isUnread()).length);
  readonly urgentCount = computed(() => this.securityAlerts().filter((a) => a.isUrgent()).length);
  readonly todaysAlertCount = computed(
    () => this.securityAlerts().filter((a) => a.isWithinPeriod(AlertPeriod.TODAY)).length,
  );
  readonly activeDefenseActions = computed(() => this.defenseActions().filter((a) => a.isActive()));
  readonly selectedAlert = computed(() => {
    const id = this.selectedAlertId();
    return id ? (this.securityAlerts().find((a) => a.id === id) ?? null) : null;
  });

  // ----- actions -----
  async fetchAlertRules(ownerId: string): Promise<void> {
    this.currentOwnerId = ownerId;
    await this.run(async () => this.alertRules.set(AlertRuleAssembler.toEntitiesFromResponse(await this.api.getAlertRules(ownerId))));
  }
  async configureGeofence(centerLat: number, centerLng: number, radiusMeters: number): Promise<void> {
    await this.run(async () => {
      const res = await this.api.configureGeofenceRule({
        ownerId: this.currentOwnerId ?? undefined,
        type: 'GEOFENCE',
        geofence: { centerLat, centerLng, radiusMeters },
        enabled: true,
      });
      this.alertRules.set([...this.alertRules(), ...AlertRuleAssembler.toEntitiesFromResponse(res)]);
    });
  }
  async updateAlertRule(ruleId: string, patch: object): Promise<void> {
    await this.run(async () => this.alertRules.set(AlertRuleAssembler.toEntitiesFromResponse(await this.api.updateAlertRule(ruleId, patch))));
  }
  async fetchSecurityAlerts(ownerId: string): Promise<void> {
    this.currentOwnerId = ownerId;
    const filter = this.activeFilter();
    await this.run(async () => this.securityAlerts.set(SecurityAlertAssembler.toEntitiesFromResponse(await this.api.getSecurityAlerts(ownerId, { category: filter.category, period: filter.period }))));
  }
  connectAlertStream(ownerId: string): void {
    this.currentOwnerId = ownerId;
    this.liveStreamConnected.set(true);
  }
  disconnectAlertStream(): void {
    this.liveStreamConnected.set(false);
  }
  setFilter(category: string, period: string | null): void {
    this.activeFilter.set(
      new AlertFilter(category as AlertFilterCategory, period ? (period as AlertPeriod) : null),
    );
    if (this.currentOwnerId) void this.fetchSecurityAlerts(this.currentOwnerId);
  }
  selectAlert(alertId: string): void {
    this.selectedAlertId.set(alertId);
  }
  async acknowledgeAlert(alertId: string): Promise<void> {
    await this.run(async () => this.mergeAlert(SecurityAlertAssembler.toEntityFromResponse(await this.api.acknowledgeAlert(alertId))));
  }
  async closeAlert(alertId: string): Promise<void> {
    await this.run(async () => this.mergeAlert(SecurityAlertAssembler.toEntityFromResponse(await this.api.closeAlert(alertId))));
  }
  async fetchDefenseActions(vehicleId: string): Promise<void> {
    await this.run(async () => this.defenseActions.set(AutomaticDefenseActionAssembler.toEntitiesFromResponse(await this.api.getDefenseActions(vehicleId))));
  }
  async recordAutomaticDefenseTrigger(vehicleId: string, alertId: string, actionType: string): Promise<void> {
    await this.run(async () => {
      const action = AutomaticDefenseActionAssembler.toEntityFromResponse(
        await this.api.recordDefenseAction({ vehicleId, triggeredByAlertId: alertId, actionType, result: 'PENDING' }),
      );
      if (action) this.defenseActions.set([action, ...this.defenseActions()]);
    });
  }
  /** Delegates the actual engine-block command to the commands bounded context. */
  async requestEngineBlockFromAlert(alertId: string, vehicleId: string): Promise<void> {
    await this.run(async () => {
      const issuedBy = 'system';
      const commandId = await this.commandsStore.blockEngine(vehicleId, issuedBy, alertId);
      await this.recordAutomaticDefenseTrigger(vehicleId, alertId, DefenseActionType.ENGINE_BLOCK);
      void commandId;
    });
  }
  async fetchSecurityOptions(ownerId: string): Promise<void> {
    this.currentOwnerId = ownerId;
    await this.run(async () => this.securityOptions.set(SecurityOptionsAssembler.toEntityFromResponse(await this.api.getSecurityOptions(ownerId))));
  }
  async updateSecurityOptions(patch: object): Promise<void> {
    if (!this.currentOwnerId) return;
    await this.run(async () => this.securityOptions.set(SecurityOptionsAssembler.toEntityFromResponse(await this.api.updateSecurityOptions(this.currentOwnerId!, patch))));
  }
  async fetchNotificationPreferences(ownerId: string): Promise<void> {
    this.currentOwnerId = ownerId;
    await this.run(async () => this.notificationPreferences.set(NotificationPreferencesAssembler.toEntityFromResponse(await this.api.getNotificationPreferences(ownerId))));
  }
  async updateNotificationPreferences(patch: object): Promise<void> {
    if (!this.currentOwnerId) return;
    await this.run(async () => this.notificationPreferences.set(NotificationPreferencesAssembler.toEntityFromResponse(await this.api.updateNotificationPreferences(this.currentOwnerId!, patch))));
  }
  clearErrors(): void {
    this.errors.set([]);
  }

  // ----- helpers -----
  private mergeAlert(alert: SecurityAlert | null): void {
    if (!alert) return;
    const byId = new Map(this.securityAlerts().map((a) => [a.id, a]));
    byId.set(alert.id, alert);
    this.securityAlerts.set([...byId.values()]);
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
