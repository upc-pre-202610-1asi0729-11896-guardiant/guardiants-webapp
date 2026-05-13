import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal, HostListener } from '@angular/core';
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

  // Estado para el modal de bloqueo
  readonly isBlockMenuOpen = signal(false);
  readonly isBlockingVehicle = signal(false);

  readonly activeVehicle = computed(() => this.vehicles().find((vehicle) => vehicle.status === 'ACTIVE') ?? this.vehicles()[0] ?? null);
  readonly alertsToday = computed(() => this.vehicles().filter((vehicle) => vehicle.status === 'MAINTENANCE').length);
  readonly routesCount = computed(() => this.vehicles().length);
  readonly activeBattery = computed(() => this.activeVehicle()?.batteryPct ?? 0);
  readonly activeGps = computed(() => (typeof this.activeVehicle()?.lastLat === 'number' ? 'High' : 'No signal'));

  ngOnInit(): void {
    this.fleetStore.loadVehicles().subscribe({ error: () => void 0 });
  }

  toggleBlockMenu(): void {
    this.isBlockMenuOpen.update((v) => !v);
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

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const blockMenu = document.querySelector('.block-menu');
    const blockButton = document.querySelector('.danger-button');

    if (
      this.isBlockMenuOpen() &&
      blockMenu &&
      !blockMenu.contains(target) &&
      blockButton &&
      !blockButton.contains(target)
    ) {
      this.isBlockMenuOpen.set(false);
    }
  }
}







