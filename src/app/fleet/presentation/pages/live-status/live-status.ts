import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FleetStore } from '../../../application/fleet.store';
import { Vehicle } from '../../../domain/model/vehicle.entity';

@Component({
  selector: 'app-live-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './live-status.html',
  styleUrls: ['./live-status.css'],
})
export class LiveStatus implements OnInit {
  private readonly fleetStore = inject(FleetStore);

  readonly vehicles = this.fleetStore.vehicles;
  readonly isLoading = this.fleetStore.isLoading;
  readonly error = this.fleetStore.error;

  private readonly _selectedVehicle = signal<Vehicle | null>(null);

  readonly selectedVehicle = computed(() => this._selectedVehicle() ?? this.vehicles()[0] ?? null);
  readonly activeVehicles = computed(() => this.vehicles().filter((vehicle) => vehicle.status === 'ACTIVE'));
  readonly maintenanceVehicles = computed(() =>
    this.vehicles().filter((vehicle) => vehicle.status === 'MAINTENANCE'),
  );
  readonly totalMileageKm = computed(() =>
    this.vehicles().reduce((total, vehicle) => total + (vehicle.mileageKm ?? 0), 0),
  );
  readonly averageSpeed = computed(() => {
    const list = this.vehicles().filter((vehicle) => typeof vehicle.speedKmh === 'number');
    if (!list.length) return 0;
    return Math.round(list.reduce((total, vehicle) => total + (vehicle.speedKmh ?? 0), 0) / list.length);
  });

  ngOnInit(): void {
    this.fleetStore.loadVehicles().subscribe({ error: () => void 0 });
  }

  selectVehicle(vehicle: Vehicle): void {
    this._selectedVehicle.set(vehicle);
  }

  trackByVehicleId(_: number, vehicle: Vehicle): string {
    return vehicle.id;
  }


  statusLabel(vehicle: Vehicle): string {
    const map: Record<string, string> = {
      ACTIVE: 'Activo',
      MAINTENANCE: 'Mantenimiento',
      BLOCKED: 'Bloqueado',
      INACTIVE: 'Inactivo',
    };
    return map[vehicle.status] ?? vehicle.status;
  }

  statusClass(vehicle: Vehicle): string {
    return vehicle.status.toLowerCase();
  }

  deviceLabel(vehicle: Vehicle): string {
    if (!vehicle.deviceStatus) return 'Sin señal';
    return vehicle.deviceStatus === 'CONNECTED' ? 'Conectado' : vehicle.deviceStatus;
  }

  formatCoordinate(value?: number): string {
    return typeof value === 'number' ? value.toFixed(4) : '--';
  }
}


