/** Resource/response contracts shared by all bounded contexts. */

export interface BaseResource {
  id: string;
}

export interface PaginatedResponse<T> {
  status: string;
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface ApiErrorResource {
  code: string;
  message: string;
  statusCode: number;
  fieldErrors: Record<string, string> | null;
}

export interface ErrorResponse {
  status: string;
  error: ApiErrorResource;
}

/** Contract every assembler implements. */
export interface BaseAssembler<TResource, TEntity> {
  toEntityFromResource(resource: TResource): TEntity | null;
  toEntitiesFromResponse(response: unknown): TEntity[];
}
