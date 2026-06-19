import { BaseEntity } from '../../../shared/domain/model/base.entity';

export enum SubscriptionStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  SUSPENDED = 'SUSPENDED',
  EXPIRED = 'EXPIRED',
  CANCELED = 'CANCELED',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  SUCCEEDED = 'SUCCEEDED',
  FAILED = 'FAILED',
}

export enum ConnectionValue {
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
}

export class Plan extends BaseEntity {
  constructor(
    id: string,
    public key: string,
    public name: string,
    public priceUsd: number,
    public billingIntervalMonths: number,
    public maxVehicles: number,
    public features: string[],
  ) {
    super(id);
  }
  isFree(): boolean {
    return this.priceUsd === 0;
  }
  supportsVehicleCount(count: number): boolean {
    return count <= this.maxVehicles;
  }
}

export class Subscription extends BaseEntity {
  constructor(
    id: string,
    public ownerId: string,
    public planId: string,
    public status: SubscriptionStatus,
    public currentPeriodStart: string,
    public currentPeriodEnd: string,
    public stripeSubscriptionId: string | null,
    public stripeCustomerId: string | null,
    public cancelAtPeriodEnd: boolean,
    public createdAt: string,
    public updatedAt: string,
  ) {
    super(id);
  }
  isActive(): boolean {
    return this.status === SubscriptionStatus.ACTIVE && !this.isExpired();
  }
  isExpired(): boolean {
    return (
      this.status === SubscriptionStatus.EXPIRED ||
      new Date(this.currentPeriodEnd).getTime() < Date.now()
    );
  }
  isSuspended(): boolean {
    return this.status === SubscriptionStatus.SUSPENDED;
  }
  daysUntilExpiration(): number {
    return Math.max(
      0,
      Math.ceil((new Date(this.currentPeriodEnd).getTime() - Date.now()) / 86_400_000),
    );
  }
  canBeUpgradedTo(plan: Plan): boolean {
    return plan.id !== this.planId && this.isActive();
  }
}

export class Payment extends BaseEntity {
  constructor(
    id: string,
    public subscriptionId: string,
    public stripePaymentIntentId: string,
    public amountUsd: number,
    public currency: string,
    public status: PaymentStatus,
    public failureReason: string | null,
    public processedAt: string,
  ) {
    super(id);
  }
  isSuccessful(): boolean {
    return this.status === PaymentStatus.SUCCEEDED;
  }
  isFailed(): boolean {
    return this.status === PaymentStatus.FAILED;
  }
}

export class PaymentFailureNotification extends BaseEntity {
  constructor(
    id: string,
    public subscriptionId: string,
    public paymentId: string,
    public ownerId: string,
    public sentAt: string,
    public acknowledged: boolean,
  ) {
    super(id);
  }
  daysUntilSuspension(gracePeriodDays: number): number {
    const deadline = new Date(this.sentAt).getTime() + gracePeriodDays * 86_400_000;
    return Math.max(0, Math.ceil((deadline - Date.now()) / 86_400_000));
  }
}

export class DeviceConnectionStatus {
  constructor(
    public value: ConnectionValue,
    public lastSeenAt: string,
  ) {}
  isConnected(): boolean {
    return this.value === ConnectionValue.CONNECTED;
  }
}
