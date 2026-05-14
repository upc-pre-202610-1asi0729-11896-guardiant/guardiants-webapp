import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { AlertReadFilter, AlertStore, AlertTimeFilter } from '../../../application/alert.store';
import { IamStore } from '../../../../iam/application/iam.store';

@Component({
  selector: 'app-security-alert',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './security-alert.html',
  styleUrls: ['./security-alert.css'],
})
export class SecurityAlert implements OnInit {
  private readonly alertStore = inject(AlertStore);
  private readonly iamStore = inject(IamStore);
  private readonly translate = inject(TranslateService);

  readonly alerts = this.alertStore.filteredAlerts;
  readonly recentAlerts = this.alertStore.recentAlerts;
  readonly isLoading = this.alertStore.isLoading;
  readonly error = this.alertStore.error;
  readonly timeFilter = this.alertStore.timeFilter;
  readonly readFilter = this.alertStore.readFilter;
  readonly unreadCount = this.alertStore.unreadCount;

  readonly userName = this.iamStore.userName;
  readonly userPlan = this.iamStore.userPlan;

  readonly timeFilters: { value: AlertTimeFilter; label: string }[] = [
    { value: 'last_hour', label: 'alerts.timeFilters.last_hour' },
    { value: 'today', label: 'alerts.timeFilters.today' },
    { value: 'last_7_days', label: 'alerts.timeFilters.last_7_days' },
    { value: 'last_30_days', label: 'alerts.timeFilters.last_30_days' },
  ];

  ngOnInit(): void {
    this.alertStore.loadAlerts().subscribe({ error: () => void 0 });
  }

  setTimeFilter(filter: AlertTimeFilter): void {
    this.alertStore.setTimeFilter(filter);
  }

  setReadFilter(filter: AlertReadFilter): void {
    this.alertStore.setReadFilter(filter);
  }

  viewDetail(alertId: string): void {
    this.alertStore.markAsRead(alertId).subscribe({ error: () => void 0 });
  }

  blockVehicle(vehicleId: string): void {
    console.warn('Block vehicle:', vehicleId);
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
