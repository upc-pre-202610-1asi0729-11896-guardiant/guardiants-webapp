import { HttpClient } from '@angular/common/http';
import { BaseEndpoint } from './base-endpoint';

/**
 * Base class for every bounded-context API. Subclasses build one
 * BaseEndpoint per backend resource they expose.
 */
export abstract class BaseApi {
  protected constructor(
    protected readonly httpClient: HttpClient,
    protected readonly baseUrl: string,
  ) {}

  protected buildEndpoint(path: string): BaseEndpoint {
    return new BaseEndpoint(this.httpClient, `${this.baseUrl}/${path}`);
  }
}
