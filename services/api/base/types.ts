/**
 * Common types for API services
 */

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status?: number;
  success?: boolean;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  details?: any;
}

export interface QueryParams {
  page?: number;
  page_size?: number;
  search?: string;
  ordering?: string;
  [key: string]: any;
}
