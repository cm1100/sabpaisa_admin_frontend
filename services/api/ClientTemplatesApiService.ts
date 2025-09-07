import { BaseApiService } from './base/BaseApiService';

export interface ClientTemplate {
  id: number;
  name: string;
  base_client_code?: string;
  template_json: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class ClientTemplatesApiService extends BaseApiService {
  public readonly serviceName = 'ClientTemplatesApiService';
  protected readonly endpoint = '/productivity/client-templates';

  async list(params?: { q?: string; active?: boolean }): Promise<ClientTemplate[]> {
    const resp = await this.get<any>('/', { params: params as any });
    return this.normalizeResults<ClientTemplate>(resp);
  }

  async create(payload: Partial<ClientTemplate>): Promise<ClientTemplate> {
    return this.post<ClientTemplate>('/', payload);
  }

  async update(id: number, payload: Partial<ClientTemplate>): Promise<ClientTemplate> {
    return this.patch<ClientTemplate>(`/${id}/`, payload);
  }

  async remove(id: number): Promise<void> {
    await this.delete<void>(`/${id}/`);
  }

  async activate(id: number): Promise<void> {
    await this.post<void>(`/${id}/activate/`);
  }

  async deactivate(id: number): Promise<void> {
    await this.post<void>(`/${id}/deactivate/`);
  }
}

export default new ClientTemplatesApiService();

