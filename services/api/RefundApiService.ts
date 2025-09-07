import { BaseApiService } from './base/BaseApiService';
import { ApiResponse, PaginatedResponse } from './base/types';

export interface RefundRequest {
  refund_id: number;
  amount: string;
  client_code?: string;
  client_id?: string;
  client_txn_id?: string;
  message?: string;
  refund_complete_date?: string;
  refund_init_date?: string;
  sp_txn_id?: string;
  login_id?: number;
  refunded_bank_ref_id?: string;
  // Virtual properties
  refund_type: 'FULL' | 'PARTIAL';
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'REJECTED';
  requested_by: string;
}

export interface RefundApprovalWorkflow {
  workflow_id: number;
  refund_id: number;
  stage: 'INITIATED' | 'L1_APPROVAL' | 'L2_APPROVAL' | 'FINANCE_APPROVAL' | 'COMPLETED';
  action: 'APPROVE' | 'REJECT' | 'ESCALATE';
  action_by: string;
  action_date: string;
  comments?: string;
  next_approver?: string;
  created_at: string;
}

export interface RefundConfiguration {
  config_id: number;
  client_id?: string;
  min_refund_amount: number;
  max_refund_amount: number;
  auto_approval_limit: number;
  requires_l1_approval: boolean;
  requires_l2_approval: boolean;
  requires_finance_approval: boolean;
  max_days_for_refund: number;
  refund_fee_percentage: number;
  is_active: boolean;
  created_at: string;
}

export interface RefundBatch {
  batch_id: number;
  batch_name: string;
  total_amount: number;
  total_refunds: number;
  status: 'DRAFT' | 'READY' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  created_by: string;
  processed_by?: string;
  created_at: string;
  processed_at?: string;
  settlement_date?: string;
}

export interface RefundBatchItem {
  item_id: number;
  batch_id: number;
  refund_id: number;
  amount: number;
  status: 'PENDING' | 'PROCESSED' | 'FAILED';
  error_message?: string;
  bank_reference?: string;
  processed_at?: string;
}

export interface RefundReport {
  period: string;
  total_requests: number;
  total_amount: number;
  approved_count: number;
  approved_amount: number;
  rejected_count: number;
  rejected_amount: number;
  pending_count: number;
  pending_amount: number;
  success_rate: number;
  avg_processing_days: number;
  by_status: RefundStatusBreakdown[];
  by_client: RefundClientBreakdown[];
}

export interface RefundStatusBreakdown {
  status: string;
  count: number;
  amount: number;
  percentage: number;
}

export interface RefundClientBreakdown {
  client_id: string;
  client_name: string;
  count: number;
  amount: number;
}

export interface CreateRefundRequest {
  txn_id: string;
  amount: number;
  refund_type: 'FULL' | 'PARTIAL';
  reason: string;
  requested_by?: string;
}

export interface ApproveRefundRequest {
  action: 'APPROVE' | 'REJECT' | 'ESCALATE';
  comments?: string;
  next_approver?: string;
}

export interface RefundTracking {
  refund_id: number;
  txn_id: string;
  status: string;
  timeline: RefundTimelineEvent[];
  current_stage: string;
  estimated_completion?: string;
}

export interface RefundTimelineEvent {
  stage: string;
  action: string;
  action_by: string;
  action_date: string;
  comments?: string;
}

class RefundApiService extends BaseApiService {
  protected readonly endpoint = '';
  public readonly serviceName = 'RefundApiService';
  
  constructor() {
    super();
  }

