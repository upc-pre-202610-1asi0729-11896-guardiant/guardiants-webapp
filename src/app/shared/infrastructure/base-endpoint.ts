import { HttpClient } from '@angular/common/http';
import { Observable, firstValueFrom } from 'rxjs';

/**
 * A single REST endpoint bound to a concrete URL. Wraps Angular's HttpClient
 * and exposes promise-based CRUD operations plus an observable stream.
 */
export class BaseEndpoint {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly url: string,
  ) {}

  getAll(): Promise<object> {
    return firstValueFrom(this.httpClient.get<object>(this.url));
  }

  getById(id: string): Promise<object> {
    return firstValueFrom(this.httpClient.get<object>(`${this.url}/${id}`));
  }

  getPaginated(page: number, pageSize: number, filters: object | null = null): Promise<object> {
    const params = { page, pageSize, ...(filters ?? {}) } as Record<string, unknown>;
    const query = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
      .join('&');
    return firstValueFrom(this.httpClient.get<object>(`${this.url}?${query}`));
  }

  create(resource: object): Promise<object> {
    return firstValueFrom(this.httpClient.post<object>(this.url, resource));
  }

  update(id: string, patch: object): Promise<object> {
    return firstValueFrom(this.httpClient.patch<object>(`${this.url}/${id}`, patch));
  }

  delete(id: string): Promise<object> {
    return firstValueFrom(this.httpClient.delete<object>(`${this.url}/${id}`));
  }

  subscribe(): Observable<object> {
    return this.httpClient.get<object>(this.url);
  }

  /** Raw GET against an arbitrary sub-path of this endpoint. */
  getPath(path: string): Promise<object> {
    return firstValueFrom(this.httpClient.get<object>(`${this.url}${path}`));
  }

  /** Raw POST against an arbitrary sub-path of this endpoint. */
  postPath(path: string, body: object): Promise<object> {
    return firstValueFrom(this.httpClient.post<object>(`${this.url}${path}`, body));
  }
}
