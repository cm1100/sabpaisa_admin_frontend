import { BaseApiService } from './base/BaseApiService';

export interface NotificationItem {
  type: 'COMPLIANCE_ALERT' | 'WEBHOOK' | 'GATEWAY_SYNC';
  title: string;
  message: string;
  severity?: 'HIGH' | 'MEDIUM' | 'LOW';
  timestamp: string;
  source: string;
}

class NotificationsApiService extends BaseApiService {
  public readonly serviceName = 'NotificationsService';
  protected readonly endpoint = '/notifications';

  async listAll(): Promise<{ results: NotificationItem[] }> {
    const resp = await this.get<any>('/');
    const pag = this.normalizePaginated<NotificationItem>(resp);
    return { results: pag.results };
  }

  async listSystemAlerts(): Promise<any[]> {
    const resp = await this.get<any>('/alerts/');
    return this.normalizeResults<any>(resp);
  }
}

export default new NotificationsApiService();
