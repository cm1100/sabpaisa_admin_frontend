/**
 * AI Chat API Service
 * Consistent with BaseApiService patterns and centralized config
 */
import { BaseApiService } from './base/BaseApiService';

export interface AIChatSessionDTO {
  session_id: string;
  thread_id?: string | null;
  created_at?: string;
  last_activity?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface AIChatMessageDTO {
  role: 'human' | 'ai' | 'system' | 'error';
  content: string;
  timestamp?: string;
}

export interface AIChatRequest {
  message: string;
  session_id?: string;
}

export interface AIChatResponse {
  session_id: string;
  reply: string;
  messages?: AIChatMessageDTO[]; // optional full transcript if returned
  tool_calls?: any[];
  requires_approval?: boolean;
  audit_id?: number;
}

class AIChatApiService extends BaseApiService {
  public readonly serviceName = 'AIChatApiService';
  protected readonly endpoint = '/ai-chat';

  /** List chat sessions for current user */
  async listSessions(): Promise<AIChatSessionDTO[]> {
    const data = await this.get<any>('sessions/');
    return this.normalizeResults<AIChatSessionDTO>(data);
  }

  /** Create a new chat session */
  async createSession(): Promise<AIChatSessionDTO> {
    return this.post<AIChatSessionDTO>('sessions/', {});
  }

  /** Send a chat message (optionally within an existing session) */
  async chat(input: AIChatRequest): Promise<AIChatResponse> {
    return this.post<AIChatResponse>('sessions/chat/', input);
  }

  /** List AI action audits (approval queue) */
  async listAudits(): Promise<any> {
    return this.get<any>('audit/');
  }

  /** Approve a pending AI action audit */
  async approveAudit(auditId: number | string): Promise<any> {
    return this.post<any>(`audit/${auditId}/approve/`, {});
  }
}

export default new AIChatApiService();

