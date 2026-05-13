// src/app/fleet/presentation/pages/home/home.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject } from '@angular/core';
import { FleetStore } from '../../../application/fleet.store';
import { IamStore } from '../../../../iam/application/iam.store';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class Home implements OnInit {
  private readonly fleetStore = inject(FleetStore);
  private readonly iamStore = inject(IamStore);

  readonly vehicles = this.fleetStore.vehicles;
  readonly isLoading = this.fleetStore.isLoading;
  readonly error = this.fleetStore.error;
  readonly userName = this.iamStore.userName;

  readonly activeVehicle = computed(
    () => this.vehicles().find((v) => v.status === 'ACTIVE') ?? this.vehicles()[0] ?? null,
  );
  readonly alertsToday = computed(
    () => this.vehicles().filter((v) => v.status === 'MAINTENANCE').length,
  );
  readonly routesCount = computed(() => this.vehicles().length);

  ngOnInit(): void {
    this.fleetStore.loadVehicles().subscribe({ error: () => void 0 });
  }
}
