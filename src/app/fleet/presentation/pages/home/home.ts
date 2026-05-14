import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal, HostListener } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { FleetStore, VehiclePayload } from '../../../application/fleet.store';
import { IamStore } from '../../../../iam/application/iam.store';
import { VehicleMapComponent } from '../../components/vehicle-map/vehicle-map';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, VehicleMapComponent],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  private readonly fleetStore = inject(FleetStore);
  private readonly iamStore = inject(IamStore);
  private readonly fb = inject(FormBuilder);

  readonly vehicles = this.fleetStore.vehicles;
  readonly isLoading = this.fleetStore.isLoading;
  readonly error = this.fleetStore.error;
  readonly userName = this.iamStore.userName;

  // Estado para el modal de bloqueo
  readonly isBlockMenuOpen = signal(false);
  readonly isUnblockMenuOpen = signal(false);
  readonly isAddVehicleOpen = signal(false);
  readonly isBlockingVehicle = signal(false);
  readonly isSavingVehicle = signal(false);

  readonly vehicleForm = this.fb.nonNullable.group({
    plate: ['', Validators.required],
    brand: ['', Validators.required],
    model: ['', Validators.required],
    capacity: [0, [Validators.required, Validators.min(1)]],
    lastLocation: [''],
    lastLat: [-12.0974, Validators.required],
    lastLng: [-77.0362, Validators.required],
    batteryPct: [100, [Validators.min(0), Validators.max(100)]],
  });

  readonly activeVehicle = computed(() => this.vehicles().find((vehicle) => vehicle.status === 'ACTIVE') ?? this.vehicles()[0] ?? null);
  readonly alertsToday = computed(() => this.vehicles().filter((vehicle) => vehicle.status === 'MAINTENANCE').length);
  readonly routesCount = computed(() => this.vehicles().length);
  readonly activeBattery = computed(() => this.activeVehicle()?.batteryPct ?? 0);
  readonly activeGps = computed(() => typeof this.activeVehicle()?.lastLat === 'number');

  ngOnInit(): void {
    this.fleetStore.loadVehicles().subscribe({ error: () => void 0 });
  }

  toggleBlockMenu(): void {
    this.isBlockMenuOpen.update((v) => !v);
    this.isUnblockMenuOpen.set(false);
    this.isAddVehicleOpen.set(false);
  }

  toggleUnblockMenu(): void {
    this.isUnblockMenuOpen.update((v) => !v);
    this.isBlockMenuOpen.set(false);
    this.isAddVehicleOpen.set(false);
  }

  toggleAddVehicle(): void {
    this.isAddVehicleOpen.update((v) => !v);
    this.isBlockMenuOpen.set(false);
    this.isUnblockMenuOpen.set(false);
  }

  blockVehicle(vehicleId: string): void {
    this.isBlockingVehicle.set(true);
    this.fleetStore.blockVehicle(vehicleId).subscribe({
      next: () => {
        this.isBlockingVehicle.set(false);
        this.isBlockMenuOpen.set(false);
      },
      error: () => {
        this.isBlockingVehicle.set(false);
      },
    });
  }

  unblockVehicle(vehicleId: string): void {
    this.isBlockingVehicle.set(true);
    this.fleetStore.unblockVehicle(vehicleId).subscribe({
      next: () => {
        this.isBlockingVehicle.set(false);
        this.isUnblockMenuOpen.set(false);
      },
      error: () => {
        this.isBlockingVehicle.set(false);
      },
    });
  }

  addVehicle(): void {
    if (this.vehicleForm.invalid) {
      this.vehicleForm.markAllAsTouched();
      return;
    }

    this.isSavingVehicle.set(true);
    const formValue = this.vehicleForm.getRawValue();
    const payload: VehiclePayload = {
      organizationId: 'ORG-001',
      plate: formValue.plate,
      brand: formValue.brand,
      model: formValue.model,
      status: 'ACTIVE',
      capacity: Number(formValue.capacity),
      lastLocation: formValue.lastLocation,
      lastLat: Number(formValue.lastLat),
      lastLng: Number(formValue.lastLng),
      speedKmh: 0,
      batteryPct: Number(formValue.batteryPct),
      deviceStatus: 'CONNECTED',
    };

    this.fleetStore.createVehicle(payload).subscribe({
      next: () => {
        this.isSavingVehicle.set(false);
        this.isAddVehicleOpen.set(false);
        this.vehicleForm.reset({
          plate: '',
          brand: '',
          model: '',
          capacity: 0,
          lastLocation: '',
          lastLat: -12.0974,
          lastLng: -77.0362,
          batteryPct: 100,
        });
      },
      error: () => this.isSavingVehicle.set(false),
    });
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const openMenu = document.querySelector('.block-menu, .vehicle-form-panel');
    const blockButton = document.querySelector('.danger-button');

    if (
      (this.isBlockMenuOpen() || this.isUnblockMenuOpen() || this.isAddVehicleOpen()) &&
      openMenu &&
      !openMenu.contains(target) &&
      blockButton &&
      !blockButton.contains(target)
    ) {
      this.isBlockMenuOpen.set(false);
      this.isUnblockMenuOpen.set(false);
      this.isAddVehicleOpen.set(false);
    }
  }
}







