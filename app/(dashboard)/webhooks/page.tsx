'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CentralAlert as Alert, CentralBadge as Badge, CentralButton as Button, CentralParagraph, CentralProTable, CentralTag as Tag, CentralText, CentralTextArea, CentralTitle, Divider, Dropdown, Form, Input, List, Menu, Modal, ProCard, ProColumns, ProTable, Select, StyledCard as Card, StyledSpace as Space, StyledStatistic, Switch, Tabs, Timeline, Tooltip, App } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SendOutlined,
  ReloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  ApiOutlined,
  LinkOutlined,
  LockOutlined,
  ThunderboltOutlined,
  HistoryOutlined,
  CodeOutlined,
  CopyOutlined,
  MoreOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { notifyError, notifySuccess } from '@/utils/notify';
import GatewaySyncApiService, {
  SyncDashboard,
  SyncQueueItem,
  WebhookLog as GatewayWebhookLog,
  GatewayConfiguration
} from '@/services/api/GatewaySyncApiService';
import WebhookApiService, {
  WebhookConfig,
  WebhookLog,
  WebhookStats,
  CreateWebhookRequest,
  WebhookTestRequest
} from '@/services/api/WebhookApiService';

// Typography components imported directly from centralized UI
// Replaced by CentralTextArea

// Using interfaces from WebhookApiService

