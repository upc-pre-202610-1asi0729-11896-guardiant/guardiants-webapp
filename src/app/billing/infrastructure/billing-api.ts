import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BaseApi } from '../../shared/infrastructure/base-api';
import { BaseEndpoint } from '../../shared/infrastructure/base-endpoint';
import { environment } from '../../../environments/environment';
import {
  DeviceConnectionStatusResource,
  PaymentFailureNotificationResponse,
  PaymentListResponse,
  PaymentResponse,
  PlanListResponse,
  SubscriptionResponse,
} from './billing-response';

@Injectable({ providedIn: 'root' })
export class BillingApi extends BaseApi {
  private readonly plans: BaseEndpoint;
  private readonly subscriptions: BaseEndpoint;
  private readonly payments: BaseEndpoint;

  constructor(http: HttpClient) {
    super(http, environment.apiBaseUrl);
    this.plans = this.buildEndpoint('plans');
    this.subscriptions = this.buildEndpoint('subscriptions');
    this.payments = this.buildEndpoint('payments');
  }

  getPlans(): Promise<PlanListResponse> {
    return this.plans.getAll() as Promise<PlanListResponse>;
  }
  getCurrentSubscription(ownerId: string): Promise<SubscriptionResponse> {
    return this.subscriptions.getPath(`?ownerId=${ownerId}&current=true`) as Promise<SubscriptionResponse>;
  }
  selectPlan(ownerId: string, planId: string): Promise<SubscriptionResponse> {
    return this.subscriptions.create({ ownerId, planId }) as Promise<SubscriptionResponse>;
  }
  createStripeCheckoutSession(subscriptionId: string): Promise<{ checkoutUrl: string }> {
    return this.subscriptions.postPath(`/${subscriptionId}/checkout`, {}) as Promise<{ checkoutUrl: string }>;
  }
  confirmPayment(subscriptionId: string, stripePaymentIntentId: string): Promise<PaymentResponse> {
    return this.payments.create({ subscriptionId, stripePaymentIntentId }) as Promise<PaymentResponse>;
  }
  getPaymentHistory(subscriptionId: string): Promise<PaymentListResponse> {
    return this.payments.getPath(`?subscriptionId=${subscriptionId}`) as Promise<PaymentListResponse>;
  }
  getPaymentFailureNotifications(ownerId: string): Promise<PaymentFailureNotificationResponse> {
    return this.subscriptions.getPath(`/failure-notifications?ownerId=${ownerId}`) as Promise<PaymentFailureNotificationResponse>;
  }
  acknowledgePaymentFailure(notificationId: string): Promise<PaymentFailureNotificationResponse> {
    return this.subscriptions.postPath(`/failure-notifications/${notificationId}/ack`, {}) as Promise<PaymentFailureNotificationResponse>;
  }
  renewSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    return this.subscriptions.postPath(`/${subscriptionId}/renew`, {}) as Promise<SubscriptionResponse>;
  }
  updatePlan(subscriptionId: string, newPlanId: string): Promise<SubscriptionResponse> {
    return this.subscriptions.update(subscriptionId, { planId: newPlanId }) as Promise<SubscriptionResponse>;
  }
  cancelSubscription(subscriptionId: string): Promise<SubscriptionResponse> {
    return this.subscriptions.postPath(`/${subscriptionId}/cancel`, {}) as Promise<SubscriptionResponse>;
  }
  getDeviceConnectionStatus(ownerId: string): Promise<DeviceConnectionStatusResource> {
    return this.subscriptions.getPath(`/device-connection?ownerId=${ownerId}`) as Promise<DeviceConnectionStatusResource>;
  }
}
