import { signal } from '@angular/core';
import { ApiError } from '../domain/model/value-objects';

/**
 * Generic signal-based store every bounded-context store extends.
 * Provides the items/loading/errors trio and common helpers.
 */
export abstract class BaseStore<TEntity> {
  protected readonly _items = signal<TEntity[]>([]);
  protected readonly _loading = signal(false);
  protected readonly _errors = signal<ApiError[]>([]);

  readonly items = this._items.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly errors = this._errors.asReadonly();

  clearErrors(): void {
    this._errors.set([]);
  }

  setLoading(value: boolean): void {
    this._loading.set(value);
  }

  protected pushError(error: unknown): void {
    const apiError =
      error instanceof ApiError
        ? error
        : new ApiError('UNKNOWN', (error as Error)?.message ?? 'Unexpected error', 0);
    this._errors.update((list) => [...list, apiError]);
  }
}
