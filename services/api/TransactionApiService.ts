import { BaseApiService } from './base/BaseApiService';

export interface Transaction {
  id: string;
  merchantTransactionId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'success' | 'failed' | 'cancelled' | 'refunded' | 'disputed';
  paymentMethod: string;
  gatewayTransactionId?: string;
  clientId: string;
  clientName: string;
  customerEmail: string;
  customerPhone?: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  settlementDate?: string;
  fees: {
    gateway: number;
    platform: number;
    gst: number;
    total: number;
  };
  metadata?: Record<string, any>;
}

export interface TransactionSearchFilter {
  id?: string;
  merchantTransactionId?: string;
  status?: Transaction['status'][];
  paymentMethod?: string[];
  clientId?: string[];
  amountFrom?: number;
  amountTo?: number;
  dateFrom?: string;
  dateTo?: string;
  customerEmail?: string;
  customerPhone?: string;
  page?: number;
  pageSize?: number;
  sortBy?: 'createdAt' | 'amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface TransactionSearchResponse {
  transactions: Transaction[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrev: boolean;
  summary: {
    totalAmount: number;
    successCount: number;
    failedCount: number;
    pendingCount: number;
  };
}

export interface RefundRequest {
  amount: number;
  reason: string;
  notes?: string;
}

export interface RefundResponse {
  id: string;
  transactionId: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  gatewayRefundId?: string;
  reason: string;
  notes?: string;
  processedAt?: string;
  createdAt: string;
}

export interface BulkOperation {
  operation: 'refund' | 'cancel' | 'retry' | 'export';
  transactionIds: string[];
  parameters?: Record<string, any>;
}

export interface BulkOperationResponse {
  operationId: string;
  status: 'queued' | 'processing' | 'completed' | 'failed';
  totalItems: number;
  processedItems: number;
  successCount: number;
  failureCount: number;
  errors: {
    transactionId: string;
    error: string;
  }[];
  createdAt: string;
  completedAt?: string;
}

export interface TransactionDetails extends Transaction {
  timeline: {
    status: string;
    timestamp: string;
    notes?: string;
    user?: string;
  }[];
  refunds: RefundResponse[];
  disputes: {
    id: string;
    amount: number;
    reason: string;
    status: 'pending' | 'resolved' | 'lost';
    createdAt: string;
    resolvedAt?: string;
  }[];
  webhookLogs: {
    id: string;
    url: string;
    status: number;
    response: string;
    attempt: number;
    sentAt: string;
  }[];
}

export class TransactionApiService extends BaseApiService {
  public readonly serviceName = 'TransactionService';
  protected readonly endpoint = '/transactions';

  async searchTransactions(filter: TransactionSearchFilter = {}): Promise<TransactionSearchResponse> {
    return this.requestWithConfig<TransactionSearchResponse>(
      'transactionSearch',
      'POST',
      filter
    );
  }

  async getTransaction(id: string): Promise<TransactionDetails> {
    return this.requestWithConfig<TransactionDetails>(
      'transactionDetails',
      'GET',
      undefined,
      { id }
    );
  }

  async getTransactionsPaginated(
    page: number = 1,
    pageSize: number = 50,
    filter: Omit<TransactionSearchFilter, 'page' | 'pageSize'> = {}
  ): Promise<TransactionSearchResponse> {
    const pag = await this.getPaginated<Transaction>('', page, pageSize, filter);
    const summary = pag.data.reduce(
      (acc, t) => {
        acc.totalAmount += (t.amount ?? 0);
        const s = (t.status || '').toLowerCase();
        if (s === 'success') acc.successCount += 1;
        else if (s === 'failed') acc.failedCount += 1;
        else acc.pendingCount += 1;
        return acc;
      },
      { totalAmount: 0, successCount: 0, failedCount: 0, pendingCount: 0 }
    );
    return {
      transactions: pag.data,
      total: pag.total,
      page: pag.page,
      pageSize: pag.pageSize,
      hasNext: pag.hasNext,
      hasPrev: pag.hasPrev,
      summary,
    };
  }

  async refundTransaction(
    transactionId: string,
    refundRequest: RefundRequest
  ): Promise<RefundResponse> {
    return this.requestWithConfig<RefundResponse>(
      'transactionRefund',
      'POST',
      refundRequest,
      { id: transactionId }
    );
  }

  async getRefundStatus(refundId: string): Promise<RefundResponse> {
    return this.get<RefundResponse>(`/refunds/${refundId}`);
  }

  async retryTransaction(transactionId: string): Promise<Transaction> {
    return this.post<Transaction>(`/${transactionId}/retry`);
  }