const WebhookConfigurationPage: React.FC = () => {
  const { message } = App.useApp();
  const actionRef = useRef<any>(null);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [testModalVisible, setTestModalVisible] = useState(false);
  const [logsModalVisible, setLogsModalVisible] = useState(false);
  const [selectedWebhook, setSelectedWebhook] = useState<WebhookConfig | null>(null);
  const [editingWebhook, setEditingWebhook] = useState<WebhookConfig | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  const [form] = Form.useForm();
  const [testForm] = Form.useForm();
  
  // Gateway Sync state
  const [loading, setLoading] = useState(false);
  const [syncDashboard, setSyncDashboard] = useState<SyncDashboard | null>(null);
  const [syncQueue, setSyncQueue] = useState<SyncQueueItem[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<GatewayWebhookLog[]>([]);
  const [gatewayConfigs, setGatewayConfigs] = useState<GatewayConfiguration[]>([]);
  
  // Webhook Management state
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [webhookStats, setWebhookStats] = useState<WebhookStats | null>(null);
  const [logs, setLogs] = useState<WebhookLog[]>([]);
  
  // Use the variables to avoid TypeScript errors
  console.log('Forms initialized:', { form, testForm });

  // Load all webhook data
  const loadAllWebhookData = async () => {
    try {
      setLoading(true);
      const [dashboardData, queueData, logsData, configsData, webhooksData, statsData, webhookLogsData] = await Promise.all([
        GatewaySyncApiService.getDashboard(),
        GatewaySyncApiService.getQueue({ page_size: 50 }),
        GatewaySyncApiService.getWebhookLogs({ page_size: 100 }),
        GatewaySyncApiService.getGatewayConfigurations({ is_active: true }),
        WebhookApiService.getWebhooks({ page_size: 50 }),
        WebhookApiService.getWebhookStats(),
        WebhookApiService.getWebhookLogs({ page_size: 100 })
      ]);
      
      setSyncDashboard(dashboardData.data);
      setSyncQueue(queueData.data.results || []);
      setWebhookLogs(logsData.data.results || []);
      setGatewayConfigs(configsData.data.results || []);
      setWebhooks(webhooksData.data.results || []);
      setWebhookStats(statsData.data);
      setLogs(webhookLogsData.data.results || []);
    } catch (error: any) {
      console.error('Failed to load webhook data:', error);
      notifyError(error, 'Failed to load webhook data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh every 10 seconds for real-time updates
  React.useEffect(() => {
    loadAllWebhookData();
    const interval = setInterval(loadAllWebhookData, 10000);
    return () => clearInterval(interval);
  }, []);

  const eventTypes = WebhookApiService.getAvailableEventTypes();

  const columns: ProColumns<WebhookConfig>[] = [
    {
      title: 'Webhook',
      key: 'webhook',
      width: 250,
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <Space>
            <ApiOutlined />
            <CentralText strong>{record.name}</CentralText>
          </Space>
          <CentralText type="secondary" copyable>
            {record.id}
          </CentralText>
        </Space>
      )
    },
    {
      title: 'URL',
      dataIndex: 'url',
      key: 'url',
      width: 300,
      render: (url: any) => (
        <Space>
          <LinkOutlined />
          <CentralText copyable ellipsis>
            {url}
          </CentralText>
        </Space>
      )
    },
    {
      title: 'Events',
      dataIndex: 'events',
      key: 'events',
      width: 250,
      render: (events: any) => (
        <Space wrap>
          {(events as string[]).slice(0, 2).map(event => {
            const eventType = eventTypes.find(e => e.value === event);
            return (
              <Tag key={event} color={eventType?.color}>
                {eventType?.label || event}
              </Tag>
            );
          })}
          {(events as string[]).length > 2 && (
            <Tag>+{(events as string[]).length - 2} more</Tag>
          )}
        </Space>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      filters: [
        { text: 'Active', value: 'active' },
        { text: 'Inactive', value: 'inactive' },
        { text: 'Failed', value: 'failed' }
      ],
      render: (status: any) => {
        const statusConfig = {
          active: { color: 'success', text: 'Active', icon: <CheckCircleOutlined /> },
          inactive: { color: 'default', text: 'Inactive', icon: <CloseCircleOutlined /> },
          failed: { color: 'error', text: 'Failed', icon: <ExclamationCircleOutlined /> }
        };
        const config = statusConfig[status as keyof typeof statusConfig];
        return (
          <Badge
            status={config.color as any}
            text={
              <Space>
                {config.icon}
                {config.text}
              </Space>
            }
          />
        );
      }
    },
    {
      title: 'Performance',
      key: 'performance',
      width: 180,
      render: (_: any, record: any) => (
        <Space direction="vertical" size={0}>
          <CentralText>
            Success Rate: <CentralText strong>
              {record.successRate}%
            </CentralText>
          </CentralText>
          <CentralText type="secondary">
            {record.totalCalls} calls | {record.failedCalls} failed
          </CentralText>
        </Space>
      )
    },
    {
      title: 'Last Triggered',
      dataIndex: 'lastTriggered',
      key: 'lastTriggered',
      width: 150,
      render: (date: any) => date ? (
        <Space direction="vertical" size={0}>
          <CentralText>{dayjs(date).format('DD MMM')}</CentralText>
          <CentralText type="secondary">
            {dayjs(date).format('HH:mm:ss')}
          </CentralText>
        </Space>
      ) : (
        <CentralText type="secondary">Never</CentralText>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      fixed: 'right',
      render: (_: any, record: any) => (
        <Space>
          <Tooltip title="Test Webhook">
            <Button
              type="text"
              icon={<SendOutlined />}
              onClick={() => handleTest(record)}
            />
          </Tooltip>
          <Tooltip title="View Logs">
            <Button
              type="text"
              icon={<HistoryOutlined />}
              onClick={() => handleViewLogs(record)}
            />
          </Tooltip>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'edit',
                  label: 'Edit',
                  icon: <EditOutlined />,
                  onClick: () => handleEdit(record)
                },
                {
                  key: 'toggle',
                  label: record.status === 'active' ? 'Deactivate' : 'Activate',
                  icon: record.status === 'active' ? <CloseCircleOutlined /> : <CheckCircleOutlined />,
                  onClick: () => handleToggleStatus(record)
                },
                {
                  type: 'divider'
                },
                {
                  key: 'delete',
                  label: 'Delete',
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: () => handleDelete(record)
                }
              ]
            }}
          >
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      )
    }
  ];

  // Using real data from API state

  const handleEdit = (webhook: WebhookConfig) => {
    setEditingWebhook(webhook);
    form.setFieldsValue({
      client_id: webhook.client_id,
      endpoint_url: webhook.endpoint_url,
      events_subscribed: webhook.events_subscribed,
      is_active: webhook.is_active
    });
    setCreateModalVisible(true);
  };

  const handleTest = (webhook: WebhookConfig) => {
    setSelectedWebhook(webhook);
    testForm.setFieldsValue({
      event_type: webhook.events_subscribed[0] || webhook.events[0]
    });
    setTestModalVisible(true);
  };

  const handleViewLogs = (webhook: WebhookConfig) => {
    setSelectedWebhook(webhook);
    setLogsModalVisible(true);
  };

  const handleToggleStatus = async (webhook: WebhookConfig) => {
    try {
      const response = await WebhookApiService.toggleWebhookStatus(webhook.config_id);
      notifySuccess(response.data.message);
      loadAllWebhookData();
    } catch (error: any) {
      notifyError(error, 'Failed to toggle webhook status');
    }
  };

  const handleDelete = (webhook: WebhookConfig) => {
    Modal.confirm({
      title: 'Delete Webhook',
      content: `Are you sure you want to delete webhook ${webhook.config_id}?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await WebhookApiService.deleteWebhook(webhook.config_id);
          notifySuccess('Webhook deleted successfully');
          loadAllWebhookData();
        } catch (error: any) {
          notifyError(error, 'Failed to delete webhook');
        }
      }
    });
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      const webhookData: CreateWebhookRequest = {
        client_id: values.client_id || 'DEFAULT_CLIENT',
        endpoint_url: values.endpoint_url,
        events_subscribed: values.events_subscribed,
        max_retry_attempts: 3,
        timeout_seconds: 30,
        created_by: 'Admin'
      };
      
      if (editingWebhook) {
        await WebhookApiService.updateWebhook(editingWebhook.config_id, {
          endpoint_url: values.endpoint_url,
          events_subscribed: values.events_subscribed
        });
        notifySuccess('Webhook updated successfully');
      } else {
        await WebhookApiService.createWebhook(webhookData);
        notifySuccess('Webhook created successfully');
      }
      
      setCreateModalVisible(false);
      form.resetFields();
      setEditingWebhook(null);
      loadAllWebhookData();
    } catch (error: any) {
      message.error(error.message || 'Please fill in all required fields');
    }
  };

  const handleTestSubmit = async () => {
    try {
      const values = await testForm.validateFields();
      if (!selectedWebhook) return;
      
      const testPayload = {
        id: 'test_' + Date.now(),
        amount: 5000,
        status: 'success',
        timestamp: new Date().toISOString()
      };
      
      const testData: WebhookTestRequest = {
        event_type: values.event_type,
        test_payload: JSON.parse(values.payload || JSON.stringify(testPayload, null, 2))
      };
      
      message.loading('Testing webhook...', 0);
      const response = await WebhookApiService.testWebhook(selectedWebhook.config_id, testData);
      message.destroy();
      notifySuccess(response.data.message);
      setTestModalVisible(false);
      testForm.resetFields();
      loadAllWebhookData();
    } catch (error: any) {
      message.destroy();
      notifyError(error, 'Test webhook failed');
    }
  };

  // Gateway Sync handlers
  const handleSyncTransaction = async (txnId: string) => {
    try {
      await GatewaySyncApiService.syncTransactionStatus(txnId);
      notifySuccess(`Sync initiated for transaction ${txnId}`);
      loadAllWebhookData(); // Refresh data
    } catch (error: any) {
      notifyError(error, 'Failed to sync transaction');
    }
  };

  const handleRetrySync = async (syncId: number) => {
    try {
      await GatewaySyncApiService.retrySync(syncId);
      notifySuccess('Sync queued for retry');
      loadAllWebhookData();
    } catch (error: any) {
      notifyError(error, 'Failed to retry sync');
    }
  };

  const handleTestGateway = async (gatewayCode: string) => {
    try {
      const gw = gatewayConfigs.find(g => g.gateway_code === gatewayCode);
      if (!gw) {
        notifyError(new Error('Gateway not found'), 'Gateway test failed');
        return;
      }
      const response = await GatewaySyncApiService.testConnection(gw.gateway_id);
      notifySuccess(`Gateway ${gatewayCode} test successful`);
    } catch (error: any) {
      notifyError(error, 'Gateway test failed');
    }
  };

  return (
    <div>
      <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <ProCard>
            <StyledStatistic
              title="Queue Items"
              value={syncDashboard?.queue_stats.total || 0}
              prefix={<ApiOutlined />}
            />
            <div>
              {syncDashboard?.queue_stats.pending || 0} pending
            </div>
          </ProCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <ProCard>
            <StyledStatistic
              title="Avg Sync Time"
              value={syncDashboard?.avg_sync_time_ms || 0}
              suffix="ms"
              prefix={<ThunderboltOutlined />}
            />
            <div>
              SLA: {syncDashboard?.meets_sla ? '✅ Met' : '❌ Violated'}
            </div>
          </ProCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <ProCard>
            <StyledStatistic
              title="Completed Syncs"
              value={syncDashboard?.queue_stats.completed || 0}
              prefix={<CheckCircleOutlined />}
            />
          </ProCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <ProCard>
            <StyledStatistic
              title="Failed Syncs"
              value={syncDashboard?.queue_stats.failed || 0}
              prefix={<ExclamationCircleOutlined />}
            />
          </ProCard>
        </ResponsiveCol>
      </ResponsiveRow>

      <Alert
        message={syncDashboard?.meets_sla ? "✅ SLA Status: On Target" : "⚠️ SLA Status: Violation Detected"}
        description={
          syncDashboard?.meets_sla 
            ? "Gateway sync operations are meeting the <30 second SLA requirement."
            : "Gateway sync operations are exceeding the 30 second SLA. Check gateway health and queue status."
        }
        type={syncDashboard?.meets_sla ? "success" : "warning"}
        showIcon
      />

      <CentralProTable<WebhookConfig>
        id="webhooks:configs"
        columns={columns}
        dataSource={webhooks}
        actionRef={actionRef}
        rowKey="config_id"
        className="transaction-table"
        search={{
          labelWidth: 'auto',
          searchText: 'Search',
          resetText: 'Reset'
        }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true
        }}
        dateFormatter="string"
        headerTitle="Webhook Endpoints"
        toolBarRender={() => [
          <Button
            key="add"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingWebhook(null);
              form.resetFields();
              setCreateModalVisible(true);
            }}
          >
            Add Webhook
          </Button>,
          <Button
            key="refresh"
            icon={<ReloadOutlined />}
            onClick={loadAllWebhookData}
          >
            Refresh
          </Button>
        ]}
        scroll={{ x: 1400 }}
        sticky
      />

      {/* Create/Edit Webhook Modal */}
      <Modal
        title={editingWebhook ? 'Edit Webhook' : 'Create New Webhook'}
        open={createModalVisible}
        onOk={handleCreateSubmit}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
          setEditingWebhook(null);
        }}
        width={700}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="client_id"
            label="Client ID"
            rules={[{ required: true, message: 'Please enter client ID' }]}
          >
            <Input
              prefix={<ApiOutlined />}
              placeholder="e.g., CLIENT001"
            />
          </Form.Item>

          <Form.Item
            name="endpoint_url"
            label="Endpoint URL"
            rules={[
              { required: true, message: 'Please enter endpoint URL' },
              { type: 'url', message: 'Please enter a valid URL' }
            ]}
          >
            <Input
              prefix={<LinkOutlined />}
              placeholder="https://your-domain.com/webhooks/endpoint"
            />
          </Form.Item>

          <Form.Item
            name="events_subscribed"
            label="Events to Subscribe"
            rules={[{ required: true, message: 'Please select at least one event' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select events"
              options={eventTypes}
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Status"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Alert
            message="Webhook Secret"
            description={
              <Space direction="vertical">
                <CentralText>Your webhook secret will be generated automatically upon creation.</CentralText>
                {editingWebhook && (
                  <Input.Password
                    value={editingWebhook.secret_key}
                    readOnly
                    addonAfter={
                      <Button
                        type="text"
                        size="small"
                        icon={<CopyOutlined />}
                        onClick={() => {
                          navigator.clipboard.writeText(editingWebhook.secret_key);
                          notifySuccess('Secret copied to clipboard');
                        }}
                      >
                        Copy
                      </Button>
                    }
                  />
                )}
              </Space>
            }
            type="info"
          />
        </Form>
      </Modal>

      {/* Test Webhook Modal */}
      <Modal
        title="Test Webhook"
        open={testModalVisible}
        onOk={handleTestSubmit}
        onCancel={() => {
          setTestModalVisible(false);
          testForm.resetFields();
        }}
        width={600}
      >
        <Form form={testForm} layout="vertical">
          <Form.Item
            name="event_type"
            label="Event Type"
            rules={[{ required: true }]}
          >
            <Select
              placeholder="Select event to test"
              options={selectedWebhook?.events_subscribed?.map(e => {
                const eventType = eventTypes.find(et => et.value === e);
                return {
                  value: e,
                  label: eventType?.label || e
                };
              }) || selectedWebhook?.events?.map(e => {
                const eventType = eventTypes.find(et => et.value === e);
                return {
                  value: e,
                  label: eventType?.label || e
                };
              })}
            />
          </Form.Item>

          <Form.Item
            name="payload"
            label="Test Payload"
            initialValue={JSON.stringify({
              id: 'test_123',
              amount: 5000,
              status: 'success',
              timestamp: new Date().toISOString()
            }, null, 2)}
          >
            <CentralTextArea
              rows={10}
            />
          </Form.Item>

          <Alert
            message="Test Mode"
            description="This will send a test webhook to your endpoint with the above payload. The request will include all standard headers including the signature."
            type="info"
            showIcon
          />
        </Form>
      </Modal>

      {/* Webhook Logs Modal */}
      <Modal
        title={`Webhook Logs - ${selectedWebhook?.config_id}`}
        open={logsModalVisible}
        onCancel={() => {
          setLogsModalVisible(false);
          setSelectedWebhook(null);
        }}
        width={900}
        footer={[
          <Button key="close" onClick={() => setLogsModalVisible(false)}>
            Close
          </Button>
        ]}
      >
        <List
          dataSource={logs.filter(log => log.config_id === selectedWebhook?.config_id)}
          renderItem={log => (
            <List.Item>
              <Timeline.Item
          color={log.status === 'success' ? 'success' : log.status === 'failure' ? 'error' : 'processing'}
                dot={
                  log.status === 'success' ? <CheckCircleOutlined /> :
                  log.status === 'failure' ? <CloseCircleOutlined /> :
                  <ClockCircleOutlined />
                }
              >
                <Space direction="vertical">
                  <Space>
                    <CentralText strong>{log.event}</CentralText>
                    <Tag color={log.status === 'success' ? 'green' : 'red'}>
                      {log.statusCode || 'Pending'}
                    </Tag>
                    <CentralText type="secondary">
                      {dayjs(log.timestamp).format('DD MMM YYYY HH:mm:ss')}
                    </CentralText>
                    <CentralText type="secondary">
                      {log.duration}ms
                    </CentralText>
                    {log.retryCount > 0 && (
                      <Tag color="orange">Retry: {log.retryCount}</Tag>
                    )}
                  </Space>
                  <CentralParagraph
                    ellipsis={{ rows: 2, expandable: true }}
                  >
                    <CentralText type="secondary">
                      Request: {JSON.stringify(log.request)}
                    </CentralText>
                  </CentralParagraph>
                </Space>
              </Timeline.Item>
            </List.Item>
          )}
        />
      </Modal>
    </div>
  );
};

export default WebhookConfigurationPage;
