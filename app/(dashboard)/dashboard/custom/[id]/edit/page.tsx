'use client';

import React, { useEffect, useState } from 'react';
import CentralPageContainer from '@/components/ui/CentralPageContainer';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { builderService, BuilderChatResponse, CustomDashboardDTO } from '@/services/api/BuilderApiService';
import WidgetRenderer from '@/components/dashboards/WidgetRenderer';
import { StyledSpace, CentralButton, Input, Tag, message } from '@/components/ui';
import { useParams, useRouter } from 'next/navigation';

const EditCustomDashboardPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [title, setTitle] = useState<string>('');
  const [config, setConfig] = useState<any | null>(null);
  const [rendered, setRendered] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messagesState, setMessagesState] = useState<{ role: 'human' | 'ai' | 'error'; content: string }[]>([]);

  const load = async () => {
    try {
      setLoading(true);
      const item = await builderService.getDashboard(id);
      setTitle(item.title);
      setConfig(item.layout);
      // initial render for preview
      const r = await builderService.render(item.layout);
      setRendered(r);
    } catch (e: any) {
      message.error(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) load(); }, [id]);

  const send = async () => {
    const text = chatInput.trim();
    if (!text || !config) return;
    setChatInput('');
    setMessagesState((prev) => [...prev, { role: 'human', content: text }]);
    try {
      setLoading(true);
      const resp: BuilderChatResponse = await builderService.chat({ message: text, config });
      if (resp.error) {
        setMessagesState((prev) => [...prev, { role: 'error', content: resp.error || 'Agent error' }]);
      } else {
        setMessagesState((prev) => [...prev, { role: 'ai', content: resp.response }]);
        if (resp.config) setConfig(resp.config);
      }
    } catch (e: any) {
      setMessagesState((prev) => [...prev, { role: 'error', content: e?.message || 'Failed to send' }]);
    } finally {
      setLoading(false);
    }
  };

  const validate = async () => {
    if (!config) return;
    try { setLoading(true); const r = await builderService.validate(config); r.ok ? message.success('Validation OK') : message.error(r.error || 'Validation failed'); } catch (e: any) { message.error(e?.message || 'Validation failed'); } finally { setLoading(false); }
  };

  const renderNow = async () => {
    if (!config) return;
    try { setLoading(true); const r = await builderService.render(config); setRendered(r); } catch (e: any) { message.error(e?.message || 'Render failed'); } finally { setLoading(false); }
  };

  const save = async () => {
    if (!config) return;
    try { setSaving(true); await builderService.updateDashboard(id, { title, layout: config }); message.success('Saved'); } catch (e: any) { message.error(e?.message || 'Save failed'); } finally { setSaving(false); }
  };

  const slots = (rendered?.slots || []).slice(0, 4);

  return (
    <CentralPageContainer withBackground title={'Edit: ' + (title || 'Custom Dashboard')}
      extra={
        <StyledSpace>
          <Input placeholder="Dashboard title" value={title} onChange={(e) => setTitle(e.target.value)} style={{ width: 240 }} />
          <CentralButton onClick={validate} loading={loading} disabled={!config}>Validate</CentralButton>
          <CentralButton type="primary" onClick={renderNow} loading={loading} disabled={!config}>Render</CentralButton>
          <CentralButton type="primary" onClick={save} loading={saving} disabled={!config}>Save</CentralButton>
          <CentralButton onClick={() => router.push(`/dashboard/custom/${id}`)}>View</CentralButton>
        </StyledSpace>
      }
    >
      <ResponsiveRow gutter={16}>
        <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
          <StyledSpace direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, padding: 8, minHeight: 180 }}>
              {messagesState.length === 0 ? (
                <div style={{ color: 'var(--app-colorTextTertiary)' }}>
                  You can tweak the current layout. Try: “replace slot 2 with hourly volume 24h”.
                </div>
              ) : (
                messagesState.map((m, i) => (
                  <div key={i} style={{ marginBottom: 6 }}>
                    <Tag color={m.role === 'human' ? 'blue' : m.role === 'ai' ? 'green' : 'red'}>{m.role.toUpperCase()}</Tag>
                    <span style={{ whiteSpace: 'pre-wrap' }}>{m.content}</span>
                  </div>
                ))
              )}
            </div>
            <StyledSpace style={{ width: '100%' }}>
              <Input.TextArea value={chatInput} onChange={(e) => setChatInput(e.target.value)} onPressEnter={(e) => { if (!e.shiftKey) { e.preventDefault(); send(); } }} placeholder="Describe changes…" autoSize={{ minRows: 1, maxRows: 4 }} />
              <CentralButton type="primary" onClick={send} loading={loading}>Send</CentralButton>
            </StyledSpace>
          </StyledSpace>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
          <StyledSpace direction="vertical" size="small" style={{ width: '100%' }}>
            <div style={{ color: 'var(--app-colorTextTertiary)' }}>Live Preview</div>
            <ResponsiveRow gutter={12}>
              {slots.slice(0, 2).map((s: any, idx: number) => (
                <ResponsiveCol key={s.id || idx} {...LAYOUT_CONFIG.halfWidth}>
                  <WidgetRenderer slot={s} />
                </ResponsiveCol>
              ))}
            </ResponsiveRow>
            <ResponsiveRow gutter={12}>
              {slots.slice(2, 4).map((s: any, idx: number) => (
                <ResponsiveCol key={s.id || idx} {...LAYOUT_CONFIG.halfWidth}>
                  <WidgetRenderer slot={s} />
                </ResponsiveCol>
              ))}
            </ResponsiveRow>
          </StyledSpace>
        </ResponsiveCol>
      </ResponsiveRow>
    </CentralPageContainer>
  );
};

export default EditCustomDashboardPage;

