/**
 * Client domain model interfaces
 */
import { IEntity, ISoftDeletable, IStatusable, IAuditable } from '../base/IEntity';

/**
 * Client status enum
 */
export enum ClientStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  PENDING = 'PENDING',
  SUSPENDED = 'SUSPENDED',
  BLOCKED = 'BLOCKED'
}

/**
 * Client type enum
 */
export enum ClientType {
  INDIVIDUAL = 'INDIVIDUAL',
  BUSINESS = 'BUSINESS',
  GOVERNMENT = 'GOVERNMENT',
  EDUCATIONAL = 'EDUCATIONAL',
  NON_PROFIT = 'NON_PROFIT'
}

/**
 * KYC status enum
 */
export enum KYCStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_VERIFICATION = 'PENDING_VERIFICATION',
  VERIFIED = 'VERIFIED',
  REJECTED = 'REJECTED',
  EXPIRED = 'EXPIRED'
}

/**
 * Base client interface
 */
export interface IClient extends IEntity, ISoftDeletable, IStatusable, IAuditable {
  // Basic Information
  clientCode: string;
  clientName: string;
  legalName: string;
  clientType: ClientType;
  
  // Contact Information
  email: string;
  phone: string;
  alternatePhone?: string;
  website?: string;
  
  // Address Information
  address: IAddress;
  billingAddress?: IAddress;
  
  // Business Information
  businessCategory: string;
  industryType: string;
  annualTurnover?: number;
  employeeCount?: number;
  establishedDate?: Date;
  
  // KYC Information
  kycStatus: KYCStatus;
  kycVerifiedDate?: Date;
  kycDocuments?: IKYCDocument[];
  
  // Banking Information
  bankAccounts: IBankAccount[];
  settlementAccount?: string; // ID of primary settlement account
  
  // Configuration
  configuration: IClientConfiguration;
  
  // Compliance
  gstNumber?: string;
  panNumber?: string;
  tanNumber?: string;
  cinNumber?: string;
  
  // Relationships
  parentClientId?: string;
  subsidiaryClientIds?: string[];
  
  // Metrics
  totalTransactions?: number;
  totalVolume?: number;
  lastTransactionDate?: Date;
  
  // Override from IStatusable
  status: ClientStatus;
}

/**
 * Address interface
 */
export interface IAddress {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  country: string;
  pincode: string;
  landmark?: string;
}

/**
 * KYC Document interface
 */
export interface IKYCDocument {
  id: string;
  documentType: string;
  documentNumber: string;
  documentUrl: string;
  verificationStatus: string;
  verifiedDate?: Date;
  expiryDate?: Date;
  uploadedAt: Date;
}

/**
 * Bank Account interface
 */
export interface IBankAccount {
  id: string;
  accountNumber: string;
  accountHolderName: string;
  bankName: string;
  branchName: string;
  ifscCode: string;
  accountType: 'CURRENT' | 'SAVINGS';
  isPrimary: boolean;
  isVerified: boolean;
  verifiedDate?: Date;
}

/**
 * Client Configuration interface
 */
export interface IClientConfiguration {
  // Payment Methods
  enabledPaymentMethods: string[];
  
  // Transaction Limits
  dailyTransactionLimit: number;
  monthlyTransactionLimit: number;
  perTransactionLimit: number;
  minTransactionAmount: number;
  
  // Settlement Configuration
  settlementFrequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'CUSTOM';
  settlementDays?: number[]; // Days of week/month for settlement
  settlementTime?: string; // Time of day for settlement
  autoSettlement: boolean;
  
  // Fee Configuration
  feeStructureId: string;
  customFees?: ICustomFee[];
  
  // Security Settings
  requireMFA: boolean;
  ipWhitelist?: string[];
  webhookUrl?: string;
  webhookSecret?: string;
  
  // Features
  enabledFeatures: string[];
  customSettings?: Record<string, any>;
}

/**
 * Custom Fee interface
 */
export interface ICustomFee {
  paymentMethod: string;
  feeType: 'PERCENTAGE' | 'FLAT';
  feeValue: number;
  minFee?: number;
  maxFee?: number;
  effectiveFrom: Date;
  effectiveTo?: Date;
}

/**
 * Client creation DTO
 */
export interface IClientCreateDTO {
  clientName: string;
  legalName: string;
  clientType: ClientType;
  email: string;
  phone: string;
  address: IAddress;
  businessCategory: string;
  industryType: string;
  gstNumber?: string;
  panNumber?: string;
}

/**
 * Client update DTO
 */
export interface IClientUpdateDTO extends Partial<IClientCreateDTO> {
  status?: ClientStatus;
  configuration?: Partial<IClientConfiguration>;
}

/**
 * Client search parameters
 */
export interface IClientSearchParams {
  query?: string;
  status?: ClientStatus;
  clientType?: ClientType;
  kycStatus?: KYCStatus;
  fromDate?: Date;
  toDate?: Date;
  minVolume?: number;
  maxVolume?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}