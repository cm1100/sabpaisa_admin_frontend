import { BaseApiService } from './base/BaseApiService';
import { ApiResponse, PaginatedResponse } from './base/types';

// Gateway Configuration Interface
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

// Gateway Sync Queue Interface
export interface GatewaySyncQueue {
  sync_id: number;
  txn_id: string;
  pg_txn_id?: string;
  sync_type: 'STATUS_CHECK' | 'REFUND_STATUS' | 'SETTLEMENT_STATUS';
  priority: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
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

// Gateway Sync Log Interface
export interface GatewaySyncLog {
  log_id: number;
  sync_queue_id: number;
  operation: string;
  request_url: string;
  request_method: string;
  request_headers: any;
  request_body?: any;
  response_status: number;
  response_body?: any;
  response_time_ms: number;
  success: boolean;
  error_message?: string;
  created_at: string;
}

// Gateway Webhook Log Interface
export interface GatewayWebhookLog {
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

// Request Interfaces
export interface CreateGatewayConfigurationRequest {
  gateway_name: string;
  gateway_code: string;
  api_endpoint: string;
  status_check_endpoint: string;
  refund_endpoint?: string;
  api_key: string;
  api_secret: string;
  webhook_secret?: string;
  timeout_seconds?: number;
  max_retry_attempts?: number;
  retry_delay_seconds?: number;
  is_active?: boolean;
  supports_webhook?: boolean;
  webhook_url?: string;
}

export interface UpdateGatewayConfigurationRequest extends Partial<CreateGatewayConfigurationRequest> {}

// Statistics Interfaces
export interface GatewayQueueStatistics {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
  avg_attempts: number;
  recent_total: number;
  recent_completed: number;
  recent_failed: number;
}

export interface GatewayPerformanceStatistics {
  total_requests: number;
  successful_requests: number;
  avg_response_time: number;
  max_response_time: number;
  success_rate_percent: number;
}

export interface GatewayConnectionTestResult {
  status: 'success' | 'failed';
  response_code?: number;
  response_time_ms?: number;
  message: string;
  error?: string;
}

class GatewayApiService extends BaseApiService {
  protected readonly endpoint = '/gateway-sync';
  public readonly serviceName = 'Gateway';

  constructor() {
    super();
  }

