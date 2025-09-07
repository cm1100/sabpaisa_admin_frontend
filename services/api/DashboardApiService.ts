import { BaseApiService } from './base/BaseApiService';

export interface DashboardMetrics {
  todayVolume: number;
  totalTransactions: number;
  successRate: number;
  avgResponseTime: number;
  pendingSettlements: number;
  activeClients: number;
  systemHealth: 'healthy' | 'warning' | 'critical';
  lastUpdated: string;
}

export interface RealtimeMetrics {
  transactionsPerSecond: number;
  volumePerSecond: number;
  successRate: number;
  avgResponseTime: number;
  activeConnections: number;
  queueSize: number;
  timestamp: string;
}

export interface HistoricalMetrics {
  date: string;
  volume: number;
  transactions: number;
  successRate: number;
  avgResponseTime: number;
  errors: number;
}

export interface SystemHealthResponse {
  status: 'healthy' | 'warning' | 'critical';
  services: {
    database: 'up' | 'down' | 'degraded';
    redis: 'up' | 'down' | 'degraded';
    paymentGateway: 'up' | 'down' | 'degraded';
    notifications: 'up' | 'down' | 'degraded';
  };
  uptime: number;
  lastCheck: string;
  alerts: {
    id: string;
    type: 'error' | 'warning' | 'info';
    message: string;
    timestamp: string;
  }[];
}

export interface MetricsFilter {
  dateFrom?: string;
  dateTo?: string;
  granularity?: 'hour' | 'day' | 'week' | 'month';
  clientId?: string;
  paymentMethod?: string;
}

export class DashboardApiService extends BaseApiService {
  public readonly serviceName = 'DashboardService';
  protected readonly endpoint = '/dashboard';

  async getDashboardMetrics(range?: string): Promise<DashboardMetrics> {
    const queryString = range ? `?range=${range}` : '';
    return this.get<DashboardMetrics>(`/metrics/${queryString}`);
  }

  async getRealtimeMetrics(): Promise<RealtimeMetrics> {
    return this.requestWithConfig<RealtimeMetrics>('dashboardMetrics', 'GET');
  }

  async getHistoricalMetrics(filter: MetricsFilter = {}): Promise<HistoricalMetrics[]> {
    const queryString = this.buildQueryString(filter);
    const path = queryString ? `?${queryString}` : '';
    return this.requestWithConfig<HistoricalMetrics[]>('dashboardMetrics', 'GET', undefined, {}, { params: filter });
  }

  async getSystemHealth(): Promise<SystemHealthResponse> {
    return this.requestWithConfig<SystemHealthResponse>('systemHealth', 'GET');
  }

  async getHourlyVolumeChart(hours: number = 24): Promise<{
    data: any[];
  }> {
    return this.get<{
      data: any[];
    }>(`/charts/hourly/?hours=${hours}`);
  }

  async getSuccessRateChart(filter: MetricsFilter = {}): Promise<{
    labels: string[];
    datasets: {
      successRate: number[];
      failureRate: number[];
    };
  }> {
    const queryString = this.buildQueryString(filter);
    const path = `/charts/success-rate${queryString ? `?${queryString}` : ''}`;
    return this.get<{
      labels: string[];
      datasets: {
        successRate: number[];
        failureRate: number[];
      };
    }>(path);
  }

  async getPaymentMethodDistribution(range?: string): Promise<{
    data: any[];
  }> {
    const queryString = range ? `?range=${range}` : '';
    return this.get<{
      data: any[];
    }>(`/charts/payment-modes/${queryString}`);
  }

  async getTopClientsChart(limit: number = 10, range?: string): Promise<{
    data: any[];
  }> {
    const params = new URLSearchParams();
    params.append('limit', limit.toString());
    if (range) params.append('range', range);
    return this.get<{
      data: any[];
    }>(`/charts/top-clients/?${params.toString()}`);
  }

  async getLiveFeed(limit: number = 20): Promise<any[]> {
    return this.requestWithConfig<any[]>('liveFeed', 'GET', undefined, {}, { params: { limit } });
  }

  async getClientStats(): Promise<any> {
    return this.requestWithConfig<any>('clientStats', 'GET');
  }

  async refreshMetricsCache(): Promise<void> {
    return this.requestWithConfig<void>('refreshMetrics', 'POST');
  }

  async getAlerts(limit: number = 50): Promise<SystemHealthResponse['alerts']> {
    const queryString = this.buildQueryString({ limit: limit.toString() });
    const path = `/alerts${queryString ? `?${queryString}` : ''}`;
    return this.get<SystemHealthResponse['alerts']>(path);
  }

  async dismissAlert(alertId: string): Promise<void> {
    return this.post<void>(`/alerts/${alertId}/dismiss`);
  }

  async getPerformanceMetrics(filter: MetricsFilter = {}): Promise<{
    avgResponseTime: number[];
    p95ResponseTime: number[];
    p99ResponseTime: number[];
    throughput: number[];
    errorRate: number[];
    timestamps: string[];
  }> {
    const queryString = this.buildQueryString(filter);
    const path = `/performance${queryString ? `?${queryString}` : ''}`;
    return this.get<{
      avgResponseTime: number[];
      p95ResponseTime: number[];
      p99ResponseTime: number[];
      throughput: number[];
      errorRate: number[];
      timestamps: string[];
    }>(path);
  }

  async exportMetrics(filter: MetricsFilter & { format: 'csv' | 'xlsx' | 'pdf' }): Promise<void> {
    // Convert mixed filter to a string map for download
    const params: Record<string, string> = {};
    Object.entries(filter).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) params[k] = v.join(','); else params[k] = String(v);
    });
    await this.downloadFile(
      'export',
      params,
      `dashboard-metrics-${new Date().toISOString().split('T')[0]}.${filter.format}`
    );
  }
}

export const dashboardService = new DashboardApiService();
