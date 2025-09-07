/**
 * Mock API Service
 * Simulates API responses with realistic delays
 * Following SOLID principles with proper type safety
 */
import {
  generateMockClients,
  generateMockTransactions,
  generateDashboardMetrics,
  generateSettlementData,
  generateTimeSeriesData,
} from '@/utils/mockData';
import {
  IClient,
  ITransaction,
  ISettlement,
  PaginatedResponse,
  ApiResponse,
  BulkOperationResult,
  ExportFormat,
  QueryParams,
  DashboardMetrics,
  TimeSeriesData
} from '@/types';

// Simulate network delay
const delay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Cache for consistent data with proper typing
let clientsCache: IClient[] | null = null;
let transactionsCache: ITransaction[] | null = null;

class MockApiService {
  // Dashboard APIs
  async getDashboardMetrics() {
    await delay(200);
    return generateDashboardMetrics();
  }

  async getTimeSeriesData(days: number = 30) {
    await delay(300);
    return generateTimeSeriesData(days);
  }

  // Client APIs
  async getClients(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
  }) {
    await delay(400);
    
    if (!clientsCache) {
      clientsCache = generateMockClients(500);
    }
    
    let filtered = [...clientsCache];
    
    // Apply search filter
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(client =>
        client.clientName.toLowerCase().includes(search) ||
        client.clientCode.toLowerCase().includes(search) ||
        client.email.toLowerCase().includes(search)
      );
    }
    
    // Apply status filter
    if (params?.status) {
      filtered = filtered.filter(client => client.status === params.status);
    }
    
    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  async getClientById(id: string) {
    await delay(200);
    
    if (!clientsCache) {
      clientsCache = generateMockClients(500);
    }
    
    const client = clientsCache.find(c => c.id === id);
    if (!client) {
      throw new Error('Client not found');
    }
    
    return client;
  }

  async createClient(data: any) {
    await delay(500);
    
    const newClient = {
      ...data,
      id: `client-${Date.now()}`,
      clientCode: `CL${String(Date.now()).slice(-5)}`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: 'PENDING',
      kycStatus: 'NOT_STARTED',
      totalTransactions: 0,
      totalVolume: 0,
    };
    
    if (clientsCache) {
      clientsCache.unshift(newClient);
    }
    
    return newClient;
  }

  async updateClient(id: string, data: any) {
    await delay(400);
    
    if (!clientsCache) {
      clientsCache = generateMockClients(500);
    }
    
    const index = clientsCache.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Client not found');
    }
    
    clientsCache[index] = {
      ...clientsCache[index],
      ...data,
      updatedAt: new Date(),
    };
    
    return clientsCache[index];
  }

  async deleteClient(id: string) {
    await delay(300);
    
    if (!clientsCache) {
      clientsCache = generateMockClients(500);
    }
    
    const index = clientsCache.findIndex(c => c.id === id);
    if (index === -1) {
      throw new Error('Client not found');
    }
    
    clientsCache.splice(index, 1);
    return { success: true };
  }

  async getClientStatistics() {
    await delay(200);
    
    if (!clientsCache) {
      clientsCache = generateMockClients(500);
    }
    
    return {
      total: clientsCache.length,
      active: clientsCache.filter(c => c.status === 'ACTIVE').length,
      inactive: clientsCache.filter(c => c.status === 'INACTIVE').length,
      pending: clientsCache.filter(c => c.status === 'PENDING').length,
      totalVolume: clientsCache.reduce((sum, c) => sum + (c.totalVolume || 0), 0),
      averageVolume: clientsCache.reduce((sum, c) => sum + (c.totalVolume || 0), 0) / clientsCache.length,
    };
  }

  // Transaction APIs
  async getTransactions(params?: {
    page?: number;
    limit?: number;
    search?: string;
    status?: string;
    clientId?: string;
    fromDate?: Date;
    toDate?: Date;
  }) {
    await delay(400);
    
    if (!transactionsCache) {
      transactionsCache = generateMockTransactions(5000);
    }
    
    let filtered = [...transactionsCache];
    
    // Apply filters
    if (params?.search) {
      const search = params.search.toLowerCase();
      filtered = filtered.filter(txn =>
        txn.transactionId.toLowerCase().includes(search) ||
        txn.referenceId?.toLowerCase().includes(search) ||
        txn.customerEmail?.toLowerCase().includes(search)
      );
    }
    
    if (params?.status) {
      filtered = filtered.filter(txn => txn.status === params.status);
    }
    
    if (params?.clientId) {
      filtered = filtered.filter(txn => txn.clientId === params.clientId);
    }
    
    if (params?.fromDate) {
      filtered = filtered.filter(txn => new Date(txn.createdAt) >= params.fromDate!);
    }
    
    if (params?.toDate) {
      filtered = filtered.filter(txn => new Date(txn.createdAt) <= params.toDate!);
    }
    
    // Apply pagination
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  async getTransactionById(id: string) {
    await delay(200);
    
    if (!transactionsCache) {
      transactionsCache = generateMockTransactions(5000);
    }
    
    const transaction = transactionsCache.find(t => t.id === id);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    return transaction;
  }

  async refundTransaction(transactionId: string, amount: number, reason: string) {
    await delay(800);
    
    if (!transactionsCache) {
      transactionsCache = generateMockTransactions(5000);
    }
    
    const transaction = transactionsCache.find(t => t.id === transactionId);
    if (!transaction) {
      throw new Error('Transaction not found');
    }
    
    if (transaction.status !== 'SUCCESS') {
      throw new Error('Only successful transactions can be refunded');
    }
    
    if (amount > transaction.amount) {
      throw new Error('Refund amount cannot exceed transaction amount');
    }
    
    // Create refund transaction
    const refundTxn = {
      ...transaction,
      id: `txn-refund-${Date.now()}`,
      transactionId: `REFUND${Date.now()}`,
      transactionType: 'REFUND',
      amount,
      parentTransactionId: transactionId,
      status: 'PROCESSING',
      initiatedAt: new Date(),
    };
    
    transactionsCache.unshift(refundTxn);
    
    // Update original transaction
    transaction.refundedAmount = (transaction.refundedAmount || 0) + amount;
    if (transaction.refundedAmount >= transaction.amount) {
      transaction.status = 'REFUNDED';
    } else {
      transaction.status = 'PARTIALLY_REFUNDED';
    }
    
    return refundTxn;
  }

  async getTransactionStatistics() {
    await delay(200);
    
    if (!transactionsCache) {
      transactionsCache = generateMockTransactions(5000);
    }
    
    const successTxns = transactionsCache.filter(t => t.status === 'SUCCESS');
    const failedTxns = transactionsCache.filter(t => t.status === 'FAILED');
    
    return {
      total: transactionsCache.length,
      success: successTxns.length,
      failed: failedTxns.length,
      pending: transactionsCache.filter(t => t.status === 'PENDING').length,
      totalVolume: transactionsCache.reduce((sum, t) => sum + t.amount, 0),
      successVolume: successTxns.reduce((sum, t) => sum + t.amount, 0),
      failedVolume: failedTxns.reduce((sum, t) => sum + t.amount, 0),
      avgTransactionValue: transactionsCache.reduce((sum, t) => sum + t.amount, 0) / transactionsCache.length,
      successRate: (successTxns.length / transactionsCache.length) * 100,
    };
  }

  // Settlement APIs
  async getSettlements(params?: {
    page?: number;
    limit?: number;
    status?: string;
    clientId?: string;
  }) {
    await delay(300);
    
    const settlements = generateSettlementData();
    const allSettlements = [...settlements.pending, ...settlements.processed];
    
    let filtered = allSettlements;
    
    if (params?.status) {
      filtered = filtered.filter(s => s.status === params.status);
    }
    
    if (params?.clientId) {
      filtered = filtered.filter(s => s.clientId === params.clientId);
    }
    
    const page = params?.page || 1;
    const limit = params?.limit || 10;
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      data: filtered.slice(start, end),
      total: filtered.length,
      page,
      totalPages: Math.ceil(filtered.length / limit),
    };
  }

  async processSettlement(settlementId: string) {
    await delay(1000);
    
    return {
      id: settlementId,
      status: 'PROCESSING',
      message: 'Settlement is being processed',
      estimatedTime: '2-4 hours',
    };
  }

  async getSettlementReport(params?: {
    fromDate?: Date;
    toDate?: Date;
    clientId?: string;
  }) {
    await delay(500);
    
    return {
      totalSettled: Math.floor(80000000 + Math.random() * 20000000),
      totalPending: Math.floor(10000000 + Math.random() * 5000000),
      settlementsProcessed: Math.floor(100 + Math.random() * 50),
      averageSettlementTime: '3.5 hours',
      successRate: 99.5,
    };
  }

  // Bulk operations
  async bulkUploadClients(file: File) {
    await delay(2000);
    
    return {
      success: Math.floor(80 + Math.random() * 20),
      failed: Math.floor(Math.random() * 5),
      errors: [],
      message: 'Bulk upload completed successfully',
    };
  }

  async exportData(type: 'clients' | 'transactions' | 'settlements', format: 'csv' | 'excel' | 'pdf') {
    await delay(1500);
    
    // Create a mock blob
    const content = `Mock ${type} data in ${format} format`;
    const blob = new Blob([content], { type: 'text/plain' });
    
    return blob;
  }

  // Real-time simulation
  async subscribeToUpdates(callback: (data: any) => void) {
    // Simulate real-time updates every 5 seconds
    const interval = setInterval(() => {
      const update = {
        type: ['transaction', 'settlement', 'alert'][Math.floor(Math.random() * 3)],
        data: {
          id: `update-${Date.now()}`,
          message: 'New update received',
          timestamp: new Date(),
        },
      };
      callback(update);
    }, 5000);
    
    // Return unsubscribe function
    return () => clearInterval(interval);
  }
}

// Export singleton instance
export const mockApi = new MockApiService();