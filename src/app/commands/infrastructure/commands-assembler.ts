import {
  Command,
  CommandResult,
  CommandStatus,
  CommandType,
  DeviceConnectionStatus,
  DeviceHealth,
  IncidentStatus,
  LocationShareLink,
  TheftReport,
} from '../domain/model/commands.entities';
import {
  CommandListResponse,
  CommandResource,
  CommandResponse,
  DeviceHealthResource,
  DeviceHealthResponse,
  LocationShareLinkResource,
  LocationShareLinkResponse,
  TheftReportListResponse,
  TheftReportResource,
  TheftReportResponse,
} from './commands-response';

export class CommandAssembler {
  static toEntityFromResource(r: CommandResource): Command | null {
    if (!r) return null;
    return new Command(
      r.id,
      r.vehicleId,
      r.issuedByUserId,
      r.type as CommandType,
      r.triggeredByAlertId,
      r.status as CommandStatus,
      r.issuedAt,
      r.dispatchedAt,
      r.acknowledgedAt,
      r.completedAt,
      r.result ? (r.result as CommandResult) : null,
    );
  }
  static toEntityFromResponse(response: CommandResponse): Command | null {
    return CommandAssembler.toEntityFromResource(response?.command);
  }
  static toEntitiesFromResponse(response: CommandListResponse): Command[] {
    return (response?.commands ?? [])
      .map((r) => CommandAssembler.toEntityFromResource(r))
      .filter((e): e is Command => e !== null);
  }
}

export class DeviceHealthAssembler {
  static toEntityFromResource(r: DeviceHealthResource): DeviceHealth | null {
    if (!r) return null;
    return new DeviceHealth(
      r.vehicleId,
      r.deviceSerial,
      r.model,
      r.imei,
      r.status as DeviceConnectionStatus,
      r.lastConnectionAt,
      r.batteryLevelPercent,
    );
  }
  static toEntityFromResponse(response: DeviceHealthResponse): DeviceHealth | null {
    return DeviceHealthAssembler.toEntityFromResource(response?.device);
  }
}

export class TheftReportAssembler {
  static toEntityFromResource(r: TheftReportResource): TheftReport | null {
    if (!r) return null;
    return new TheftReport(
      r.id,
      r.vehicleId,
      r.reportedByUserId,
      r.reportedAt,
      r.status as IncidentStatus,
      r.relatedCommandIds ?? [],
      r.relatedAlertId,
    );
  }
  static toEntityFromResponse(response: TheftReportResponse): TheftReport | null {
    return TheftReportAssembler.toEntityFromResource(response?.report);
  }
  static toEntitiesFromResponse(response: TheftReportListResponse): TheftReport[] {
    return (response?.reports ?? [])
      .map((r) => TheftReportAssembler.toEntityFromResource(r))
      .filter((e): e is TheftReport => e !== null);
  }
}

export class LocationShareLinkAssembler {
  static toEntityFromResource(r: LocationShareLinkResource): LocationShareLink | null {
    if (!r) return null;
    return new LocationShareLink(r.id, r.vehicleId, r.createdByUserId, r.token, r.createdAt, r.expiresAt);
  }
  static toEntityFromResponse(response: LocationShareLinkResponse): LocationShareLink | null {
    return LocationShareLinkAssembler.toEntityFromResource(response?.link);
  }
}
