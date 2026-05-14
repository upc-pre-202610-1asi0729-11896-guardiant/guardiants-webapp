import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { FleetStore } from '../../../application/fleet.store';
import { Vehicle } from '../../../domain/model/vehicle.entity';
import { VehicleMapComponent } from '../../components/vehicle-map/vehicle-map';

@Component({
  selector: 'app-live-status',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, VehicleMapComponent],
  templateUrl: './live-status.html',
  styleUrls: ['./live-status.css'],
})
export class LiveStatus implements OnInit {
  private readonly fleetStore = inject(FleetStore);
  private readonly fb = inject(FormBuilder);

  readonly vehicles = this.fleetStore.vehicles;
  readonly isLoading = this.fleetStore.isLoading;
  readonly error = this.fleetStore.error;

  private readonly _selectedVehicle = signal<Vehicle | null>(null);
  readonly isEditVehicleOpen = signal(false);
  readonly isSavingVehicle = signal(false);

  readonly editVehicleForm = this.fb.nonNullable.group({
    plate: ['', Validators.required],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    capacity: [0, [Validators.required, Validators.min(1)]],
    status: ['ACTIVE', Validators.required],
    lastLocation: [''],
    lastLat: [-12.0974, Validators.required],
    lastLng: [-77.0362, Validators.required],
    speedKmh: [0],
    batteryPct: [100, [Validators.min(0), Validators.max(100)]],
  });

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

  openEditVehicle(vehicle: Vehicle): void {
    this._selectedVehicle.set(vehicle);
    this.editVehicleForm.reset({
      plate: vehicle.plate,
      brand: vehicle.brand,
      model: vehicle.model,
      capacity: vehicle.capacity,
      status: vehicle.status,
      lastLocation: vehicle.lastLocation ?? '',
      lastLat: vehicle.lastLat ?? -12.0974,
      lastLng: vehicle.lastLng ?? -77.0362,
      speedKmh: vehicle.speedKmh ?? 0,
      batteryPct: vehicle.batteryPct ?? 100,
    });
    this.isEditVehicleOpen.set(true);
  }

  closeEditVehicle(): void {
    this.isEditVehicleOpen.set(false);
  }

  saveVehicle(): void {
    const vehicle = this.selectedVehicle();
    if (!vehicle || this.editVehicleForm.invalid) {
      this.editVehicleForm.markAllAsTouched();
      return;
    }

    this.isSavingVehicle.set(true);
    const formValue = this.editVehicleForm.getRawValue();
    this.fleetStore.updateVehicle(vehicle.id, {
      organizationId: vehicle.organizationId,
      plate: formValue.plate,
      brand: formValue.brand,
      model: formValue.model,
      status: formValue.status,
      capacity: Number(formValue.capacity),
      lastLocation: formValue.lastLocation,
      lastLat: Number(formValue.lastLat),
      lastLng: Number(formValue.lastLng),
      speedKmh: Number(formValue.speedKmh),
      batteryPct: Number(formValue.batteryPct),
      deviceStatus: vehicle.deviceStatus ?? 'CONNECTED',
    }).subscribe({
      next: (updated) => {
        this._selectedVehicle.set(updated);
        this.isSavingVehicle.set(false);
        this.isEditVehicleOpen.set(false);
      },
      error: () => this.isSavingVehicle.set(false),
    });
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


