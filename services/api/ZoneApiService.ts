import { BaseApiService } from './base/BaseApiService';
import { ApiResponse, PaginatedResponse } from './base/types';

// Zone Configuration Interface
export interface ZoneConfig {
  zone_id: number;
  zone_name: string;
  zone_code: string;
  zone_type: 'GEOGRAPHIC' | 'BUSINESS_UNIT' | 'FUNCTIONAL' | 'REGULATORY' | 'TEMPORAL';
  parent_zone_id?: number;
  description?: string;
  
  // Geographic configuration
  geographic_bounds?: any; // GeoJSON format
  supported_states: string[];
  supported_cities: string[];
  
  // Business rules
  business_rules: any;
  transaction_limits: any;
  allowed_payment_methods: string[];
  
  // Operational settings
  is_active: boolean;
  requires_approval: boolean;
  auto_assign_new_clients: boolean;
  
  created_at: string;
  updated_at: string;
  created_by: string;
  
  // Virtual properties from serializer
  parent_zone_name?: string;
  child_zones_count: number;
  total_clients: number;
  total_users: number;
}

// User Zone Access Interface
export interface UserZoneAccess {
  access_id: number;
  user_id: number;
  zone_id: number;
  access_level: 'VIEW' | 'EDIT' | 'ADMIN' | 'SUPER_ADMIN';
  
  // Access metadata
  granted_by: string;
  granted_at: string;
  expires_at?: string;
  is_active: boolean;
  
  // Access restrictions
  time_restrictions: {
    allowed_days?: number[];
    allowed_hours?: {
      start: string;
      end: string;
    };
  };
  ip_restrictions: string[];
  location_restrictions: any;
  
  // Audit fields
  last_accessed?: string;
  access_count: number;
  created_at: string;
  
  // Virtual properties from serializer
  user_name: string;
  zone_name: string;
  zone_code: string;
  is_expired: boolean;
  can_access_now: boolean;
}

// Client Zone Mapping Interface
export interface ClientZoneMapping {
  mapping_id: number;
  client_id: string;
  zone_id: number;
  is_primary: boolean;
  
  // Mapping configuration
  auto_assigned: boolean;
  assignment_reason?: string;
  effective_from: string;
  effective_until?: string;
  
  // Business rules for this mapping
  transaction_routing_priority: number;
  settlement_preferences: any;
  fee_configuration: any;
  
  created_at: string;
  created_by: string;
  
  // Virtual properties from serializer
  zone_name: string;
  zone_code: string;
  zone_type: string;
  is_active: boolean;
}

// Zone Based Restrictions Interface
export interface ZoneBasedRestrictions {
  restriction_id: number;
  zone_id: number;
  resource_type: 'TRANSACTION' | 'SETTLEMENT' | 'REFUND' | 'REPORT' | 'CLIENT' | 'USER';
  
  // Permission configuration
  allowed_actions: string[];
  denied_actions: string[];
  
  // Conditional restrictions
  amount_limits: {
    min?: number;
    max?: number;
  };
  time_restrictions: any;
  approval_requirements: any;
  
  // Additional constraints
  additional_conditions: any;
  error_message?: string;
  
  is_active: boolean;
  created_at: string;
  created_by: string;
  
  // Virtual properties from serializer
  zone_name: string;
  zone_code: string;
}

// Zone Hierarchy Interface
export interface ZoneHierarchy {
  zone_id: number;
  zone_name: string;
  zone_code: string;
  zone_type: string;
  parent_zone_id?: number;
  parent_name?: string;
  children: ZoneHierarchy[];
}

// Zone Statistics Interface
export interface ZoneStatistics {
  total_users: number;
  total_clients: number;
  child_zones: number;
  active_restrictions: number;
  user_access_levels: Array<{
    access_level: string;
    count: number;
  }>;
}

