'use client';

import React, { useState, useEffect } from 'react';
import { CentralBadge, CentralButton, CentralParagraph, CentralTable, CentralTag, CentralText, CentralTextArea, CentralTitle, Divider, Form, Input, Modal, Select, StyledCard, StyledSpace, StyledStatistic, Switch, Tabs, Tooltip, App } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { useResponsive } from '@/hooks/useResponsive';
import {
  FileTextOutlined,
  MailOutlined,
  MessageOutlined,
  ApiOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SyncOutlined,
  CopyOutlined,
  DeleteOutlined,
  GlobalOutlined,
  SendOutlined,
  CheckCircleOutlined,
  BellOutlined
} from '@ant-design/icons';
import WebhookApiService from '@/services/api/WebhookApiService';

const { Option } = Select;
// Replaced by CentralTextArea

interface Template {
  id: string;
  name: string;
  type: 'EMAIL' | 'SMS' | 'WEBHOOK' | 'PUSH';
  category: string;
  subject?: string;
  content: string;
  language: string;
  variables: string[];
  enabled: boolean;
  lastModified: string;
  createdBy: string;
  usageCount: number;
  deliveryRate: number;
  tags: string[];
}

const TemplatesConfiguration: React.FC = () => {
  const { message } = App.useApp();
  const responsive = useResponsive();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [previewModalVisible, setPreviewModalVisible] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [previewTemplate, setPreviewTemplate] = useState<Template | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('templates');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Mock data (unused after wiring to backend)
  const mockTemplates: Template[] = [
    {
      id: 'email_payment_success',
      name: 'Payment Success Email',
      type: 'EMAIL',
      category: 'Payment Notifications',
      subject: 'Payment Successful - Transaction #{transaction_id}',
      content: `<!DOCTYPE html>
<html>
<head>
    <title>Payment Successful</title>
    <style>
        body { font-family: var(--font-inter), Arial, sans-serif; background-color: var(--app-colorBgLayout); }
        .container { max-width: 600px; margin: 0 auto; background: var(--app-colorBgElevated); padding: var(--spacing-lg); }
        .header { background: var(--app-colorPrimary); color: var(--app-colorTextLightSolid); padding: var(--spacing-lg); text-align: center; }
        .content { padding: var(--spacing-lg); color: var(--app-colorText); }
        .footer { background: var(--app-colorBgElevated); padding: var(--spacing-md); text-align: center; font-size: var(--font-size-xs); color: var(--app-colorTextTertiary); }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>Payment Successful!</h1>
        </div>
        <div class="content">
            <p>Dear {{customer_name}},</p>
            <p>Your payment of <strong>₹{{amount}}</strong> has been processed successfully.</p>
            <p><strong>Transaction Details:</strong></p>
            <ul>
                <li>Transaction ID: {{transaction_id}}</li>
                <li>Amount: ₹{{amount}}</li>
                <li>Payment Method: {{payment_method}}</li>
                <li>Date: {{transaction_date}}</li>
            </ul>
            <p>Thank you for using our services!</p>
        </div>
        <div class="footer">
            <p>This is an automated message. Please do not reply.</p>
        </div>
    </div>
</body>
</html>`,
      language: 'en',
      variables: ['customer_name', 'amount', 'transaction_id', 'payment_method', 'transaction_date'],
      enabled: true,
      lastModified: '2025-09-01T10:30:00Z',
      createdBy: 'admin@sabpaisa.com',
      usageCount: 15420,
      deliveryRate: 99.2,
      tags: ['payment', 'success', 'customer']
    },
    {
      id: 'sms_payment_otp',
      name: 'Payment OTP SMS',
      type: 'SMS',
      category: 'Security',
      content: 'Your OTP for payment of ₹{{amount}} is {{otp}}. Valid for 10 minutes. Do not share with anyone. - SabPaisa',
      language: 'en',
      variables: ['amount', 'otp'],
      enabled: true,
      lastModified: '2025-09-01T09:15:00Z',
      createdBy: 'admin@sabpaisa.com',
      usageCount: 45230,
      deliveryRate: 98.8,
      tags: ['otp', 'security', 'payment']
    },
    {
      id: 'webhook_payment_update',
      name: 'Payment Status Webhook',
      type: 'WEBHOOK',
      category: 'API Notifications',
      content: `{
  "event": "payment.{{status}}",
  "data": {
    "transaction_id": "{{transaction_id}}",
    "amount": {{amount}},
    "currency": "{{currency}}",
    "status": "{{status}}",
    "payment_method": "{{payment_method}}",
    "customer": {
      "id": "{{customer_id}}",
      "email": "{{customer_email}}",
      "phone": "{{customer_phone}}"
    },
    "metadata": {{metadata}},
    "created_at": "{{created_at}}",
    "updated_at": "{{updated_at}}"
  }
}`,
      language: 'json',
      variables: ['status', 'transaction_id', 'amount', 'currency', 'payment_method', 'customer_id', 'customer_email', 'customer_phone', 'metadata', 'created_at', 'updated_at'],
      enabled: true,
      lastModified: '2025-09-01T11:45:00Z',
      createdBy: 'tech@sabpaisa.com',
      usageCount: 23450,
      deliveryRate: 99.5,
      tags: ['webhook', 'api', 'integration']
    },
    {
      id: 'push_payment_reminder',
      name: 'Payment Reminder Push',
      type: 'PUSH',
      category: 'Reminders',
      content: 'Payment of ₹{{amount}} is pending for order #{{order_id}}. Complete now to avoid cancellation.',
      language: 'en',
      variables: ['amount', 'order_id'],
      enabled: false,
      lastModified: '2025-08-30T16:20:00Z',
      createdBy: 'marketing@sabpaisa.com',
      usageCount: 8920,
      deliveryRate: 87.3,
      tags: ['reminder', 'payment', 'push']
    }
  ];

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      const resp = await WebhookApiService.getWebhookTemplates();
      const list = (resp.data as any) || [];
      const arr = Array.isArray(list) ? list : (list.results || []);
      const mapped: Template[] = arr.map((t: any) => ({
        id: String(t.template_id ?? t.id ?? ''),
        name: t.description || `Template ${t.template_id}`,
        type: 'WEBHOOK',
        category: t.event_type || 'API Notifications',
        content: typeof t.payload_template === 'string' ? t.payload_template : JSON.stringify(t.payload_template || {}, null, 2),
        language: 'json',
        variables: extractVariables(typeof t.payload_template === 'string' ? t.payload_template : JSON.stringify(t.payload_template || {})),
        enabled: true,
        lastModified: t.updated_at || t.created_at,
        createdBy: '',
        usageCount: 0,
        deliveryRate: 0,
        tags: ['webhook']
      }));
      setTemplates(mapped);
    } catch (e: any) {
      message.error(e?.message || 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleTemplate = async (templateId: string, enabled: boolean) => {
    // Backend WebhookTemplate has no enabled flag; update UI only
    setTemplates(prev => prev.map(t => t.id === templateId ? { ...t, enabled } : t));
    import('@/utils/notify').then(({ notifySuccess }) => notifySuccess(`Template ${enabled ? 'enabled' : 'disabled'}`));
  };

  const handleEdit = (template: Template) => {
    setEditingTemplate(template);
    form.setFieldsValue(template);
    setModalVisible(true);
  };

  const handlePreview = (template: Template) => {
    setPreviewTemplate(template);
    setPreviewModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const payload: any = {
        event_type: values.category || 'transaction.success',
        payload_template: values.content,
        description: values.name,
      };
      if (editingTemplate) {
        await WebhookApiService.updateWebhookTemplate(Number(editingTemplate.id), payload);
        import('@/utils/notify').then(({ notifySuccess }) => notifySuccess('Template updated successfully'));
      } else {
        await WebhookApiService.createWebhookTemplate(payload);
        import('@/utils/notify').then(({ notifySuccess }) => notifySuccess('Template created successfully'));
      }
      setModalVisible(false);
      setEditingTemplate(null);
      form.resetFields();
      loadTemplates();
    } catch (error: any) {
      message.error(error?.message || 'Failed to save template');
    }
  };

  const extractVariables = (content: string): string[] => {
    const matches = content.match(/\{\{([^}]+)\}\}/g);
    return matches ? matches.map(match => match.replace(/[{}]/g, '')) : [];
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      'EMAIL': <MailOutlined />,
      'SMS': <MessageOutlined />,
      'WEBHOOK': <ApiOutlined />,
      'PUSH': <BellOutlined />
    };
    return icons[type as keyof typeof icons] || <FileTextOutlined />;
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'EMAIL': 'var(--app-colorPrimary)',
      'SMS': 'var(--app-colorSuccess)',
      'WEBHOOK': 'var(--app-colorInfo)',
      'PUSH': 'var(--app-colorWarning)'
    };
    return colors[type as keyof typeof colors] || 'var(--color-text-secondary)';
  };

  const filteredTemplates = selectedType === 'all' 
    ? templates 
    : templates.filter(t => t.type === selectedType);

  const columns = [
    {
      title: 'Template',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Template) => (
        <StyledSpace>
          <div >
            {getTypeIcon(record.type)}
          </div>
          <div>
            <div >{name}</div>
            <CentralText type="secondary" >
              {record.category} • {record.language.toUpperCase()}
            </CentralText>
          </div>
        </StyledSpace>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => (
        <CentralTag color={getTypeColor(type)}>
          {type}
        </CentralTag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: Template) => (
        <StyledSpace direction="vertical" size={0}>
          <Switch
            checked={enabled}
            size="small"
            onChange={(checked) => handleToggleTemplate(record.id, checked)}
          />
          <CentralBadge
            status={enabled ? 'success' : 'error'}
            text={enabled ? 'Active' : 'Inactive'}
          />
        </StyledSpace>
      ),
    },
    {
      title: 'Usage Stats',
      key: 'stats',
      render: (_: any, record: Template) => (
        <StyledSpace direction="vertical" size={4}>
          <div>
            <CentralText >Used: </CentralText>
            <CentralTag color="blue">{record.usageCount.toLocaleString()}</CentralTag>
          </div>
          <div>
            <CentralText >Delivery: </CentralText>
            <CentralTag color={record.deliveryRate > 95 ? 'green' : record.deliveryRate > 90 ? 'orange' : 'red'}>
              {record.deliveryRate}%
            </CentralTag>
          </div>
        </StyledSpace>
      ),
    },
    {
      title: 'Variables',
      dataIndex: 'variables',
      key: 'variables',
      render: (variables: string[]) => (
        <div>
          <CentralText >
            {variables.length} variables
          </CentralText>
          <div >
            {variables.slice(0, 2).map(variable => (
              <CentralTag key={variable} size="small" >
                {variable}
              </CentralTag>
            ))}
            {variables.length > 2 && (
              <CentralTag size="small" >
                +{variables.length - 2}
              </CentralTag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Last Modified',
      dataIndex: 'lastModified',
      key: 'lastModified',
      render: (date: string) => (
        <CentralText >
          {new Date(date).toLocaleDateString()}
        </CentralText>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Template) => (
        <StyledSpace>
          <Tooltip title="Preview Template">
            <CentralButton
              icon={<EyeOutlined />}
              size="small"
              onClick={() => handlePreview(record)}
            />
          </Tooltip>
          <Tooltip title="Edit Template">
            <CentralButton
              icon={<EditOutlined />}
              size="small"
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
          <Tooltip title="Duplicate Template">
            <CentralButton
              icon={<CopyOutlined />}
              size="small"
              onClick={() => {
                const duplicated = {
                  ...record,
                  id: `template_${Date.now()}`,
                  name: `${record.name} (Copy)`,
                  usageCount: 0,
                  deliveryRate: 0,
                  createdBy: 'admin@sabpaisa.com',
                  lastModified: new Date().toISOString()
                };
                setTemplates(prev => [...prev, duplicated]);
                import('@/utils/notify').then(({ notifySuccess }) => notifySuccess('Template duplicated successfully'));
              }}
            />
          </Tooltip>
        </StyledSpace>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    totalTemplates: templates.length,
    activeTemplates: templates.filter(t => t.enabled).length,
    totalUsage: templates.reduce((sum, t) => sum + t.usageCount, 0),
    averageDeliveryRate: templates.reduce((sum, t) => sum + t.deliveryRate, 0) / templates.length
  };

  return (
    <div >
      <div >
        <div>
          <CentralTitle level={3}>
            <FileTextOutlined  />
            Templates Configuration
          </CentralTitle>
          <CentralText type="secondary">
            Manage email, SMS, webhook and push notification templates
          </CentralText>
        </div>
        <StyledSpace>
          <Select
            value={selectedType}
            onChange={setSelectedType}
            
          >
            <Option value="all">All Types</Option>
            <Option value="EMAIL">Email</Option>
            <Option value="SMS">SMS</Option>
            <Option value="WEBHOOK">Webhook</Option>
            <Option value="PUSH">Push</Option>
          </Select>
          <CentralButton icon={<SyncOutlined />} onClick={loadTemplates}>
            Refresh
          </CentralButton>
          <CentralButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingTemplate(null);
              form.resetFields();
              form.setFieldsValue({ type: 'WEBHOOK', language: 'json' });
              setModalVisible(true);
            }}
          >
            Add Template
          </CentralButton>
        </StyledSpace>
      </div>

      {/* Statistics Cards */}
      <ResponsiveRow>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <StyledStatistic title="Total Templates" value={stats.totalTemplates} />
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <StyledStatistic title="Active Templates" value={stats.activeTemplates} />
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <StyledStatistic title="Total Usage" value={stats.totalUsage} />
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <StyledStatistic title="Avg Delivery Rate" value={stats.averageDeliveryRate.toFixed(1)} suffix="%" />
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Templates" key="templates">
          <StyledCard>
            <CentralTable
              columns={columns}
              dataSource={filteredTemplates}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} templates`,
              }}
            />
          </StyledCard>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Template Categories" key="categories">
          <ResponsiveRow >
            <ResponsiveCol {...LAYOUT_CONFIG.fullWidth} wide={24}>
              <StyledCard title="Template Categories" loading={loading} >
                <div >
                  <CentralText type="secondary">Template categorization and organization tools will be displayed here</CentralText>
                </div>
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Analytics" key="analytics">
          <ResponsiveRow >
            <ResponsiveCol {...LAYOUT_CONFIG.fullWidth} wide={24}>
              <StyledCard title="Template Performance Analytics" loading={loading} >
                <div >
                  <CentralText type="secondary">Template usage and performance analytics will be displayed here</CentralText>
                </div>
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>
        </Tabs.TabPane>
      </Tabs>

      {/* Add/Edit Template Modal */}
      <Modal
        title={`${editingTemplate ? 'Edit' : 'Add'} Template`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingTemplate(null);
          form.resetFields();
        }}
        footer={null}
        width={1000}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <ResponsiveRow >
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField} wide={12}>
              <Form.Item
                name="name"
                label="Template Name"
                rules={[{ required: true, message: 'Please enter template name' }]}
              >
                <Input placeholder="e.g., Payment Success Email" />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField} wide={12}>
              <Form.Item
                name="type"
                label="Template Type"
                rules={[{ required: true, message: 'Please select template type' }]}
              >
                <Select placeholder="Select type">
                  <Option value="EMAIL">Email</Option>
                  <Option value="SMS">SMS</Option>
                  <Option value="WEBHOOK">Webhook</Option>
                  <Option value="PUSH">Push Notification</Option>
                </Select>
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow >
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField} wide={12}>
              <Form.Item
                name="category"
                label="Category"
                rules={[{ required: true, message: 'Please enter category' }]}
              >
                <Input placeholder="e.g., Payment Notifications" />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField} wide={12}>
              <Form.Item
                name="language"
                label="Language"
                rules={[{ required: true, message: 'Please select language' }]}
              >
                <Select defaultValue="en">
                  <Option value="en">English</Option>
                  <Option value="hi">Hindi</Option>
                  <Option value="json">JSON</Option>
                </Select>
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
          >
            {({ getFieldValue }) => 
              getFieldValue('type') === 'EMAIL' && (
                <Form.Item
                  name="subject"
                  label="Email Subject"
                  rules={[{ required: true, message: 'Please enter email subject' }]}
                >
                  <Input placeholder="e.g., Payment Successful - Transaction #{{transaction_id}}" />
                </Form.Item>
              )
            }
          </Form.Item>

          <Form.Item
            name="content"
            label="Template Content"
            rules={[{ required: true, message: 'Please enter template content' }]}
          >
            <CentralTextArea
              rows={12}
              placeholder="Enter your template content here. Use {{variable_name}} for dynamic content."
            />
          </Form.Item>

          <Form.Item name="tags" label="Tags">
            <Select
              mode="tags"
              placeholder="Add tags to categorize this template"
            />
          </Form.Item>

          <Form.Item>
            <StyledSpace>
              <CentralButton type="primary" htmlType="submit">
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </CentralButton>
              <CentralButton onClick={() => setModalVisible(false)}>
                Cancel
              </CentralButton>
            </StyledSpace>
          </Form.Item>
        </Form>
      </Modal>

      {/* Template Preview Modal */}
      <Modal
        title={`Preview: ${previewTemplate?.name}`}
        open={previewModalVisible}
        onCancel={() => {
          setPreviewModalVisible(false);
          setPreviewTemplate(null);
        }}
        footer={[
          <CentralButton key="close" onClick={() => setPreviewModalVisible(false)}>
            Close
          </CentralButton>
        ]}
        width={800}
      >
        {previewTemplate && (
          <div>
            <Divider>Template Details</Divider>
            <ResponsiveRow mobileGutter={[8, 8]} tabletGutter={[12, 8]} desktopGutter={[16, 8]}>
              <ResponsiveCol {...LAYOUT_CONFIG.oneThird} wide={8}>
                <CentralText strong>Type:</CentralText> <CentralTag color={getTypeColor(previewTemplate.type)}>{previewTemplate.type}</CentralTag>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.oneThird} wide={8}>
                <CentralText strong>Category:</CentralText> {previewTemplate.category}
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.oneThird} wide={8}>
                <CentralText strong>Language:</CentralText> {previewTemplate.language.toUpperCase()}
              </ResponsiveCol>
            </ResponsiveRow>

            {previewTemplate.subject && (
              <>
                <Divider>Subject</Divider>
                <StyledCard size="small">
                  <CentralText code>{previewTemplate.subject}</CentralText>
                </StyledCard>
              </>
            )}

            <Divider>Content</Divider>
            <StyledCard size="small">
              <pre >
                {previewTemplate.content}
              </pre>
            </StyledCard>

            <Divider>Variables ({previewTemplate.variables.length})</Divider>
            <div>
              {previewTemplate.variables.map(variable => (
                <CentralTag key={variable} >
                  {variable}
                </CentralTag>
              ))}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default TemplatesConfiguration;
