import { BaseEntity } from './base.entity';

/** Generic paginated collection of items. */
export class PaginatedResult<T> {
  constructor(
    public items: T[],
    public page: number,
    public pageSize: number,
    public totalItems: number,
    public totalPages: number,
  ) {}

  hasNextPage(): boolean {
    return this.page < this.totalPages;
  }

  hasPreviousPage(): boolean {
    return this.page > 1;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }
}

/** An inclusive date range expressed as ISO date strings. */
export class DateRange {
  constructor(
    public startDate: string,
    public endDate: string,
  ) {}

  isValid(): boolean {
    return new Date(this.startDate).getTime() <= new Date(this.endDate).getTime();
  }

  spansDays(): number {
    const ms = new Date(this.endDate).getTime() - new Date(this.startDate).getTime();
    return Math.max(0, Math.round(ms / 86_400_000));
  }

  contains(date: string): boolean {
    const t = new Date(date).getTime();
    return t >= new Date(this.startDate).getTime() && t <= new Date(this.endDate).getTime();
  }
}

/** A geographic point. */
export class GeoPoint {
  constructor(
    public lat: number,
    public lng: number,
  ) {}

  /** Haversine distance in meters. */
  distanceTo(other: GeoPoint): number {
    const R = 6_371_000;
    const dLat = ((other.lat - this.lat) * Math.PI) / 180;
    const dLng = ((other.lng - this.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((this.lat * Math.PI) / 180) *
        Math.cos((other.lat * Math.PI) / 180) *
        Math.sin(dLng / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }
}

/** Normalized representation of an API error. */
export class ApiError {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number,
    public fieldErrors: Record<string, string> | null = null,
  ) {}

  isValidationError(): boolean {
    return this.statusCode === 400 || this.statusCode === 422;
  }

  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  isNotFoundError(): boolean {
    return this.statusCode === 404;
  }

  isServerError(): boolean {
    return this.statusCode >= 500;
  }
}

export enum RequestStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR',
}

// PaginatedResult is intended to carry BaseEntity-derived items.
export type EntityPage = PaginatedResult<BaseEntity>;
