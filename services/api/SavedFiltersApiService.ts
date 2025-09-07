import { BaseApiService } from './base/BaseApiService';

export interface SavedFilter {
  id: number;
  module: string;
  name: string;
  params_json: Record<string, any>;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

class SavedFiltersApiService extends BaseApiService {
  public readonly serviceName = 'SavedFiltersService';
  protected readonly endpoint = '/productivity/saved-filters';

  async list(module: string): Promise<SavedFilter[]> {
    const data = await this.get<any>('/', { params: { module } });
    return this.normalizeResults<SavedFilter>(data);
  }

  async create(payload: Partial<SavedFilter>): Promise<SavedFilter> {
    const data = await this.post<SavedFilter>('/', payload);
    return data;
  }

  async update(id: number, payload: Partial<SavedFilter>): Promise<SavedFilter> {
    const data = await this.patch<SavedFilter>(`/${id}/`, payload);
    return data;
  }

  async remove(id: number): Promise<void> {
    await this.delete<void>(`/${id}/`);
  }

  async setDefault(id: number): Promise<void> {
    await this.post<void>(`/${id}/set_default/`);
  }
}

export default new SavedFiltersApiService();

