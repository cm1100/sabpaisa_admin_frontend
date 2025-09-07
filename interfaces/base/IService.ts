/**
 * Service layer interfaces following Single Responsibility Principle
 * Each service interface focuses on a specific business capability
 */

/**
 * Base service interface
 */
export interface IService {
  readonly serviceName: string;
  initialize?(): Promise<void>;
  dispose?(): Promise<void>;
}

/**
 * Interface for services that handle CRUD operations
 */
export interface ICrudService<T, CreateDTO, UpdateDTO> extends IService {
  getById(id: string): Promise<T>;
  getAll(params?: any): Promise<T[]>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<boolean>;
}

/**
 * Interface for services that handle authentication
 */
export interface IAuthService extends IService {
  login(credentials: ILoginCredentials): Promise<IAuthToken>;
  logout(token: string): Promise<void>;
  refresh(refreshToken: string): Promise<IAuthToken>;
  verify(token: string): Promise<ITokenPayload>;
}

/**
 * Interface for services that handle notifications
 */
export interface INotificationService extends IService {
  send(notification: INotification): Promise<boolean>;
  sendBulk(notifications: INotification[]): Promise<boolean[]>;
  getTemplates(): Promise<INotificationTemplate[]>;
}

/**
 * Interface for services that handle file operations
 */
export interface IFileService extends IService {
  upload(file: File): Promise<IFileMetadata>;
  download(fileId: string): Promise<Blob>;
  delete(fileId: string): Promise<boolean>;
  getMetadata(fileId: string): Promise<IFileMetadata>;
}

/**
 * Interface for services that handle validation
 */
export interface IValidationService<T> extends IService {
  validate(data: T): Promise<IValidationResult>;
  validateField(fieldName: keyof T, value: any): Promise<IValidationResult>;
  getValidationRules(): IValidationRule[];
}

// Supporting interfaces
export interface ILoginCredentials {
  username: string;
  password: string;
  mfaCode?: string;
}

export interface IAuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface ITokenPayload {
  userId: string;
  username: string;
  roles: string[];
  permissions: string[];
  exp: number;
  iat: number;
}

export interface INotification {
  to: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  subject?: string;
  body: string;
  templateId?: string;
  data?: Record<string, any>;
}

export interface INotificationTemplate {
  id: string;
  name: string;
  type: string;
  template: string;
  variables: string[];
}

export interface IFileMetadata {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  url: string;
  uploadedAt: Date;
  uploadedBy: string;
}

export interface IValidationResult {
  isValid: boolean;
  errors: IValidationError[];
}

export interface IValidationError {
  field: string;
  message: string;
  code: string;
}

export interface IValidationRule {
  field: string;
  rules: string[];
  message?: string;
}