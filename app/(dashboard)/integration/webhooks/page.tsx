'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, CentralTable, Spin, Tag, CentralPageContainer, Modal, Form, Input, Switch, Select, App, StyledSpace as Space, CentralButton as Button, Tooltip } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import WebhookApiService from '@/services/api/WebhookApiService';
import MobileDetailDrawer from '@/components/common/MobileDetailDrawer';
import { useResponsive } from '@/hooks/useResponsive';
import { CheckCircleOutlined, ApiOutlined, PoweroffOutlined, PlusOutlined } from '@ant-design/icons';

export default function IntegrationWebhooksPage() {
  const { message } = App.useApp();
  const [configs, setConfigs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [form] = Form.useForm();
  const responsive = useResponsive();
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedConfig, setSelectedConfig] = useState<any>(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await WebhookApiService.getWebhookConfigs();
        const list = (resp.data as any).results || resp.data || [];
        setConfigs(list);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onCreate = async () => {
    try {
      const values = await form.validateFields();
      const resp = await WebhookApiService.createWebhook({
        client_id: values.client_id,
        endpoint_url: values.endpoint_url,
        events_subscribed: values.events,
        timeout_seconds: 30,
      });
      setConfigs([resp.data, ...configs]);
      setModalOpen(false);
      form.resetFields();
      message.success('Webhook created');
    } catch (e: any) {
      message.error(e?.message || 'Create failed');
    }
  };

  const toggleActive = async (record: any) => {
    try {
      const resp = await WebhookApiService.toggleWebhookStatus(record.config_id);
      const updated = configs.map(c => c.config_id === record.config_id ? { ...c, is_active: resp.data.is_active } : c);
      setConfigs(updated);
      message.success('Status updated');
    } catch (e: any) { message.error(e?.message || 'Toggle failed'); }
  };

  const testWebhook = async (record: any) => {
    try {
      const resp = await WebhookApiService.testWebhook(record.config_id, { event_type: 'transaction.success', test_payload: { ping: true } });
      message.success(`Test: ${resp.data.status}`);
    } catch (e: any) { message.error(e?.message || 'Test failed'); }
  };

  const columns = [
    { title: 'ID', dataIndex: 'config_id', key: 'config_id' },
    { title: 'URL', dataIndex: 'endpoint_url', key: 'endpoint_url' },
    { title: 'Events', dataIndex: 'events_subscribed', key: 'events_subscribed', render: (arr: string[]) => (arr || []).slice(0,3).map(e => <Tag key={e}>{e}</Tag>) },
    { title: 'Status', dataIndex: 'is_active', key: 'is_active', render: (_: any, r: any) => (
      <Space>
        <Tag color={r.is_active ? 'green' : 'red'}>{r.is_active ? 'Active' : 'Inactive'}</Tag>
        <Tooltip title="Toggle Active">
          <Button size="small" icon={<PoweroffOutlined />} onClick={() => toggleActive(r)} />
        </Tooltip>
        <Tooltip title="Send Test Event">
          <Button size="small" icon={<ApiOutlined />} onClick={() => testWebhook(r)} />
        </Tooltip>
      </Space>
    ) },
  ];

  return (
    <CentralPageContainer withBackground title="Integration Webhooks">
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
        <ResponsiveRow gutter={16}>
        <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
          <StyledCard data-testid="stub-integration-webhooks"
            extra={<Button type="primary" icon={<PlusOutlined />} onClick={() => setModalOpen(true)}>Create</Button>}
          >
          {loading ? <Spin /> : (
            <CentralTable dataSource={configs} columns={columns as any} rowKey={(r: any) => r.config_id} pagination={{ pageSize: 10 }} className="transaction-table" onRow={(record) => ({ onClick: () => { if (responsive.isMobile) { setSelectedConfig(record); setDetailOpen(true); } } })} />
          )}
          <Modal title="Create Webhook" open={modalOpen} onOk={onCreate} onCancel={() => setModalOpen(false)}>
            <Form form={form} layout="vertical">
              <Form.Item name="client_id" label="Client ID" rules={[{ required: true }]}>
                <Input placeholder="e.g., CLT001" />
              </Form.Item>
              <Form.Item name="endpoint_url" label="Endpoint URL" rules={[{ required: true }]}>
                <Input placeholder="https://example.com/webhooks" />
              </Form.Item>
              <Form.Item name="events" label="Events" rules={[{ required: true }]}>
                <Select mode="multiple" options={WebhookApiService.getAvailableEventTypes().map(e => ({ label: e.label, value: e.value }))} />
              </Form.Item>
              <Form.Item>
                <CentralText type="secondary">Secret will be generated automatically.</CentralText>
              </Form.Item>
            </Form>
          </Modal>
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>
      </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
    {responsive.isMobile && (
      <MobileDetailDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selectedConfig ? selectedConfig.endpoint_url : 'Webhook'}
      >
        {selectedConfig && (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space style={{ justifyContent: 'space-between', width: '100%' }}>
              <CentralText type="secondary">URL</CentralText>
              <CentralText>{selectedConfig.endpoint_url}</CentralText>
            </Space>
            <Space style={{ justifyContent: 'space-between', width: '100%' }}>
              <CentralText type="secondary">Events</CentralText>
              <CentralText>{(selectedConfig.events_subscribed || []).join(', ')}</CentralText>
            </Space>
          </Space>
        )}
      </MobileDetailDrawer>
    )}
  );
}
