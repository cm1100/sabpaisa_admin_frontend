/**
 * Settlement API Service
 * Handles settlement-related API calls with a clean, typed surface.
 */
import { BaseApiService } from './base/BaseApiService';

export interface SettlementBatch {
  batch_id: string;
  batch_date: string;
  total_transactions: number;
  total_amount: number;
  processing_fee: number;
  gst_amount: number;
  net_settlement_amount: number;
  status: 'PENDING' | 'PROCESSING' | 'APPROVED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  created_at: string;
  processed_at?: string;
  processed_by?: string;
}

export interface SettlementDetail {
  settlement_id: string;
  batch_id: string;
  txn_id: string;
  client_code: string;
  client_name?: string;
  transaction_amount: number;
  settlement_amount: number;
  processing_fee: number;
  gst_amount: number;
  net_amount: number;
  settlement_date?: string;
  settlement_status: 'PENDING' | 'PROCESSING' | 'SETTLED' | 'FAILED' | 'ON_HOLD';
  bank_reference?: string;
  utr_number?: string;
  remarks?: string;
  created_at: string;
}

export interface CreateSettlementBatchRequest {
  batch_date?: string;
  client_codes?: string[];
  auto_process?: boolean;
}

export interface ProcessSettlementRequest {
  batch_id: string;
  approval_notes?: string;
}

export interface SettlementConfiguration {
  config_id: string;
  client_code: string;
  settlement_cycle: 'T+0' | 'T+1' | 'T+2' | 'T+3';
  min_settlement_amount: number;
  auto_settle: boolean;
  bank_account_id: string;
  notification_emails: string[];
  is_active: boolean;
}

export interface SettlementReport {
  report_id: string;
  report_type: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  date_from: string;
  date_to: string;
  total_batches: number;
  total_transactions: number;
  total_amount: number;
  total_fees: number;
  net_amount: number;
  generated_at: string;
  report_url?: string;
}

export interface SettlementReconciliation {
  reconciliation_id: string;
  batch_id: string;
  bank_statement_amount: number;
  system_amount: number;
  difference: number;
  status: 'MATCHED' | 'MISMATCHED' | 'PENDING';
  reconciled_at?: string;
  reconciled_by?: string;
  remarks?: string;
}

export interface SettlementStatistics {
  pending_count: number;
  pending_amount: number;
  processing_count: number;
  processing_amount: number;
  completed_today_count: number;
  completed_today_amount: number;
  failed_count: number;
  failed_amount: number;
  cycle_distribution: {
    [key: string]: {
      count: number;
      amount: number;
      percentage: number;
    };
  };
}

export interface SettlementFilter {
  status?: string;
  client_code?: string;
  batch_date_from?: string;
  batch_date_to?: string;
  amount_min?: number;
  amount_max?: number;
  settlement_cycle?: string;
  page?: number;
  page_size?: number;
}

export class SettlementApiService extends BaseApiService {
  public readonly serviceName = 'SettlementService';
  protected readonly endpoint = '/settlements';

