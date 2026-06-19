import { Injectable, computed, signal } from '@angular/core';

/** Tracks the number of in-flight HTTP requests for the global spinner. */
@Injectable({ providedIn: 'root' })
export class useLoadingStore {
  private readonly _activeRequestCount = signal(0);

  readonly activeRequestCount = this._activeRequestCount.asReadonly();
  readonly isLoading = computed(() => this._activeRequestCount() > 0);

  increment(): void {
    this._activeRequestCount.update((c) => c + 1);
  }

  decrement(): void {
    this._activeRequestCount.update((c) => Math.max(0, c - 1));
  }
}