  // Gateway Configuration Management
  async getGatewayConfigurations(params?: {
    is_active?: boolean;
    supports_webhook?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<GatewayConfiguration>>> {
    const resp = await this.get<any>('/configurations/', { params });
    const pag = this.normalizePaginated<GatewayConfiguration>(resp);
    return { data: pag as any };
  }

  async getGatewayConfiguration(gatewayId: number): Promise<ApiResponse<GatewayConfiguration>> {
    const data = await this.get<GatewayConfiguration>(`/configurations/${gatewayId}/`);
    return { data };
  }

  async createGatewayConfiguration(data: CreateGatewayConfigurationRequest): Promise<ApiResponse<GatewayConfiguration>> {
    const created = await this.post<GatewayConfiguration>('/configurations/', data);
    return { data: created };
  }

  async updateGatewayConfiguration(gatewayId: number, data: UpdateGatewayConfigurationRequest): Promise<ApiResponse<GatewayConfiguration>> {
    const updated = await this.patch<GatewayConfiguration>(`/configurations/${gatewayId}/`, data);
    return { data: updated };
  }

  async deleteGatewayConfiguration(gatewayId: number): Promise<ApiResponse<void>> {
    const resp = await this.delete<void>(`/configurations/${gatewayId}/`);
    return { data: resp };
  }

  async testGatewayConnection(gatewayId: number): Promise<ApiResponse<GatewayConnectionTestResult>> {
    const data = await this.post<GatewayConnectionTestResult>(`/configurations/${gatewayId}/test_connection/`);
    return { data };
  }

  async toggleGateway(gatewayId: number, isActive: boolean): Promise<ApiResponse<GatewayConfiguration>> {
    const updated = await this.patch<GatewayConfiguration>(`/configurations/${gatewayId}/`, { is_active: isActive });
    return { data: updated };
  }

  // Sync Queue Management
  async getSyncQueue(params?: {
    status?: string;
    sync_type?: string;
    priority?: number;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<GatewaySyncQueue>>> {
    const data = await this.get<PaginatedResponse<GatewaySyncQueue>>('/sync-queue/', { params });
    return { data };
  }

  async getSyncQueueItem(syncId: number): Promise<ApiResponse<GatewaySyncQueue>> {
    const data = await this.get<GatewaySyncQueue>(`/sync-queue/${syncId}/`);
    return { data };
  }

  async retrySyncOperation(syncId: number): Promise<ApiResponse<{ message: string; sync_id: number; status: string }>> {
    const data = await this.post<{ message: string; sync_id: number; status: string }>(`/sync-queue/${syncId}/retry/`);
    return { data };
  }

  async getSyncQueueStatistics(): Promise<ApiResponse<GatewayQueueStatistics>> {
    const data = await this.get<GatewayQueueStatistics>('/sync-queue/stats/');
    return { data };
  }

  // Sync Logs
  async getSyncLogs(params?: {
    success?: boolean;
    operation?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<GatewaySyncLog>>> {
    const data = await this.get<PaginatedResponse<GatewaySyncLog>>('/sync-logs/', { params });
    return { data };
  }

  async getPerformanceStatistics(): Promise<ApiResponse<GatewayPerformanceStatistics>> {
    const data = await this.get<GatewayPerformanceStatistics>('/sync-logs/performance_stats/');
    return { data };
  }

  // Webhook Logs
  async getWebhookLogs(params?: {
    gateway_code?: string;
    webhook_type?: string;
    signature_valid?: boolean;
    processed?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<GatewayWebhookLog>>> {
    const data = await this.get<PaginatedResponse<GatewayWebhookLog>>('/webhook-logs/', { params });
    return { data };
  }

  async getWebhookStatistics(): Promise<ApiResponse<any>> {
    const data = await this.get('/webhook-logs/stats/');
    return { data };
  }

  // Utility Methods
  getGatewayProviders() {
    return [
      { code: 'RAZORPAY', name: 'Razorpay', color: 'var(--color-info)' },
      { code: 'PAYU', name: 'PayU', color: 'var(--color-success)' },
      { code: 'CASHFREE', name: 'Cashfree', color: 'var(--color-warning)' },
      { code: 'PHONEPE', name: 'PhonePe', color: 'var(--color-secondary)' },
      { code: 'PAYTM', name: 'Paytm', color: 'var(--color-primary)' },
      { code: 'BILLDESK', name: 'BillDesk', color: 'var(--color-error)' },
      { code: 'CCAVENUE', name: 'CCAvenue', color: 'var(--color-error)' },
      { code: 'ATOM', name: 'Atom', color: 'var(--color-success)' }
    ];
  }

  getSyncTypes() {
    return [
      { value: 'STATUS_CHECK', label: 'Status Check' },
      { value: 'REFUND_STATUS', label: 'Refund Status' },
      { value: 'SETTLEMENT_STATUS', label: 'Settlement Status' }
    ];
  }

  getPriorityLevels() {
    return [
      { value: 1, label: 'High', color: 'var(--color-error)' },
      { value: 2, label: 'Medium', color: 'var(--color-warning)' },
      { value: 3, label: 'Low', color: 'var(--color-info)' }
    ];
  }

  getStatusColors(status: string): string {
    const colors: Record<string, string> = {
      'PENDING': 'var(--color-warning)',
      'PROCESSING': 'var(--color-info)',
      'COMPLETED': 'var(--color-success)',
      'FAILED': 'var(--color-error)',
      'ACTIVE': 'var(--color-success)',
      'INACTIVE': 'var(--color-text-disabled)',
      'MAINTENANCE': 'var(--color-warning)'
    };
    return colors[status] || 'var(--color-text-disabled)';
  }

  formatResponseTime(ms: number): string {
    if (ms < 1000) {
      return `${ms}ms`;
    }
    return `${(ms / 1000).toFixed(2)}s`;
  }

  getHealthStatus(successRate: number): { status: string; color: string } {
    if (successRate >= 95) return { status: 'Healthy', color: '#52C41A' };
    if (successRate >= 85) return { status: 'Warning', color: '#FFA500' };
    return { status: 'Critical', color: '#FF4D4F' };
  }
}

export default new GatewayApiService();
