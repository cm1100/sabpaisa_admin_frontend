import { BaseApiService } from './base/BaseApiService';
import { ApiResponse, PaginatedResponse } from './base/types';

// Fee Configuration Interface
export interface FeeConfiguration {
  fee_id: number;
  client_id: string;
  fee_name: string;
  fee_type: 'TRANSACTION' | 'PROCESSING' | 'SETTLEMENT' | 'REFUND' | 'CHARGEBACK' | 'MONTHLY' | 'ANNUAL' | 'SETUP';
  fee_structure: 'FLAT' | 'PERCENTAGE' | 'TIERED' | 'HYBRID' | 'VOLUME_BASED' | 'CUSTOM';
  
  // Basic fee configuration
  base_rate: number;
  minimum_fee: number;
  maximum_fee?: number;
  
  // Tiered pricing configuration
  tier_rates: Array<{
    min: number;
    max: number;
    rate: number;
  }>;
  volume_slabs: Array<{
    min: number;
    max?: number;
    rate: number;
  }>;
  
  // Payment method specific rates
  payment_method_rates: {
    [key: string]: number;
  };
  
  // Conditional configurations
  conditions: {
    [key: string]: any;
  };
  
  // Validity period
  effective_from: string;
  effective_until?: string;
  
  // Status and metadata
  is_active: boolean;
  requires_approval: boolean;
  approval_status: string;
  
  // Audit fields
  created_at: string;
  updated_at: string;
  created_by: string;
  approved_by?: string;

  // Virtual property
  is_currently_active: boolean;
}

// Fee Calculation Log Interface
export interface FeeCalculationLog {
  calc_id: number;
  transaction_id: string;
  fee_id: number;
  client_id: string;
  
  // Transaction details
  transaction_amount: number;
  payment_method: string;
  
  // Fee calculation details
  calculated_amount: number;
  calculation_method: 'AUTO' | 'MANUAL' | 'PROMO' | 'BULK' | 'CUSTOM';
  calculation_details: {
    [key: string]: any;
  };
  
  // Promotional/discount details
  promo_code_applied?: string;
  discount_amount: number;
  final_fee_amount: number;
  
  // Metadata
  created_at: string;
  ip_address?: string;
  user_agent?: string;
}

// Promotional Fee Interface
export interface PromotionalFee {
  promo_id: number;
  client_id: string;
  promo_code: string;
  promo_name: string;
  description: string;
  
  // Discount configuration
  discount_type: 'PERCENTAGE' | 'FLAT' | 'WAIVER' | 'CASHBACK';
  discount_value: number;
  max_discount_amount?: number;
  
  // Validity
  valid_from: string;
  valid_until: string;
  
  // Usage limits
  usage_limit: number;
  used_count: number;
  usage_per_client: number;
  
  // Conditions
  minimum_transaction_amount?: number;
  applicable_payment_methods: string[];
  applicable_fee_types: string[];
  
  // Status
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED' | 'EXHAUSTED';
  
  // Audit
  created_at: string;
  updated_at: string;
  created_by: string;

  // Virtual property
  is_valid: boolean;
}

// Fee Reconciliation Interface
export interface FeeReconciliation {
  recon_id: number;
  period: string;
  client_id: string;
  
  // Fee totals
  total_transactions: number;
  total_transaction_amount: number;
  total_fees_charged: number;
  total_fees_collected: number;
  
  // Calculated vs actual
  calculated_fees: number;
  variance: number;
  variance_percentage: number;
  
  // Breakdown by fee type
  fee_breakdown: {
    [feeType: string]: {
      count: number;
      total_amount: number;
      fees_charged: number;
    };
  };
  
  // Discrepancies
  discrepancy_details: Array<{
    transaction_id: string;
    issue: string;
    expected: number;
    actual: number;
    variance: number;
  }>;
  discrepancy_count: number;
  
  // Status
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'DISCREPANCY' | 'RESOLVED';
  reconciled_at?: string;
  reconciled_by?: string;
  
