import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { IamStore } from '../../../../iam/application/iam.store';
import { FleetStore } from '../../../application/fleet.store';

interface DeviceResource {
  id: string;
  vehicleId: string;
  serialNumber: string;
  status: string;
  assignedAt: string;
  unassignedAt?: string | null;
}

interface SubscriptionResource {
  id: string;
  organizationId: string;
  planId: number;
  status: string;
}

interface PlanResource {
  id: number;
  name: string;
  planTier: string;
  maxVehicles?: number;
  maxDevices?: number;
}

@Component({
  selector: 'app-devices',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './devices.html',
  styleUrls: ['./devices.css'],
})
export class Devices implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly fb = inject(FormBuilder);
  private readonly iamStore = inject(IamStore);
  private readonly fleetStore = inject(FleetStore);

  readonly devices = signal<DeviceResource[]>([]);
  readonly subscriptions = signal<SubscriptionResource[]>([]);
  readonly plans = signal<PlanResource[]>([]);
  readonly vehicles = this.fleetStore.vehicles;
  readonly organizationId = this.iamStore.organizationId;
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly isAddingDevice = signal(false);
  readonly successMessage = signal<string | null>(null);

  readonly deviceForm = this.fb.nonNullable.group({
    vehicleId: ['', Validators.required],
    serialNumber: ['', Validators.required],
  });

  readonly currentSubscription = computed(() =>
    this.subscriptions().find((subscription) => subscription.organizationId === this.organizationId() && subscription.status === 'ACTIVE') ?? null,
  );

  readonly currentPlan = computed(() => {
    const subscription = this.currentSubscription();
    return this.plans().find((plan) => plan.id === subscription?.planId) ?? this.plans()[0] ?? null;
  });

  readonly deviceLimit = computed(() => {
    const plan = this.currentPlan();
    return plan?.maxDevices ?? plan?.maxVehicles ?? 3;
  });

  readonly canAddDevice = computed(() => this.devices().length < this.deviceLimit());

  ngOnInit(): void {
    this.isLoading.set(true);
    this.fleetStore.loadVehicles().subscribe({ error: () => void 0 });
    this.loadDevices();
    this.loadPlans();
    this.loadSubscriptions();
  }

  addDevice(): void {
    if (this.deviceForm.invalid || !this.canAddDevice()) {
      this.deviceForm.markAllAsTouched();
      return;
    }

    this.isAddingDevice.set(true);
    const formValue = this.deviceForm.getRawValue();
    const payload: DeviceResource = {
      id: `DEV-${Date.now()}`,
      vehicleId: formValue.vehicleId,
      serialNumber: formValue.serialNumber,
      status: 'CONNECTED',
      assignedAt: new Date().toISOString(),
      unassignedAt: null,
    };

    this.http.post<DeviceResource>(`${environment.apiBaseUrl}/devices`, payload).subscribe({
      next: (created) => {
        this.devices.update((items) => [...items, created]);
        this.deviceForm.reset({ vehicleId: '', serialNumber: '' });
        this.isAddingDevice.set(false);
        this.successMessage.set(`Dispositivo ${created.serialNumber} asignado correctamente`);
        setTimeout(() => this.successMessage.set(null), 3000);
      },
      error: (error) => {
        this.error.set(error?.message ?? 'Error creating device.');
        this.isAddingDevice.set(false);
      },
    });
  }

  vehicleLabel(vehicleId: string): string {
    const vehicle = this.vehicles().find((item) => item.id === vehicleId);
    return vehicle ? `${vehicle.plate} - ${vehicle.brand} ${vehicle.model}` : vehicleId;
  }

  private loadDevices(): void {
    this.http.get<DeviceResource[]>(`${environment.apiBaseUrl}/devices`).subscribe({
      next: (devices) => {
        this.devices.set(devices);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set(error?.message ?? 'Error loading devices.');
        this.isLoading.set(false);
      },
    });
  }

  private loadPlans(): void {
    this.http.get<PlanResource[]>(`${environment.apiBaseUrl}/plans`).subscribe({
      next: (plans) => this.plans.set(plans),
      error: () => void 0,
    });
  }

  private loadSubscriptions(): void {
    this.http.get<SubscriptionResource[]>(`${environment.apiBaseUrl}/subscriptions`).subscribe({
      next: (subscriptions) => this.subscriptions.set(subscriptions),
      error: () => void 0,
    });
  }
}
