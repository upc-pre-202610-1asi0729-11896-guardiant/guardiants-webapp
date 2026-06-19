import {
  AlertRule,
  AlertRuleType,
  AlertSeverity,
  AlertStatus,
  AlertType,
  AutomaticDefenseAction,
  DefenseActionResult,
  DefenseActionType,
  Geofence,
  GeoPoint,
  NotificationPreferences,
  SecurityAlert,
  SecurityOptions,
} from '../domain/model/alerting.entities';
import {
  AlertRuleResource,
  AlertRuleResponse,
  AutomaticDefenseActionResource,
  AutomaticDefenseActionResponse,
  NotificationPreferencesResponse,
  SecurityAlertResource,
  SecurityAlertResponse,
  SecurityOptionsResponse,
} from './alerting-response';

export class AlertRuleAssembler {
  static toEntityFromResource(r: AlertRuleResource): AlertRule | null {
    if (!r) return null;
    return new AlertRule(
      r.id,
      r.ownerId,
      r.vehicleId,
      r.type as AlertRuleType,
      r.geofence ? new Geofence(r.geofence.centerLat, r.geofence.centerLng, r.geofence.radiusMeters) : null,
      r.speedThresholdKmh,
      r.prolongedStopThresholdMinutes,
      r.enabled,
      r.createdAt,
      r.updatedAt,
    );
  }
  static toEntitiesFromResponse(response: AlertRuleResponse): AlertRule[] {
    return (response?.rules ?? [])
      .map((r) => AlertRuleAssembler.toEntityFromResource(r))
      .filter((e): e is AlertRule => e !== null);
  }
}

export class SecurityAlertAssembler {
  static toEntityFromResource(r: SecurityAlertResource): SecurityAlert | null {
    if (!r) return null;
    return new SecurityAlert(
      r.id,
      r.ownerId,
      r.vehicleId,
      r.ruleId,
      r.type as AlertType,
      r.severity as AlertSeverity,
      new GeoPoint(r.location.lat, r.location.lng),
      r.description,
      r.generatedAt,
      r.status as AlertStatus,
      r.acknowledgedAt,
      r.closedAt,
    );
  }
  static toEntityFromResponse(response: SecurityAlertResponse): SecurityAlert | null {
    return response?.alert ? SecurityAlertAssembler.toEntityFromResource(response.alert) : null;
  }
  static toEntitiesFromResponse(response: SecurityAlertResponse): SecurityAlert[] {
    return (response?.alerts ?? [])
      .map((r) => SecurityAlertAssembler.toEntityFromResource(r))
      .filter((e): e is SecurityAlert => e !== null);
  }
}

export class AutomaticDefenseActionAssembler {
  static toEntityFromResource(r: AutomaticDefenseActionResource): AutomaticDefenseAction | null {
    if (!r) return null;
    return new AutomaticDefenseAction(
      r.id,
      r.vehicleId,
      r.triggeredByAlertId,
      r.actionType as DefenseActionType,
      r.commandId,
      r.result as DefenseActionResult,
      r.triggeredAt,
      r.deactivatedAt,
    );
  }
  static toEntityFromResponse(response: AutomaticDefenseActionResponse): AutomaticDefenseAction | null {
    return response?.action ? AutomaticDefenseActionAssembler.toEntityFromResource(response.action) : null;
  }
  static toEntitiesFromResponse(response: AutomaticDefenseActionResponse): AutomaticDefenseAction[] {
    return (response?.actions ?? [])
      .map((r) => AutomaticDefenseActionAssembler.toEntityFromResource(r))
      .filter((e): e is AutomaticDefenseAction => e !== null);
  }
}

export class SecurityOptionsAssembler {
  static toEntityFromResponse(response: SecurityOptionsResponse): SecurityOptions | null {
    const r = response?.options;
    if (!r) return null;
    return new SecurityOptions(
      r.ownerId,
      r.suspiciousMovementEnabled,
      r.autoEngineShutdownEnabled,
      r.autoSafeModeEnabled,
      r.updatedAt,
    );
  }
}

export class NotificationPreferencesAssembler {
  static toEntityFromResponse(response: NotificationPreferencesResponse): NotificationPreferences | null {
    const r = response?.preferences;
    if (!r) return null;
    return new NotificationPreferences(
      r.ownerId,
      r.securityAlertsEnabled,
      r.liveLocationEnabled,
      r.maintenanceRemindersEnabled,
      r.updatedAt,
    );
  }
}