  // Notes
  notes?: string;
  
  // Audit
  created_at: string;
  updated_at: string;
}

// Request Interfaces
export interface CreateFeeConfigurationRequest {
  client_id: string;
  fee_name: string;
  fee_type: 'TRANSACTION' | 'PROCESSING' | 'SETTLEMENT' | 'REFUND' | 'CHARGEBACK' | 'MONTHLY' | 'ANNUAL' | 'SETUP';
  fee_structure: 'FLAT' | 'PERCENTAGE' | 'TIERED' | 'HYBRID' | 'VOLUME_BASED' | 'CUSTOM';
  base_rate: number;
  minimum_fee?: number;
  maximum_fee?: number;
  tier_rates?: Array<{ min: number; max: number; rate: number; }>;
  volume_slabs?: Array<{ min: number; max?: number; rate: number; }>;
  payment_method_rates?: { [key: string]: number };
  conditions?: { [key: string]: any };
  effective_from: string;
  effective_until?: string;
  is_active?: boolean;
  requires_approval?: boolean;
  created_by?: string;
}

export interface CreatePromotionalFeeRequest {
  client_id: string;
  promo_code: string;
  promo_name: string;
  description: string;
  discount_type: 'PERCENTAGE' | 'FLAT' | 'WAIVER' | 'CASHBACK';
  discount_value: number;
  max_discount_amount?: number;
  valid_from: string;
  valid_until: string;
  usage_limit?: number;
  usage_per_client?: number;
  minimum_transaction_amount?: number;
  applicable_payment_methods?: string[];
  applicable_fee_types?: string[];
  created_by?: string;
}

export interface FeeCalculationRequest {
  transaction_amount: number;
  client_id: string;
  fee_type: string;
  payment_method?: string;
  promo_code?: string;
  volume_data?: {
    monthly_volume: number;
    annual_volume?: number;
  };
  additional_conditions?: { [key: string]: any };
}

export interface FeeCalculationResponse {
  fee_configuration_id: number;
  base_fee_amount: number;
  discount_amount: number;
  final_fee_amount: number;
  calculation_method: string;
  calculation_details: {
    structure_used: string;
    rate_applied: number;
    min_fee_applied: boolean;
    max_fee_applied: boolean;
    promo_applied?: string;
    volume_slab_used?: any;
  };
  breakdown: Array<{
    component: string;
    amount: number;
    description: string;
  }>;
}

export interface BulkFeeUpdateRequest {
  client_ids: string[];
  fee_type: string;
  updates: {
    base_rate?: number;
    minimum_fee?: number;
    maximum_fee?: number;
    tier_rates?: Array<{ min: number; max: number; rate: number; }>;
    volume_slabs?: Array<{ min: number; max?: number; rate: number; }>;
    payment_method_rates?: { [key: string]: number };
  };
  effective_from: string;
  reason: string;
}


// Statistics Interfaces
export interface FeeStatistics {
  total_configurations: number;
  active_configurations: number;
  total_revenue_current_month: number;
  total_revenue_previous_month: number;
  revenue_growth_percentage: number;
  top_revenue_fee_types: Array<{
    fee_type: string;
    revenue: number;
    percentage: number;
  }>;
  client_distribution: Array<{
    client_id: string;
    configurations_count: number;
    revenue: number;
  }>;
  promotional_savings: number;
  reconciliation_accuracy: number;
}

class FeeConfigurationApiService extends BaseApiService {
  protected readonly endpoint = '/fees';
  public readonly serviceName = 'FeeConfiguration';

  constructor() {
    super();
  }

