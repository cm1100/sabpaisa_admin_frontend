import { BaseApiService } from './base/BaseApiService';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
    first_name: string;
    last_name: string;
  };
}

export interface RefreshTokenRequest {
  refresh: string;
}

export interface RefreshTokenResponse {
  access: string;
}

export class AuthenticationApiService extends BaseApiService {
  public readonly serviceName = 'AuthenticationService';
  protected readonly endpoint = '/auth';

  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return this.requestWithConfig<LoginResponse>(
      'login',
      'POST',
      credentials
    );
  }

  async refreshToken(request: RefreshTokenRequest): Promise<RefreshTokenResponse> {
    return this.requestWithConfig<RefreshTokenResponse>(
      'refreshToken',
      'POST',
      request
    );
  }

  async logout(): Promise<void> {
    try {
      await this.requestWithConfig<void>('logout', 'POST');
    } finally {
      this.clearAuthTokens();
    }
  }

  async getCurrentUser(): Promise<LoginResponse['user']> {
    return this.requestWithConfig<LoginResponse['user']>('userProfile', 'GET');
  }

  // Compatibility alias used by components
  async getProfile(): Promise<LoginResponse['user']> {
    return this.getCurrentUser();
  }

  // Accepts both standardized LoginResponse and common backend/mock variants
  storeAuthTokens(response: LoginResponse | any): void {
    if (typeof window === 'undefined') return;
    const access = response?.access_token ?? response?.access ?? response?.token ?? '';
    const refresh = response?.refresh_token ?? response?.refresh ?? '';
    const user = response?.user ?? response?.profile ?? response?.userInfo ?? null;

    if (access) localStorage.setItem('access_token', access);
    if (refresh) localStorage.setItem('refresh_token', refresh);
    if (user) localStorage.setItem('user', JSON.stringify(user));
  }

  getStoredTokens(): { access: string | null; refresh: string | null } {
    if (typeof window !== 'undefined') {
      return {
        access: localStorage.getItem('access_token'),
        refresh: localStorage.getItem('refresh_token')
      };
    }
    return { access: null, refresh: null };
  }

  getStoredUser(): LoginResponse['user'] | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  }

  clearAuthTokens(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('remember_me');
      // Clear any other auth-related data
      sessionStorage.clear();
    }
  }
}

export const authenticationService = new AuthenticationApiService();
