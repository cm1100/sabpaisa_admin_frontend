/**
 * Transaction Service - SOLID Principles Implementation
 * Single Responsibility: Handle all transaction-related API calls
 * Open/Closed: Extensible for new transaction features
 * Interface Segregation: Separate interfaces for different operations
 */

import { apiClient } from './apiClient';
import type { 
  ITransaction, 
  ITransactionFilter, 
  ITransactionStats,
  IRefund,
  IRefundRequest,
  ISettlement,
  IDispute,
  IAnalytics,
  IPaginatedResponse
} from '@/types/transaction';

/**
 * Interface for Transaction Repository
 * Following Repository Pattern for data access
 */
interface ITransactionRepository {
  getAll(filters: ITransactionFilter): Promise<IPaginatedResponse<ITransaction>>;
  getById(id: string): Promise<ITransaction>;
  getStats(range: string): Promise<ITransactionStats>;
  export(format: string, filters: ITransactionFilter): Promise<Blob>;
}

/**
 * Interface for Refund Operations
 */
interface IRefundService {
  getRefunds(filters: { status?: string; txn_id?: string }): Promise<IRefund[]>;
  initiateRefund(request: IRefundRequest): Promise<IRefund>;
  approveRefund(refundId: string): Promise<IRefund>;
  rejectRefund(refundId: string, reason: string): Promise<IRefund>;
}

/**
 * Interface for Settlement Operations
 */
interface ISettlementService {
  getPendingSettlements(clientId?: string): Promise<ISettlement>;
  processSettlementBatch(txnIds: string[]): Promise<{ settlement_id: string; status: string }>;
  getSettlementHistory(filters: any): Promise<ISettlement[]>;
}

/**
 * Interface for Analytics Operations
 */
interface IAnalyticsService {
  getPaymentModeDistribution(range: string): Promise<IAnalytics[]>;
  getHourlyVolume(hours: number): Promise<IAnalytics[]>;
  getTopClients(limit: number): Promise<IAnalytics[]>;
}

/**
 * Main Transaction Service Class
 * Implements all transaction-related operations
 */
class TransactionService implements ITransactionRepository, IRefundService, ISettlementService, IAnalyticsService {
  private readonly baseUrl = '/transactions';
  private readonly refundUrl = '/refunds';
  private readonly analyticsUrl = '/transactions/analytics';
  private readonly settlementUrl = '/transactions/settlements';
  private readonly liveUrl = '/transactions/live';

