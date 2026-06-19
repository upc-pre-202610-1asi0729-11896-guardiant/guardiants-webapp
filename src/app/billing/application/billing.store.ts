import { Injectable, computed, inject, signal } from '@angular/core';
import {
  DeviceConnectionStatus,
  Payment,
  PaymentFailureNotification,
  Plan,
  Subscription,
} from '../domain/model/billing.entities';
import { BillingApi } from '../infrastructure/billing-api';
import {
  DeviceConnectionStatusAssembler,
  PaymentAssembler,
  PaymentFailureNotificationAssembler,
  PlanAssembler,
  SubscriptionAssembler,
} from '../infrastructure/billing-assembler';
import { ApiError } from '../../shared/domain/model/value-objects';

@Injectable({ providedIn: 'root' })
export class useBillingStore {
  private readonly api = inject(BillingApi);

  // ----- state -----
  readonly plans = signal<Plan[]>([]);
  readonly subscription = signal<Subscription | null>(null);
  readonly paymentHistory = signal<Payment[]>([]);
  readonly pendingFailureNotifications = signal<PaymentFailureNotification[]>([]);
  readonly deviceConnectionStatus = signal<DeviceConnectionStatus | null>(null);
  readonly selectedPlanId = signal<string | null>(null);
  readonly checkoutInProgress = signal(false);
  readonly loading = signal(false);
  readonly errors = signal<ApiError[]>([]);

  // ----- computed -----
  readonly activePlan = computed(() => {
    const sub = this.subscription();
    return sub ? (this.plans().find((p) => p.id === sub.planId) ?? null) : null;
  });
  readonly isSubscriptionActive = computed(() => this.subscription()?.isActive() ?? false);
  readonly isSubscriptionSuspended = computed(() => this.subscription()?.isSuspended() ?? false);
  readonly daysUntilExpiration = computed(() => this.subscription()?.daysUntilExpiration() ?? null);
  readonly hasUnacknowledgedFailures = computed(() =>
    this.pendingFailureNotifications().some((n) => !n.acknowledged),
  );
  readonly upgradeablePlans = computed(() => {
    const sub = this.subscription();
    if (!sub) return this.plans();
    return this.plans().filter((p) => sub.canBeUpgradedTo(p));
  });

  // ----- actions -----
  async fetchPlans(): Promise<void> {
    await this.run(async () => this.plans.set(PlanAssembler.toEntitiesFromResponse(await this.api.getPlans())));
  }
  async fetchCurrentSubscription(ownerId: string): Promise<void> {
    await this.run(async () => this.subscription.set(SubscriptionAssembler.toEntityFromResponse(await this.api.getCurrentSubscription(ownerId))));
  }
  async selectPlan(ownerId: string, planId: string): Promise<void> {
    this.selectedPlanId.set(planId);
    await this.run(async () => this.subscription.set(SubscriptionAssembler.toEntityFromResponse(await this.api.selectPlan(ownerId, planId))));
  }
  async startCheckout(subscriptionId: string): Promise<void> {
    this.checkoutInProgress.set(true);
    try {
      const { checkoutUrl } = await this.api.createStripeCheckoutSession(subscriptionId);
      this.redirectToCheckout(checkoutUrl);
    } catch (e) {
      this.pushError(e);
    } finally {
      this.checkoutInProgress.set(false);
    }
  }
  async confirmPayment(subscriptionId: string, stripePaymentIntentId: string): Promise<void> {
    await this.run(async () => {
      const res = await this.api.confirmPayment(subscriptionId, stripePaymentIntentId);
      const payment = PaymentAssembler.toEntityFromResource(res.payment);
      if (payment) this.paymentHistory.set([payment, ...this.paymentHistory()]);
    });
  }
  async fetchPaymentHistory(subscriptionId: string): Promise<void> {
    await this.run(async () => this.paymentHistory.set(PaymentAssembler.toEntitiesFromResponse(await this.api.getPaymentHistory(subscriptionId))));
  }
  async fetchFailureNotifications(ownerId: string): Promise<void> {
    await this.run(async () => {
      const n = PaymentFailureNotificationAssembler.toEntityFromResponse(await this.api.getPaymentFailureNotifications(ownerId));
      this.pendingFailureNotifications.set(n ? [n] : []);
    });
  }
  async acknowledgePaymentFailure(notificationId: string): Promise<void> {
    await this.run(async () => {
      await this.api.acknowledgePaymentFailure(notificationId);
      this.pendingFailureNotifications.set(
        this.pendingFailureNotifications().filter((n) => n.id !== notificationId),
      );
    });
  }
  async renewSubscription(subscriptionId: string): Promise<void> {
    await this.run(async () => this.subscription.set(SubscriptionAssembler.toEntityFromResponse(await this.api.renewSubscription(subscriptionId))));
  }
  async updatePlan(subscriptionId: string, newPlanId: string): Promise<void> {
    await this.run(async () => this.subscription.set(SubscriptionAssembler.toEntityFromResponse(await this.api.updatePlan(subscriptionId, newPlanId))));
  }
  async cancelSubscription(subscriptionId: string): Promise<void> {
    await this.run(async () => this.subscription.set(SubscriptionAssembler.toEntityFromResponse(await this.api.cancelSubscription(subscriptionId))));
  }
  async fetchDeviceConnectionStatus(ownerId: string): Promise<void> {
    await this.run(async () => this.deviceConnectionStatus.set(DeviceConnectionStatusAssembler.toEntityFromResource(await this.api.getDeviceConnectionStatus(ownerId))));
  }
  redirectToCheckout(checkoutUrl: string): void {
    window.location.href = checkoutUrl;
  }
  clearErrors(): void {
    this.errors.set([]);
  }

  private pushError(e: unknown): void {
    const err = e instanceof ApiError ? e : new ApiError('UNKNOWN', (e as Error)?.message ?? 'Error', 0);
    this.errors.set([...this.errors(), err]);
  }
  private async run(work: () => Promise<void>): Promise<void> {
    this.loading.set(true);
    try {
      await work();
    } catch (e) {
      this.pushError(e);
    } finally {
      this.loading.set(false);
    }
  }
}