  // Build query string from a plain object
  protected buildQueryString(params: Record<string, any> = {}): string {
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') usp.append(k, String(v));
    });
    return usp.toString();
  }

  // Batches
  async getSettlementBatches(filter: SettlementFilter = {}): Promise<{ results: SettlementBatch[]; count: number }>{
    const qs = this.buildQueryString(filter as any);
    return this.get(`/batches/${qs ? `?${qs}` : ''}`);
  }

  // Fetch single batch summary
  async getSettlementBatch(batchId: string): Promise<SettlementBatch>{
    const details = await this.getBatchDetails(batchId);
    return details.batch;
  }

  async getBatchDetails(batchId: string): Promise<{ batch: SettlementBatch; items: SettlementDetail[] }>{
    return this.get(`/batches/${batchId}/`);
  }

  // Fetch only settlement details for a batch
  async getSettlementDetails(batchId: string): Promise<SettlementDetail[]>{
    const details = await this.getBatchDetails(batchId);
    return details.items;
  }

  async createSettlementBatch(data: CreateSettlementBatchRequest): Promise<SettlementBatch>{
    return this.post(`/batches/`, data);
  }

  async processSettlementBatch(batchId: string, data?: ProcessSettlementRequest): Promise<SettlementBatch>{
    return this.post(`/batches/${batchId}/process/`, data || { batch_id: batchId });
  }

  async approveSettlementBatch(batchId: string, approvalNotes?: string): Promise<SettlementBatch>{
    return this.post(`/batches/${batchId}/approve/`, { approval_notes: approvalNotes });
  }

  async cancelSettlementBatch(batchId: string, reason: string): Promise<SettlementBatch>{
    return this.post(`/batches/${batchId}/cancel/`, { reason });
  }

  async bulkProcessSettlements(settlementIds: string[]): Promise<{ processed: number; failed: number; results: SettlementBatch[] }>{
    return this.post(`/batches/bulk-process/`, { settlement_ids: settlementIds });
  }

  // Analytics / reporting
  async getStatistics(): Promise<SettlementStatistics>{
    return this.get(`/analytics/statistics/`);
  }

  // Alias to match store usage; accepts optional filters
  async getSettlementStatistics(filter: SettlementFilter = {}): Promise<SettlementStatistics>{
    const qs = this.buildQueryString(filter as any);
    return this.get(`/analytics/statistics/${qs ? `?${qs}` : ''}`);
  }

  async getCycleDistribution(): Promise<{ cycle: string; count: number; amount: number; percentage: number; }[]>{
    return this.get(`/analytics/cycle-distribution/`);
  }

  async getBankWisePerformance(filter: { date_from?: string; date_to?: string } = {}): Promise<{
    bank_code: string;
    bank_name: string;
    total_batches: number;
    completed: number;
    pending: number;
    failed: number;
    total_amount: number;
    success_rate: number;
    avg_processing_time: string;
    last_settlement?: string;
  }[]>{
    const qs = this.buildQueryString(filter as any);
    return this.get(`/bank-wise-performance/${qs ? `?${qs}` : ''}`);
  }

  async getSettlementActivity(limit: number = 10): Promise<{
    activity_type: string;
    description: string;
    amount?: number;
    timestamp: string;
    status: string;
  }[]>{
    return this.get(`/activity/?limit=${limit}`);
  }

  // Retry a specific settlement item
  async retrySettlement(settlementId: string): Promise<{ message: string }>{
    return this.post(`/details/${settlementId}/retry/`);
  }

  // Configurations
  async getSettlementConfigurations(clientCode?: string): Promise<SettlementConfiguration[]>{
    const qs = this.buildQueryString(clientCode ? { client_code: clientCode } : {});
    return this.get(`/configurations/${qs ? `?${qs}` : ''}`);
  }

  async updateSettlementConfiguration(configId: string, data: Partial<SettlementConfiguration>): Promise<SettlementConfiguration>{
    return this.patch(`/configurations/${configId}/`, data);
  }

  // Disputes (if exposed via settlement API)
  async getDisputes(): Promise<{
    id: string;
    dispute_id: string;
    batch_id: string;
    client_name: string;
    amount: number;
    status: string;
    priority: string;
    category: string;
    description: string;
    created_at: string;
    assigned_to?: string;
    resolution_deadline?: string;
  }[]>{
    return this.get(`/disputes/`);
  }

  // Export
  async exportSettlements(params?: { format?: 'csv' | 'xlsx'; batch_date_from?: string; batch_date_to?: string; status?: string; client_code?: string; }): Promise<Blob>{
    const blob = await this.get(`/export/`, {
      params,
      responseType: 'blob' as any,
      headers: { Accept: '*/*' },
    });
    return blob as any;
  }

  // Reports
  async generateSettlementReport(data: { report_type: string; date_from: string; date_to: string }): Promise<SettlementReport>{
    return this.post(`/reports/generate/`, data);
  }

  async getSettlementReports(): Promise<SettlementReport[]>{
    return this.get(`/reports/`);
  }

  async downloadSettlementReport(reportId: string): Promise<Blob>{
    const blob = await this.get(`/reports/${reportId}/download/`, {
      responseType: 'blob' as any,
      headers: { Accept: '*/*' },
    });
    return blob as any;
  }

  // Reconciliations
  async createReconciliation(data: { batch_id: string; bank_statement_amount: number; remarks?: string }): Promise<SettlementReconciliation>{
    return this.post(`/reconciliations/`, data);
  }

  async getReconciliations(filter: Record<string, any> = {}): Promise<SettlementReconciliation[]>{
    const qs = this.buildQueryString(filter);
    return this.get(`/reconciliations/${qs ? `?${qs}` : ''}`);
  }

  async updateReconciliation(id: string, data: { status: string; remarks?: string }): Promise<SettlementReconciliation>{
    return this.patch(`/reconciliations/${id}/`, data);
  }
}

export const settlementApiService = new SettlementApiService();
