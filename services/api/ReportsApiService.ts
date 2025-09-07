import { BaseApiService } from './base/BaseApiService';

export interface ReportTemplate {
  template_id: number;
  name: string;
  report_type: 'TRANSACTIONS' | 'REFUNDS' | 'SETTLEMENTS' | 'CLIENTS' | 'COMPLIANCE';
  format: 'csv' | 'excel' | 'pdf';
  description?: string;
  query_params?: any;
  created_at: string;
  updated_at: string;
}

export interface ScheduledReport {
  schedule_id: number;
  template: number;
  cadence: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CRON';
  cron?: string;
  enabled: boolean;
  next_run_at?: string;
  last_run_at?: string;
  recipients?: string[];
  created_at: string;
}

export interface GeneratedReport {
  report_id: number;
  template?: number;
  status: 'PENDING' | 'GENERATED' | 'FAILED';
  file_path?: string;
  params?: any;
  generated_at: string;
  error_message?: string;
  template_name?: string;
}

class ReportsApiService extends BaseApiService {
  public readonly serviceName = 'ReportsService';
  protected readonly endpoint = '/reports';

  // Templates
  async listTemplates(): Promise<ReportTemplate[]> {
    const resp = await this.get<any>('/templates/');
    return this.normalizeResults<ReportTemplate>(resp);
  }
  async createTemplate(data: Partial<ReportTemplate>): Promise<ReportTemplate> {
    return this.post<ReportTemplate>('/templates/', data);
  }
  async deleteTemplate(templateId: number): Promise<void> {
    await this.delete(`/templates/${templateId}/`);
  }

  // Schedules
  async listSchedules(): Promise<ScheduledReport[]> {
    const resp = await this.get<any>('/schedules/');
    return this.normalizeResults<ScheduledReport>(resp);
  }
  async createSchedule(data: Partial<ScheduledReport>): Promise<ScheduledReport> {
    return this.post<ScheduledReport>('/schedules/', data);
  }

  // Generated
  async listGenerated(): Promise<GeneratedReport[]> {
    const resp = await this.get<any>('/generated/');
    return this.normalizeResults<GeneratedReport>(resp);
  }
  async runTemplate(template_id: number, params?: any): Promise<GeneratedReport> {
    return this.post<GeneratedReport>('/generated/run/', { template_id, params });
  }
  async download(report_id: number): Promise<Blob> {
    return this.get<Blob>(`/generated/${report_id}/download/`, { responseType: 'blob' as any });
  }
}

export default new ReportsApiService();
