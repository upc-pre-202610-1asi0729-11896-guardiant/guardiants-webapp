import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { environment } from '../../../../../environments/environment';
import { IamStore } from '../../../../iam/application/iam.store';

interface PlanResource {
  id: number;
  name: string;
  planTier: string;
  maxVehicles?: number;
  maxDevices?: number;
  price: number;
}

interface SubscriptionResource {
  id: string;
  organizationId: string;
  planId: number;
  status: string;
  startDate: string;
  endDate?: string | null;
}

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './subscriptions.html',
  styleUrls: ['./subscriptions.css'],
})
export class Subscriptions implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly iamStore = inject(IamStore);

  readonly plans = signal<PlanResource[]>([]);
  readonly subscriptions = signal<SubscriptionResource[]>([]);
  readonly isLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly organizationId = this.iamStore.organizationId;
  readonly userRoleId = this.iamStore.userRoleId;

  readonly normalizedPlans = computed(() => {
    const plans = this.plans();
    const isEmpresa = this.userRoleId() === 2;

    if (isEmpresa) {
      // Empresas ven planes empresariales
      return plans.filter(plan => plan.planTier.startsWith('ENTERPRISE'));
    } else {
      // Personas naturales ven planes personales
      return plans.filter(plan => !plan.planTier.startsWith('ENTERPRISE'));
    }
  });

  readonly currentSubscription = computed(() =>
    this.subscriptions().find((subscription) => subscription.organizationId === this.organizationId() && subscription.status === 'ACTIVE') ?? null,
  );

  ngOnInit(): void {
    this.isLoading.set(true);
    this.http.get<PlanResource[]>(`${environment.apiBaseUrl}/plans`).subscribe({
      next: (plans) => {
        this.plans.set(plans);
        this.loadSubscriptions();
      },
      error: (error) => {
        this.error.set(error?.message ?? 'Error loading plans.');
        this.isLoading.set(false);
      },
    });
  }

  selectPlan(plan: PlanResource): void {
    const current = this.currentSubscription();
    if (current) {
      this.http.patch<SubscriptionResource>(`${environment.apiBaseUrl}/subscriptions/${current.id}`, {
        planId: plan.id,
        status: 'ACTIVE',
      }).subscribe({
        next: (updated) => {
          this.subscriptions.update((items) => items.map((item) => (item.id === updated.id ? updated : item)));
        },
        error: (error) => this.error.set(error?.message ?? 'Error updating subscription.'),
      });
      return;
    }

    this.http.post<SubscriptionResource>(`${environment.apiBaseUrl}/subscriptions`, {
      id: `SUB-${Date.now()}`,
      organizationId: this.organizationId(),
      planId: plan.id,
      status: 'ACTIVE',
      startDate: new Date().toISOString(),
      endDate: null,
    }).subscribe({
      next: (created) => this.subscriptions.update((items) => [...items, created]),
      error: (error) => this.error.set(error?.message ?? 'Error creating subscription.'),
    });
  }

  isCurrentPlan(plan: PlanResource): boolean {
    return this.currentSubscription()?.planId === plan.id;
  }

  deviceLimit(plan: PlanResource): number {
    return plan.maxDevices ?? plan.maxVehicles ?? 0;
  }

  private loadSubscriptions(): void {
    this.http.get<SubscriptionResource[]>(`${environment.apiBaseUrl}/subscriptions`).subscribe({
      next: (subscriptions) => {
        this.subscriptions.set(subscriptions);
        this.isLoading.set(false);
      },
      error: (error) => {
        this.error.set(error?.message ?? 'Error loading subscriptions.');
        this.isLoading.set(false);
      },
    });
  }
}
