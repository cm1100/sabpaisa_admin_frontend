import { BaseApiService } from './base/BaseApiService';
import { ApiResponse, PaginatedResponse } from './base/types';

// Payment Method Interface
export interface PaymentMethod {
  method_id: string;
  method_code: string;
  method_name: string;
  method_type: 'CARD' | 'NETBANKING' | 'UPI' | 'WALLET' | 'EMI' | 'BNPL';
  provider_name: string;
  provider_code: string;
  is_active: boolean;
  requires_otp: boolean;
  requires_3ds: boolean;
  min_amount: number;
  max_amount: number;
  processing_time: number;
  success_rate: number;
  icon_url?: string;
  description?: string;
  terms_conditions?: string;
  created_at: string;
  updated_at: string;
}

// Payment Configuration Interface
export interface PaymentConfiguration {
  config_id: string;
  client: string;
  payment_methods: Record<string, { enabled: boolean; config: any }>;
  
  // Card settings
  card_enabled: boolean;
  card_min_amount: number;
  card_max_amount: number;
  card_processing_fee: number;
  
  // Net banking settings
  netbanking_enabled: boolean;
  netbanking_banks: string[];
  netbanking_processing_fee: number;
  
  // UPI settings
  upi_enabled: boolean;
  upi_vpa: string;
  upi_processing_fee: number;
  
  // Wallet settings
  wallet_enabled: boolean;
  wallet_providers: string[];
  wallet_processing_fee: number;
  
  // Gateway configuration
  gateway_merchant_id: string;
  gateway_api_key?: string;
  gateway_secret_key?: string;
  gateway_webhook_secret?: string;
  
  // Transaction limits
  daily_transaction_limit: number;
  monthly_transaction_limit: number;
  max_transaction_amount: number;
  min_transaction_amount: number;
  
  // Settlement
  settlement_cycle: 'T+0' | 'T+1' | 'T+2' | 'T+3' | 'WEEKLY';
  settlement_account_number?: string;
  settlement_ifsc_code?: string;
  settlement_account_name?: string;
  
  // Risk management
  fraud_check_enabled: boolean;
  risk_score_threshold: number;
  auto_refund_enabled: boolean;
  duplicate_check_window: number;
  
  // Status
  is_active: boolean;
  is_verified: boolean;
  verified_at?: string;
  last_synced_at?: string;
  sync_status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  sync_error?: string;
  
  created_at: string;
  updated_at: string;
}

// Client Payment Method Interface
export interface ClientPaymentMethod {
  id: string;
  client: string;
  payment_method: PaymentMethod;
  config: string;
  is_enabled: boolean;
  custom_fee_percentage?: number;
  custom_min_amount?: number;
  custom_max_amount?: number;
  display_priority: number;
  custom_display_name?: string;
  custom_description?: string;
  total_transactions: number;
  total_amount: number;
  success_count: number;
  failure_count: number;
  last_used_at?: string;
  success_rate: number;
  created_at: string;
  updated_at: string;
}

// Request Interfaces
export interface CreatePaymentConfigurationRequest {
  client_id: string;
  card_enabled?: boolean;
  card_min_amount?: number;
  card_max_amount?: number;
  card_processing_fee?: number;
  netbanking_enabled?: boolean;
  netbanking_banks?: string[];
  netbanking_processing_fee?: number;
  upi_enabled?: boolean;
  upi_vpa?: string;
  upi_processing_fee?: number;
  wallet_enabled?: boolean;
  wallet_providers?: string[];
  wallet_processing_fee?: number;
  gateway_merchant_id?: string;
  gateway_api_key?: string;
  gateway_secret_key?: string;
  daily_transaction_limit?: number;
  monthly_transaction_limit?: number;
  max_transaction_amount?: number;
  min_transaction_amount?: number;
  settlement_cycle?: 'T+0' | 'T+1' | 'T+2' | 'T+3' | 'WEEKLY';
  settlement_account_number?: string;
  settlement_ifsc_code?: string;
  settlement_account_name?: string;
  fraud_check_enabled?: boolean;
  risk_score_threshold?: number;
  auto_refund_enabled?: boolean;
  duplicate_check_window?: number;
}

export interface UpdatePaymentConfigurationRequest extends Partial<CreatePaymentConfigurationRequest> {}

export interface CreatePaymentMethodRequest {
  method_code: string;
  method_name: string;
  method_type: 'CARD' | 'NETBANKING' | 'UPI' | 'WALLET' | 'EMI' | 'BNPL';
  provider_name: string;
  provider_code: string;
  is_active?: boolean;
  requires_otp?: boolean;
  requires_3ds?: boolean;
  min_amount?: number;
  max_amount?: number;
  processing_time?: number;
  success_rate?: number;
  icon_url?: string;
  description?: string;
  terms_conditions?: string;
}

