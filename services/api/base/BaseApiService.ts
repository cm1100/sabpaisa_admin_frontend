/**
 * Enhanced Base API Service implementing common HTTP operations
 * Following Open/Closed Principle - open for extension, closed for modification
 * Integrated with centralized API configuration
 */
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { IService } from '@/interfaces/base/IService';
import { getApiConfig, getEndpoint, buildUrl, ApiEndpoint } from '@/config/apiConfig';

/**
 * API Error class for consistent error handling
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public data?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Base API Service abstract class
 * All API services should extend this class
 */
export abstract class BaseApiService implements IService {
  protected axiosInstance: AxiosInstance;
  protected abstract readonly endpoint: string;
  public abstract readonly serviceName: string;
  protected readonly config = getApiConfig();

  constructor(baseURL?: string) {
    const finalBaseURL = baseURL || this.config.baseURL;
    
    this.axiosInstance = axios.create({
      baseURL: finalBaseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
      },
    });

    this.setupInterceptors();
  }

  /**
   * Normalize and join endpoint + path into a relative URL that preserves baseURL path (e.g. /api)
   */
  private joinPath(endpoint: string, path?: string): string {
    const lhs = (endpoint || '').replace(/^\/+|\/+$/g, '');
    const rhs = (path || '').replace(/^\/+/, '');
    const joined = [lhs, rhs].filter(Boolean).join('/');
    return joined; // no leading slash so axios keeps baseURL path segment
  }

  /**
   * Setup request and response interceptors
   */
  protected setupInterceptors(): void {
    // Request interceptor
    this.axiosInstance.interceptors.request.use(
      (config) => {
        // Add auth token if available
        const token = this.getAuthToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (error.response?.status === 401) {
          // Handle token refresh or redirect to login
          await this.handleUnauthorized();
        }
        return Promise.reject(this.transformError(error));
      }
    );
  }

  /**
   * Get auth token from storage
   */
  protected getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  /**
   * Handle unauthorized response
   */
  protected async handleUnauthorized(): Promise<void> {
    // Implementation can be overridden in derived classes
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
  }

  /**
   * Transform axios error to ApiError
   */
  protected transformError(error: any): ApiError {
    // Axios error with response
    if (error && error.response) {
      const status = error.response.status;
      const data = error.response.data;
      let message: string | undefined;

      // String bodies
      if (typeof data === 'string') {
        message = data;
      }

      // Nested error object { error: { message, details, type, ... } }
      if (!message && data && typeof data === 'object' && (data as any).error) {
        const err = (data as any).error;
        if (typeof err === 'string') {
          message = err;
        } else if (err && typeof err === 'object') {
          let m: any = err.details ?? err.message ?? err.type ?? err.error;
          // If details is an object, flatten to human-readable lines
          if (m && typeof m === 'object') {
            try {
              const lines: string[] = [];
              for (const [field, val] of Object.entries(m)) {
                if (Array.isArray(val)) lines.push(`${field}: ${val.join(', ')}`);
                else if (val && typeof val === 'object') lines.push(`${field}: ${JSON.stringify(val)}`);
                else if (val != null) lines.push(`${field}: ${String(val)}`);
              }
              m = lines.join('\n');
            } catch {
              m = JSON.stringify(m);
            }
          }
          if (Array.isArray(m)) m = m.join(', ');
          message = typeof m === 'string' ? m : JSON.stringify(err);
        }
      }

      // Flat keys { message } or { detail }
      if (!message && data && typeof data === 'object') {
        const maybe = (data as any).message || (data as any).detail;
        if (maybe) message = maybe;
      }

      // Fallback to axios error message
      if (!message) message = error.message || 'Request failed';

      return new ApiError(status, message, data);
    }
    // Network or unexpected error
    return new ApiError(500, (error && error.message) || 'Network error occurred');
  }

  /**
   * Generic GET request
   */
  protected async get<T>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const url = this.joinPath(this.endpoint, path);
    const response = await this.axiosInstance.get<T>(url, config);
    return response.data;
  }

  /**
   * Generic POST request
   */
  protected async post<T>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const url = this.joinPath(this.endpoint, path);
    const response = await this.axiosInstance.post<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PUT request
   */
  protected async put<T>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const url = this.joinPath(this.endpoint, path);
    const response = await this.axiosInstance.put<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic PATCH request
   */
  protected async patch<T>(
    path: string,
    data?: any,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const url = this.joinPath(this.endpoint, path);
    const response = await this.axiosInstance.patch<T>(url, data, config);
    return response.data;
  }

  /**
   * Generic DELETE request
   */
  protected async delete<T>(
    path: string,
    config?: AxiosRequestConfig
  ): Promise<T> {
    const url = this.joinPath(this.endpoint, path);
    const response = await this.axiosInstance.delete<T>(url, config);
    return response.data;
  }

  /**
   * Build query string from params object
   */
  protected buildQueryString(params: Record<string, any>): string {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          value.forEach(v => searchParams.append(key, String(v)));
        } else {
          searchParams.append(key, String(value));
        }
      }
    });
    return searchParams.toString();
  }

  /**
   * Normalize list responses to a plain array.
   * Accepts shapes: Array<T> | { results: T[] } | { data: T[] }
   */
  protected normalizeResults<T = any>(resp: any): T[] {
    if (!resp) return [];
    if (Array.isArray(resp)) return resp as T[];
    if (Array.isArray(resp.results)) return resp.results as T[];
    if (Array.isArray(resp.data)) return resp.data as T[];
    return [];
  }

  /**
   * Normalize paginated responses to a canonical shape.
   * Accepts shapes commonly returned by DRF or custom adapters.
   */
  protected normalizePaginated<T = any>(resp: any): {
    results: T[];
    count?: number;
    next?: any;
    previous?: any;
  } {
    if (!resp) return { results: [] };
    if (Array.isArray(resp)) return { results: resp as T[] };
    if (resp.results) return { results: resp.results as T[], count: resp.count, next: resp.next, previous: resp.previous };
    if (resp.data && Array.isArray(resp.data)) return { results: resp.data as T[] };
    return { results: [] };
  }

  /**
   * Get endpoint configuration with parameters
   */
  protected getEndpointConfig(endpointKey: string, params: Record<string, string> = {}): string {
    const endpointConfig = getEndpoint(endpointKey);
    if (!endpointConfig) {
      throw new ApiError(500, `Endpoint configuration not found: ${endpointKey}`);
    }
    return buildUrl(endpointConfig.url, params);
  }

  /**
   * Make request with endpoint configuration
   */
  protected async requestWithConfig<T>(
    endpointKey: string,
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' = 'GET',
    data?: any,
    params: Record<string, string> = {},
    config?: AxiosRequestConfig
  ): Promise<T> {
    const endpointConfig = getEndpoint(endpointKey);
    if (!endpointConfig) {
      throw new ApiError(500, `Endpoint configuration not found: ${endpointKey}`);
    }

    const url = buildUrl(endpointConfig.url, params);
    const requestConfig: AxiosRequestConfig = {
      timeout: endpointConfig.timeout || this.config.timeout,
      ...config,
    };

    let response: AxiosResponse<T>;
    
    switch (method) {
      case 'GET':
        response = await this.axiosInstance.get<T>(url, requestConfig);
        break;
      case 'POST':
        response = await this.axiosInstance.post<T>(url, data, requestConfig);
        break;
      case 'PUT':
        response = await this.axiosInstance.put<T>(url, data, requestConfig);
        break;
      case 'PATCH':
        response = await this.axiosInstance.patch<T>(url, data, requestConfig);
        break;
      case 'DELETE':
        response = await this.axiosInstance.delete<T>(url, requestConfig);
        break;
    }

    return response.data;
  }

  /**
   * Upload file with progress tracking
   */
  protected async uploadFile<T>(
    endpointKey: string,
    file: File,
    additionalData?: Record<string, any>,
    onProgress?: (progress: number) => void
  ): Promise<T> {
    const formData = new FormData();
    formData.append('file', file);
    
    if (additionalData) {
      Object.entries(additionalData).forEach(([key, value]) => {
        formData.append(key, String(value));
      });
    }

    const endpointConfig = getEndpoint(endpointKey);
    if (!endpointConfig) {
      throw new ApiError(500, `Endpoint configuration not found: ${endpointKey}`);
    }

    const response = await this.axiosInstance.post<T>(endpointConfig.url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      timeout: endpointConfig.timeout || this.config.timeout,
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    return response.data;
  }

  /**
   * Download file with progress tracking
   */
  protected async downloadFile(
    endpointKey: string,
    params: Record<string, string> = {},
    filename?: string,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    const url = this.getEndpointConfig(endpointKey, params);
    
    const response = await this.axiosInstance.get(url, {
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });

    // Create download link
    const blob = new Blob([response.data]);
    const downloadUrl = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = filename || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(downloadUrl);
  }

  /**
   * Paginated request helper
   */
  protected async getPaginated<T>(
    path: string,
    page: number = 1,
    pageSize: number = this.config.performance.paginationSize,
    filters?: Record<string, any>
  ): Promise<{
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
    hasPrev: boolean;
  }> {
    const params = {
      page: page.toString(),
      pageSize: pageSize.toString(),
      ...filters,
    };

    const queryString = this.buildQueryString(params);
    const url = `${this.endpoint}${path}${queryString ? `?${queryString}` : ''}`;

    return this.get(url);
  }

  /**
   * Initialize service (can be overridden)
   */
  public async initialize(): Promise<void> {
    // Override in derived classes if needed
  }

  /**
   * Dispose service (can be overridden)
   */
  public async dispose(): Promise<void> {
    // Override in derived classes if needed
  }
}
