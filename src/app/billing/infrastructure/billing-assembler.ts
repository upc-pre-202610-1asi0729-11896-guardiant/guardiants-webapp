import {
  ConnectionValue,
  DeviceConnectionStatus,
  Payment,
  PaymentFailureNotification,
  PaymentStatus,
  Plan,
  Subscription,
  SubscriptionStatus,
} from '../domain/model/billing.entities';
import {
  DeviceConnectionStatusResource,
  PaymentFailureNotificationResource,
  PaymentFailureNotificationResponse,
  PaymentListResponse,
  PaymentResource,
  PlanListResponse,
  PlanResource,
  SubscriptionResource,
  SubscriptionResponse,
} from './billing-response';

export class PlanAssembler {
  static toEntityFromResource(r: PlanResource): Plan | null {
    if (!r) return null;
    return new Plan(r.id, r.key, r.name, r.priceUsd, r.billingIntervalMonths, r.maxVehicles, r.features ?? []);
  }
  static toEntitiesFromResponse(response: PlanListResponse): Plan[] {
    return (response?.plans ?? [])
      .map((r) => PlanAssembler.toEntityFromResource(r))
      .filter((e): e is Plan => e !== null);
  }
}

export class SubscriptionAssembler {
  static toEntityFromResource(r: SubscriptionResource | null): Subscription | null {
    if (!r) return null;
    return new Subscription(
      r.id,
      r.ownerId,
      r.planId,
      r.status as SubscriptionStatus,
      r.currentPeriodStart,
      r.currentPeriodEnd,
      r.stripeSubscriptionId,
      r.stripeCustomerId,
      r.cancelAtPeriodEnd,
      r.createdAt,
      r.updatedAt,
    );
  }
  static toEntityFromResponse(response: SubscriptionResponse): Subscription | null {
    return SubscriptionAssembler.toEntityFromResource(response?.subscription ?? null);
  }
}

export class PaymentAssembler {
  static toEntityFromResource(r: PaymentResource): Payment | null {
    if (!r) return null;
    return new Payment(
      r.id,
      r.subscriptionId,
      r.stripePaymentIntentId,
      r.amountUsd,
      r.currency,
      r.status as PaymentStatus,
      r.failureReason,
      r.processedAt,
    );
  }
  static toEntitiesFromResponse(response: PaymentListResponse): Payment[] {
    return (response?.payments ?? [])
      .map((r) => PaymentAssembler.toEntityFromResource(r))
      .filter((e): e is Payment => e !== null);
  }
}

export class PaymentFailureNotificationAssembler {
  static toEntityFromResource(r: PaymentFailureNotificationResource): PaymentFailureNotification | null {
    if (!r) return null;
    return new PaymentFailureNotification(r.id, r.subscriptionId, r.paymentId, r.ownerId, r.sentAt, r.acknowledged);
  }
  static toEntityFromResponse(response: PaymentFailureNotificationResponse): PaymentFailureNotification | null {
    return PaymentFailureNotificationAssembler.toEntityFromResource(response?.notification);
  }
}

export class DeviceConnectionStatusAssembler {
  static toEntityFromResource(r: DeviceConnectionStatusResource): DeviceConnectionStatus | null {
    if (!r) return null;
    return new DeviceConnectionStatus(r.value as ConnectionValue, r.lastSeenAt);
  }
}
