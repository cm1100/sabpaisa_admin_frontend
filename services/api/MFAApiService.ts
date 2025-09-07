import { BaseApiService } from './base/BaseApiService';

export interface MFASetupResponse {
  success: boolean;
  data?: {
    device_id: number;
    secret: string;
    qr_code: string; // base64 PNG
    provisioning_uri: string;
    backup_codes: string[];
    status: string;
  };
  error?: string;
}

class MFAApiService extends BaseApiService {
  public readonly serviceName = 'MFAService';
  protected readonly endpoint = '/auth/mfa';

  async setup(device_name = 'Default'): Promise<MFASetupResponse> {
    return this.post<MFASetupResponse>('/setup/', { device_name });
  }

  async verifySetup(device_id: number, token: string): Promise<{ success: boolean; message?: string; error?: string }>{
    return this.post('/verify-setup/', { device_id, token });
  }

  async verify(token: string, trust_device = false): Promise<any> {
    return this.post('/verify/', { token, trust_device });
  }

  async listDevices(): Promise<{ success: boolean; devices: any[] }>{
    return this.get('/devices/');
  }

  async removeDevice(device_id: number): Promise<{ success: boolean; message?: string; error?: string }>{
    return this.delete(`/devices/${device_id}/`);
  }

  async getBackupCodesCount(): Promise<{ success: boolean; unused_codes_count: number }>{
    return this.get('/backup-codes/');
  }

  async regenerateBackupCodes(): Promise<{ success: boolean; backup_codes: string[]; message?: string }>{
    return this.post('/backup-codes/', {});
  }

  async listTrustedDevices(): Promise<{ success: boolean; devices: any[] }>{
    return this.get('/trusted-devices/');
  }

  async revokeTrustedDevice(device_id: number): Promise<{ success: boolean; message?: string; error?: string }>{
    return this.delete(`/trusted-devices/${device_id}/`);
  }

  async getConfiguration(): Promise<{ success: boolean; configuration: any }>{
    return this.get('/configuration/');
  }

  async updateConfiguration(data: Partial<{ require_mfa_for_login: boolean }>): Promise<{ success: boolean; configuration: any }>{
    return this.patch('/configuration/', data);
  }
}

export default new MFAApiService();

