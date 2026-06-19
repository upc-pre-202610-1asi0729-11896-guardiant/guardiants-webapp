import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint';
import { environment } from '../../../environments/environment';
import {
  AlertRuleResource,
  AlertRuleResponse,
  AutomaticDefenseActionResource,
  AutomaticDefenseActionResponse,
  NotificationPreferencesResponse,
  SecurityAlertResponse,
  SecurityOptionsResponse,
} from './alerting-response';

@Injectable({ providedIn: 'root' })
export class AlertingApi extends BaseApi {
  private readonly rules: BaseEndpoint;
  private readonly alerts: BaseEndpoint;
  private readonly defenseActions: BaseEndpoint;
  private readonly securityOptions: BaseEndpoint;
  private readonly notificationPrefs: BaseEndpoint;

  constructor(http: HttpClient) {
    super(http, environment.apiBaseUrl);
    this.rules = this.buildEndpoint('alert-rules');
    this.alerts = this.buildEndpoint('security-alerts');
    this.defenseActions = this.buildEndpoint('defense-actions');
    this.securityOptions = this.buildEndpoint('security-options');
    this.notificationPrefs = this.buildEndpoint('notification-preferences');
  }

  getAlertRules(ownerId: string): Promise<AlertRuleResponse> {
    return this.rules.getPath(`?ownerId=${ownerId}`) as Promise<AlertRuleResponse>;
  }
  configureGeofenceRule(resource: Partial<AlertRuleResource>): Promise<AlertRuleResponse> {
    return this.rules.create(resource) as Promise<AlertRuleResponse>;
  }
  updateAlertRule(id: string, patch: object): Promise<AlertRuleResponse> {
    return this.rules.update(id, patch) as Promise<AlertRuleResponse>;
  }
  getSecurityAlerts(ownerId: string, filter: object): Promise<SecurityAlertResponse> {
    const query = Object.entries(filter)
      .filter(([, v]) => v != null)
      .map(([k, v]) => `${k}=${v}`)
      .join('&');
    return this.alerts.getPath(`?ownerId=${ownerId}${query ? `&${query}` : ''}`) as Promise<SecurityAlertResponse>;
  }
  getSecurityAlertById(id: string): Promise<SecurityAlertResponse> {
    return this.alerts.getById(id) as Promise<SecurityAlertResponse>;
  }
  acknowledgeAlert(id: string): Promise<SecurityAlertResponse> {
    return this.alerts.postPath(`/${id}/acknowledge`, {}) as Promise<SecurityAlertResponse>;
  }
  closeAlert(id: string): Promise<SecurityAlertResponse> {
    return this.alerts.postPath(`/${id}/close`, {}) as Promise<SecurityAlertResponse>;
  }
  getDefenseActions(vehicleId: string): Promise<AutomaticDefenseActionResponse> {
    return this.defenseActions.getPath(`?vehicleId=${vehicleId}`) as Promise<AutomaticDefenseActionResponse>;
  }
  recordDefenseAction(resource: Partial<AutomaticDefenseActionResource>): Promise<AutomaticDefenseActionResponse> {
    return this.defenseActions.create(resource) as Promise<AutomaticDefenseActionResponse>;
  }
  updateDefenseActionResult(id: string, result: string, commandId: string | null): Promise<AutomaticDefenseActionResponse> {
    return this.defenseActions.update(id, { result, commandId }) as Promise<AutomaticDefenseActionResponse>;
  }
  getSecurityOptions(ownerId: string): Promise<SecurityOptionsResponse> {
    return this.securityOptions.getById(ownerId) as Promise<SecurityOptionsResponse>;
  }
  updateSecurityOptions(ownerId: string, patch: object): Promise<SecurityOptionsResponse> {
    return this.securityOptions.update(ownerId, patch) as Promise<SecurityOptionsResponse>;
  }
  getNotificationPreferences(ownerId: string): Promise<NotificationPreferencesResponse> {
    return this.notificationPrefs.getById(ownerId) as Promise<NotificationPreferencesResponse>;
  }
  updateNotificationPreferences(ownerId: string, patch: object): Promise<NotificationPreferencesResponse> {
    return this.notificationPrefs.update(ownerId, patch) as Promise<NotificationPreferencesResponse>;
  }
}
