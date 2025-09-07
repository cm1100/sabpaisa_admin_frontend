/**
 * Unit tests for ClientApiService
 */
import { ClientApiService } from './ClientApiService';
import { ClientStatus, ClientType, KYCStatus } from '@/interfaces/models/IClient';

// Mock the BaseApiService methods
jest.mock('./base/BaseApiService');

describe('ClientApiService', () => {
  let service: ClientApiService;
  
  beforeEach(() => {
    service = new ClientApiService();
    jest.clearAllMocks();
  });

  describe('CRUD Operations', () => {
    it('should get client by ID', async () => {
      const mockClient = {
        id: '1',
        clientCode: 'CL001',
        clientName: 'Test Client',
        status: ClientStatus.ACTIVE,
      };

      jest.spyOn(service as any, 'get').mockResolvedValue(mockClient);

      const result = await service.getById('1');

      expect(service['get']).toHaveBeenCalledWith('/1');
      expect(result).toEqual(mockClient);
    });

    it('should get all clients with search params', async () => {
      const params = {
        status: ClientStatus.ACTIVE,
        clientType: ClientType.BUSINESS,
        page: 1,
        limit: 10,
      };
      const mockClients = [
        { id: '1', clientName: 'Client 1' },
        { id: '2', clientName: 'Client 2' },
      ];

      jest.spyOn(service as any, 'get').mockResolvedValue(mockClients);
      jest.spyOn(service as any, 'buildQueryString').mockReturnValue('status=ACTIVE&clientType=BUSINESS&page=1&limit=10');

      const result = await service.getAll(params);

      expect(service['buildQueryString']).toHaveBeenCalledWith(params);
      expect(service['get']).toHaveBeenCalledWith('?status=ACTIVE&clientType=BUSINESS&page=1&limit=10');
      expect(result).toEqual(mockClients);
    });

    it('should create a new client', async () => {
      const createData = {
        clientName: 'New Client',
        legalName: 'New Client Ltd',
        clientType: ClientType.BUSINESS,
        email: 'client@example.com',
        phone: '+911234567890',
        address: {
          line1: '123 Street',
          city: 'Mumbai',
          state: 'Maharashtra',
          country: 'India',
          pincode: '400001',
        },
        businessCategory: 'E-commerce',
        industryType: 'Retail',
      };
      const mockResponse = { id: '1', ...createData };

      jest.spyOn(service as any, 'post').mockResolvedValue(mockResponse);

      const result = await service.create(createData);

      expect(service['post']).toHaveBeenCalledWith('', createData);
      expect(result).toEqual(mockResponse);
    });

    it('should update a client', async () => {
      const updateData = {
        clientName: 'Updated Client',
        status: ClientStatus.INACTIVE,
      };
      const mockResponse = { id: '1', ...updateData };

      jest.spyOn(service as any, 'patch').mockResolvedValue(mockResponse);

      const result = await service.update('1', updateData);

      expect(service['patch']).toHaveBeenCalledWith('/1', updateData);
      expect(result).toEqual(mockResponse);
    });

    it('should delete a client', async () => {
      jest.spyOn(service as any, 'delete').mockResolvedValue({ success: true });

      const result = await service.delete('1');

      expect(service['delete']).toHaveBeenCalledWith('/1');
      expect(result).toBe(true);
    });
  });

  describe('Pagination and Search', () => {
    it('should get paginated clients', async () => {
      const mockResponse = {
        data: [{ id: '1' }, { id: '2' }],
        total: 100,
        page: 1,
        totalPages: 10,
      };

      jest.spyOn(service as any, 'get').mockResolvedValue(mockResponse);
      jest.spyOn(service as any, 'buildQueryString').mockReturnValue('page=1&limit=10');

      const result = await service.findPaginated(1, 10);

      expect(service['get']).toHaveBeenCalledWith('/paginated?page=1&limit=10');
      expect(result).toEqual(mockResponse);
    });

    it('should search clients', async () => {
      const mockClients = [
        { id: '1', clientName: 'Search Result 1' },
        { id: '2', clientName: 'Search Result 2' },
      ];

      jest.spyOn(service as any, 'get').mockResolvedValue(mockClients);
      jest.spyOn(service as any, 'buildQueryString').mockReturnValue('query=test');

      const result = await service.search('test');

      expect(service['get']).toHaveBeenCalledWith('/search?query=test');
      expect(result).toEqual(mockClients);
    });

    it('should search with pagination', async () => {
      const mockResponse = {
        data: [{ id: '1' }],
        total: 50,
        page: 1,
        totalPages: 5,
      };

      jest.spyOn(service as any, 'get').mockResolvedValue(mockResponse);
      jest.spyOn(service as any, 'buildQueryString').mockReturnValue('query=test&page=1&limit=10');

      const result = await service.searchWithPagination('test', 1, 10);

      expect(service['get']).toHaveBeenCalledWith('/search/paginated?query=test&page=1&limit=10');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Bulk Operations', () => {
    it('should create multiple clients', async () => {
      const clientsData = [
        { clientName: 'Client 1' },
        { clientName: 'Client 2' },
      ];
      const mockResponse = [
        { id: '1', clientName: 'Client 1' },
        { id: '2', clientName: 'Client 2' },
      ];

      jest.spyOn(service as any, 'post').mockResolvedValue(mockResponse);

      const result = await service.createMany(clientsData);

      expect(service['post']).toHaveBeenCalledWith('/bulk', { clients: clientsData });
      expect(result).toEqual(mockResponse);
    });

    it('should update multiple clients', async () => {
      const ids = ['1', '2', '3'];
      const updateData = { status: ClientStatus.INACTIVE };
      const mockResponse = [
        { id: '1', status: ClientStatus.INACTIVE },
        { id: '2', status: ClientStatus.INACTIVE },
        { id: '3', status: ClientStatus.INACTIVE },
      ];

      jest.spyOn(service as any, 'patch').mockResolvedValue(mockResponse);

      const result = await service.updateMany(ids, updateData);

      expect(service['patch']).toHaveBeenCalledWith('/bulk', { ids, data: updateData });
      expect(result).toEqual(mockResponse);
    });

    it('should delete multiple clients', async () => {
      const ids = ['1', '2', '3'];

      jest.spyOn(service as any, 'post').mockResolvedValue({ success: true });

      const result = await service.deleteMany(ids);

      expect(service['post']).toHaveBeenCalledWith('/bulk/delete', { ids });
      expect(result).toBe(true);
    });
  });

  describe('Special Operations', () => {
    it('should get client statistics', async () => {
      const mockStats = {
        total: 1000,
        active: 800,
        inactive: 150,
        pending: 50,
        totalVolume: 10000000,
        averageVolume: 10000,
      };

      jest.spyOn(service as any, 'get').mockResolvedValue(mockStats);

      const result = await service.getStatistics();

      expect(service['get']).toHaveBeenCalledWith('/statistics');
      expect(result).toEqual(mockStats);
    });

    it('should get client by code', async () => {
      const mockClient = { id: '1', clientCode: 'CL001' };

      jest.spyOn(service as any, 'get').mockResolvedValue(mockClient);

      const result = await service.getByCode('CL001');

      expect(service['get']).toHaveBeenCalledWith('/code/CL001');
      expect(result).toEqual(mockClient);
    });

    it('should verify KYC', async () => {
      const documents = [{ type: 'PAN', number: 'ABCDE1234F' }];
      const mockResponse = {
        success: true,
        kycStatus: KYCStatus.VERIFIED,
        message: 'KYC verified successfully',
      };

      jest.spyOn(service as any, 'post').mockResolvedValue(mockResponse);

      const result = await service.verifyKYC('1', documents);

      expect(service['post']).toHaveBeenCalledWith('/1/kyc/verify', { documents });
      expect(result).toEqual(mockResponse);
    });

    it('should update client configuration', async () => {
      const configuration = {
        dailyTransactionLimit: 1000000,
        enabledPaymentMethods: ['UPI', 'CARD'],
      };
      const mockResponse = { id: '1', configuration };

      jest.spyOn(service as any, 'patch').mockResolvedValue(mockResponse);

      const result = await service.updateConfiguration('1', configuration);

      expect(service['patch']).toHaveBeenCalledWith('/1/configuration', configuration);
      expect(result).toEqual(mockResponse);
    });

    it('should activate client', async () => {
      const mockResponse = { id: '1', status: ClientStatus.ACTIVE };

      jest.spyOn(service as any, 'post').mockResolvedValue(mockResponse);

      const result = await service.activate('1');

      expect(service['post']).toHaveBeenCalledWith('/1/activate', undefined);
      expect(result).toEqual(mockResponse);
    });

    it('should deactivate client with reason', async () => {
      const reason = 'Compliance issues';
      const mockResponse = { id: '1', status: ClientStatus.INACTIVE };

      jest.spyOn(service as any, 'post').mockResolvedValue(mockResponse);

      const result = await service.deactivate('1', reason);

      expect(service['post']).toHaveBeenCalledWith('/1/deactivate', { reason });
      expect(result).toEqual(mockResponse);
    });
  });

  describe('Service Properties', () => {
    it('should have correct service name', () => {
      expect(service.serviceName).toBe('ClientApiService');
    });

    it('should have correct endpoint', () => {
      expect(service['endpoint']).toBe('/api/clients');
    });
  });
});