import { BaseApiService } from './base/BaseApiService';

export interface AdminUserItem {
  id: number;
  user_id: string;
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: string;
  is_active: boolean;
  last_login?: string;
  last_activity?: string;
}

class AdministrationApiService extends BaseApiService {
  public readonly serviceName = 'AdministrationService';
  protected readonly endpoint = '/administration';

  async listUsers(): Promise<AdminUserItem[]> {
    const resp = await this.get<any>('/users/');
    return (resp?.results ?? resp) as AdminUserItem[];
  }

  async listRoles(): Promise<{ roles: { value: string; label: string }[] }> {
    return this.get<{ roles: { value: string; label: string }[] }>('/users/roles/');
  }

  async updateUser(id: number, payload: Partial<AdminUserItem>): Promise<AdminUserItem> {
    return this.patch<AdminUserItem>(`/users/${id}/`, payload);
  }

  async listActivity(): Promise<any[]> {
    return this.get<any[]>('/activity-logs/');
  }

  async getSystemSettings(): Promise<any> {
    return this.get<any>('/system-settings/');
  }

  async listBackups(): Promise<any[]> {
    return this.get<any[]>('/backups/');
  }

  async createBackup(): Promise<any> {
    return this.post<any>('/backups/', {});
  }
}

export default new AdministrationApiService();
