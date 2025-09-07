'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Drawer,
  StyledSpace,
  CentralButton,
  Input,
  List,
  Tag,
  Spin,
  Tooltip,
  message,
} from '@/components/ui';
import {
  SendOutlined,
  PlusOutlined,
  ReloadOutlined,
  CheckCircleTwoTone,
  ExclamationCircleTwoTone,
} from '@ant-design/icons';
import AIChatApiService, { AIChatRequest, AIChatResponse, AIChatSessionDTO } from '@/services/api/AIChatApiService';

type AssistantPanelProps = {
  open: boolean;
  onClose: () => void;
};

const AssistantPanel: React.FC<AssistantPanelProps> = ({ open, onClose }) => {
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [sessions, setSessions] = useState<AIChatSessionDTO[]>([]);
  const [activeSession, setActiveSession] = useState<AIChatSessionDTO | null>(null);
  const [messagesState, setMessagesState] = useState<{ role: 'human' | 'ai' | 'system' | 'error'; content: string; }[]>([]);
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement | null>(null);

  const loadSessions = async () => {
    setLoading(true);
    try {
      const list = await AIChatApiService.listSessions();
      setSessions(list);
      // Prefer the most recent session if none selected
      if (!activeSession && list.length > 0) {
        setActiveSession(list[0]);
      }
    } catch (e: any) {
      message.error(e?.message || 'Failed to load sessions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) loadSessions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messagesState, sending]);

  const startNewSession = async () => {
    setLoading(true);
    try {
      const session = await AIChatApiService.createSession();
      setActiveSession(session);
      setSessions((prev) => [session, ...prev]);
      setMessagesState([]);
    } catch (e: any) {
      message.error(e?.message || 'Failed to create session');
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async () => {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setSending(true);
    // Optimistic human message
    setMessagesState((prev) => [...prev, { role: 'human', content: text }]);
    try {
      // Ensure a session exists
      let sessionId = activeSession?.session_id;
      if (!sessionId) {
        const session = await AIChatApiService.createSession();
        setActiveSession(session);
        setSessions((prev) => [session, ...prev]);
        sessionId = session.session_id;
      }

      const payload: AIChatRequest = { message: text, session_id: sessionId };
      const response: any = await AIChatApiService.chat(payload);

      // Append AI reply (backend uses `response`; support `reply` alias)
      const replyText = response?.reply ?? response?.response ?? '';
      if (replyText) {
        setMessagesState((prev) => [...prev, { role: 'ai', content: replyText }]);
      }

      // If backend surfaced an error, show it in the thread
      if (response?.error) {
        const errMsg = typeof response.error === 'string' ? response.error : (response.error.message || 'Agent error');
        setMessagesState((prev) => [...prev, { role: 'error', content: errMsg }]);
      }

      if (response.requires_approval && response.audit_id) {
        message.info('Action requires approval. Check the audit list in AI Assistant.');
      }
    } catch (e: any) {
      setMessagesState((prev) => [...prev, { role: 'error', content: e?.message || 'Failed to send message' }]);
    } finally {
      setSending(false);
    }
  };

  const header = (
    <StyledSpace align="center" style={{ width: '100%', justifyContent: 'space-between' }}>
      <StyledSpace size="small">
        <strong>Admin Assistant</strong>
        <Tag color={activeSession ? 'green' : 'default'}>{activeSession ? 'Active' : 'No Session'}</Tag>
      </StyledSpace>
      <StyledSpace>
        <Tooltip title="New Session">
          <CentralButton type="default" icon={<PlusOutlined />} onClick={startNewSession}>
            New
          </CentralButton>
        </Tooltip>
        <Tooltip title="Refresh Sessions">
          <CentralButton type="text" icon={<ReloadOutlined spin={loading} />} onClick={loadSessions} />
        </Tooltip>
      </StyledSpace>
    </StyledSpace>
  );

  const renderMessage = (m: { role: 'human' | 'ai' | 'system' | 'error'; content: string }, idx: number) => {
    const alignRight = m.role === 'human';
    const bg = m.role === 'human' ? 'var(--color-primary-alpha-10)' : m.role === 'ai' ? 'var(--color-bg-elevated)' : '#fffbe6';
    const border = m.role === 'error' ? '1px solid #ffccc7' : '1px solid var(--color-border)';
    return (
      <div key={idx} style={{ display: 'flex', justifyContent: alignRight ? 'flex-end' : 'flex-start', marginBottom: 8 }}>
        <div style={{
          maxWidth: '80%',
          background: bg,
          border,
          borderRadius: 8,
          padding: 10,
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
        }}>
          {m.content}
        </div>
      </div>
    );
  };

  return (
    <Drawer
      title={header}
      placement="right"
      width={480}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Sessions quick list */}
        <div style={{ marginBottom: 8 }}>
          <List
            size="small"
            bordered
            dataSource={sessions}
            renderItem={(s) => (
              <List.Item
                onClick={() => setActiveSession(s)}
                style={{ cursor: 'pointer', background: activeSession?.session_id === s.session_id ? 'var(--color-primary-alpha-10)' : undefined }}
              >
                <StyledSpace size="small">
                  <span>Session</span>
                  <Tag color={activeSession?.session_id === s.session_id ? 'blue' : 'default'}>{s.session_id.slice(0, 8)}…</Tag>
                </StyledSpace>
              </List.Item>
            )}
          />
        </div>

        {/* Messages area */}
        <div ref={scrollRef} style={{ flex: 1, overflowY: 'auto', padding: '8px 4px', border: '1px solid var(--color-border)', borderRadius: 6, marginBottom: 8 }}>
          {messagesState.length === 0 && (
            <div style={{ color: 'var(--color-text-secondary)' }}>Ask about transactions, clients, refunds, settlements, etc.</div>
          )}
          {messagesState.map(renderMessage)}
          {sending && (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', color: 'var(--color-text-secondary)' }}>
              <Spin size="small" /> <span>Thinking…</span>
            </div>
          )}
        </div>

        {/* Input row */}
        <StyledSpace style={{ width: '100%' }}>
          <Input.TextArea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onPressEnter={(e) => {
              if (!e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Type your message…"
            autoSize={{ minRows: 1, maxRows: 4 }}
          />
          <CentralButton type="primary" icon={<SendOutlined />} onClick={handleSend} loading={sending}>
            Send
          </CentralButton>
        </StyledSpace>
      </div>
    </Drawer>
  );
};

export default AssistantPanel;
