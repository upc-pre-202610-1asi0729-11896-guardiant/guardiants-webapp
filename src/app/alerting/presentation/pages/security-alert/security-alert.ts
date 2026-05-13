// src/app/alerting/presentation/pages/security-alert/security-alert.ts

import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { AlertStore, AlertTimeFilter, AlertReadFilter } from '../../../application/alert.store';
import { IamStore } from '../../../../iam/application/iam.store';
// 👆 AppShell eliminado — ya no se importa ni se usa aquí

@Component({
  selector: 'app-security-alert',
  standalone: true,
  imports: [CommonModule], // 👈 limpio
  templateUrl: './security-alert.html',
  styleUrls: ['./security-alert.css'],
})
export class SecurityAlert implements OnInit {
  private readonly alertStore = inject(AlertStore);
  private readonly iamStore = inject(IamStore);

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
    { value: 'last_hour', label: 'Last hour' },
    { value: 'today', label: 'Today' },
    { value: 'last_7_days', label: 'Last 7 days' },
    { value: 'last_30_days', label: 'Last 30 days' },
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
    if (diff < 60) return `${diff}s ago`;
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
  }
}
