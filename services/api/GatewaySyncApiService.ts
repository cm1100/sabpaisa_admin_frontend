import { BaseApiService } from './base/BaseApiService';
import { ApiResponse, PaginatedResponse } from './base/types';

export interface SyncQueueItem {
  sync_id: number;
  txn_id: string;
  pg_txn_id?: string;
  sync_type: string;
  priority: number;
  status: string;
  attempts: number;
  max_attempts: number;
  next_retry_at?: string;
  request_data?: any;
  response_data?: any;
  error_message?: string;
  created_at: string;
  updated_at: string;
  processed_at?: string;
}

export interface GatewayConfiguration {
  gateway_id: number;
  gateway_name: string;
  gateway_code: string;
  api_endpoint: string;
  status_check_endpoint: string;
  refund_endpoint?: string;
  api_key: string;
  api_secret: string;
  webhook_secret?: string;
  timeout_seconds: number;
  max_retry_attempts: number;
  retry_delay_seconds: number;
  is_active: boolean;
  supports_webhook: boolean;
  webhook_url?: string;
  created_at: string;
  updated_at: string;
}

export interface SyncLog {
  log_id: number;
  sync_queue_id: number;
  operation: string;
  request_url: string;
  request_method: string;
  request_headers: any;
  request_body?: any;
  response_status?: number;
  response_headers?: any;
  response_body?: any;
  response_time_ms?: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

export interface WebhookLog {
  log_id: number;
  gateway_code: string;
  webhook_type: string;
  txn_id?: string;
  pg_txn_id?: string;
  request_headers: any;
  request_body: any;
  response_status: number;
  response_body?: any;
  signature_valid: boolean;
  processed: boolean;
  processing_time_ms?: number;
  ip_address: string;
  created_at: string;
}

export interface SyncDashboard {
  queue_stats: {
    total: number;
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  };
  avg_sync_time_ms: number;
  recent_webhooks: number;
  gateway_status: GatewayStatus[];
  meets_sla: boolean;
}

export interface GatewayStatus {
  name: string;
  code: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  success_rate: number;
  recent_calls: number;
}

export interface SyncTransactionRequest {
  txn_id: string;
  sync_type?: 'STATUS_CHECK' | 'REFUND_STATUS' | 'SETTLEMENT_STATUS';
}

export interface TestGatewayRequest {
  gateway_code: string;
}

class GatewaySyncApiService extends BaseApiService {
  public readonly serviceName = 'GatewaySyncService';
  protected readonly endpoint = '/gateway-sync';

  // Dashboard
  async getDashboard(): Promise<ApiResponse<SyncDashboard>> {
    const data = await this.get<SyncDashboard>('/sync/dashboard/');
    return { data };
  }

  // Queue Management
  async getQueue(params?: {
    status?: string;
    sync_type?: string;
    priority?: number;
    search?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<SyncQueueItem>>> {
    const resp = await this.get<any>('/queue/', { params });
    const pag = this.normalizePaginated<SyncQueueItem>(resp);
    return { data: pag as any };
  }

  async retrySync(syncId: number): Promise<ApiResponse<any>> {
    const data = await this.post(`/queue/${syncId}/retry/`);
    return { data };
  }

  async getQueueStats(): Promise<ApiResponse<any>> {
    const data = await this.get('/sync/queue/stats/');
    return { data };
  }

  // Sync Operations
  async syncTransactionStatus(txnId: string): Promise<ApiResponse<any>> {
    const data = await this.post(`/sync/status/${txnId}/`);
    return { data };
  }

  async syncRefundStatus(txnId: string): Promise<ApiResponse<any>> {
    const data = await this.post(`/sync/refund/${txnId}/`);
    return { data };
  }

  async syncSettlementStatus(txnId: string): Promise<ApiResponse<any>> {
    const data = await this.post(`/sync/settlement/${txnId}/`);
    return { data };
  }

  // Gateway Configurations
  async getGatewayConfigurations(params?: {
    is_active?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<GatewayConfiguration>>> {
    const data = await this.get<PaginatedResponse<GatewayConfiguration>>('/configurations/', { params });
    return { data };
  }

  async createGatewayConfiguration(data: Partial<GatewayConfiguration>): Promise<ApiResponse<GatewayConfiguration>> {
    const created = await this.post<GatewayConfiguration>('/configurations/', data);
    return { data: created };
  }

  async updateGatewayConfiguration(id: number, data: Partial<GatewayConfiguration>): Promise<ApiResponse<GatewayConfiguration>> {
    const updated = await this.put<GatewayConfiguration>(`/configurations/${id}/`, data);
    return { data: updated };
  }

  async deleteGatewayConfiguration(id: number): Promise<ApiResponse<any>> {
    const data = await this.delete(`/configurations/${id}/`);
    return { data };
  }

  // Note: prefer testConnection(gatewayId) via /configurations/{id}/test_connection/

  async testConnection(gatewayId: number): Promise<ApiResponse<any>> {
    const data = await this.post(`/configurations/${gatewayId}/test_connection/`);
    return { data };
  }

  // Sync Logs
  async getSyncLogs(params?: {
    sync_queue_id?: number;
    operation?: string;
    success?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<SyncLog>>> {
    const resp = await this.get<any>('/logs/', { params });
    const pag = this.normalizePaginated<SyncLog>(resp);
    return { data: pag as any };
  }

  // Webhook Logs
  async getWebhookLogs(params?: {
    gateway_code?: string;
    webhook_type?: string;
    processed?: boolean;
    signature_valid?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<WebhookLog>>> {
    const resp = await this.get<any>('/webhook-logs/', { params });
    const pag = this.normalizePaginated<WebhookLog>(resp);
    return { data: pag as any };
  }

  // Health Check
  async getWebhookHealth(): Promise<ApiResponse<any>> {
    const data = await this.get('/webhooks/health/');
    return { data };
  }

  // Bulk Operations
  async bulkRetryFailed(): Promise<ApiResponse<any>> {
    const data = await this.post('/queue/bulk-retry-failed/');
    return { data };
  }

  async clearCompleted(): Promise<ApiResponse<any>> {
    const data = await this.post('/queue/clear-completed/');
    return { data };
  }
}

export default new GatewaySyncApiService();
