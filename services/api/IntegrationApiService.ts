import { BaseApiService } from './base/BaseApiService';

export interface AdminOutApiLog {
  id: number;
  url: string;
  method: string;
  payload?: string;
  headers?: string;
  response_status?: number;
  response_time_ms?: number;
  called_at?: string;
  error_message?: string;
  reference_id?: string;
  triggered_by?: string;
}

export interface ApiUserKey {
  id: number;
  api_user: string;
  created_at: string;
  updated_at: string;
}

class IntegrationApiService extends BaseApiService {
  public readonly serviceName = 'IntegrationService';
  protected readonly endpoint = '/integration';

  async getApiLogs(): Promise<AdminOutApiLog[]> {
    const resp = await this.get<any>('/api-logs/');
    return this.normalizeResults<AdminOutApiLog>(resp);
  }

  async getApiKeys(): Promise<ApiUserKey[]> {
    const resp = await this.get<any>('/api-keys/');
    return this.normalizeResults<ApiUserKey>(resp);
  }
}

export default new IntegrationApiService();
