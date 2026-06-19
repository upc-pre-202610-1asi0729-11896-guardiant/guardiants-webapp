import { Injectable, computed, inject, signal } from '@angular/core';
import { Fleet } from '../domain/model/fleet.entity';
import { Vehicle, VehicleStatusValue } from '../domain/model/vehicle.entity';
import { AlertRule } from '../domain/model/alert-rule.entity';
import { LoanStatus, VehicleLoan } from '../domain/model/vehicle-loan.entity';
import { DrivingReport } from '../domain/model/driving-report.entity';
import { FleetApi } from '../infrastructure/fleet-api';
import {
  AlertRuleAssembler,
  DrivingReportAssembler,
  FleetAssembler,
  VehicleAssembler,
  VehicleLoanAssembler,
} from '../infrastructure/fleet-assembler';
import { ApiError } from '../../shared/domain/model/value-objects';

const HIGH_RISK_SCORE = 60;

@Injectable({ providedIn: 'root' })
export class useFleetStore {
  private readonly api = inject(FleetApi);

  // ----- state -----
  readonly fleets = signal<Fleet[]>([]);
  readonly vehicles = signal<Vehicle[]>([]);
  readonly alertRules = signal<AlertRule[]>([]);
  readonly vehicleLoans = signal<VehicleLoan[]>([]);
  readonly drivingReports = signal<DrivingReport[]>([]);
  readonly selectedFleetId = signal<string | null>(null);
  readonly selectedVehicleId = signal<string | null>(null);
  readonly searchQuery = signal('');
  readonly loanStatusFilter = signal<LoanStatus | null>(null);
  readonly loading = signal(false);
  readonly errors = signal<ApiError[]>([]);

  // ----- computed -----
  readonly activeVehicles = computed(() => this.vehicles().filter((v) => v.isActive()));
  readonly availableVehicles = computed(() => this.vehicles().filter((v) => v.isAvailableForLoan()));
  readonly vehiclesOnLoan = computed(() =>
    this.vehicles().filter((v) => v.status === VehicleStatusValue.ON_LOAN),
  );
  readonly pendingLoanRequests = computed(() => this.vehicleLoans().filter((l) => l.isPending()));
  readonly overdueLoans = computed(() => this.vehicleLoans().filter((l) => l.isOverdue()));
  readonly filteredVehicles = computed(() => {
    const q = this.searchQuery().trim().toLowerCase();
    if (!q) return this.vehicles();
    return this.vehicles().filter(
      (v) => v.plate.toLowerCase().includes(q) || v.model.toLowerCase().includes(q),
    );
  });
  readonly searchHasNoMatch = computed(
    () => this.searchQuery().trim() !== '' && this.filteredVehicles().length === 0,
  );

