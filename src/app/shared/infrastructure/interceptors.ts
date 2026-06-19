import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, finalize, throwError } from 'rxjs';
import { ApiError } from '../domain/model/value-objects';
import { useLoadingStore } from '../application/loading.store';
import { useNotificationStore } from '../application/notification.store';

const SESSION_KEY = 'god-tracker.session';

/** Attaches the bearer token from the persisted session, when present. */
export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const raw = localStorage.getItem(SESSION_KEY);
  if (!raw) return next(request);
  try {
    const session = JSON.parse(raw) as { accessToken?: string };
    if (session.accessToken) {
      request = request.clone({
        setHeaders: { Authorization: `Bearer ${session.accessToken}` },
      });
    }
  } catch {
    /* ignore malformed session */
  }
  return next(request);
};

export function mapToApiError(httpError: HttpErrorResponse): ApiError {
  const body = httpError.error ?? {};
  return new ApiError(
    body.code ?? 'UNKNOWN',
    body.message ?? httpError.message ?? 'Unexpected error',
    httpError.status,
    body.fieldErrors ?? null,
  );
}

/** Normalizes HTTP failures into ApiError and surfaces a toast. */
export const errorInterceptor: HttpInterceptorFn = (request, next) => {
  const notifications = inject(useNotificationStore);
  return next(request).pipe(
    catchError((httpError: HttpErrorResponse) => {
      const apiError = mapToApiError(httpError);
      notifications.showError(apiError.message);
      return throwError(() => apiError);
    }),
  );
};

/** Tracks in-flight requests for the global loading indicator. */
export const loadingInterceptor: HttpInterceptorFn = (request, next) => {
  const loading = inject(useLoadingStore);
  loading.increment();
  return next(request).pipe(finalize(() => loading.decrement()));
};
