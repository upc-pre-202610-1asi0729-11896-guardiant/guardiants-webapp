import { Injectable, computed, inject, signal } from '@angular/core';
import {
  Command,
  DeviceHealth,
  LocationShareLink,
  TheftReport,
} from '../domain/model/commands.entities';
import { CommandsApi } from '../infrastructure/commands-api';
import {
  CommandAssembler,
  DeviceHealthAssembler,
  LocationShareLinkAssembler,
  TheftReportAssembler,
} from '../infrastructure/commands-assembler';
import { ApiError } from '../../shared/domain/model/value-objects';

@Injectable({ providedIn: 'root' })
export class useCommandsStore {
  private readonly api = inject(CommandsApi);

  // ----- state -----
  readonly commandsByVehicle = signal<Record<string, Command[]>>({});
  readonly deviceHealthByVehicle = signal<Record<string, DeviceHealth>>({});
  readonly activeTheftReports = signal<TheftReport[]>([]);
  readonly activeShareLinks = signal<LocationShareLink[]>([]);
  readonly pendingCommandId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly errors = signal<ApiError[]>([]);

  // ----- computed -----
  readonly pendingCommands = computed(() =>
    Object.values(this.commandsByVehicle())
      .flat()
      .filter((c) => c.isPending()),
  );

  // ----- actions -----
  async blockEngine(vehicleId: string, issuedByUserId: string, triggeredByAlertId: string | null): Promise<string> {
    let commandId = '';
    await this.run(async () => {
      const command = CommandAssembler.toEntityFromResponse(
        await this.api.issueEngineBlock(vehicleId, issuedByUserId, triggeredByAlertId),
      );
      if (command) {
        commandId = command.id;
        this.pendingCommandId.set(command.id);
        this.mergeCommand(command);
      }
    });
    return commandId;
  }
  async unblockEngine(vehicleId: string, issuedByUserId: string): Promise<void> {
    await this.run(async () => this.mergeCommand(CommandAssembler.toEntityFromResponse(await this.api.issueEngineUnblock(vehicleId, issuedByUserId))));
  }
  async restartDevice(vehicleId: string, issuedByUserId: string): Promise<void> {
    await this.run(async () => this.mergeCommand(CommandAssembler.toEntityFromResponse(await this.api.issueDeviceRestart(vehicleId, issuedByUserId))));
  }
  async trackCommandStatus(commandId: string): Promise<void> {
    await this.run(async () => this.mergeCommand(CommandAssembler.toEntityFromResponse(await this.api.getCommandById(commandId))));
  }
  async fetchCommandsForVehicle(vehicleId: string): Promise<void> {
    await this.run(async () => {
      const commands = CommandAssembler.toEntitiesFromResponse(await this.api.getCommandsForVehicle(vehicleId));
      this.commandsByVehicle.update((m) => ({ ...m, [vehicleId]: commands }));
    });
  }
  async fetchDeviceHealth(vehicleId: string): Promise<void> {
    await this.run(async () => {
      const health = DeviceHealthAssembler.toEntityFromResponse(await this.api.getDeviceHealth(vehicleId));
      if (health) this.deviceHealthByVehicle.update((m) => ({ ...m, [vehicleId]: health }));
    });
  }
  async reportTheft(vehicleId: string, reportedByUserId: string): Promise<void> {
    await this.run(async () => {
      const report = TheftReportAssembler.toEntityFromResponse(await this.api.reportTheft(vehicleId, reportedByUserId));
      if (report) this.activeTheftReports.set([report, ...this.activeTheftReports()]);
    });
  }
  async fetchActiveTheftReports(): Promise<void> {
    await this.run(async () => this.activeTheftReports.set(TheftReportAssembler.toEntitiesFromResponse(await this.api.getActiveTheftReports())));
  }
  async resolveTheftReport(id: string): Promise<void> {
    await this.run(async () => {
      await this.api.resolveTheftReport(id);
      this.activeTheftReports.set(this.activeTheftReports().filter((r) => r.id !== id));
    });
  }
  async shareVehicleLocation(vehicleId: string, createdByUserId: string, expiresAt: string | null): Promise<void> {
    await this.run(async () => {
      const link = LocationShareLinkAssembler.toEntityFromResponse(
        await this.api.generateLocationShareLink(vehicleId, createdByUserId, expiresAt),
      );
      if (link) this.activeShareLinks.set([link, ...this.activeShareLinks()]);
    });
  }
  clearErrors(): void {
    this.errors.set([]);
  }

  // ----- helpers -----
  private mergeCommand(command: Command | null): void {
    if (!command) return;
    this.commandsByVehicle.update((m) => {
      const existing = m[command.vehicleId] ?? [];
      const byId = new Map(existing.map((c) => [c.id, c]));
      byId.set(command.id, command);
      return { ...m, [command.vehicleId]: [...byId.values()] };
    });
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