export interface UpdateClientPaymentMethodRequest {
  is_enabled?: boolean;
  custom_fee_percentage?: number;
  custom_min_amount?: number;
  custom_max_amount?: number;
  display_priority?: number;
  custom_display_name?: string;
  custom_description?: string;
}

// Statistics Interface
export interface PaymentMethodStatistics {
  total_methods: number;
  active_methods: number;
  total_volume: number;
  total_transactions: number;
  average_success_rate: number;
  top_methods: Array<{
    method_name: string;
    transaction_count: number;
    volume: number;
    success_rate: number;
  }>;
  monthly_trend: Array<{
    month: string;
    volume: number;
    transactions: number;
  }>;
  risk_distribution: {
    low: number;
    medium: number;
    high: number;
  };
}

class PaymentMethodsApiService extends BaseApiService {
  protected readonly endpoint = '/';
  public readonly serviceName = 'PaymentMethods';

  constructor() {
    super();
  }

  // Payment Methods Management
  async getPaymentMethods(params?: {
    method_type?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<PaymentMethod>>> {
    const resp = await this.get<any>('payment-methods/', { params });
    const pag = this.normalizePaginated<PaymentMethod>(resp);
    return { data: pag as any };
  }

  async getPaymentMethod(methodId: string): Promise<ApiResponse<PaymentMethod>> {
    const data = await this.get<PaymentMethod>(`payment-methods/${methodId}/`);
    return { data };
  }

  async createPaymentMethod(data: CreatePaymentMethodRequest): Promise<ApiResponse<PaymentMethod>> {
    const created = await this.post<PaymentMethod>('payment-methods/', data);
    return { data: created };
  }

  async updatePaymentMethod(methodId: string, data: Partial<CreatePaymentMethodRequest>): Promise<ApiResponse<PaymentMethod>> {
    const updated = await this.patch<PaymentMethod>(`payment-methods/${methodId}/`, data);
    return { data: updated };
  }

  async deletePaymentMethod(methodId: string): Promise<ApiResponse<void>> {
    const resp = await this.delete<void>(`payment-methods/${methodId}/`);
    return { data: resp };
  }

  async togglePaymentMethod(methodId: string, isActive: boolean): Promise<ApiResponse<PaymentMethod>> {
    const updated = await this.patch<PaymentMethod>(`payment-methods/${methodId}/`, { is_active: isActive });
    return { data: updated };
  }

  // Payment Configurations Management
  async getPaymentConfigurations(params?: {
    client_id?: string;
    is_active?: boolean;
    sync_status?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<PaymentConfiguration>>> {
    const resp = await this.get<any>('payment-configurations/', { params });
    const pag = this.normalizePaginated<PaymentConfiguration>(resp);
    return { data: pag as any };
  }

  async getPaymentConfiguration(configId: string): Promise<ApiResponse<PaymentConfiguration>> {
    const data = await this.get<PaymentConfiguration>(`payment-configurations/${configId}/`);
    return { data };
  }

  async createPaymentConfiguration(data: CreatePaymentConfigurationRequest): Promise<ApiResponse<PaymentConfiguration>> {
    const created = await this.post<PaymentConfiguration>('payment-configurations/', data);
    return { data: created };
  }

  async updatePaymentConfiguration(configId: string, data: UpdatePaymentConfigurationRequest): Promise<ApiResponse<PaymentConfiguration>> {
    const updated = await this.patch<PaymentConfiguration>(`payment-configurations/${configId}/`, data);
    return { data: updated };
  }

  async deletePaymentConfiguration(configId: string): Promise<ApiResponse<void>> {
    const resp = await this.delete<void>(`payment-configurations/${configId}/`);
    return { data: resp };
  }

  async syncGateway(configId: string): Promise<ApiResponse<{ success: boolean; message: string }>> {
    const data = await this.post<{ success: boolean; message: string }>(`payment-configurations/${configId}/sync_gateway/`);
    return { data };
  }

  async verifyConfiguration(configId: string): Promise<ApiResponse<PaymentConfiguration>> {
    const data = await this.post<PaymentConfiguration>(`payment-configurations/${configId}/verify/`);
    return { data };
  }

  // Client Payment Methods Management
  async getClientPaymentMethods(params?: {
    client_id?: string;
    is_enabled?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<ClientPaymentMethod>>> {
    const resp = await this.get<any>('client-payment-methods/', { params });
    const pag = this.normalizePaginated<ClientPaymentMethod>(resp);
    return { data: pag as any };
  }

  async getClientPaymentMethod(id: string): Promise<ApiResponse<ClientPaymentMethod>> {
    const data = await this.get<ClientPaymentMethod>(`client-payment-methods/${id}/`);
    return { data };
  }

  async updateClientPaymentMethod(id: string, data: UpdateClientPaymentMethodRequest): Promise<ApiResponse<ClientPaymentMethod>> {
    const updated = await this.patch<ClientPaymentMethod>(`client-payment-methods/${id}/`, data);
    return { data: updated };
  }

  async toggleClientPaymentMethod(id: string, isEnabled: boolean): Promise<ApiResponse<ClientPaymentMethod>> {
    const updated = await this.patch<ClientPaymentMethod>(`client-payment-methods/${id}/`, { is_enabled: isEnabled });
    return { data: updated };
  }

  async updatePriority(id: string, priority: number): Promise<ApiResponse<ClientPaymentMethod>> {
    const updated = await this.patch<ClientPaymentMethod>(`client-payment-methods/${id}/`, { display_priority: priority });
    return { data: updated };
  }

  // Statistics
  async getStatistics(params?: {
    client_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<PaymentMethodStatistics>> {
    const data = await this.get<PaymentMethodStatistics>('payment-methods/statistics/', { params });
    return { data };
  }

  async getPerformanceMetrics(methodId: string, params?: {
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<any>> {
    const data = await this.get(`payment-methods/${methodId}/performance/`, { params });
    return { data };
  }

  // Utility Methods
  getMethodTypes() {
    return [
      { value: 'CARD', label: 'Card Payment', icon: '💳' },
      { value: 'NETBANKING', label: 'Net Banking', icon: '🏦' },
      { value: 'UPI', label: 'UPI', icon: '📱' },
      { value: 'WALLET', label: 'Digital Wallet', icon: '👛' },
      { value: 'EMI', label: 'EMI', icon: '📊' },
      { value: 'BNPL', label: 'Buy Now Pay Later', icon: '🛍️' }
    ];
  }

  getSettlementCycles() {
    return [
      { value: 'T+0', label: 'Same Day (T+0)' },
      { value: 'T+1', label: 'Next Day (T+1)' },
      { value: 'T+2', label: 'Two Days (T+2)' },
      { value: 'T+3', label: 'Three Days (T+3)' },
      { value: 'WEEKLY', label: 'Weekly' }
    ];
  }

  getBankList() {
    return [
      { code: 'HDFC', name: 'HDFC Bank' },
      { code: 'ICICI', name: 'ICICI Bank' },
      { code: 'SBI', name: 'State Bank of India' },
      { code: 'AXIS', name: 'Axis Bank' },
      { code: 'KOTAK', name: 'Kotak Mahindra Bank' },
      { code: 'PNB', name: 'Punjab National Bank' },
      { code: 'BOB', name: 'Bank of Baroda' },
      { code: 'IDBI', name: 'IDBI Bank' },
      { code: 'YES', name: 'Yes Bank' },
      { code: 'INDUSIND', name: 'IndusInd Bank' }
    ];
  }

  getWalletProviders() {
    return [
      { code: 'PAYTM', name: 'Paytm' },
      { code: 'PHONEPE', name: 'PhonePe' },
      { code: 'GOOGLEPAY', name: 'Google Pay' },
      { code: 'AMAZONPAY', name: 'Amazon Pay' },
      { code: 'MOBIKWIK', name: 'MobiKwik' },
      { code: 'FREECHARGE', name: 'FreeCharge' },
      { code: 'AIRTEL', name: 'Airtel Money' }
    ];
  }

  // Helper methods
  getRiskLevel(score: number): { level: string; color: string } {
    if (score < 30) return { level: 'Low', color: 'green' };
    if (score < 70) return { level: 'Medium', color: 'orange' };
    return { level: 'High', color: 'red' };
  }

  formatSuccessRate(rate: number): string {
    return `${rate.toFixed(1)}%`;
  }

  getMethodIcon(type: string): string {
    const icons: Record<string, string> = {
      'CARD': '💳',
      'NETBANKING': '🏦',
      'UPI': '📱',
      'WALLET': '👛',
      'EMI': '📊',
      'BNPL': '🛍️'
    };
    return icons[type] || '💰';
  }

  getMethodColor(type: string): string {
    const colors: Record<string, string> = {
      'CARD': 'var(--color-info)',
      'NETBANKING': 'var(--color-warning)',
      'UPI': 'var(--color-success)',
      'WALLET': 'var(--color-secondary)',
      'EMI': 'var(--color-error)',
      'BNPL': 'var(--color-primary)'
    };
    return colors[type] || 'var(--color-text-secondary)';
  }
}

export default new PaymentMethodsApiService();
