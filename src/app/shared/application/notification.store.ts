import { Injectable, signal } from '@angular/core';

export enum ToastType {
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
  INFO = 'INFO',
}

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
  createdAt: string;
}

/** Holds transient toast notifications shown by the ToastContainer. */
@Injectable({ providedIn: 'root' })
export class useNotificationStore {
  private readonly _toasts = signal<ToastMessage[]>([]);
  readonly toasts = this._toasts.asReadonly();

  showSuccess(message: string): void {
    this.push(ToastType.SUCCESS, message);
  }

  showError(message: string): void {
    this.push(ToastType.ERROR, message);
  }

  showInfo(message: string): void {
    this.push(ToastType.INFO, message);
  }

  dismiss(toastId: string): void {
    this._toasts.update((list) => list.filter((t) => t.id !== toastId));
  }

  private push(type: ToastType, message: string): void {
    const toast: ToastMessage = {
      id: crypto.randomUUID(),
      type,
      message,
      createdAt: new Date().toISOString(),
    };
    this._toasts.update((list) => [...list, toast]);
  }
}
