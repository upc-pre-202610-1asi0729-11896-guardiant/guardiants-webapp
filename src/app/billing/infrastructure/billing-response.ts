export interface PlanResource {
  id: string;
  key: string;
  name: string;
  priceUsd: number;
  billingIntervalMonths: number;
  maxVehicles: number;
  features: string[];
}
export interface PlanListResponse {
  status: string;
  plans: PlanResource[];
}
export interface SubscriptionResource {
  id: string;
  ownerId: string;
  planId: string;
  status: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  stripeSubscriptionId: string | null;
  stripeCustomerId: string | null;
  cancelAtPeriodEnd: boolean;
  createdAt: string;
  updatedAt: string;
}
export interface SubscriptionResponse {
  status: string;
  subscription: SubscriptionResource | null;
}
export interface PaymentResource {
  id: string;
  subscriptionId: string;
  stripePaymentIntentId: string;
  amountUsd: number;
  currency: string;
  status: string;
  failureReason: string | null;
  processedAt: string;
}
export interface PaymentResponse {
  status: string;
  payment: PaymentResource;
}
export interface PaymentListResponse {
  status: string;
  payments: PaymentResource[];
}
export interface PaymentFailureNotificationResource {
  id: string;
  subscriptionId: string;
  paymentId: string;
  ownerId: string;
  sentAt: string;
  acknowledged: boolean;
}
export interface PaymentFailureNotificationResponse {
  status: string;
  notification: PaymentFailureNotificationResource;
}
export interface DeviceConnectionStatusResource {
  value: string;
  lastSeenAt: string;
}
