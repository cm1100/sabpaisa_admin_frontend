import { BaseApiService } from './base/BaseApiService';

export interface RoutingPolicy {
  id: number;
  name: string;
  conditions_json: Record<string, any>;
  weights_json: Record<string, number>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

class RoutingApiService extends BaseApiService {
  public readonly serviceName = 'RoutingApiService';
  protected readonly endpoint = '/routing/routing-policies';

  async list(params?: { q?: string; active?: boolean }): Promise<RoutingPolicy[]> {
    const resp = await this.get<any>('/', { params: params as any });
    return this.normalizeResults<RoutingPolicy>(resp);
  }

  async create(payload: Partial<RoutingPolicy>): Promise<RoutingPolicy> {
    return this.post<RoutingPolicy>('/', payload);
  }

  async update(id: number, payload: Partial<RoutingPolicy>): Promise<RoutingPolicy> {
    return this.patch<RoutingPolicy>(`/${id}/`, payload);
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

  async simulate(id: number, payload?: Record<string, any>): Promise<{ weights: Record<string, number>; conditions: Record<string, any>}> {
    const data = await this.post<any>(`/${id}/simulate/`, payload || {});
    return data as any;
  }
}

export default new RoutingApiService();