  // ----- actions -----
  async fetchFleets(ownerId: string): Promise<void> {
    await this.run(async () => this.fleets.set(FleetAssembler.toEntitiesFromResponse(await this.api.getFleets(ownerId))));
  }
  async createFleet(name: string, organizationType: string): Promise<void> {
    await this.run(async () => {
      const res = await this.api.createFleet({ name, organizationType });
      this.fleets.set([...this.fleets(), ...FleetAssembler.toEntitiesFromResponse(res)]);
    });
  }
  async fetchVehicles(fleetId: string): Promise<void> {
    this.selectedFleetId.set(fleetId);
    await this.run(async () => this.vehicles.set(VehicleAssembler.toEntitiesFromResponse(await this.api.getVehicles(fleetId))));
  }
  async registerVehicle(fleetId: string, plate: string, model: string, brand: string, year: number): Promise<void> {
    await this.run(async () => {
      const res = await this.api.createVehicle({ fleetId, plate, model, brand, year });
      this.vehicles.set([...this.vehicles(), ...VehicleAssembler.toEntitiesFromResponse(res)]);
    });
  }
  async updateVehicle(vehicleId: string, patch: object): Promise<void> {
    await this.run(async () => this.mergeVehicles(await this.api.updateVehicle(vehicleId, patch)));
  }
  async deactivateVehicle(vehicleId: string): Promise<void> {
    await this.run(async () => this.mergeVehicles(await this.api.deactivateVehicle(vehicleId)));
  }
  async assignDevice(vehicleId: string, deviceSerial: string): Promise<void> {
    await this.run(async () => { await this.api.assignDevice(vehicleId, deviceSerial); await this.refreshSelectedVehicles(); });
  }
  async unassignDevice(assignmentId: string): Promise<void> {
    await this.run(async () => { await this.api.unassignDevice(assignmentId); await this.refreshSelectedVehicles(); });
  }
  async fetchAlertRules(fleetId: string): Promise<void> {
    await this.run(async () => this.alertRules.set(AlertRuleAssembler.toEntitiesFromResponse(await this.api.getAlertRules(fleetId))));
  }
  async configureAlertRule(rule: object): Promise<void> {
    await this.run(async () => {
      const res = await this.api.createAlertRule(rule);
      this.alertRules.set([...this.alertRules(), ...AlertRuleAssembler.toEntitiesFromResponse(res)]);
    });
  }
  async updateAlertRule(ruleId: string, patch: object): Promise<void> {
    await this.run(async () => this.alertRules.set(AlertRuleAssembler.toEntitiesFromResponse(await this.api.updateAlertRule(ruleId, patch))));
  }
  searchVehicle(query: string): void {
    this.searchQuery.set(query);
  }
  async fetchVehicleLoans(fleetId: string, statusFilter: string | null): Promise<void> {
    this.loanStatusFilter.set((statusFilter as LoanStatus) ?? null);
    await this.run(async () => this.vehicleLoans.set(VehicleLoanAssembler.toEntitiesFromResponse(await this.api.getVehicleLoans(fleetId, statusFilter))));
  }
  async requestVehicleLoan(vehicleId: string, personnelId: string, expectedReturnDate: string): Promise<void> {
    await this.run(async () => this.mergeLoans(await this.api.requestVehicleLoan({ vehicleId, requestedByPersonnelId: personnelId, expectedReturnDate })));
  }
  async approveVehicleLoan(loanId: string, approverId: string): Promise<void> {
    await this.run(async () => this.mergeLoans(await this.api.approveVehicleLoan(loanId, approverId)));
  }
  async rejectVehicleLoan(loanId: string, approverId: string, reason: string): Promise<void> {
    await this.run(async () => this.mergeLoans(await this.api.rejectVehicleLoan(loanId, approverId, reason)));
  }
  async assignVehicleToPersonnel(loanId: string): Promise<void> {
    await this.run(async () => this.mergeLoans(await this.api.assignVehicleToPersonnel(loanId)));
  }
  async requestVehicleReturn(loanId: string): Promise<void> {
    await this.run(async () => this.mergeLoans(await this.api.requestVehicleReturn(loanId)));
  }
  async confirmVehicleReturn(loanId: string, supervisorId: string): Promise<void> {
    await this.run(async () => this.mergeLoans(await this.api.confirmVehicleReturn(loanId, supervisorId)));
  }
  async fetchDrivingReports(vehicleId: string, startDate: string, endDate: string): Promise<void> {
    this.selectedVehicleId.set(vehicleId);
    await this.run(async () => this.drivingReports.set(DrivingReportAssembler.toEntitiesFromResponse(await this.api.getDrivingReports(vehicleId, startDate, endDate))));
  }
  clearErrors(): void {
    this.errors.set([]);
  }

  highRiskReports = computed(() => this.drivingReports().filter((r) => r.isHighRisk(HIGH_RISK_SCORE)));

  // ----- helpers -----
  private async refreshSelectedVehicles(): Promise<void> {
    const fleetId = this.selectedFleetId();
    if (fleetId) this.vehicles.set(VehicleAssembler.toEntitiesFromResponse(await this.api.getVehicles(fleetId)));
  }
  private mergeVehicles(res: unknown): void {
    const incoming = VehicleAssembler.toEntitiesFromResponse(res as never);
    const byId = new Map(this.vehicles().map((v) => [v.id, v]));
    for (const v of incoming) byId.set(v.id, v);
    this.vehicles.set([...byId.values()]);
  }
  private mergeLoans(res: unknown): void {
    const incoming = VehicleLoanAssembler.toEntitiesFromResponse(res as never);
    const byId = new Map(this.vehicleLoans().map((l) => [l.id, l]));
    for (const l of incoming) byId.set(l.id, l);
    this.vehicleLoans.set([...byId.values()]);
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
