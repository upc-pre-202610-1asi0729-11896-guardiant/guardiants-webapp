import { CommonModule } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertEntity } from '../../../domain/model/alert.entity';
import { AlertReadFilter, AlertStore, AlertTimeFilter } from '../../../application/alert.store';
import { IamStore } from '../../../../iam/application/iam.store';
import { FleetStore } from '../../../../fleet/application/fleet.store';
import { Vehicle } from '../../../../fleet/domain/model/vehicle.entity';
import { VehicleMapComponent } from '../../../../fleet/presentation/components/vehicle-map/vehicle-map';
import { VehicleSearchStore } from '../../../../shared/application/vehicle-search.store';

@Component({
  selector: 'app-security-alert',
  standalone: true,
  imports: [CommonModule, TranslatePipe, VehicleMapComponent],
  templateUrl: './security-alert.html',
  styleUrls: ['./security-alert.css'],
})
export class SecurityAlert implements OnInit {
  private readonly alertStore = inject(AlertStore);
  private readonly fleetStore = inject(FleetStore);
  private readonly iamStore = inject(IamStore);
  private readonly translate = inject(TranslateService);
  private readonly vehicleSearchStore = inject(VehicleSearchStore);

  readonly allAlerts = this.alertStore.filteredAlerts;
  readonly recentAlerts = this.alertStore.recentAlerts;
  readonly isLoading = this.alertStore.isLoading;
  readonly error = this.alertStore.error;
  readonly timeFilter = this.alertStore.timeFilter;
  readonly readFilter = this.alertStore.readFilter;
  readonly unreadCount = this.alertStore.unreadCount;
  readonly vehicles = this.fleetStore.vehicles;
  readonly searchQuery = this.vehicleSearchStore.query;

  readonly userName = this.iamStore.userName;
  readonly userPlan = this.iamStore.userPlan;

  readonly selectedAlert = signal<AlertEntity | null>(null);
  readonly isDetailOpen = signal(false);
  readonly isActionLoading = signal(false);

  readonly alerts = computed(() => {
    const query = this.searchQuery();
    const alerts = this.allAlerts();
    if (!query) return alerts;
    return alerts.filter((alert) => {
      const vehicle = this.vehicleById(alert.vehicleId);
      return [
        alert.typeLabel,
        alert.description,
        alert.detail,
        alert.location,
        alert.severity,
        vehicle?.plate,
        vehicle?.brand,
        vehicle?.model,
        vehicle?.lastLocation,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(query));
    });
  });

  readonly selectedVehicle = computed(() => {
    const alert = this.selectedAlert();
    return alert ? this.vehicleById(alert.vehicleId) : null;
  });

  readonly timeFilters: { value: AlertTimeFilter; label: string }[] = [
    { value: 'last_hour', label: 'alerts.timeFilters.last_hour' },
    { value: 'today', label: 'alerts.timeFilters.today' },
    { value: 'last_7_days', label: 'alerts.timeFilters.last_7_days' },
    { value: 'last_30_days', label: 'alerts.timeFilters.last_30_days' },
  ];

  ngOnInit(): void {
    this.alertStore.loadAlerts().subscribe({ error: () => void 0 });
    this.fleetStore.loadVehicles().subscribe({ error: () => void 0 });
  }

  setTimeFilter(filter: AlertTimeFilter): void {
    this.alertStore.setTimeFilter(filter);
  }

  setReadFilter(filter: AlertReadFilter): void {
    this.alertStore.setReadFilter(filter);
  }

  openDetail(alert: AlertEntity): void {
    this.selectedAlert.set(alert);
    this.isDetailOpen.set(true);
    if (alert.isUnread) {
      this.alertStore.markAsRead(alert.id).subscribe({ error: () => void 0 });
    }
  }

  closeDetail(): void {
    this.isDetailOpen.set(false);
  }

  resolveSelectedAlert(): void {
    const alert = this.selectedAlert();
    if (!alert) return;
    this.isActionLoading.set(true);
    this.alertStore.resolveAlert(alert.id).subscribe({
      next: () => {
        this.selectedAlert.set(this.alertStore.allAlerts().find((item) => item.id === alert.id) ?? null);
        this.isActionLoading.set(false);
      },
      error: () => this.isActionLoading.set(false),
    });
  }

  blockVehicle(vehicleId: string): void {
    this.isActionLoading.set(true);
    this.fleetStore.blockVehicle(vehicleId).subscribe({
      next: () => this.isActionLoading.set(false),
      error: () => this.isActionLoading.set(false),
    });
  }

  unblockVehicle(vehicleId: string): void {
    this.isActionLoading.set(true);
    this.fleetStore.unblockVehicle(vehicleId).subscribe({
      next: () => this.isActionLoading.set(false),
      error: () => this.isActionLoading.set(false),
    });
  }

  vehicleById(vehicleId: string): Vehicle | null {
    return this.vehicles().find((vehicle) => vehicle.id === vehicleId) ?? null;
  }

  timeAgo(date: Date): string {
    const diff = Math.floor((Date.now() - date.getTime()) / 1000);
    if (diff < 60) return this.translate.instant('alerts.ago.seconds', { value: diff });
    if (diff < 3600) {
      return this.translate.instant('alerts.ago.minutes', { value: Math.floor(diff / 60) });
    }
    if (diff < 86400) {
      return this.translate.instant('alerts.ago.hours', { value: Math.floor(diff / 3600) });
    }
    return this.translate.instant('alerts.ago.days', { value: Math.floor(diff / 86400) });
  }
}
