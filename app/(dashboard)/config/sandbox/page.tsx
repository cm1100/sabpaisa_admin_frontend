'use client';

import React, { useEffect, useState } from 'react';
import { CentralAlert, CentralBadge, CentralButton, CentralParagraph, CentralTable, CentralTag, CentralText, CentralTextArea, CentralTitle, Divider, Form, Input, InputNumber, Modal, Select, StyledCard, StyledSpace, StyledStatistic, Tabs, Spin, App } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import {
  ExperimentOutlined,
  PlayCircleOutlined,
  BugOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ApiOutlined,
  ThunderboltOutlined,
  CodeOutlined
} from '@ant-design/icons';

const { Option } = Select;
// Replaced by CentralTextArea

const SandboxConfiguration: React.FC = () => {
  const { message } = App.useApp();
  const [activeTab, setActiveTab] = useState('gateway-test');
  const [testResults, setTestResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  // message via App provider

  // Gateway + Webhooks data
  const [gateways, setGateways] = useState<any[]>([]);
  const [webhooks, setWebhooks] = useState<any[]>([]);
  const [forms] = Form.useFormInstance ? [Form.useForm()[0]] : [null as any];
  const [gwForm] = Form.useForm();
  const [whForm] = Form.useForm();
  const [syncForm] = Form.useForm();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Lazy import services to avoid bundle spike
        const { default: GatewaySyncApiService } = await import('@/services/api/GatewaySyncApiService');
        const WebhookApiService = (await import('@/services/api/WebhookApiService')).default;
        const [gw, wh] = await Promise.all([
          GatewaySyncApiService.getGatewayConfigurations({ page: 1, page_size: 50 })
            .then((r: any): any[] => ((r.data as any).results || []))
            .catch((): any[] => []),
          WebhookApiService.getWebhookConfigs({ page: 1, page_size: 50 })
            .then((r: any): any[] => ((r.data as any).results || (r.data as any) || []))
            .catch((): any[] => [])
        ]);
        setGateways(gw);
        setWebhooks(wh);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const testColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      render: (timestamp: string) => new Date(timestamp).toLocaleTimeString()
    },
    {
      title: 'Gateway',
      dataIndex: ['request', 'gateway'],
      key: 'gateway',
      render: (gateway: string) => <CentralTag color="blue">{gateway}</CentralTag>
    },
    {
      title: 'Amount',
      dataIndex: ['request', 'amount'],
      key: 'amount',
      render: (amount: number) => `₹${amount}`
    },
    {
      title: 'Method',
      dataIndex: ['request', 'payment_method'],
      key: 'payment_method',
      render: (method: string) => <CentralTag>{method}</CentralTag>
    },
    {
      title: 'Status',
      dataIndex: ['response', 'success'],
      key: 'status',
      render: (success: boolean) => (
        <CentralBadge 
          status={success ? 'success' : 'error'} 
          text={success ? 'Success' : 'Failed'} 
        />
      )
    },
    {
      title: 'Processing Time',
      dataIndex: ['response', 'processing_time'],
      key: 'processing_time',
      render: (time: number) => `${time}ms`
    },
    {
      title: 'Transaction ID',
      dataIndex: ['response', 'transaction_id'],
      key: 'transaction_id',
      render: (id: string) => <CentralText code>{id}</CentralText>
    }
  ];

  return (
    <div >
      <div >
        <CentralTitle level={3}>
          <ExperimentOutlined  />
          Testing Sandbox
        </CentralTitle>
        <CentralParagraph type="secondary">
          Test payment flows, configurations, and integrations in an isolated environment.
          All transactions in sandbox are simulated and no real money is processed.
        </CentralParagraph>
      </div>

      {/* Environment Alert */}
      <CentralAlert
        message="Sandbox Environment"
        description="You are currently in the testing sandbox. All transactions are simulated and no real payments will be processed."
        type="warning"
        showIcon
        banner
      />

          {/* message via App */}
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Gateway Connection" key="gateway-test">
          <ResponsiveRow>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <StyledCard title="Test Gateway Connection">
                <Form form={gwForm} layout="vertical" onFinish={async (values) => {
                  try {
                    setLoading(true);
                    const { default: GatewaySyncApiService } = await import('@/services/api/GatewaySyncApiService');
                    const res = await GatewaySyncApiService.testConnection(values.gateway_id);
                    setTestResults(prev => [{ id: Date.now(), type: 'GATEWAY', data: res.data, timestamp: new Date().toISOString() }, ...prev]);
                    message.success('Gateway test executed');
                  } catch (e: any) {
                    message.error(e?.message || 'Gateway test failed');
                  } finally {
                    setLoading(false);
                  }
                }}>
                  <Form.Item name="gateway_id" label="Gateway Configuration" rules={[{ required: true }]}>
                    <Select placeholder="Select Gateway" loading={loading}>
                      {gateways.map((g: any) => (
                        <Option key={g.gateway_id} value={g.gateway_id}>{g.gateway_name} ({g.gateway_code})</Option>
                      ))}
                    </Select>
                  </Form.Item>
                  <CentralButton type="primary" htmlType="submit" loading={loading}>Test Connection</CentralButton>
                </Form>
              </StyledCard>
            </ResponsiveCol>

            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <StyledCard title="Test Statistics">
                <ResponsiveRow>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                    <StyledStatistic title="Total Tests" value={testResults.length} />
                  </ResponsiveCol>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                    <StyledStatistic title="Success Rate" value={testResults.length > 0 
                        ? ((testResults.filter(r => r.response.success).length / testResults.length) * 100).toFixed(1)
                        : 0
                      } suffix="%" />
                  </ResponsiveCol>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                    <StyledStatistic title="Avg Response Time" value={testResults.length > 0
                        ? Math.round(testResults.reduce((sum, r) => sum + r.response.processing_time, 0) / testResults.length)
                        : 0
                      } suffix="ms" />
                  </ResponsiveCol>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                    <StyledStatistic title="Total Fee" value={testResults.reduce((sum, r) => sum + parseFloat(r.response.fee || 0), 0).toFixed(2)} prefix="₹" />
                  </ResponsiveCol>
                </ResponsiveRow>
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>

          {/* Test Results */}
          <StyledCard title="Recent Test Results">
            <CentralTable
              columns={[
                { title: 'Time', dataIndex: 'timestamp', key: 'timestamp', render: (t: string) => new Date(t).toLocaleTimeString() },
                { title: 'Type', dataIndex: 'type', key: 'type' },
                { title: 'Result', dataIndex: 'data', key: 'data', render: (d: any) => <CentralText>{typeof d === 'string' ? d : JSON.stringify(d)}</CentralText> }
              ]}
              dataSource={testResults}
              rowKey="id"
              size="small"
              pagination={{ pageSize: 5 }}
              className="transaction-table"
              locale={{
                emptyText: 'No test results yet. Run a test transaction above.'
              }}
            />
          </StyledCard>
        </Tabs.TabPane>
        <Tabs.TabPane tab="Webhook Test" key="webhook-test">
          <StyledCard title="Test Webhook Delivery">
            <Form form={whForm} layout="vertical" onFinish={async (values) => {
              try {
                setLoading(true);
                const WebhookApiService = (await import('@/services/api/WebhookApiService')).default;
                const res = await WebhookApiService.testWebhook(values.config_id, { event_type: values.event_type, test_payload: JSON.parse(values.payload || '{}') });
                setTestResults(prev => [{ id: Date.now(), type: 'WEBHOOK', data: res.data, timestamp: new Date().toISOString() }, ...prev]);
                message.success('Webhook test sent');
              } catch (e: any) {
                message.error(e?.message || 'Webhook test failed');
              } finally {
                setLoading(false);
              }
            }}>
              <Form.Item name="config_id" label="Webhook Config" rules={[{ required: true }]}>
                <Select placeholder="Select Webhook Config">
                  {webhooks.map((w: any) => (
                    <Option key={w.config_id} value={w.config_id}>{w.endpoint_url}</Option>
                  ))}
                </Select>
              </Form.Item>
              <Form.Item name="event_type" label="Event Type" rules={[{ required: true }]}>
                <Input placeholder="payment.success" />
              </Form.Item>
              <Form.Item name="payload" label="Payload (JSON)">
                <CentralTextArea rows={4} placeholder='{"txn_id":"..."}' />
              </Form.Item>
              <CentralButton type="primary" htmlType="submit" loading={loading}>Send Test Webhook</CentralButton>
            </Form>
          </StyledCard>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Transaction Sync" key="sync-test">
          <StyledCard title="Queue Transaction Status Sync">
            <Form form={syncForm} layout="inline" onFinish={async (values) => {
              try {
                setLoading(true);
                const { default: GatewaySyncApiService } = await import('@/services/api/GatewaySyncApiService');
                const res = await GatewaySyncApiService.syncTransactionStatus(values.txn_id);
                setTestResults(prev => [{ id: Date.now(), type: 'SYNC', data: res.data, timestamp: new Date().toISOString() }, ...prev]);
                message.success('Sync queued');
              } catch (e: any) {
                message.error(e?.message || 'Failed to queue sync');
              } finally {
                setLoading(false);
              }
            }}>
              <Form.Item name="txn_id" label="Transaction ID" rules={[{ required: true }]}>
                <Input placeholder="Enter txn_id" />
              </Form.Item>
              <CentralButton type="primary" htmlType="submit" loading={loading}>Queue Status Sync</CentralButton>
            </Form>
          </StyledCard>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default SandboxConfiguration;