// Request Interfaces
export interface CreateZoneRequest {
  zone_name: string;
  zone_code: string;
  zone_type: 'GEOGRAPHIC' | 'BUSINESS_UNIT' | 'FUNCTIONAL' | 'REGULATORY' | 'TEMPORAL';
  parent_zone_id?: number;
  description?: string;
  geographic_bounds?: any;
  supported_states?: string[];
  supported_cities?: string[];
  business_rules?: any;
  transaction_limits?: any;
  allowed_payment_methods?: string[];
  is_active?: boolean;
  requires_approval?: boolean;
  auto_assign_new_clients?: boolean;
  created_by?: string;
}

export interface CreateUserAccessRequest {
  user_id: number;
  zone_id: number;
  access_level: 'VIEW' | 'EDIT' | 'ADMIN' | 'SUPER_ADMIN';
  expires_at?: string;
  time_restrictions?: {
    allowed_days?: number[];
    allowed_hours?: {
      start: string;
      end: string;
    };
  };
  ip_restrictions?: string[];
  location_restrictions?: any;
  granted_by?: string;
}

export interface CreateClientMappingRequest {
  client_id: string;
  zone_id: number;
  is_primary?: boolean;
  assignment_reason?: string;
  effective_from?: string;
  effective_until?: string;
  transaction_routing_priority?: number;
  settlement_preferences?: any;
  fee_configuration?: any;
  created_by?: string;
}

export interface CreateRestrictionRequest {
  zone_id: number;
  resource_type: 'TRANSACTION' | 'SETTLEMENT' | 'REFUND' | 'REPORT' | 'CLIENT' | 'USER';
  allowed_actions?: string[];
  denied_actions?: string[];
  amount_limits?: {
    min?: number;
    max?: number;
  };
  time_restrictions?: any;
  approval_requirements?: any;
  additional_conditions?: any;
  error_message?: string;
  is_active?: boolean;
  created_by?: string;
}

export interface AssignUsersRequest {
  user_ids: number[];
  access_level: 'VIEW' | 'EDIT' | 'ADMIN' | 'SUPER_ADMIN';
}

export interface AssignClientsRequest {
  client_ids: string[];
}

export interface BulkRetryRequest {
  client_ids: string[];
}

export interface ExtendAccessRequest {
  days: number;
}

export interface BulkUpdateAccessRequest {
  access_ids: number[];
  access_level: 'VIEW' | 'EDIT' | 'ADMIN' | 'SUPER_ADMIN';
}

export interface ValidateAccessRequest {
  zone_id: number;
  resource_type: 'TRANSACTION' | 'SETTLEMENT' | 'REFUND' | 'REPORT' | 'CLIENT' | 'USER';
  action: string;
  context?: any;
}

export interface ValidateAccessResponse {
  allowed: boolean;
  message?: string;
  requires_approval: boolean;
  approver_level?: string;
}

class ZoneApiService extends BaseApiService {
  public readonly serviceName = 'ZoneService';
  protected readonly endpoint = '/zones';

