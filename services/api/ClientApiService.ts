/**
 * Client API Service
 * Implements client-related API operations following SOLID principles
 */
import { BaseApiService } from './base/BaseApiService';
import { ICrudService } from '@/interfaces/base/IService';
import { 
  IClient, 
  IClientCreateDTO, 
  IClientUpdateDTO, 
  IClientSearchParams 
} from '@/interfaces/models/IClient';
import { 
  IPaginatable, 
  ISearchable, 
  IBulkOperations 
} from '@/interfaces/base/IRepository';

/**
 * Client API Service implementation
 * Follows Single Responsibility Principle - handles only client API operations
 */
export class ClientApiService extends BaseApiService {
  
  protected readonly endpoint = '/clients';
  public readonly serviceName = 'ClientApiService';

  /**
   * Get client by ID
   */
  async getById(id: string): Promise<IClient> {
    return this.get<IClient>(`/${id}/`);
  }

  // (export and bulkUpload are defined later with enhanced behavior)

  /**
   * Get all clients with optional parameters
   */
  async getAll(params?: IClientSearchParams): Promise<{
    results?: IClient[];
    count?: number;
    next?: string;
    previous?: string;
  } | IClient[]> {
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    return this.get(queryString);
  }

  /**
   * Create a new client
   */
  async create(data: IClientCreateDTO): Promise<IClient> {
    return this.post<IClient>('/', data as any);
  }

  /**
   * Update an existing client
   */
  async update(id: string, data: IClientUpdateDTO): Promise<IClient> {
    return this.patch<IClient>(`/${id}/`, data as any);
  }

  /**
   * Delete a client (soft delete)
   */
  async deleteClient(id: string): Promise<boolean> {
    // Some endpoints return 204 No Content on successful delete
    try {
      const result = await this.delete<{ success?: boolean }>(`/${id}/`);
      return result?.success !== false;
    } catch (err: any) {
      // If backend returns 204, axios treats it as success with empty data
      if (err?.response?.status === 204) return true;
      throw err;
    }
  }