  // Refund Requests Management
  async getRefunds(params?: {
    status?: string;
    client_id?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<RefundRequest>>> {
    const response = await this.get<any>('/refunds/', { params });
    // Normalize to PaginatedResponse shape for UI
    const normalized: PaginatedResponse<RefundRequest> = Array.isArray(response)
      ? { results: response as RefundRequest[], count: (response as RefundRequest[]).length, next: null as any, previous: null as any }
      : (response as PaginatedResponse<RefundRequest>);
    return { data: normalized };
  }

  async getRefund(refundId: number): Promise<ApiResponse<RefundRequest>> {
    const response = await this.get<RefundRequest>(`/refunds/${refundId}/`);
    return { data: response };
  }

  async createRefund(data: CreateRefundRequest): Promise<ApiResponse<RefundRequest>> {
    const response = await this.post<RefundRequest>('/refunds/initiate/', {
      txn_id: data.txn_id,
      refund_amount: data.amount,
      refund_reason: data.reason,
      refund_type: data.refund_type
    });
    return { data: response };
  }

  async updateRefund(refundId: number, data: Partial<RefundRequest>): Promise<ApiResponse<RefundRequest>> {
    const response = await this.patch<RefundRequest>(`/refunds/${refundId}/`, data);
    return { data: response };
  }

  async deleteRefund(refundId: number): Promise<ApiResponse<any>> {
    const response = await this.delete(`/refunds/${refundId}/`);
    return { data: response };
  }

  // Refund Approval Workflow
  async getApprovalWorkflow(refundId: number): Promise<ApiResponse<RefundApprovalWorkflow[]>> {
    const response = await this.get<RefundApprovalWorkflow[]>(`/refunds/${refundId}/workflow/`);
    return { data: response };
  }

  async approveRefund(refundId: number, data: ApproveRefundRequest): Promise<ApiResponse<any>> {
    const response = await this.post('/refunds/approve/', { refund_id: refundId, ...data });
    return { data: response };
  }

  async rejectRefund(refundId: number, reason: string): Promise<ApiResponse<any>> {
    const response = await this.post('/refunds/approve/', { 
      refund_id: refundId,
      action: 'REJECT',
      rejection_reason: reason
    });
    return { data: response };
  }

  async escalateRefund(refundId: number, data: { next_approver: string; comments?: string }): Promise<ApiResponse<any>> {
    const response = await this.post(`/refunds/${refundId}/escalate/`, data);
    return { data: response };
  }

  // Batch Processing
  async getRefundBatches(params?: {
    status?: string;
    created_by?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<RefundBatch>>> {
    const data = await this.get<PaginatedResponse<RefundBatch>>('/refunds/batches/', { params });
    return { data };
  }

  async createRefundBatch(data: {
    batch_name: string;
    refund_ids: number[];
  }): Promise<ApiResponse<RefundBatch>> {
    const created = await this.post<RefundBatch>('/refunds/batches/', data);
    return { data: created };
  }

  async processBatch(batchId: number): Promise<ApiResponse<any>> {
    const resp = await this.post(`/refunds/batches/${batchId}/process/`);
    return { data: resp };
  }

  async getBatchItems(batchId: number): Promise<ApiResponse<RefundBatchItem[]>> {
    const data = await this.get<RefundBatchItem[]>(`/refunds/batches/${batchId}/items/`);
    return { data };
  }

  // Configuration Management
  async getConfigurations(params?: {
    client_id?: string;
    is_active?: boolean;
  }): Promise<ApiResponse<RefundConfiguration[]>> {
    const data = await this.get<RefundConfiguration[]>('/refunds/configurations/', { params });
    return { data };
  }

  async createConfiguration(data: Partial<RefundConfiguration>): Promise<ApiResponse<RefundConfiguration>> {
    const created = await this.post<RefundConfiguration>('/refunds/configurations/', data);
    return { data: created };
  }

  async updateConfiguration(configId: number, data: Partial<RefundConfiguration>): Promise<ApiResponse<RefundConfiguration>> {
    const updated = await this.patch<RefundConfiguration>(`/refunds/configurations/${configId}/`, data);
    return { data: updated };
  }

  // Reports and Analytics
  async getRefundReport(params?: {
    date_from?: string;
    date_to?: string;
    client_id?: string;
    group_by?: 'day' | 'week' | 'month';
  }): Promise<ApiResponse<RefundReport>> {
    const data = await this.get<RefundReport>('/refunds/reports/', { params });
    return { data };
  }

  async getRefundStats(): Promise<ApiResponse<{
    total_refunds: number;
    pending_count: number;
    processing_count: number;
    completed_count: number;
    rejected_count: number;
    total_amount: number;
    avg_processing_days: number;
    success_rate: number;
  }>> {
    const data = await this.get<{
      total_refunds: number;
      pending_count: number;
      processing_count: number;
      completed_count: number;
      rejected_count: number;
      total_amount: number;
      avg_processing_days: number;
      success_rate: number;
    }>('/refunds/dashboard/');
    return { data };
  }

  // Refund Tracking
  async trackRefund(refundId: number): Promise<ApiResponse<RefundTracking>> {
    const data = await this.get<RefundTracking>(`/refunds/${refundId}/track/`);
    return { data };
  }

  async getRefundTimeline(refundId: number): Promise<ApiResponse<RefundTimelineEvent[]>> {
    const data = await this.get<RefundTimelineEvent[]>(`/refunds/${refundId}/timeline/`);
    return { data };
  }

  // Bulk Operations
  async bulkApprove(refundIds: number[], data: ApproveRefundRequest): Promise<ApiResponse<any>> {
    const resp = await this.post<any>('/refunds/bulk-approve/', { refund_ids: refundIds, ...data });
    return { data: resp };
  }

  async bulkReject(refundIds: number[], reason: string): Promise<ApiResponse<any>> {
    const resp = await this.post<any>('/refunds/bulk-reject/', { refund_ids: refundIds, reason });
    return { data: resp };
  }

  // Export
  async exportRefunds(params?: {
    format?: 'csv' | 'xlsx';
    status?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<Blob> {
    const blob = await this.get<Blob>('/refunds/export/', {
      params,
      responseType: 'blob',
    } as any);
    return blob;
  }
}

export default new RefundApiService();