  // Fee Configuration Management
  async getFeeConfigurations(params?: {
    client_id?: string;
    fee_type?: string;
    fee_structure?: string;
    is_active?: boolean;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<FeeConfiguration>>> {
    const resp = await this.get<any>('/configurations/', { params });
    const pag = this.normalizePaginated<FeeConfiguration>(resp);
    return { data: pag as any };
  }

  async getFeeConfiguration(feeId: number): Promise<ApiResponse<FeeConfiguration>> {
    const data = await this.get<FeeConfiguration>(`/configurations/${feeId}/`);
    return { data };
  }

  async createFeeConfiguration(data: CreateFeeConfigurationRequest): Promise<ApiResponse<FeeConfiguration>> {
    const created = await this.post<FeeConfiguration>('/configurations/', data);
    return { data: created };
  }

  async updateFeeConfiguration(feeId: number, data: Partial<CreateFeeConfigurationRequest>): Promise<ApiResponse<FeeConfiguration>> {
    const updated = await this.patch<FeeConfiguration>(`/configurations/${feeId}/`, data);
    return { data: updated };
  }

  async deleteFeeConfiguration(feeId: number): Promise<ApiResponse<any>> {
    const resp = await this.delete(`/configurations/${feeId}/`);
    return { data: resp };
  }

  async toggleFeeConfiguration(feeId: number): Promise<ApiResponse<{ message: string; is_active: boolean }>> {
    const data = await this.post(`/configurations/${feeId}/toggle/`);
    return { data } as any;
  }

  async approveFeeConfiguration(feeId: number, approved_by: string): Promise<ApiResponse<{ message: string }>> {
    const data = await this.post(`/configurations/${feeId}/approve/`, { approved_by });
    return { data } as any;
  }

  async bulkUpdateFeeConfigurations(data: BulkFeeUpdateRequest): Promise<ApiResponse<{ message: string; updated_count: number }>> {
    const resp = await this.post('/configurations/bulk_update/', data);
    return { data: resp } as any;
  }

  // Fee Calculation
  async calculateFee(data: FeeCalculationRequest): Promise<ApiResponse<FeeCalculationResponse>> {
    const resp = await this.post<FeeCalculationResponse>('/calculate/', data);
    return { data: resp };
  }

  async previewFeeCalculation(data: FeeCalculationRequest): Promise<ApiResponse<FeeCalculationResponse>> {
    const resp = await this.post<FeeCalculationResponse>('/calculate/preview/', data);
    return { data: resp };
  }

  async getFeeCalculationLogs(params?: {
    client_id?: string;
    transaction_id?: string;
    fee_type?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<FeeCalculationLog>>> {
    const resp = await this.get<any>('/calculation-logs/', { params });
    const pag = this.normalizePaginated<FeeCalculationLog>(resp);
    return { data: pag as any };
  }

  // Promotional Fees Management
  async getPromotionalFees(params?: {
    client_id?: string;
    status?: string;
    promo_code?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<PromotionalFee>>> {
    const resp = await this.get<any>('/promotional/', { params });
    const pag = this.normalizePaginated<PromotionalFee>(resp);
    return { data: pag as any };
  }

  async getPromotionalFee(promoId: number): Promise<ApiResponse<PromotionalFee>> {
    const data = await this.get<PromotionalFee>(`/promotional/${promoId}/`);
    return { data };
  }

  async createPromotionalFee(data: CreatePromotionalFeeRequest): Promise<ApiResponse<PromotionalFee>> {
    const created = await this.post<PromotionalFee>('/promotional/', data);
    return { data: created };
  }

  async updatePromotionalFee(promoId: number, data: Partial<CreatePromotionalFeeRequest>): Promise<ApiResponse<PromotionalFee>> {
    const updated = await this.patch<PromotionalFee>(`/promotional/${promoId}/`, data);
    return { data: updated };
  }

  async deletePromotionalFee(promoId: number): Promise<ApiResponse<any>> {
    const resp = await this.delete(`/promotional/${promoId}/`);
    return { data: resp };
  }

  async validatePromoCode(code: string, clientId: string): Promise<ApiResponse<{
    valid: boolean;
    promo_code?: string;
    promo_name?: string;
    discount_type?: string;
    discount_value?: number;
    usage_remaining?: number;
    reasons?: string[];
  }>> {
    const data = await this.get('/promotional/validate_code/', { 
      params: {
        code,
        client_id: clientId
      }
    });
    return { data } as any;
  }

  async activatePromoCode(promoId: number): Promise<ApiResponse<{ message: string }>> {
    const data = await this.post(`/promotional/${promoId}/activate/`);
    return { data } as any;
  }

  async deactivatePromoCode(promoId: number): Promise<ApiResponse<{ message: string }>> {
    const data = await this.post(`/promotional/${promoId}/deactivate/`);
    return { data } as any;
  }

  async extendPromoValidity(promoId: number, days: number = 30): Promise<ApiResponse<{ message: string; new_valid_until: string }>> {
    const data = await this.post(`/promotional/${promoId}/extend_validity/`, { days });
    return { data } as any;
  }

  // Fee Reconciliation Management
  async getFeeReconciliations(params?: {
    client_id?: string;
    period?: string;
    status?: string;
    page?: number;
    page_size?: number;
  }): Promise<ApiResponse<PaginatedResponse<FeeReconciliation>>> {
    const resp = await this.get<any>('/reconciliation/', { params });
    const pag = this.normalizePaginated<FeeReconciliation>(resp);
    return { data: pag as any };
  }

  async getFeeReconciliation(reconId: number): Promise<ApiResponse<FeeReconciliation>> {
    const data = await this.get<FeeReconciliation>(`/reconciliation/${reconId}/`);
    return { data };
  }

  async createFeeReconciliation(data: {
    period: string;
    client_id: string;
  }): Promise<ApiResponse<FeeReconciliation>> {
    const resp = await this.post<FeeReconciliation>('/reconciliation/', data);
    return { data: resp };
  }

  async startReconciliation(reconId: number): Promise<ApiResponse<{ 
    message: string;
    status: string;
    variance: number;
    variance_percentage: number;
  }>> {
    const data = await this.post(`/reconciliation/${reconId}/start_reconciliation/`);
    return { data } as any;
  }

  async markReconciliationResolved(reconId: number, notes: string): Promise<ApiResponse<{ message: string }>> {
    const data = await this.post(`/reconciliation/${reconId}/mark_resolved/`, { notes });
    return { data } as any;
  }

  // Compare fees across clients
  async compareFees(data: {
    client_ids: string[];
    fee_types?: string[];
    comparison_date?: string;
  }): Promise<ApiResponse<any>> {
    const resp = await this.post('/configurations/compare_fees/', data);
    return { data: resp };
  }

  // Clone configuration to another client
  async cloneConfiguration(feeId: number, targetClientId: string): Promise<ApiResponse<FeeConfiguration>> {
    const data = await this.post(`/configurations/${feeId}/clone_configuration/`, { target_client_id: targetClientId });
    return { data } as any;
  }

  // Statistics and Analytics
  async getFeeStatistics(params?: {
    client_id?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<ApiResponse<FeeStatistics>> {
    const data = await this.get<FeeStatistics>('/calculation-logs/statistics/', { params });
    return { data };
  }

  // Preview calculation with promotion
  async previewWithPromotion(data: {
    client_id: string;
    promo_code: string;
    test_amounts?: number[];
  }): Promise<ApiResponse<any>> {
    const resp = await this.post('/calculate/preview_with_promotion/', data);
    return { data: resp };
  }

  // Utility Methods
  getFeeTypes() {
    return [
      { value: 'TRANSACTION', label: 'Transaction Fee', description: 'Per-transaction fee' },
      { value: 'PROCESSING', label: 'Processing Fee', description: 'Payment processing fee' },
      { value: 'SETTLEMENT', label: 'Settlement Fee', description: 'Settlement processing fee' },
      { value: 'REFUND', label: 'Refund Fee', description: 'Fee for processing refunds' },
      { value: 'CHARGEBACK', label: 'Chargeback Fee', description: 'Chargeback handling fee' },
      { value: 'MONTHLY', label: 'Monthly Fee', description: 'Recurring monthly fee' },
      { value: 'ANNUAL', label: 'Annual Fee', description: 'Annual subscription fee' },
      { value: 'SETUP', label: 'Setup Fee', description: 'One-time setup fee' }
    ];
  }

  getFeeStructures() {
    return [
      { value: 'FLAT', label: 'Flat Rate', description: 'Fixed amount per transaction' },
      { value: 'PERCENTAGE', label: 'Percentage', description: 'Percentage of transaction amount' },
      { value: 'TIERED', label: 'Tiered Pricing', description: 'Different rates for different amount ranges' },
      { value: 'HYBRID', label: 'Hybrid', description: 'Combination of percentage and flat fee' },
      { value: 'VOLUME_BASED', label: 'Volume Based', description: 'Rates based on monthly/annual volume' },
      { value: 'CUSTOM', label: 'Custom Logic', description: 'Custom calculation logic' }
    ];
  }

  getDiscountTypes() {
    return [
      { value: 'PERCENTAGE', label: 'Percentage Discount', description: 'Percentage off the fee' },
      { value: 'FLAT', label: 'Flat Discount', description: 'Fixed amount discount' },
      { value: 'WAIVER', label: 'Fee Waiver', description: 'Complete fee waiver' },
      { value: 'CASHBACK', label: 'Cashback', description: 'Cashback on fee paid' }
    ];
  }

  getPaymentMethods() {
    return [
      { value: 'CARD', label: 'Credit/Debit Card' },
      { value: 'UPI', label: 'UPI' },
      { value: 'NETBANKING', label: 'Net Banking' },
      { value: 'WALLET', label: 'Digital Wallet' },
      { value: 'EMI', label: 'EMI' },
      { value: 'BNPL', label: 'Buy Now Pay Later' }
    ];
  }

  // Helper methods for UI
  getFeeTypeColor(type: string): string {
    const colors = {
      'TRANSACTION': 'blue',
      'PROCESSING': 'green',
      'SETTLEMENT': 'orange',
      'REFUND': 'red',
      'CHARGEBACK': 'volcano',
      'MONTHLY': 'purple',
      'ANNUAL': 'magenta',
      'SETUP': 'cyan'
    };
    return colors[type as keyof typeof colors] || 'default';
  }

  getFeeStructureColor(structure: string): string {
    const colors = {
      'FLAT': 'blue',
      'PERCENTAGE': 'green',
      'TIERED': 'orange',
      'HYBRID': 'purple',
      'VOLUME_BASED': 'cyan',
      'CUSTOM': 'magenta'
    };
    return colors[structure as keyof typeof colors] || 'default';
  }

  formatCurrency(amount: number | string | null | undefined): string {
    const num = typeof amount === 'number'
      ? (isFinite(amount) ? amount : 0)
      : Number(amount ?? 0) || 0;
    return `₹${num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }

  formatPercentage(rate: number | string | null | undefined): string {
    const num = typeof rate === 'number' ? rate : Number(rate ?? 0) || 0;
    return `${num.toFixed(2)}%`;
  }

  validateFeeConfiguration(config: CreateFeeConfigurationRequest): string[] {
    const errors: string[] = [];

    if (config.base_rate < 0) {
      errors.push('Base rate cannot be negative');
    }

    if (config.minimum_fee && config.minimum_fee < 0) {
      errors.push('Minimum fee cannot be negative');
    }

    if (config.maximum_fee && config.minimum_fee && config.maximum_fee < config.minimum_fee) {
      errors.push('Maximum fee cannot be less than minimum fee');
    }

    if (config.fee_structure === 'TIERED' && (!config.tier_rates || config.tier_rates.length === 0)) {
      errors.push('Tier rates are required for tiered pricing structure');
    }

    if (config.fee_structure === 'VOLUME_BASED' && (!config.volume_slabs || config.volume_slabs.length === 0)) {
      errors.push('Volume slabs are required for volume-based pricing structure');
    }

    return errors;
  }

  generatePromoCode(): string {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
  }
}

export default new FeeConfigurationApiService();
