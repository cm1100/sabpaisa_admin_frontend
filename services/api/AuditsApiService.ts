import { BaseApiService } from './base/BaseApiService';

export interface ApiKeyHistoryItem {
  id: number;
  api_user: string;
  action: string;
  old_key_hash?: string;
  new_key_hash?: string;
  changed_by?: number | string | null;
  meta?: Record<string, any>;
  created_at: string;
}

export interface NotificationLogItem {
  id: number;
  channel: string;
  recipient: string;
  template?: string;
  payload: Record<string, any>;
  status: string;
  response_code?: string;
  error_message?: string;
  created_at: string;
}

export interface TransactionMetadataItem {
  id: number;
  txn_id: string;
  key: string;
  value: Record<string, any>;
  created_by?: number | string | null;
  created_at: string;
}

class AuditsApiService extends BaseApiService {
  public readonly serviceName = 'AuditsApiService';
  protected readonly endpoint = '/audits';

  async listApiKeyHistory(params?: Record<string, any>): Promise<ApiKeyHistoryItem[]> {
    const resp = await this.get<any>('/api-key-history/', { params });
    return this.normalizeResults<ApiKeyHistoryItem>(resp);
  }

  async listNotificationLogs(params?: Record<string, any>): Promise<NotificationLogItem[]> {
    const resp = await this.get<any>('/notification-logs/', { params });
    return this.normalizeResults<NotificationLogItem>(resp);
  }

  async listTransactionMetadata(params?: Record<string, any>): Promise<TransactionMetadataItem[]> {
    const resp = await this.get<any>('/transaction-metadata/', { params });
    return this.normalizeResults<TransactionMetadataItem>(resp);
  }
}

export default new AuditsApiService();

