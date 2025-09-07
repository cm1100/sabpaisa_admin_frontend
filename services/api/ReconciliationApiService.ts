import { BaseApiService } from './base/BaseApiService';
import { ApiResponse, PaginatedResponse } from './base/types';

export interface ReconciliationStatus {
  total_transactions: number;
  matched: number;
  mismatched: number;
  pending: number;
  match_rate: number;
  total_amount: number;
  matched_amount: number;
  mismatched_amount: number;
}

export interface TransactionRecon {
  recon_id: number;
  txn_id: string;
  client_id: number;
  transaction_amount: number;
  bank_amount?: number;
  recon_status: string;
  recon_date?: string;
  bank_reference?: string;
  bank_date?: string;
  matched_by?: string;
  matched_at?: string;
  remarks?: string;
  created_at: string;
  updated_at: string;
}

export interface BankStatementUpload {
  upload_id: number;
  file_name: string;
  file_path: string;
  bank_name: string;
  statement_date: string;
  uploaded_by: string;
  uploaded_at: string;
  total_records: number;
  matched_records: number;
  mismatched_records: number;
  status: string;
}

export interface BankStatementEntry {
  entry_id: number;
  upload_id: number;
  transaction_date: string;
  value_date: string;
  description: string;
  reference_number: string;
  debit_amount?: number;
  credit_amount?: number;
  balance?: number;
  transaction_type: string;
  matched_txn_id?: string;
  match_status: string;
  match_confidence?: number;
}

export interface ReconciliationMismatch {
  mismatch_id: number;
  txn_id?: string;
  bank_entry_id?: number;
  bank_entry?: BankStatementEntry;
  mismatch_type: string;
  system_amount?: number;
  bank_amount?: number;
  difference?: number;
  system_date?: string;
  bank_date?: string;
  status: string;
  resolution?: string;
  resolved_by?: string;
  resolved_at?: string;
  created_at: string;
}

export interface ReconciliationRule {
  rule_id: number;
  rule_name: string;
  rule_type: string;
  match_field: string;
  tolerance_amount?: number;
  tolerance_days?: number;
  pattern?: string;
  priority: number;
  is_active: boolean;
  created_at: string;
}

export interface ManualMatchRequest {
  txn_id: string;
  bank_entry_id: number;
  remarks?: string;
}

export interface ReconciliationReportItem {
  date: string;
  total_transactions: number;
  matched_count: number;
  matched_amount: number;
  mismatched_count: number;
  mismatched_amount: number;
  match_percentage: number;
}

export interface BankStatementUploadRequest {
  file: File;
  bank_name: string;
  statement_date: string;
  format: 'CSV' | 'EXCEL' | 'PDF';
}

export interface RunReconciliationRequest {
  date_from: string;
  date_to: string;
}

class ReconciliationApiService extends BaseApiService {
  public readonly serviceName = 'ReconciliationService';
  protected readonly endpoint = '/reconciliation';

  async getStatus(): Promise<ApiResponse<ReconciliationStatus>> {
    const data = await this.get<ReconciliationStatus>('/');
    return { data };
  }

  async uploadStatement(formData: FormData): Promise<ApiResponse<any>> {
    const data = await this.post('/upload_statement/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return { data };
  }

  async getPendingReconciliation(params?: {
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<TransactionRecon[]>> {
    const resp = await this.get<any>('/pending_reconciliation/', { params });
    return { data: this.normalizeResults<TransactionRecon>(resp) };
  }

  async getMismatches(params?: {
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<ReconciliationMismatch[]>> {
    const resp = await this.get<any>('/mismatches/', { params });
    return { data: this.normalizeResults<ReconciliationMismatch>(resp) };
  }

  async manualMatch(data: ManualMatchRequest): Promise<ApiResponse<any>> {
    const resp = await this.post('/manual_match/', data);
    return { data: resp };
  }

  async getBankEntries(params?: {
    upload_id?: number;
    match_status?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<BankStatementEntry[]>> {
    const resp = await this.get<any>('/bank_entries/', { params });
    return { data: this.normalizeResults<BankStatementEntry>(resp) };
  }

  async getRules(): Promise<ApiResponse<ReconciliationRule[]>> {
    const resp = await this.get<any>('/rules/');
    return { data: this.normalizeResults<ReconciliationRule>(resp) };
  }

  async createRule(rule: Partial<ReconciliationRule>): Promise<ApiResponse<ReconciliationRule>> {
    const created = await this.post<ReconciliationRule>('/create_rule/', rule);
    return { data: created };
  }

  async runReconciliation(data: RunReconciliationRequest): Promise<ApiResponse<any>> {
    const resp = await this.post('/run_reconciliation/', data);
    return { data: resp };
  }

  async getReport(params?: {
    days?: number;
  }): Promise<ApiResponse<ReconciliationReportItem[]>> {
    const resp = await this.get<any>('/report/', { params });
    return { data: this.normalizeResults<ReconciliationReportItem>(resp) };
  }

  async getBankUploads(params?: {
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<BankStatementUpload>>> {
    const resp = await this.get<any>('/bank_uploads/', { params });
    const pag = this.normalizePaginated<BankStatementUpload>(resp);
    return { data: pag as any };
  }
}

export default new ReconciliationApiService();