  // Zone Configuration Management
  async getZones(params?: {
    zone_type?: string;
    is_active?: boolean;
    parent_zone_id?: number;
    search?: string;
    ordering?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<ZoneConfig>>> {
    const data = await this.get<PaginatedResponse<ZoneConfig>>('/configs/', { params });
    return { data };
  }

  async getZone(zoneId: number): Promise<ApiResponse<ZoneConfig>> {
    const data = await this.get<ZoneConfig>(`/configs/${zoneId}/`);
    return { data };
  }

  async createZone(data: CreateZoneRequest): Promise<ApiResponse<ZoneConfig>> {
    const created = await this.post<ZoneConfig>('/configs/', data);
    return { data: created };
  }

  async updateZone(zoneId: number, data: Partial<CreateZoneRequest>): Promise<ApiResponse<ZoneConfig>> {
    const updated = await this.patch<ZoneConfig>(`/configs/${zoneId}/`, data);
    return { data: updated };
  }

  async deleteZone(zoneId: number): Promise<ApiResponse<any>> {
    const data = await this.delete(`/configs/${zoneId}/`);
    return { data };
  }

  async getZoneHierarchy(): Promise<ApiResponse<ZoneHierarchy[]>> {
    const data = await this.get<ZoneHierarchy[]>('/configs/hierarchy/');
    return { data };
  }

  async assignUsers(zoneId: number, data: AssignUsersRequest): Promise<ApiResponse<{
    message: string;
    zone: string;
  }>> {
    const resp = await this.post<{ message: string; zone: string }>(`/configs/${zoneId}/assign_users/`, data);
    return { data: resp };
  }

  async assignClients(zoneId: number, data: AssignClientsRequest): Promise<ApiResponse<any>> {
    const resp = await this.post(`/configs/${zoneId}/assign_clients/`, data);
    return { data: resp };
  }

  async getZoneStatistics(zoneId: number): Promise<ApiResponse<ZoneStatistics>> {
    const data = await this.get<ZoneStatistics>(`/configs/${zoneId}/statistics/`);
    return { data };
  }

  // User Zone Access Management
  async getUserAccess(params?: {
    zone_id?: number;
    access_level?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<UserZoneAccess>>> {
    const data = await this.get<PaginatedResponse<UserZoneAccess>>('/user-access/', { params });
    return { data };
  }

  async getUserAccessRecord(accessId: number): Promise<ApiResponse<UserZoneAccess>> {
    const data = await this.get<UserZoneAccess>(`/user-access/${accessId}/`);
    return { data };
  }

  async createUserAccess(data: CreateUserAccessRequest): Promise<ApiResponse<UserZoneAccess>> {
    const created = await this.post<UserZoneAccess>('/user-access/', data);
    return { data: created };
  }

  async updateUserAccess(accessId: number, data: Partial<CreateUserAccessRequest>): Promise<ApiResponse<UserZoneAccess>> {
    const updated = await this.patch<UserZoneAccess>(`/user-access/${accessId}/`, data);
    return { data: updated };
  }

  async deleteUserAccess(accessId: number): Promise<ApiResponse<any>> {
    const data = await this.delete(`/user-access/${accessId}/`);
    return { data };
  }

  async extendAccess(accessId: number, data: ExtendAccessRequest): Promise<ApiResponse<{
    message: string;
    new_expiry: string;
  }>> {
    const resp = await this.post<{ message: string; new_expiry: string }>(`/user-access/${accessId}/extend_access/`, data);
    return { data: resp };
  }

  async bulkUpdateAccess(data: BulkUpdateAccessRequest): Promise<ApiResponse<{
    message: string;
    new_access_level: string;
  }>> {
    const resp = await this.post<{ message: string; new_access_level: string }>(
      '/user-access/bulk_update_access/',
      data
    );
    return { data: resp };
  }

  // Client Zone Mapping Management
  async getClientMappings(params?: {
    client_id?: string;
    zone_id?: number;
    is_primary?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<ClientZoneMapping>>> {
    const data = await this.get<PaginatedResponse<ClientZoneMapping>>('/client-mappings/', { params });
    return { data };
  }

  async getClientMapping(mappingId: number): Promise<ApiResponse<ClientZoneMapping>> {
    const data = await this.get<ClientZoneMapping>(`/client-mappings/${mappingId}/`);
    return { data };
  }

  async createClientMapping(data: CreateClientMappingRequest): Promise<ApiResponse<ClientZoneMapping>> {
    const created = await this.post<ClientZoneMapping>('/client-mappings/', data);
    return { data: created };
  }

  async updateClientMapping(mappingId: number, data: Partial<CreateClientMappingRequest>): Promise<ApiResponse<ClientZoneMapping>> {
    const updated = await this.patch<ClientZoneMapping>(`/client-mappings/${mappingId}/`, data);
    return { data: updated };
  }

  async deleteClientMapping(mappingId: number): Promise<ApiResponse<any>> {
    const data = await this.delete(`/client-mappings/${mappingId}/`);
    return { data };
  }

  async autoAssignClients(data: BulkRetryRequest): Promise<ApiResponse<{
    assignments: Array<{
      client_id: string;
      assigned_zone?: string;
      reason: string;
    }>;
  }>> {
    const resp = await this.post<{
      assignments: Array<{
        client_id: string;
        assigned_zone?: string;
        reason: string;
      }>;
    }>('/client-mappings/auto_assign/', data);
    return { data: resp };
  }

  // Zone Based Restrictions Management
  async getRestrictions(params?: {
    zone_id?: number;
    resource_type?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<ZoneBasedRestrictions>>> {
    const data = await this.get<PaginatedResponse<ZoneBasedRestrictions>>('/restrictions/', { params });
    return { data };
  }

  async getRestriction(restrictionId: number): Promise<ApiResponse<ZoneBasedRestrictions>> {
    const data = await this.get<ZoneBasedRestrictions>(`/restrictions/${restrictionId}/`);
    return { data };
  }

  async createRestriction(data: CreateRestrictionRequest): Promise<ApiResponse<ZoneBasedRestrictions>> {
    const created = await this.post<ZoneBasedRestrictions>('/restrictions/', data);
    return { data: created };
  }

  async updateRestriction(restrictionId: number, data: Partial<CreateRestrictionRequest>): Promise<ApiResponse<ZoneBasedRestrictions>> {
    const updated = await this.patch<ZoneBasedRestrictions>(`/restrictions/${restrictionId}/`, data);
    return { data: updated };
  }

  async deleteRestriction(restrictionId: number): Promise<ApiResponse<any>> {
    const data = await this.delete(`/restrictions/${restrictionId}/`);
    return { data };
  }

  async validateAccess(data: ValidateAccessRequest): Promise<ApiResponse<ValidateAccessResponse>> {
    const resp = await this.post<ValidateAccessResponse>('/restrictions/validate_access/', data);
    return { data: resp };
  }

  // Utility Methods
  getZoneTypes() {
    return [
      { value: 'GEOGRAPHIC', label: 'Geographic', description: 'Geographic regions (states, cities)' },
      { value: 'BUSINESS_UNIT', label: 'Business Unit', description: 'Business divisions or units' },
      { value: 'FUNCTIONAL', label: 'Functional', description: 'Functional areas or departments' },
      { value: 'REGULATORY', label: 'Regulatory', description: 'Regulatory compliance zones' },
      { value: 'TEMPORAL', label: 'Temporal', description: 'Time-based access zones' }
    ];
  }

  getAccessLevels() {
    return [
      { value: 'VIEW', label: 'View Only', color: 'blue', description: 'Read-only access' },
      { value: 'EDIT', label: 'Edit', color: 'green', description: 'Read and write access' },
      { value: 'ADMIN', label: 'Administrator', color: 'orange', description: 'Administrative access' },
      { value: 'SUPER_ADMIN', label: 'Super Administrator', color: 'red', description: 'Full system access' }
    ];
  }

  getResourceTypes() {
    return [
      { value: 'TRANSACTION', label: 'Transactions', description: 'Transaction-related operations' },
      { value: 'SETTLEMENT', label: 'Settlements', description: 'Settlement operations' },
      { value: 'REFUND', label: 'Refunds', description: 'Refund operations' },
      { value: 'REPORT', label: 'Reports', description: 'Report generation and viewing' },
      { value: 'CLIENT', label: 'Client Management', description: 'Client management operations' },
      { value: 'USER', label: 'User Management', description: 'User management operations' }
    ];
  }

  getActions() {
    return ['CREATE', 'READ', 'UPDATE', 'DELETE', 'APPROVE', 'REJECT', 'EXPORT', 'IMPORT'];
  }

  getIndianStates() {
    return [
      { value: 'KA', label: 'Karnataka' },
      { value: 'TN', label: 'Tamil Nadu' },
      { value: 'AP', label: 'Andhra Pradesh' },
      { value: 'TS', label: 'Telangana' },
      { value: 'MH', label: 'Maharashtra' },
      { value: 'GJ', label: 'Gujarat' },
      { value: 'RJ', label: 'Rajasthan' },
      { value: 'UP', label: 'Uttar Pradesh' },
      { value: 'WB', label: 'West Bengal' },
      { value: 'DL', label: 'Delhi' },
      { value: 'HR', label: 'Haryana' },
      { value: 'PB', label: 'Punjab' },
      { value: 'OR', label: 'Odisha' },
      { value: 'JH', label: 'Jharkhand' },
      { value: 'CG', label: 'Chhattisgarh' },
      { value: 'MP', label: 'Madhya Pradesh' },
      { value: 'BR', label: 'Bihar' },
      { value: 'AS', label: 'Assam' },
      { value: 'KL', label: 'Kerala' },
      { value: 'HP', label: 'Himachal Pradesh' },
      { value: 'UK', label: 'Uttarakhand' },
      { value: 'GA', label: 'Goa' },
      { value: 'MN', label: 'Manipur' },
      { value: 'TR', label: 'Tripura' },
      { value: 'MZ', label: 'Mizoram' },
      { value: 'NL', label: 'Nagaland' },
      { value: 'SK', label: 'Sikkim' },
      { value: 'AR', label: 'Arunachal Pradesh' },
      { value: 'ML', label: 'Meghalaya' }
    ];
  }

  getBusinessTypes() {
    return [
      { value: 'E_COMMERCE', label: 'E-commerce' },
      { value: 'RETAIL', label: 'Retail' },
      { value: 'HOSPITALITY', label: 'Hospitality' },
      { value: 'HEALTHCARE', label: 'Healthcare' },
      { value: 'EDUCATION', label: 'Education' },
      { value: 'FINANCIAL_SERVICES', label: 'Financial Services' },
      { value: 'TRAVEL', label: 'Travel & Tourism' },
      { value: 'UTILITIES', label: 'Utilities' },
      { value: 'GOVERNMENT', label: 'Government' },
      { value: 'NON_PROFIT', label: 'Non-Profit' },
      { value: 'OTHER', label: 'Other' }
    ];
  }

  // Helper methods for UI
  getZoneTypeColor(type: string): string {
    const colors = {
      'GEOGRAPHIC': 'blue',
      'BUSINESS_UNIT': 'green',
      'FUNCTIONAL': 'orange',
      'REGULATORY': 'red',
      'TEMPORAL': 'purple'
    };
    return colors[type as keyof typeof colors] || 'default';
  }

  getAccessLevelColor(level: string): string {
    const levels = this.getAccessLevels();
    const levelConfig = levels.find(l => l.value === level);
    return levelConfig?.color || 'default';
  }

  formatZoneHierarchyForTree(zones: ZoneHierarchy[]): any[] {
    return zones.map(zone => ({
      title: `${zone.zone_name} (${zone.zone_code})`,
      key: zone.zone_id.toString(),
      value: zone.zone_id,
      zone_type: zone.zone_type,
      children: zone.children ? this.formatZoneHierarchyForTree(zone.children) : []
    }));
  }

  // Validation helpers
  validateZoneCode(code: string): boolean {
    return /^[A-Z0-9_]{2,20}$/.test(code);
  }

  validateIPAddress(ip: string): boolean {
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)(?:\/(?:[0-9]|[1-2][0-9]|3[0-2]))?$/;
    return ipRegex.test(ip);
  }

  validateTimeFormat(time: string): boolean {
    return /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/.test(time);
  }
}

export default new ZoneApiService();
