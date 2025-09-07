/**
 * Centralized TypeScript Types and Interfaces
 * Following SOLID principles with proper type safety
 */

// ============= User & Authentication Types =============
export interface IUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
  avatar?: string;
  lastLogin?: Date;
  mfaEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN = 'ADMIN',
  OPERATIONS_MANAGER = 'OPERATIONS_MANAGER',
  SETTLEMENT_ADMIN = 'SETTLEMENT_ADMIN',
  CONFIGURATION_MANAGER = 'CONFIGURATION_MANAGER',
  COMPLIANCE_OFFICER = 'COMPLIANCE_OFFICER',
  VIEWER = 'VIEWER'
}

export interface Permission {
  resource: string;
  actions: ('create' | 'read' | 'update' | 'delete')[];
}

export interface AuthCredentials {
  email: string;
  password: string;
  remember?: boolean;
}

export interface MFAVerification {
  code: string;
  method: 'totp' | 'sms' | 'email';
}

// ============= Client Types =============
export interface IClient {
  id: string;
  clientId: string;
  name: string;
  email: string;
  phone: string;
  website?: string;
  industry: ClientIndustry;
  contactPerson: string;
  status: ClientStatus;
  tier: ClientTier;
  kycStatus: KYCStatus;
  apiKeys: {
    live: boolean;
    test: boolean;
  };
  settlementCycle: SettlementCycle;
  settlementAccount: string;
  totalVolume: number;
  transactionCount: number;
  createdAt: string;
  updatedAt: string;
}

export enum ClientStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING = 'pending'
}

export enum ClientTier {
  BASIC = 'basic',
  STANDARD = 'standard',
  PREMIUM = 'premium',
  ENTERPRISE = 'enterprise'
}

export enum ClientIndustry {
  EDUCATION = 'education',
  RETAIL = 'retail',
  HEALTHCARE = 'healthcare',
  TECHNOLOGY = 'technology',
  FINANCE = 'finance',
  ECOMMERCE = 'ecommerce',
  OTHER = 'other'
}

export enum KYCStatus {
  VERIFIED = 'VERIFIED',
  PENDING = 'PENDING',
  REJECTED = 'REJECTED',
  NOT_STARTED = 'NOT_STARTED'
}

// ============= Transaction Types =============
export interface ITransaction {
  id: string;
  transactionId: string;
  clientId: string;
  clientName: string;
  amount: number;
  currency: Currency;
  status: TransactionStatus;
  method: PaymentMethod;
  customerEmail?: string;
  customerPhone?: string;
  referenceId?: string;
  description?: string;
  settlementId?: string;
  settlementStatus?: SettlementStatus;
  fee: number;
  tax: number;
  netAmount: number;
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  processedAt?: string;
  failureReason?: string;
  retryCount: number;
  refundedAmount?: number;
}

export enum TransactionStatus {
  SUCCESS = 'success',
  PENDING = 'pending',
  FAILED = 'failed',
  REFUNDED = 'refunded',
  PARTIALLY_REFUNDED = 'partially_refunded',
  CANCELLED = 'cancelled',
  PROCESSING = 'processing'
}

export enum PaymentMethod {
  UPI = 'upi',
  CREDIT_CARD = 'credit_card',
  DEBIT_CARD = 'debit_card',
  NET_BANKING = 'net_banking',
  WALLET = 'wallet',
  BANK_TRANSFER = 'bank_transfer'
}

export enum Currency {
  INR = 'INR',
  USD = 'USD',
  EUR = 'EUR',
  GBP = 'GBP'
}

// ============= Settlement Types =============
export interface ISettlement {
  id: string;
  settlementId: string;
  clientId: string;
  clientName: string;
  amount: number;
  transactionCount: number;
  settlementDate: string;
  status: SettlementStatus;
  cycle: SettlementCycle;
  bankAccount: string;
  bankName?: string;
  ifscCode?: string;
  utrNumber?: string;
  processedAt?: string;
  failureReason?: string;
  fees: number;
  tax: number;
  netAmount: number;
  transactions?: string[]; // Transaction IDs
  createdAt: string;
  updatedAt: string;
}

export enum SettlementStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  ON_HOLD = 'on_hold',
  CANCELLED = 'cancelled'
}

export enum SettlementCycle {
  T0 = 'T+0',
  T1 = 'T+1',
  T2 = 'T+2',
  T3 = 'T+3',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY'
}

// ============= Dashboard Types =============
export interface DashboardMetrics {
  todayTransactions: number;
  todayVolume: number;
  successRate: number;
  activeClients: number;
  pendingSettlements: number;
  avgResponseTime: number;
  failedTransactions: number;
  refundedAmount: number;
}

export interface TrendData {
  current: number;
  previous: number;
  trend: number;
  changePercent: number;
}

export interface TimeSeriesData {
  timestamp: string;
  value: number;
  label?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
  }[];
}

// ============= Webhook Types =============
export interface IWebhook {
  id: string;
  name: string;
  url: string;
  events: WebhookEvent[];
  status: WebhookStatus;
  secret: string;
  headers?: Record<string, string>;
  retryPolicy: {
    maxRetries: number;
    retryInterval: number;
  };
  createdAt: string;
  updatedAt: string;
  lastTriggered?: string;
  successRate: number;
  totalCalls: number;
  failedCalls: number;
}

