'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, Form, Input, CentralButton as Button, List, Tag, Spin, App, CentralPageContainer, CentralProTable, ProColumns, Modal, StyledSpace } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { ClientApiService } from '@/services/api/ClientApiService';

export default function IntegrationApiKeysPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [clientKeys, setClientKeys] = useState<any[]>([]);
  const api = new ClientApiService();

  const onGenerate = async (values: { client_id: string }) => {
    try {
      setLoading(true);
      const data = await api.generateApiKey(values.client_id);
      setResult(data);
      message.success('API key generated');
    } catch (e: any) {
      message.error(e?.message || 'Failed to generate API key');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Load first page of clients, then hydrate auth fields via detail
        const list = await new ClientApiService().getAll({ page: 1, page_size: 20 } as any);
        const items = (list as any).results || (list as any) || [];
        const details = await Promise.all(
          items.map(async (c: any) => {
            try {
              const full = await new ClientApiService().getById(String(c.client_id));
              return full;
            } catch {
              return null;
            }
          })
        );
        const withKeys = details.filter(Boolean).filter((c: any) => c.auth_flag);
        setClientKeys(withKeys as any[]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const headerExtra = (
    <StyledSpace>
      <Button type="primary" onClick={() => setShowModal(true)}>Generate API Key</Button>
    </StyledSpace>
  );

  const columns: ProColumns<any>[] = [
    { title: 'Client Code', dataIndex: 'client_code', key: 'client_code' },
    { title: 'Client Name', dataIndex: 'client_name', key: 'client_name' },
    { title: 'Type', dataIndex: 'auth_type', key: 'auth_type' },
    { title: 'Key', dataIndex: 'auth_key', key: 'auth_key', ellipsis: true, render: (_, r) => (r.auth_key ? `${String(r.auth_key).slice(0,6)}•••••` : '-') },
    { title: 'IV', dataIndex: 'auth_iv', key: 'auth_iv', ellipsis: true, render: (_, r) => (r.auth_iv ? `${String(r.auth_iv).slice(0,4)}•••••` : '-') },
    { title: 'Actions', valueType: 'option', key: 'action', render: (_, r) => [<a key="regen" onClick={() => onGenerate({ client_id: r.client_id })}>Regenerate</a>] },
  ];

  return (
    <CentralPageContainer withBackground title="API Keys" extra={headerExtra}>
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
        <ResponsiveGrid layout="dashboard" background="none">
          <ResponsiveRow gutter={16}>
            <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
              <StyledCard data-testid="stub-integration-api-keys">
                <CentralProTable<any>
                  rowKey={(r) => r.client_id}
                  search={false}
                  columns={columns}
                  dataSource={clientKeys}
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  className="transaction-table"
                />
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>
        </ResponsiveGrid>
      </ResponsiveContainer>
      <Modal title="Generate Client API Key" open={showModal} onCancel={() => setShowModal(false)} footer={null} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={(vals) => { onGenerate(vals); setShowModal(false); }}>
          <Form.Item name="client_id" label="Client ID" rules={[{ required: true, message: 'Enter client ID' }]}>
            <Input placeholder="e.g., 1001" />
          </Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>Generate</Button>
        </Form>
        {result && (
          <div style={{ marginTop: 16 }}>
            <CentralText type="secondary">Client: {result.client_id}</CentralText>
            <div><CentralText strong>Key:</CentralText> <CentralText code>{result.auth_key}</CentralText></div>
            <div><CentralText strong>IV:</CentralText> <CentralText code>{result.auth_iv}</CentralText></div>
            <div><CentralText strong>Type:</CentralText> <CentralText>{result.auth_type}</CentralText></div>
          </div>
        )}
      </Modal>
    </CentralPageContainer>
  );
}