  /**
   * Get paginated transactions with filters
   */
  async getAll(filters: ITransactionFilter): Promise<IPaginatedResponse<ITransaction>> {
    try {
      const params = new URLSearchParams();
      
      // Add filters to query params
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      const response = await apiClient.get(`${this.baseUrl}/?${params.toString()}`);
      const data = response.data;
      // Normalize backend payload to ITransaction shape expected by UI
      const results = (data.results || data || []).map((t: any) => {
        const amount = t.amount ?? t.paid_amount ?? 0;
        const isSettled = Boolean(
          t.is_settled === true ||
          (typeof t.is_settled === 'string' && t.is_settled.toLowerCase() === 'true') ||
          t.settlement_status === 'SETTLED' ||
          t.settlement_date
        );
        return {
          ...t,
          amount,
          paid_amount: t.paid_amount ?? amount,
          is_settled: isSettled,
          payee_email: t.payee_email ?? t.email ?? '',
          payee_mob: t.payee_mob ?? t.contact_no ?? t.customer_phone ?? '',
          client_name: t.client_name ?? t.client ?? '',
          payment_mode: t.payment_mode ?? t.pg_pay_mode ?? t.method ?? '',
          formatted_amount: t.formatted_amount ?? `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
        } as ITransaction;
      });
      return {
        results,
        count: data.count ?? results.length,
        page: (filters as any).page || 1,
        page_size: (filters as any).page_size || 20,
      } as any;
    } catch (error: any) {
      // Check if it's an authentication error
      if (error.response?.status === 401) {
        console.error('Authentication failed. Please login again.');
        // Could redirect to login here if needed
        // window.location.href = '/login';
      }
      
      // Do not use mock data in production views; surface error to caller
      
      // For other errors, throw them
      throw error;
    }
  }

  /**
   * Generate mock transactions for development
   */
  private generateMockTransactions(): ITransaction[] {
    const paymentModes = ['UPI', 'Credit Card', 'Debit Card', 'Net Banking', 'Wallet'] as const;
    const statuses = ['SUCCESS', 'SUCCESS', 'SUCCESS', 'FAILED', 'PENDING'] as const; // More SUCCESS for realistic data
    const banks = ['HDFC', 'ICICI', 'SBI', 'AXIS'] as const;
    
    return Array.from({ length: 50 }, (_, i) => {  // Generate more for better filtering
      const baseAmount = Math.floor(Math.random() * 100000) + 1000;
      const fees = Math.floor(Math.random() * 1000) + 50;
      
      return {
        txn_id: `TXN2024${String(1000 + i).padStart(6, '0')}`,
        client_txn_id: `CLT${String(1000 + i).padStart(6, '0')}`,
        pg_txn_id: `PG${String(1000 + i).padStart(8, '0')}`,
        bank_txn_id: `BNK${String(1000 + i).padStart(8, '0')}`,
        amount: baseAmount,
        paid_amount: baseAmount,
        currency: 'INR',
        status: statuses[Math.floor(Math.random() * statuses.length)] as any,
        payment_mode: paymentModes[Math.floor(Math.random() * paymentModes.length)] as any,
        pg_name: 'SabPaisa',
        bank_name: banks[Math.floor(Math.random() * banks.length)] as any,
        customer_name: `Customer ${i + 1}`,
        payee_email: `customer${i + 1}@example.com`,
        payee_mob: `98765${String(10000 + i).substring(0, 5)}`,
        trans_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        trans_complete_date: new Date(Date.now() - Math.random() * 29 * 24 * 60 * 60 * 1000).toISOString(),
        client_code: `CL00${i % 5 + 1}`,
        client_name: `Client ${i % 5 + 1}`,
        is_settled: Math.random() > 0.3,
        is_refundable: Math.random() > 0.5,
        total_fees: fees,
        net_amount: baseAmount - fees,
        formatted_amount: `₹${baseAmount.toLocaleString('en-IN')}`,
        program_id: `PRG00${i % 3 + 1}`,
        reg_number: `REG${String(1000 + i).padStart(6, '0')}`,
        card_brand: Math.random() > 0.5 ? 'VISA' : 'MasterCard',
        vpa: Math.random() > 0.5 ? `user${i}@paytm` : undefined,
        pg_response_code: '000',
        settlement_date: Math.random() > 0.3 ? new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString() : undefined,
      } as ITransaction;
    });
  }

  /**
   * Get single transaction by ID
   */
  async getById(id: string): Promise<ITransaction> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/${id}/`);
      const t = response.data || {};
      const amount = t.amount ?? t.paid_amount ?? 0;
      const isSettled = Boolean(
        t.is_settled === true ||
        (typeof t.is_settled === 'string' && t.is_settled.toLowerCase() === 'true') ||
        t.settlement_status === 'SETTLED' ||
        t.settlement_date
      );
      return {
        ...t,
        amount,
        paid_amount: t.paid_amount ?? amount,
        is_settled: isSettled,
        payee_email: t.payee_email ?? t.email ?? '',
        payee_mob: t.payee_mob ?? t.contact_no ?? t.customer_phone ?? '',
        client_name: t.client_name ?? t.client ?? '',
        payment_mode: t.payment_mode ?? t.pg_pay_mode ?? t.method ?? '',
        formatted_amount: t.formatted_amount ?? `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      } as ITransaction;
    } catch (error: any) {
      console.error('Error fetching transaction by ID:', error);
      // Only use mock in development when backend is down
      if (!error.response && process.env.NODE_ENV === 'development') {
        console.warn('Using mock data for development');
        const mockTransactions = this.generateMockTransactions();
        const transaction = mockTransactions.find(t => t.txn_id === id) || mockTransactions[0];
        const t = { ...transaction, txn_id: id } as any;
        const amount = t.amount ?? t.paid_amount ?? 0;
        return {
          ...t,
          amount,
          paid_amount: t.paid_amount ?? amount,
          formatted_amount: t.formatted_amount ?? `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
          is_settled: Boolean(t.is_settled || t.settlement_date),
        } as ITransaction;
      }
      throw error;
    }
  }

  /**
   * Get transaction statistics
   */
  async getStats(range: string = '24h'): Promise<ITransactionStats> {
    try {
      const response = await apiClient.get(`${this.baseUrl}/stats/?range=${range}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching transaction stats:', error);
      // Only use mock in development when backend is down
      if (!error.response && process.env.NODE_ENV === 'development') {
        console.warn('Using mock stats for development');
        const now = new Date();
        const start = new Date(now);
        if (range === '30d') start.setDate(now.getDate() - 30);
        else if (range === '7d') start.setDate(now.getDate() - 7);
        else start.setDate(now.getDate() - 1);
        return {
          total_transactions: 3250,
          successful: 3100,
          failed: 150,
          pending: 0,
          total_amount: 12_500_000,
          success_rate: 95.4,
          payment_modes: [
            { payment_mode: 'UPI', count: 1800, amount: 5_000_000 },
            { payment_mode: 'Credit Card', count: 800, amount: 3_500_000 },
            { payment_mode: 'Debit Card', count: 450, amount: 2_000_000 },
            { payment_mode: 'Net Banking', count: 150, amount: 1_000_000 },
            { payment_mode: 'Wallet', count: 50, amount: 1_000_000 },
          ],
          date_range: range,
          start_date: start.toISOString(),
          end_date: now.toISOString(),
        } as ITransactionStats;
      }
      throw error;
    }
  }

  /**
   * Get live transactions + stats from backend action
   */
  async getLive(range: '5m' | '30m' | '1h' = '1h'): Promise<{ transactions: ITransaction[]; stats: any; timestamp: string }>
  {
    try {
      const response = await apiClient.get(`${this.liveUrl}/?range=${range}`);
      const data = response.data || {};
      return {
        transactions: (data.transactions || []) as ITransaction[],
        stats: data.stats || {},
        timestamp: data.timestamp || new Date().toISOString()
      };
    } catch (error) {
      console.error('Error fetching live data, falling back to list:', error);
      // Fallback to last-hour list if live endpoint unavailable
      const list = await this.getAll({
        page: 1,
        page_size: 50,
        date_from: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
        date_to: new Date().toISOString()
      });
      const results = list.results || [];
      const success = results.filter(t => t.status === 'SUCCESS').length;
      const failed = results.filter(t => t.status === 'FAILED').length;
      const pending = results.filter(t => t.status === 'PENDING').length;
      return {
        transactions: results,
        stats: {
          total: results.length,
          success,
          failed,
          pending,
          success_rate: results.length ? (success / results.length) * 100 : 0,
          total_volume: results.filter(t => t.status === 'SUCCESS').reduce((s, t) => s + (Number((t as any).amount) || 0), 0),
        },
        timestamp: new Date().toISOString()
      };
    }
  }

  /**
   * Export transactions to CSV/Excel
   */
  async export(format: string, filters: ITransactionFilter): Promise<Blob> {
    try {
      const params = new URLSearchParams();
      params.append('format', format);
      
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, String(value));
        }
      });

      // Note: The trailing slash is important for Django
      const url = `${this.baseUrl}/export/?${params.toString()}`;
      try {
        const response = await apiClient.get(url, { 
          responseType: 'blob',
          // Ensure trailing slash is preserved
          url: url.endsWith('/') ? url : url.replace('/export?', '/export/?')
        });
        return response.data;
      } catch (err: any) {
        // Fallback: export via list endpoint with ?export=1
        const listParams = new URLSearchParams();
        listParams.append('export', '1');
        listParams.append('format', format);
        Object.entries(filters).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            listParams.append(key, String(value));
          }
        });
        const fallbackUrl = `${this.baseUrl}/?${listParams.toString()}`;
        const fb = await apiClient.get(fallbackUrl, { responseType: 'blob' });
        return fb.data;
      }
    } catch (error) {
      console.error('Error exporting transactions:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get refunds list
   */
  async getRefunds(filters: { status?: string; txn_id?: string }): Promise<IRefund[]> {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.txn_id) params.append('txn_id', filters.txn_id);

      const response = await apiClient.get(`${this.refundUrl}/?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching refunds, using mock data:', error);
      // Return mock refunds for development
      return this.generateMockRefunds();
    }
  }

  private generateMockRefunds(): IRefund[] {
    const statuses = ['PENDING', 'APPROVED', 'COMPLETED'] as const;
    return Array.from({ length: 10 }, (_, i) => ({
      refund_id: `RFD2024${String(1000 + i).padStart(6, '0')}`,
      txn_id: `TXN2024${String(1000 + i).padStart(6, '0')}`,
      amount: Math.floor(Math.random() * 50000) + 1000,
      status: statuses[Math.floor(Math.random() * statuses.length)] as IRefund['status'],
      reason: 'Customer request for refund',
      request_date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      approved_by: Math.random() > 0.5 ? 'Admin User' : undefined,
      approved_date: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 3 * 24 * 60 * 60 * 1000).toISOString() : undefined
    }));
  }

  /**
   * Initiate a new refund
   */
  async initiateRefund(request: IRefundRequest): Promise<IRefund> {
    try {
      // Add refund_type if not provided (default to FULL)
      const refundData = {
        ...request,
        refund_type: request.refund_type || 'FULL',
        refund_reason: request.reason,
        refund_amount: request.amount
      };
      const response = await apiClient.post(`${this.refundUrl}/initiate/`, refundData);
      return response.data;
    } catch (error) {
      console.error('Error initiating refund:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Approve a refund
   */
  async approveRefund(refundId: string): Promise<IRefund> {
    try {
      const response = await apiClient.post(`${this.refundUrl}/${refundId}/approve/`);
      return response.data;
    } catch (error) {
      console.error('Error approving refund:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Reject a refund
   */
  async rejectRefund(refundId: string, reason: string): Promise<IRefund> {
    try {
      const response = await apiClient.post(`${this.refundUrl}/${refundId}/reject/`, { reason });
      return response.data;
    } catch (error) {
      console.error('Error rejecting refund:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get pending settlements
   */
  async getPendingSettlements(clientId?: string): Promise<any> {
    try {
      const params = clientId ? `?client_id=${clientId}` : '';
      const response = await apiClient.get(`${this.settlementUrl}/pending${params}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching pending settlements, using mock data:', error);
      // Return mock data for development
      return {
        total_count: 45,
        total_amount: 2500000
      };
    }
  }

  /**
   * Process settlement batch
   */
  async processSettlementBatch(txnIds: string[]): Promise<{ settlement_id: string; status: string }> {
    try {
      // Backend expects 'transaction_ids' list key
      const response = await apiClient.post(`${this.settlementUrl}/process-batch/`, { transaction_ids: txnIds });
      const data = response.data || {};
      // Normalize ID so callers can rely on settlement_id
      return { ...(data as any), settlement_id: data.settlement_id || data.batch_id, status: data.status } as any;
    } catch (error) {
      console.error('Error processing settlement batch:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Get settlement history
   */
  async getSettlementHistory(filters: any): Promise<ISettlement[]> {
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value));
      });

      const response = await apiClient.get(`${this.settlementUrl}/history/?${params.toString()}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching settlement history, using mock data:', error);
      // Return mock settlements for development
      return this.generateMockSettlements();
    }
  }

  private generateMockSettlements(): ISettlement[] {
    return Array.from({ length: 15 }, (_, i) => ({
      id: `SET2024${String(1000 + i).padStart(6, '0')}`,
      transaction_id: `TXN2024${String(1000 + i).padStart(6, '0')}`,
      payment_date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
      bank_name: ['HDFC', 'ICICI', 'SBI', 'AXIS'][Math.floor(Math.random() * 4)],
      gross_amount: Math.floor(Math.random() * 100000) + 10000,
      conv_fee: Math.floor(Math.random() * 1000) + 100,
      gst_fee: Math.floor(Math.random() * 200) + 50,
      pipe_fee: Math.floor(Math.random() * 100) + 20,
      net_amount: Math.floor(Math.random() * 95000) + 9000,
      payout_status: Math.random() > 0.3,
      settlement_utr: Math.random() > 0.5 ? `UTR${String(1000000 + i).padStart(10, '0')}` : null
    }));
  }

  /**
   * Get payment mode distribution analytics
   */
  async getPaymentModeDistribution(range: string = '7d'): Promise<IAnalytics[]> {
    try {
      const response = await apiClient.get(`${this.analyticsUrl}/?type=payment_modes&range=${range}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching payment mode distribution, using mock data:', error);
      // Return mock analytics for development
      return [
        { label: 'UPI', value: 4500, percentage: 45 },
        { label: 'Credit Card', value: 2000, percentage: 20 },
        { label: 'Debit Card', value: 1800, percentage: 18 },
        { label: 'Net Banking', value: 1200, percentage: 12 },
        { label: 'Wallet', value: 500, percentage: 5 }
      ];
    }
  }

  /**
   * Get hourly transaction volume
   */
  async getHourlyVolume(hours: number = 24): Promise<IAnalytics[]> {
    try {
      const response = await apiClient.get(`${this.analyticsUrl}/?type=hourly_volume&hours=${hours}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching hourly volume, using mock data:', error);
      // Return mock hourly data for development
      return Array.from({ length: 24 }, (_, hour) => ({
        label: `${hour}:00`,
        value: Math.floor(Math.random() * 100000) + 10000,
        count: Math.floor(Math.random() * 100) + 10
      }));
    }
  }

  /**
   * Get top clients by volume
   */
  async getTopClients(limit: number = 10): Promise<IAnalytics[]> {
    try {
      const response = await apiClient.get(`${this.analyticsUrl}/?type=top_clients&limit=${limit}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching top clients, using mock data:', error);
      // Return mock top clients for development
      return Array.from({ length: 5 }, (_, i) => ({
        label: `Client ${i + 1}`,
        value: Math.floor(Math.random() * 1000000) + 100000,
        count: Math.floor(Math.random() * 1000) + 100,
        success_rate: 90 + Math.random() * 10
      }));
    }
  }

  /**
   * Get dispute list
   */
  async getDisputes(filters?: any): Promise<IDispute[]> {
    try {
      const response = await apiClient.get('/disputes/', { params: filters });
      return response.data;
    } catch (error: any) {
      console.error('Error fetching disputes, using mock data:', error);
      // Return mock disputes for development
      return this.generateMockDisputes();
    }
  }

  private generateMockDisputes(): IDispute[] {
    const types = ['CHARGEBACK', 'FRAUD', 'DUPLICATE', 'QUALITY', 'UNAUTHORIZED', 'OTHER'] as const;
    const statuses = ['OPEN', 'INVESTIGATING', 'RESOLVED', 'REJECTED'] as const;
    return Array.from({ length: 8 }, (_, i) => ({
      dispute_id: `DSP2024${String(1000 + i).padStart(6, '0')}`,
      txn_id: `TXN2024${String(1000 + i).padStart(6, '0')}`,
      dispute_type: types[Math.floor(Math.random() * types.length)] as IDispute['dispute_type'],
      reason: 'Customer complaint about transaction',
      amount: Math.floor(Math.random() * 50000) + 1000,
      status: statuses[Math.floor(Math.random() * statuses.length)] as IDispute['status'],
      date: new Date(Date.now() - Math.random() * 14 * 24 * 60 * 60 * 1000).toISOString(),
      remarks: Math.random() > 0.5 ? 'Issue resolved with customer' : undefined
    }));
  }

  /**
   * Create a new dispute
   */
  async createDispute(dispute: Partial<IDispute>): Promise<IDispute> {
    try {
      const response = await apiClient.post(`${this.baseUrl}/disputes/`, dispute);
      return response.data;
    } catch (error) {
      console.error('Error creating dispute:', error);
      throw this.handleError(error);
    }
  }

  /**
   * Handle API errors consistently
   */
  private handleError(error: any): Error {
    // Prefer meaningful messages from backend, including nested error objects
    const data = error?.response?.data;
    if (data) {
      // If backend returns plain string
      if (typeof data === 'string') return new Error(data);
      // If backend returns { error: '...' }
      if (typeof (data as any).error === 'string') return new Error((data as any).error);
      // If backend returns { error: { message, details, ... } }
      if ((data as any).error && (typeof (data as any).error === 'object')) {
        const errObj = (data as any).error;
        // Prefer detailed cause over generic label
        let msg = errObj.details || errObj.message || errObj.type;
        if (Array.isArray(msg)) msg = msg.join(', ');
        if (!msg || typeof msg !== 'string') msg = JSON.stringify(errObj);
        return new Error(msg);
      }
      // If backend returns { message: '...' }
      if ((data as any).message) return new Error((data as any).message);
      // Fallback to JSON string
      return new Error(JSON.stringify(data));
    }
    if (error?.request) {
      return new Error('Network error. Please check your connection.');
    }
    return new Error(error?.message || 'An unexpected error occurred');
  }
}

// Export singleton instance
export const transactionService = new TransactionService();

// Export types for use in components
export type { 
  ITransaction, 
  ITransactionFilter, 
  ITransactionStats,
  IRefund,
  IRefundRequest,
  ISettlement,
  IDispute,
  IAnalytics,
  IPaginatedResponse
};