  async cancelTransaction(
    transactionId: string,
    reason: string
  ): Promise<Transaction> {
    return this.post<Transaction>(`/${transactionId}/cancel`, { reason });
  }

  async getTransactionTimeline(transactionId: string): Promise<TransactionDetails['timeline']> {
    return this.get<TransactionDetails['timeline']>(`/${transactionId}/timeline`);
  }

  async addTransactionNote(
    transactionId: string,
    note: string
  ): Promise<void> {
    return this.post<void>(`/${transactionId}/notes`, { note });
  }

  async bulkOperation(operation: BulkOperation): Promise<BulkOperationResponse> {
    return this.requestWithConfig<BulkOperationResponse>(
      'bulkTransactionOperations',
      'POST',
      operation
    );
  }

  async getBulkOperationStatus(operationId: string): Promise<BulkOperationResponse> {
    return this.get<BulkOperationResponse>(`/bulk/${operationId}`);
  }

  async exportTransactions(
    filter: TransactionSearchFilter & { format: 'csv' | 'xlsx' | 'pdf' },
    filename?: string
  ): Promise<void> {
    const exportData = {
      ...filter,
      operation: 'export'
    } as any;

    // Convert params to string map for download
    const params: Record<string, string> = {};
    Object.entries(exportData).forEach(([k, v]) => {
      if (v === undefined || v === null) return;
      if (Array.isArray(v)) {
        params[k] = v.join(',');
      } else if (typeof v === 'object') {
        params[k] = JSON.stringify(v);
      } else {
        params[k] = String(v);
      }
    });

    await this.downloadFile(
      'transactionExport',
      params,
      filename || `transactions-${new Date().toISOString().split('T')[0]}.${filter.format}`
    );
  }

  async getTransactionStats(filter: {
    dateFrom?: string;
    dateTo?: string;
    clientId?: string;
    paymentMethod?: string;
  } = {}): Promise<{
    totalTransactions: number;
    totalVolume: number;
    successRate: number;
    averageAmount: number;
    statusBreakdown: Record<Transaction['status'], number>;
    paymentMethodBreakdown: Record<string, number>;
    hourlyStats: {
      hour: number;
      transactions: number;
      volume: number;
    }[];
  }> {
    const queryString = this.buildQueryString(filter);
    const path = `/stats${queryString ? `?${queryString}` : ''}`;
    return this.get<{
      totalTransactions: number;
      totalVolume: number;
      successRate: number;
      averageAmount: number;
      statusBreakdown: Record<Transaction['status'], number>;
      paymentMethodBreakdown: Record<string, number>;
      hourlyStats: {
        hour: number;
        transactions: number;
        volume: number;
      }[];
    }>(path);
  }

  async getFailedTransactions(
    page: number = 1,
    pageSize: number = 50,
    filter: {
      dateFrom?: string;
      dateTo?: string;
      errorCode?: string;
      paymentMethod?: string[];
    } = {}
  ): Promise<{
    transactions: Transaction[];
    total: number;
    errorAnalysis: {
      errorCode: string;
      count: number;
      percentage: number;
    }[];
  }> {
    const searchFilter: TransactionSearchFilter = {
      ...filter,
      status: ['failed'],
      page,
      pageSize
    };

    const res = await this.searchTransactions(searchFilter);
    // Derive a simple error analysis if needed
    const analysisMap = new Map<string, number>();
    res.transactions.forEach((t) => {
      const code = (t as any).errorCode || (t as any).pg_error_code || 'UNKNOWN';
      analysisMap.set(code, (analysisMap.get(code) || 0) + 1);
    });
    const total = res.total || res.transactions.length;
    const errorAnalysis = Array.from(analysisMap.entries()).map(([errorCode, count]) => ({
      errorCode,
      count,
      percentage: total ? +(count * 100 / total).toFixed(2) : 0,
    }));

    return {
      transactions: res.transactions,
      total: res.total,
      errorAnalysis,
    };
  }

  async getRecurringTransactionPatterns(clientId?: string): Promise<{
    patterns: {
      customerEmail: string;
      frequency: 'daily' | 'weekly' | 'monthly';
      averageAmount: number;
      transactionCount: number;
      lastTransaction: string;
    }[];
  }> {
    const queryString = clientId ? this.buildQueryString({ clientId }) : '';
    const path = `/patterns/recurring${queryString ? `?${queryString}` : ''}`;
    return this.get<{
      patterns: {
        customerEmail: string;
        frequency: 'daily' | 'weekly' | 'monthly';
        averageAmount: number;
        transactionCount: number;
        lastTransaction: string;
      }[];
    }>(path);
  }
}

export const transactionService = new TransactionApiService();
