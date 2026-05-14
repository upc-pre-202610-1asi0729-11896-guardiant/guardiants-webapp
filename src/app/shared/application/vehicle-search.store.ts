import { Injectable, computed, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class VehicleSearchStore {
  private readonly _query = signal('');

  readonly query = computed(() => this._query());

  setQuery(value: string): void {
    this._query.set(value.trim().toLowerCase());
  }

  clear(): void {
    this._query.set('');
  }
}
