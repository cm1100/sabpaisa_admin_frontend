/**
 * API Client Configuration
 * Following Axios best practices with interceptors
 * Implements authentication, error handling, and request/response transformation
 */

import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosResponse } from 'axios';

// Extract a human-friendly error message from common backend shapes
const formatDetailsObject = (obj: any): string => {
  try {
    if (!obj || typeof obj !== 'object') return '';
    const lines: string[] = [];
    for (const [field, val] of Object.entries(obj)) {
      if (Array.isArray(val)) {
        lines.push(`${field}: ${val.join(', ')}`);
      } else if (val && typeof val === 'object') {
        lines.push(`${field}: ${formatDetailsObject(val)}`);
      } else if (val != null) {
        lines.push(`${field}: ${String(val)}`);
      }
    }
    return lines.join('\n');
  } catch {
    return JSON.stringify(obj);
  }
};

export const extractApiErrorMessage = (error: any): string => {
  const data = error?.response?.data;
  if (data) {
    if (typeof data === 'string') return data;
    if (typeof (data as any).error === 'string') return (data as any).error;
    if ((data as any).error && typeof (data as any).error === 'object') {
      const err = (data as any).error as any;
      let m: any = err.details ?? err.message ?? err.type ?? err.error;
      if (m && typeof m === 'object') {
        m = formatDetailsObject(m);
      }
      if (Array.isArray(m)) m = m.join(', ');
      return typeof m === 'string' ? m : JSON.stringify(err);
    }
    if ((data as any).message) return (data as any).message;
    if ((data as any).detail) return (data as any).detail;
    return JSON.stringify(data);
  }
  if (error?.message) return error.message;
  return 'An unexpected error occurred';
};

/**
 * API Response Interface
 */
interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

/**
 * API Error Interface
 */
interface ApiError {
  message: string;
  status?: number;
  errors?: Record<string, string[]>;
}

/**
 * Create and configure Axios instance
 */
const createApiClient = (): AxiosInstance => {
  // Get base URL from environment or use sensible runtime fallback
  const runtimeOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const baseURL = (
    process.env.NEXT_PUBLIC_API_URL ||
    (runtimeOrigin ? `${runtimeOrigin.replace(/\/$/, '')}/api` : 'http://localhost:8020/api')
  ).replace(/\/$/, '');
  
  const client = axios.create({
    baseURL,
    timeout: 30000, // 30 seconds
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
  });

  // Request interceptor for authentication
  client.interceptors.request.use(
    (config: any) => {
      // Get token from localStorage or cookie
      const token = localStorage.getItem('access_token');
      
      if (token && config.headers) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      
      // Add CSRF token if needed
      const csrfToken = getCsrfToken();
      if (csrfToken && config.headers) {
        config.headers['X-CSRFToken'] = csrfToken;
      }
      
      return config;
    },
    (error: AxiosError) => {
      console.error('Request interceptor error:', error);
      return Promise.reject(error);
    }
  );

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response: AxiosResponse) => {
      // Transform response if needed
      return response;
    },
    async (error: AxiosError<ApiError>) => {
      // Handle different error scenarios
      if (error.response) {
        const { status, data } = error.response;
        
        switch (status) {
          case 401:
            // Unauthorized - try to refresh token
            const refreshed = await handleTokenRefresh();
            if (refreshed && error.config) {
              // Retry original request (ensure Authorization updated)
              const cfg: any = { ...error.config };
              const newAccess = (typeof window !== 'undefined') ? localStorage.getItem('access_token') : null;
              if (newAccess) {
                cfg.headers = cfg.headers || {};
                (cfg.headers as any)['Authorization'] = `Bearer ${newAccess}`;
              }
              return client(cfg);
            } else {
              // In E2E mode, avoid redirecting to login on 401 to keep UI stable
              const e2eNoLogout = (typeof window !== 'undefined') && (
                localStorage.getItem('E2E_NO_LOGOUT') === '1' ||
                localStorage.getItem('E2E_MODE') === '1'
              );
              if (!e2eNoLogout) {
                handleLogout();
              }
            }
            break;
            
          case 403:
            // Forbidden
            console.error('Access forbidden:', data?.message);
            break;
            
          case 404:
            // Not found - silently handle as services have fallback
            // console.error('Resource not found:', data?.message);
            break;
            
          case 422:
            // Validation error
            console.error('Validation error:', data?.errors);
            break;
            
          case 500:
            // Server error
            console.error('Server error:', data?.message);
            break;
            
          default:
            console.error('API error:', data?.message);
        }
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.message);
      } else {
        // Other errors
        console.error('Error:', error.message);
      }
      
      // Attach normalized message for consumers that don't centralize handling
      (error as any).__normalizedMessage = extractApiErrorMessage(error);
      return Promise.reject(error);
    }
  );

  return client;
};

/**
 * Get CSRF token from cookie
 */
const getCsrfToken = (): string | null => {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === 'csrftoken') {
      return decodeURIComponent(value);
    }
  }
  return null;
};

/**
 * Handle token refresh
 */
const handleTokenRefresh = async (): Promise<boolean> => {
  try {
    const refreshToken = localStorage.getItem('refresh_token');
    if (!refreshToken) return false;

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const apiBase = (
      process.env.NEXT_PUBLIC_API_URL ||
      (origin ? `${origin.replace(/\/$/, '')}/api` : 'http://localhost:8020/api')
    ).replace(/\/$/, '');

    // Our backend expects the payload key 'refresh_token' or 'refresh' depending on implementation.
    // Try with both keys for compatibility.
    let response: any;
    try {
      response = await axios.post(`${apiBase}/auth/refresh/`, { refresh_token: refreshToken });
    } catch {
      response = await axios.post(`${apiBase}/auth/refresh/`, { refresh: refreshToken });
    }
    
    const data: any = response.data || {};
    const newAccess = data.access || data.access_token;
    const newRefresh = data.refresh || data.refresh_token;
    if (newAccess) {
      localStorage.setItem('access_token', newAccess);
      if (newRefresh) {
        localStorage.setItem('refresh_token', newRefresh);
      }
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Token refresh failed:', error);
    return false;
  }
};

/**
 * Handle logout
 */
const handleLogout = (): void => {
  // Clear tokens
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
  
  // Redirect to login
  if (typeof window !== 'undefined') {
    window.location.href = '/login';
  }
};

// Create singleton instance
export const apiClient = createApiClient();

// Export helper functions
export const setAuthToken = (token: string): void => {
  localStorage.setItem('access_token', token);
};

export const setRefreshToken = (token: string): void => {
  localStorage.setItem('refresh_token', token);
};

export const clearTokens = (): void => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('refresh_token');
};

export const isAuthenticated = (): boolean => {
  return !!localStorage.getItem('access_token');
};

// Export types
export type { ApiResponse, ApiError };
