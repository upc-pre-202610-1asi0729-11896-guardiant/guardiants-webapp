import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal, HostListener } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { FleetStore, VehiclePayload } from '../../../application/fleet.store';
import { IamStore } from '../../../../iam/application/iam.store';
import { VehicleMapComponent } from '../../components/vehicle-map/vehicle-map';
import { VehicleSearchStore } from '../../../../shared/application/vehicle-search.store';

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
  private readonly vehicleSearchStore = inject(VehicleSearchStore);

  readonly vehicles = this.fleetStore.vehicles;
  readonly isLoading = this.fleetStore.isLoading;
  readonly error = this.fleetStore.error;
  readonly userName = this.iamStore.userName;
  readonly userRole = this.iamStore.userRole;
  readonly organizationId = this.iamStore.organizationId;
  readonly searchQuery = this.vehicleSearchStore.query;

  // Estado para el modal de bloqueo
  readonly isBlockMenuOpen = signal(false);
  readonly isUnblockMenuOpen = signal(false);
  readonly isAddVehicleOpen = signal(false);
  readonly isBlockingVehicle = signal(false);
  readonly isSavingVehicle = signal(false);
  readonly isFullMapOpen = signal(false);

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

  readonly filteredVehicles = computed(() => {
    const query = this.searchQuery();
    if (!query) return this.vehicles();
    return this.vehicles().filter((vehicle) =>
      [vehicle.plate, vehicle.brand, vehicle.model, vehicle.lastLocation, vehicle.status]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query)),
    );
  });
  readonly activeVehicle = computed(() => this.filteredVehicles().find((vehicle) => vehicle.status === 'ACTIVE') ?? this.filteredVehicles()[0] ?? null);
  readonly alertsToday = computed(() => this.filteredVehicles().filter((vehicle) => vehicle.status === 'MAINTENANCE').length);
  readonly routesCount = computed(() => this.filteredVehicles().length);
  readonly activeBattery = computed(() => this.activeVehicle()?.batteryPct ?? 0);
  readonly activeGps = computed(() => typeof this.activeVehicle()?.lastLat === 'number');
  readonly canAddVehicle = computed(() => this.userRole() !== 'PERSONA_NATURAL' || this.vehicles().length < 3);

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
    if (!this.canAddVehicle()) return;
    this.isAddVehicleOpen.update((v) => !v);
    this.isBlockMenuOpen.set(false);
    this.isUnblockMenuOpen.set(false);
  }

  openFullMap(): void {
    this.isFullMapOpen.set(true);
  }

  closeFullMap(): void {
    this.isFullMapOpen.set(false);
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
      organizationId: this.organizationId(),
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

    if (!this.canAddVehicle()) {
      this.isSavingVehicle.set(false);
      return;
    }

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







