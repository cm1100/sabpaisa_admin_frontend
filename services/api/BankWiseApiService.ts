/**
 * Temporary API Service for Bank-wise data
 * This will call the new bank-wise performance endpoint
 */
import { BaseApiService } from './base/BaseApiService';

export class BankWiseApiService extends BaseApiService {
  public readonly serviceName = 'BankWiseService';
  protected readonly endpoint = '/settlements'; // Use settlements endpoint

  async getBankWisePerformance(filter: {
    date_from?: string;
    date_to?: string;
  } = {}) {
    const queryString = this.buildQueryString(filter);
    return this.get(`/bank-wise-performance/${queryString ? `?${queryString}` : ''}`);
  }

  async getSettlementDisputes() {
    return this.get('/disputes/');
  }
}

export const bankWiseApiService = new BankWiseApiService();