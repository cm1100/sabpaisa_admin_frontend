import { mockApi } from '@/services/api/mockApi';

describe('MockApiService', () => {
  describe('getDashboardMetrics', () => {
    it('should return dashboard metrics', async () => {
      const metrics = await mockApi.getDashboardMetrics();
      
      expect(metrics).toBeDefined();
      expect(metrics.overview).toBeDefined();
      expect(metrics.trends).toBeDefined();
      expect(metrics.hourlyData).toBeDefined();
      expect(metrics.paymentMethods).toBeDefined();
    });

    it('should have proper delay simulation', async () => {
      const startTime = Date.now();
      await mockApi.getDashboardMetrics();
      const endTime = Date.now();
      
      // Should have at least some delay (>= 100ms)
      expect(endTime - startTime).toBeGreaterThanOrEqual(100);
    });
  });

  describe('getClients', () => {
    it('should return paginated client data', async () => {
      const result = await mockApi.getClients({
        page: 1,
        limit: 10,
      });
      
      expect(result.data).toHaveLength(10);
      expect(result.page).toBe(1);
      expect(result.total).toBeGreaterThan(0);
      expect(result.totalPages).toBeGreaterThan(0);
    });

    it('should filter clients by search term', async () => {
      const result = await mockApi.getClients({
        search: 'test',
        page: 1,
        limit: 10,
      });
      
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
    });

    it('should filter clients by status', async () => {
      const result = await mockApi.getClients({
        status: 'ACTIVE',
        page: 1,
        limit: 10,
      });
      
      result.data.forEach(client => {
        expect(client.status).toBe('ACTIVE');
      });
    });
  });

  describe('createClient', () => {
    it('should create a new client', async () => {
      const clientData = {
        clientName: 'Test Client',
        email: 'test@example.com',
        phone: '1234567890',
      };
      
      const newClient = await mockApi.createClient(clientData);
      
      expect(newClient.id).toBeDefined();
      expect(newClient.clientCode).toBeDefined();
      expect(newClient.clientName).toBe(clientData.clientName);
      expect(newClient.email).toBe(clientData.email);
      expect(newClient.status).toBe('PENDING');
    });
  });

  describe('updateClient', () => {
    it('should update an existing client', async () => {
      // First create a client
      const clientData = {
        clientName: 'Original Name',
        email: 'original@example.com',
      };
      
      const created = await mockApi.createClient(clientData);
      
      // Then update it
      const updatedData = {
        clientName: 'Updated Name',
      };
      
      const updated = await mockApi.updateClient(created.id, updatedData);
      
      expect(updated?.id).toBe(created.id);
      expect(updated?.name).toBe('Updated Name');
      expect(updated?.updatedAt).toBeDefined();
    });

    it('should throw error for non-existent client', async () => {
      await expect(
        mockApi.updateClient('non-existent-id', {})
      ).rejects.toThrow('Client not found');
    });
  });

  describe('getTransactions', () => {
    it('should return paginated transaction data', async () => {
      const result = await mockApi.getTransactions({
        page: 1,
        limit: 20,
      });
      
      expect(result.data).toHaveLength(20);
      expect(result.page).toBe(1);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should filter transactions by status', async () => {
      const result = await mockApi.getTransactions({
        status: 'SUCCESS',
        page: 1,
        limit: 10,
      });
      
      result.data.forEach(txn => {
        expect(txn.status).toBe('SUCCESS');
      });
    });

    it('should filter transactions by date range', async () => {
      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-12-31');
      
      const result = await mockApi.getTransactions({
        fromDate,
        toDate,
        page: 1,
        limit: 10,
      });
      
      result.data.forEach(txn => {
        const txnDate = new Date(txn.createdAt);
        expect(txnDate >= fromDate).toBe(true);
        expect(txnDate <= toDate).toBe(true);
      });
    });
  });

  describe('refundTransaction', () => {
    it('should create a refund for successful transaction', async () => {
      // Get a successful transaction
      const transactions = await mockApi.getTransactions({
        status: 'SUCCESS',
        page: 1,
        limit: 1,
      });
      
      const txn = transactions.data[0];
      if (!txn) {
        throw new Error('No successful transaction found');
      }
      
      const refund = await mockApi.refundTransaction(
        txn.id,
        txn.amount / 2,
        'Customer request'
      );
      
      expect(refund.transactionType).toBe('REFUND');
      expect(refund.parentTransactionId).toBe(txn.id);
      expect(refund.status).toBe('PROCESSING');
    });

    it('should throw error for invalid refund amount', async () => {
      const transactions = await mockApi.getTransactions({
        status: 'SUCCESS',
        page: 1,
        limit: 1,
      });
      
      const txn = transactions.data[0];
      if (!txn) {
        throw new Error('No successful transaction found');
      }
      
      await expect(
        mockApi.refundTransaction(txn.id, txn.amount * 2, 'Invalid')
      ).rejects.toThrow('Refund amount cannot exceed transaction amount');
    });
  });

  describe('getSettlements', () => {
    it('should return settlement data', async () => {
      const result = await mockApi.getSettlements({
        page: 1,
        limit: 10,
      });
      
      expect(result.data).toBeDefined();
      expect(Array.isArray(result.data)).toBe(true);
      expect(result.total).toBeGreaterThan(0);
    });

    it('should filter settlements by status', async () => {
      const result = await mockApi.getSettlements({
        status: 'COMPLETED',
        page: 1,
        limit: 10,
      });
      
      result.data.forEach(settlement => {
        expect(settlement.status).toBe('COMPLETED');
      });
    });
  });

  describe('exportData', () => {
    it('should export data as blob', async () => {
      const blob = await mockApi.exportData('clients', 'csv');
      
      expect(blob).toBeInstanceOf(Blob);
      expect(blob.type).toBe('text/plain');
    });

    it('should support different export formats', async () => {
      const formats: Array<'csv' | 'excel' | 'pdf'> = ['csv', 'excel', 'pdf'];
      
      for (const format of formats) {
        const blob = await mockApi.exportData('transactions', format);
        expect(blob).toBeInstanceOf(Blob);
      }
    });
  });

  describe('subscribeToUpdates', () => {
    it('should return unsubscribe function', async () => {
      const callback = jest.fn();
      const unsubscribe = await mockApi.subscribeToUpdates(callback);
      
      expect(typeof unsubscribe).toBe('function');
      
      // Clean up
      unsubscribe();
    });

    it('should call callback with updates', async () => {
      jest.useFakeTimers();
      const callback = jest.fn();
      
      const unsubscribe = await mockApi.subscribeToUpdates(callback);
      
      // Fast-forward time
      jest.advanceTimersByTime(5000);
      
      expect(callback).toHaveBeenCalled();
      
      const callArg = callback.mock.calls[0][0];
      expect(callArg).toHaveProperty('type');
      expect(callArg).toHaveProperty('data');
      
      // Clean up
      unsubscribe();
      jest.useRealTimers();
    });
  });
});