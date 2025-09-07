import { BaseApiService } from './base/BaseApiService';
import { ApiResponse, PaginatedResponse } from './base/types';

export interface KYCSummary {
  total_clients: number;
  verified: number;
  pending: number;
  rejected: number;
  expired: number;
  verification_rate: number;
}

export interface ComplianceAlert {
  alert_id: number;
  alert_type: string;
  severity: string;
  entity_type: string;
  entity_id: string;
  description: string;
  detected_at: string;
  reviewed: boolean;
  review_status: string;
  review_comments?: string;
  reviewed_by?: string;
  reviewed_at?: string;
}

export interface SuspiciousTransaction {
  id: number;
  transaction_id: string;
  client_id: string;
  client_name: string;
  amount: number;
  payment_mode: string;
  risk_score: number;
  risk_indicators: string[];
  detected_at: string;
  status: string;
}

export interface ComplianceDashboard {
  kyc_summary: KYCSummary;
  risk_distribution: Record<string, number>;
  recent_alerts: ComplianceAlert[];
  suspicious_transactions: SuspiciousTransaction[];
  compliance_score: number;
  pending_reviews: number;
  total_alerts: number;
  alerts_by_severity: Record<string, number>;
}

export interface AuditLog {
  log_id: number;
  user_id: number;
  user_name?: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  ip_address: string;
  user_agent?: string;
  timestamp: string;
  details?: any;
}

export interface RBIReportRequest {
  report_type: string;
  start_date: string;
  end_date: string;
  format?: string;
}

export interface ComplianceDocument {
  doc_id: number;
  title: string;
  doc_type: string;
  status: string;
  file_path?: string;
  uploaded_by?: string;
  uploaded_at: string;
  due_date?: string;
  tags?: any;
}

export interface RegulatoryEvent {
  event_id: number;
  title: string;
  description?: string;
  category: string;
  rbi_reference?: string;
  due_date: string;
  status: string;
}

class ComplianceApiService extends BaseApiService {
  public readonly serviceName = 'ComplianceService';
  protected readonly endpoint = '/compliance';

  async getDashboard(): Promise<ApiResponse<ComplianceDashboard>> {
    // Backend returns dashboard summary at /api/compliance/ (list action)
    const data = await this.get<ComplianceDashboard>('/');
    return { data };
  }

  async getKYCStatus(status?: string): Promise<ApiResponse<any>> {
    const params = status ? { status } : {};
    const data = await this.get<any>('/kyc_status/', { params });
    return { data };
  }

  async getAlerts(params?: {
    severity?: string;
    reviewed?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<ComplianceAlert>>> {
    const data = await this.get<PaginatedResponse<ComplianceAlert>>('/alerts/', { params });
    return { data };
  }

  async getSuspiciousTransactions(params?: {
    min_risk_score?: number;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<SuspiciousTransaction>>> {
    const data = await this.get<PaginatedResponse<SuspiciousTransaction>>('/suspicious_transactions/', { params });
    return { data };
  }

  async getAuditTrail(params?: {
    user_id?: number;
    entity_type?: string;
    entity_id?: string;
    start_date?: string;
    end_date?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<AuditLog>>> {
    const data = await this.get<PaginatedResponse<AuditLog>>('/audit_trail/', { params });
    return { data };
  }

  async createAlert(alert: Partial<ComplianceAlert>): Promise<ApiResponse<ComplianceAlert>> {
    const data = await this.post<ComplianceAlert>('/alerts/', alert);
    return { data };
  }

  async reviewAlert(alertId: number, data: {
    action: 'RESOLVE' | 'ESCALATE' | 'FALSE_POSITIVE';
    comments: string;
  }): Promise<ApiResponse<any>> {
    const resp = await this.post(`/alerts/${alertId}/review/`, data);
    return { data: resp };
  }

  async generateRBIReport(data: RBIReportRequest): Promise<ApiResponse<any>> {
    const resp = await this.post('/generate_rbi_report/', data);
    return { data: resp };
  }

  async getRiskMetrics(): Promise<ApiResponse<any>> {
    const data = await this.get('/risk_metrics/');
    return { data };
  }

  async getComplianceScore(): Promise<ApiResponse<{ score: number; breakdown: any }>> {
    const data = await this.get('/compliance_score/');
    return { data };
  }

  async exportReport(format: 'pdf' | 'excel' | 'csv', params?: any): Promise<Blob> {
    const blob = await this.get<Blob>(`/export/${format}/`, { 
      params,
      // Cast due to AxiosRequestConfig typing on responseType
      responseType: 'blob' as any,
    });
    return blob;
  }

  async listDocuments(): Promise<ApiResponse<ComplianceDocument[]>> {
    const resp = await this.get<PaginatedResponse<ComplianceDocument> | ComplianceDocument[]>('/documents/');
    const data = (resp as any)?.results ?? resp;
    return { data: data as any };
  }

  async createDocument(payload: Partial<ComplianceDocument>): Promise<ApiResponse<ComplianceDocument>> {
    const data = await this.post<ComplianceDocument>('/documents/', payload);
    return { data };
  }

  async listCalendar(): Promise<ApiResponse<RegulatoryEvent[]>> {
    const resp = await this.get<PaginatedResponse<RegulatoryEvent> | RegulatoryEvent[]>('/calendar/');
    const data = (resp as any)?.results ?? resp;
    return { data: data as any };
  }

  async createCalendarEvent(payload: Partial<RegulatoryEvent>): Promise<ApiResponse<RegulatoryEvent>> {
    const data = await this.post<RegulatoryEvent>('/calendar/', payload);
    return { data };
  }
}

export default new ComplianceApiService();
