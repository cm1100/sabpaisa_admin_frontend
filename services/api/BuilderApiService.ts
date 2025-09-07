/**
 * Builder (Custom Dashboard) API Service
 */
import { BaseApiService } from './base/BaseApiService';

export interface BuilderChatRequest {
  message: string;
  session_id?: string;
  config?: any;
}

export interface BuilderChatResponse {
  response: string;
  session_id?: string;
  config?: any;
  questions?: string[];
  metadata?: Record<string, any>;
  error?: string | null;
}

export interface BuilderValidateResponse {
  ok: boolean;
  report?: any;
  error?: string;
}

export interface BuilderRenderResponse {
  slots: Array<{
    id: string;
    title: string;
    type: string;
    render: any;
    data: any;
  }>;
}

export interface CustomDashboardDTO {
  id: number;
  title: string;
  description?: string;
  layout: any;
  is_default?: boolean;
  created_at?: string;
  updated_at?: string;
}

class BuilderApiService extends BaseApiService {
  public readonly serviceName = 'BuilderApiService';
  protected readonly endpoint = '/ai-builder';

  async chat(input: BuilderChatRequest): Promise<BuilderChatResponse> {
    return this.post<BuilderChatResponse>('chat/', input);
  }

  async validate(config: any): Promise<BuilderValidateResponse> {
    return this.post<BuilderValidateResponse>('validate/', { config });
  }

  async render(config: any): Promise<BuilderRenderResponse> {
    return this.post<BuilderRenderResponse>('render/', { config });
  }

  // Dashboards CRUD
  async listDashboards(): Promise<CustomDashboardDTO[]> {
    const data = await this.get<any>('custom-dashboards/');
    return this.normalizeResults<CustomDashboardDTO>(data);
  }

  async createDashboard(payload: { title: string; description?: string; layout: any; is_default?: boolean; }): Promise<CustomDashboardDTO> {
    return this.post<CustomDashboardDTO>('custom-dashboards/', payload);
    }

  async getDashboard(id: number | string): Promise<CustomDashboardDTO> {
    return this.get<CustomDashboardDTO>(`custom-dashboards/${id}/`);
  }

  async updateDashboard(id: number | string, payload: Partial<CustomDashboardDTO>): Promise<CustomDashboardDTO> {
    return this.put<CustomDashboardDTO>(`custom-dashboards/${id}/`, payload);
  }

  async deleteDashboard(id: number | string): Promise<void> {
    return this.delete<void>(`custom-dashboards/${id}/`);
  }

  async validateDashboard(id: number | string): Promise<BuilderValidateResponse> {
    return this.post<BuilderValidateResponse>(`custom-dashboards/${id}/validate/`, {});
  }

  async renderDashboard(id: number | string): Promise<BuilderRenderResponse> {
    return this.post<BuilderRenderResponse>(`custom-dashboards/${id}/render/`, {});
  }
}

export const builderService = new BuilderApiService();