  /**
   * Get paginated clients
   */
  async findPaginated(
    page: number, 
    limit: number, 
    params?: IClientSearchParams
  ): Promise<{
    data: IClient[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const searchParams = {
      ...params,
      page,
      limit,
    };
    return this.get(`/paginated?${this.buildQueryString(searchParams)}`);
  }

  /**
   * Search clients
   */
  async search(query: string, params?: any): Promise<IClient[]> {
    const searchParams = {
      ...params,
      query,
    };
    return this.get(`/search?${this.buildQueryString(searchParams)}`);
  }

  /**
   * Search clients with pagination
   */
  async searchWithPagination(
    query: string, 
    page: number, 
    limit: number
  ): Promise<{
    data: IClient[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const searchParams = {
      query,
      page,
      limit,
    };
    return this.get(`/search/paginated?${this.buildQueryString(searchParams)}`);
  }

  /**
   * Bulk create clients
   */
  async createMany(data: Partial<IClient>[]): Promise<IClient[]> {
    return this.post('/bulk', { clients: data });
  }

  /**
   * Bulk update clients
   */
  async updateMany(ids: string[], data: Partial<IClient>): Promise<IClient[]> {
    return this.patch('/bulk', { ids, data });
  }

  /**
   * Bulk delete clients
   */
  async deleteMany(ids: string[]): Promise<boolean> {
    const result = await this.post<{ success: boolean }>('/bulk/delete', { ids });
    return result.success;
  }

  /**
   * Generate a new API key for a client
   */
  // Removed duplicate generateApiKey earlier; use the trailing-slash version below

  /**
   * Get client statistics
   */
  async getStatistics(): Promise<{
    total_clients?: number;
    active_clients?: number;
    inactive_clients?: number;
    total_volume?: number;
    avg_transaction_value?: number;
    by_type?: any[];
    by_risk_category?: any[];
  }> {
    return this.get('/statistics/');
  }

  /**
   * Export clients as CSV or Excel via explicit export endpoint
   */
  async export(format: 'csv' | 'excel' = 'csv', params: { active?: boolean; client_type?: string; risk_category?: number; search?: string } = {}): Promise<Blob> {
    const usp = new URLSearchParams();
    if (params.active !== undefined) usp.append('active', String(params.active));
    if (params.client_type) usp.append('client_type', params.client_type);
    if (params.risk_category !== undefined) usp.append('risk_category', String(params.risk_category));
    if (params.search) usp.append('search', params.search);
    usp.append('format', format);
    const v2 = `/downloads/clients/${usp.toString() ? `?${usp.toString()}` : ''}`;
    const primary = `/clients/export/${usp.toString() ? `?${usp.toString()}` : ''}`;
    try {
      const resV2 = await this.axiosInstance.get(v2, { responseType: 'blob' });
      return resV2.data as any;
    } catch (errV2: any) {
      try {
        const res = await this.axiosInstance.get(primary, { responseType: 'blob' });
        return res.data as any;
      } catch (errPrimary: any) {
      // Secondary alias: /export/clients/
      const alias = `/export/clients/${usp.toString() ? `?${usp.toString()}` : ''}`;
      try {
        const res2 = await this.axiosInstance.get(alias, { responseType: 'blob' });
        return res2.data as any;
      } catch (errAlias: any) {
        // Final fallback: list endpoint with ?export=1 (supported in viewset)
        const listParams = new URLSearchParams(usp.toString());
        listParams.set('export', '1');
        const fallback = `/clients/${listParams.toString() ? `?${listParams.toString()}` : ''}`;
        const res3 = await this.axiosInstance.get(fallback, { responseType: 'blob' });
        return res3.data as any;
      }
      }
    }
  }

  /**
   * Get client by code
   */
  async getByCode(clientCode: string): Promise<IClient> {
    return this.get(`/code/${clientCode}`);
  }

  /**
   * Verify client KYC
   */
  async verifyKYC(clientId: string, documents: any[] = []): Promise<{ success: boolean; kycStatus: string; message?: string; }> {
    // Align with backend endpoint
    return this.get(`/${clientId}/kyc_verification/`);
  }

  /**
   * Update client configuration
   */
  async updateConfiguration(
    clientId: string, 
    configuration: Partial<IClient['configuration']>
  ): Promise<IClient> {
    return this.patch(`/${clientId}/configuration`, configuration);
  }

  /**
   * Get client transactions
   */
  async getTransactions(
    clientId: string, 
    params?: {
      fromDate?: Date;
      toDate?: Date;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<any> {
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    return this.get(`/${clientId}/transactions${queryString}`);
  }

  /**
   * Get client settlements
   */
  async getSettlements(
    clientId: string,
    params?: {
      fromDate?: Date;
      toDate?: Date;
      status?: string;
      page?: number;
      limit?: number;
    }
  ): Promise<any> {
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    return this.get(`/${clientId}/settlements${queryString}`);
  }

  /**
   * Activate client
   */
  async activate(clientId: string): Promise<IClient> {
    return this.post(`/${clientId}/activate/`);
  }

  /**
   * Deactivate client
   */
  async deactivate(clientId: string, reason?: string): Promise<IClient> {
    return this.post(`/${clientId}/deactivate/`, { reason });
  }

  /**
   * Generate API key for client
   */
  async generateApiKey(clientId: string): Promise<{
    message: string;
    client_id: string;
    auth_key: string;
    auth_iv: string;
    auth_type: string;
  }> {
    return this.post(`/${clientId}/generate_api_key/`);
  }

  /**
   * Get client documents
   */
  async getDocuments(clientId: string, params?: {
    status?: string;
    document_type?: string;
  }): Promise<{
    client_id: string;
    client_name: string;
    documents: any[];
    total_documents: number;
    verified_count: number;
    pending_count: number;
    rejected_count: number;
  }> {
    const queryString = params ? `?${this.buildQueryString(params)}` : '';
    return this.get(`/${clientId}/documents/${queryString}`);
  }

  /**
   * Upload document for client
   */
  async uploadDocument(clientId: string, formData: FormData): Promise<{
    message: string;
    document: any;
  }> {
    return this.post(`/${clientId}/documents/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Get specific document
   */
  async getDocument(clientId: string, documentId: string): Promise<any> {
    return this.get(`/${clientId}/documents/${documentId}/`);
  }

  /**
   * Verify or reject document
   */
  async verifyDocument(
    clientId: string, 
    documentId: string, 
    data: {
      status: 'VERIFIED' | 'REJECTED';
      rejection_reason?: string;
      notes?: string;
    }
  ): Promise<{
    message: string;
    document: any;
  }> {
    return this.post(`/${clientId}/documents/${documentId}/`, data);
  }

  /**
   * Delete document
   */
  async deleteDocument(clientId: string, documentId: string): Promise<{
    message: string;
  }> {
    return this.delete(`/${clientId}/documents/${documentId}/`);
  }

  /**
   * Export clients data honoring current filters.
   * Supports csv | excel | pdf (backend may implement a subset).
   */
  async export(format: 'csv' | 'excel' | 'pdf' = 'csv', params?: IClientSearchParams): Promise<Blob> {
    const qs = params ? this.buildQueryString(params) : '';
    const path = `/export/?format=${encodeURIComponent(format)}${qs ? `&${qs}` : ''}`;
    // Use BaseApiService.get to preserve baseURL path segment (e.g., /api)
    try {
      return await this.get<Blob>(path, {
        responseType: 'blob',
        headers: { Accept: '*/*' },
      });
    } catch (e: any) {
      // Fallback to list endpoint with export=1 for environments without /export route
      if (e?.statusCode === 404 || e?.message?.includes('404')) {
        const fallback = `/?export=1&format=${encodeURIComponent(format)}${qs ? `&${qs}` : ''}`;
        return await this.get<Blob>(fallback, {
          responseType: 'blob',
          headers: { Accept: '*/*' },
        });
      }
      throw e;
    }
  }

  /**
   * Import clients from file
   */
  async import(file: File): Promise<{
    success: number;
    failed: number;
    errors: any[];
  }> {
    const formData = new FormData();
    formData.append('file', file);
    
    return this.post('/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  /**
   * Onboard a new client
   */
  async onboard(data: IClientCreateDTO): Promise<{
    message: string;
    client_id: string;
    client_code: string;
    status: string;
  }> {
    return this.post('/onboard/', data);
  }

  /**
   * Get KYC verification status
   */
  async getKYCStatus(clientId: string): Promise<{
    kyc_status: string;
    risk_category: number;
    client_name: string;
    client_code: string;
  }> {
    return this.get(`/${clientId}/kyc_verification/`);
  }

  /**
   * Update KYC verification status
   */
  async updateKYCStatus(clientId: string, data: {
    kyc_status: string;
    risk_category?: number;
    notes?: string;
  }): Promise<{
    message: string;
    kyc_status: string;
    risk_category: number;
  }> {
    return this.post(`/${clientId}/kyc_verification/`, data);
  }

  /**
   * Bulk upload clients from CSV
   */
  async bulkUpload(file: File): Promise<{ message?: string; success_count: number; failed_count: number; errors?: any[]; created_clients?: any[]; }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.post('/bulk_upload/', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  }
}

// Export singleton instance for use across the app
export const clientApiService = new ClientApiService();