export enum WebhookEvent {
  TRANSACTION_SUCCESS = 'transaction.success',
  TRANSACTION_FAILED = 'transaction.failed',
  SETTLEMENT_COMPLETED = 'settlement.completed',
  SETTLEMENT_FAILED = 'settlement.failed',
  CLIENT_CREATED = 'client.created',
  CLIENT_UPDATED = 'client.updated',
  REFUND_INITIATED = 'refund.initiated',
  DISPUTE_CREATED = 'dispute.created'
}

export enum WebhookStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  FAILED = 'failed'
}

export interface WebhookLog {
  id: string;
  webhookId: string;
  event: WebhookEvent;
  status: 'success' | 'failure' | 'pending';
  statusCode?: number;
  timestamp: string;
  duration: number;
  request: any;
  response: any;
  retryCount: number;
  error?: string;
}

// ============= Compliance & Audit Types =============
export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: AuditAction;
  entity: AuditEntity;
  entityId: string;
  changes?: Record<string, { old: any; new: any }>;
  ipAddress: string;
  userAgent: string;
  status: 'success' | 'failure';
  details: string;
  metadata?: Record<string, any>;
}

export enum AuditAction {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  VIEW = 'view',
  EXPORT = 'export',
  LOGIN = 'login',
  LOGOUT = 'logout'
}

export enum AuditEntity {
  CLIENT = 'client',
  TRANSACTION = 'transaction',
  SETTLEMENT = 'settlement',
  USER = 'user',
  CONFIGURATION = 'configuration',
  WEBHOOK = 'webhook'
}

export interface ComplianceReport {
  id: string;
  title: string;
  type: ReportType;
  generatedDate: string;
  period: string;
  status: 'ready' | 'generating' | 'failed';
  size: string;
  downloadUrl?: string;
  parameters?: Record<string, any>;
}

export enum ReportType {
  RBI_COMPLIANCE = 'RBI Compliance',
  PCI_DSS = 'PCI DSS',
  TRANSACTION_AUDIT = 'Transaction Audit',
  KYC_COMPLIANCE = 'KYC Compliance',
  RISK_ASSESSMENT = 'Risk Assessment',
  GDPR_PRIVACY = 'GDPR/Privacy'
}

// ============= API Response Types =============
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: any;
  field?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface BulkOperationResult {
  success: number;
  failed: number;
  errors: Array<{
    item: any;
    error: string;
  }>;
  message: string;
}

// ============= Filter & Query Types =============
export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  filters?: Record<string, any>;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface FilterOption {
  label: string;
  value: string;
  count?: number;
}

// ============= Notification Types =============
export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  metadata?: Record<string, any>;
}

export enum NotificationType {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
  ALERT = 'alert'
}

// ============= Configuration Types =============
export interface SystemConfig {
  id: string;
  key: string;
  value: any;
  type: 'string' | 'number' | 'boolean' | 'json';
  category: ConfigCategory;
  description?: string;
  editable: boolean;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    options?: any[];
  };
  updatedBy?: string;
  updatedAt: string;
}

export enum ConfigCategory {
  GENERAL = 'general',
  SECURITY = 'security',
  PAYMENT = 'payment',
  SETTLEMENT = 'settlement',
  NOTIFICATION = 'notification',
  API = 'api',
  COMPLIANCE = 'compliance'
}

// ============= Fee Configuration Types =============
export interface FeeStructure {
  id: string;
  clientId?: string; // Optional for global fees
  name: string;
  type: FeeType;
  value: number;
  method?: PaymentMethod;
  minAmount?: number;
  maxAmount?: number;
  priority: number;
  active: boolean;
  validFrom: string;
  validTo?: string;
}

export enum FeeType {
  PERCENTAGE = 'percentage',
  FLAT = 'flat',
  TIERED = 'tiered',
  VOLUME_BASED = 'volume_based'
}

// ============= API Key Types =============
export interface ApiKey {
  id: string;
  clientId: string;
  key: string;
  secret?: string; // Only shown once
  type: 'live' | 'test';
  name: string;
  permissions: string[];
  ipWhitelist?: string[];
  expiresAt?: string;
  lastUsed?: string;
  status: 'active' | 'revoked' | 'expired';
  createdAt: string;
  createdBy: string;
}

// ============= Export Types =============
export type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

export interface ExportRequest {
  type: 'clients' | 'transactions' | 'settlements' | 'audit';
  format: ExportFormat;
  filters?: QueryParams;
  columns?: string[];
}

// ============= Utility Types =============
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Nullable<T> = T | null;

export type Optional<T> = T | undefined;

// ============= Store Types =============
export interface StoreState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  lastFetch: Date | null;
}

export interface AsyncAction<T = void> {
  execute: () => Promise<T>;
  loading: boolean;
  error: string | null;
}

// ============= Form Types =============
export interface FormField<T = any> {
  name: string;
  label: string;
  type: 'text' | 'number' | 'email' | 'password' | 'select' | 'date' | 'checkbox' | 'textarea';
  value?: T;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  validation?: {
    pattern?: string;
    min?: number;
    max?: number;
    minLength?: number;
    maxLength?: number;
    custom?: (value: T) => string | undefined;
  };
  options?: Array<{ label: string; value: any }>;
}