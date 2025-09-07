'use client';

import React, { useState, useEffect } from 'react';
import {
  StyledCard,
  CentralTable,
  Switch,
  CentralButton,
  Form,
  Input,
  InputNumber,
  Select,
  Modal,
  CentralTag,
  StyledSpace,
  message,
  StyledStatistic,
  CentralTitle,
  CentralText,
  Tabs,
  CentralBadge,
  Tooltip,
  CentralProgress,
  Divider,
  CentralAlert,
  Slider
} from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import {
  GlobalOutlined,
  BankOutlined,
  SettingOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  ThunderboltOutlined,
  SafetyOutlined,
  SwapOutlined,
  NodeIndexOutlined,
  ApiOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import GatewayApiService, { GatewayConfiguration as ApiGatewayConfig } from '@/services/api/GatewayApiService';
import { notifySuccess } from '@/utils/notify';
import RoutingApiService, { RoutingPolicy } from '@/services/api/RoutingApiService';

const { Option } = Select;

interface Gateway {
  id: string;
  name: string;
  provider: string;
  enabled: boolean;
  priority: number;
  successRate: number;
  averageResponseTime: number;
  dailyVolume: number;
  monthlyVolume: number;
  processingFee: number;
  settlementCycle: string;
  supportedMethods: string[];
  countries: string[];
  currencies: string[];
  maxAmount: number;
  minAmount: number;
  riskScore: number;
  maintenanceWindow: string;
  apiVersion: string;
  status: 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';
  lastHealthCheck: string;
  failoverEnabled: boolean;
}

interface RoutingRule {
  id: string;
  name: string;
  conditions: {
    amount?: { min?: number; max?: number };
    paymentMethod?: string[];
    country?: string[];
    currency?: string[];
    clientType?: string[];
  };
  gatewayPreferences: string[];
  enabled: boolean;
  priority: number;
  description: string;
}

const GatewayRoutingConfiguration: React.FC = () => {
  const [gateways, setGateways] = useState<Gateway[]>([]);
  const [routingRules, setRoutingRules] = useState<RoutingRule[]>([]);
  const [policies, setPolicies] = useState<RoutingPolicy[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [ruleModalVisible, setRuleModalVisible] = useState(false);
  const [editingGateway, setEditingGateway] = useState<Gateway | null>(null);
  const [editingRule, setEditingRule] = useState<RoutingRule | null>(null);
  const [form] = Form.useForm();
  const [ruleForm] = Form.useForm();
  const [activeTab, setActiveTab] = useState('gateways');

  // Mock data (gateways only)
  const mockGateways: Gateway[] = [
    {
      id: 'razorpay',
      name: 'Razorpay',
      provider: 'Razorpay Software Pvt Ltd',
      enabled: true,
      priority: 1,
      successRate: 96.8,
      averageResponseTime: 1200,
      dailyVolume: 2500000,
      monthlyVolume: 75000000,
      processingFee: 2.0,
      settlementCycle: 'T+2',
      supportedMethods: ['CARD', 'UPI', 'NETBANKING', 'WALLET'],
      countries: ['IN'],
      currencies: ['INR'],
      maxAmount: 1000000,
      minAmount: 1,
      riskScore: 15,
      maintenanceWindow: '02:00-04:00 IST',
      apiVersion: 'v1',
      status: 'ACTIVE',
      lastHealthCheck: '2025-09-01T13:15:00Z',
      failoverEnabled: true
    },
    {
      id: 'payu',
      name: 'PayU',
      provider: 'PayU Payments Pvt Ltd',
      enabled: true,
      priority: 2,
      successRate: 94.5,
      averageResponseTime: 1800,
      dailyVolume: 1800000,
      monthlyVolume: 54000000,
      processingFee: 2.3,
      settlementCycle: 'T+3',
      supportedMethods: ['CARD', 'UPI', 'NETBANKING', 'WALLET', 'EMI'],
      countries: ['IN'],
      currencies: ['INR'],
      maxAmount: 500000,
      minAmount: 10,
      riskScore: 25,
      maintenanceWindow: '01:30-03:30 IST',
      apiVersion: 'v2',
      status: 'ACTIVE',
      lastHealthCheck: '2025-09-01T13:12:00Z',
      failoverEnabled: true
    },
    {
      id: 'billdesk',
      name: 'BillDesk',
      provider: 'BillDesk Technologies Pvt Ltd',
      enabled: true,
      priority: 3,
      successRate: 92.1,
      averageResponseTime: 2400,
      dailyVolume: 1200000,
      monthlyVolume: 36000000,
      processingFee: 1.8,
      settlementCycle: 'T+2',
      supportedMethods: ['NETBANKING', 'CARD'],
      countries: ['IN'],
      currencies: ['INR'],
      maxAmount: 2000000,
      minAmount: 1,
      riskScore: 20,
      maintenanceWindow: '03:00-05:00 IST',
      apiVersion: 'v1.5',
      status: 'ACTIVE',
      lastHealthCheck: '2025-09-01T13:10:00Z',
      failoverEnabled: false
    },
    {
      id: 'ccavenue',
      name: 'CCAvenue',
      provider: 'Avenues India Pvt Ltd',
      enabled: false,
      priority: 4,
      successRate: 89.3,
      averageResponseTime: 3200,
      dailyVolume: 800000,
      monthlyVolume: 24000000,
      processingFee: 2.5,
      settlementCycle: 'T+4',
      supportedMethods: ['CARD', 'NETBANKING'],
      countries: ['IN', 'US', 'UK'],
      currencies: ['INR', 'USD'],
      maxAmount: 1000000,
      minAmount: 1,
      riskScore: 35,
      maintenanceWindow: '02:30-04:30 IST',
      apiVersion: 'v3',
      status: 'MAINTENANCE',
      lastHealthCheck: '2025-09-01T12:45:00Z',
      failoverEnabled: true
    }
  ];

  // Helper to map server policy -> UI rule
  const mapPolicyToRule = (p: RoutingPolicy): RoutingRule => {
    const cond = (p.conditions_json || {}) as any;
    const weights = (p.weights_json || {}) as Record<string, number>;
    const gatewayPreferences = Object.keys(weights).sort((a,b)=> (weights[b]||0)-(weights[a]||0));
    return {
      id: String(p.id),
      name: p.name,
      conditions: {
        amount: cond.amount ? { min: cond.amount.min, max: cond.amount.max } : undefined,
        paymentMethod: cond.payment_method || cond.paymentMethod || cond.paymentMethods || undefined,
      },
      gatewayPreferences,
      enabled: !!p.is_active,
      priority: (cond.priority || 1),
      description: (cond.description || '')
    };
  };

  useEffect(() => {
    loadData();
  }, []);

  const mapGateway = (g: ApiGatewayConfig): Gateway => ({
    id: String(g.gateway_id),
    name: g.gateway_name,
    provider: g.gateway_code,
    enabled: !!g.is_active,
    priority: 1,
    successRate: 0,
    averageResponseTime: 0,
    dailyVolume: 0,
    monthlyVolume: 0,
    processingFee: 0,
    settlementCycle: 'T+2',
    supportedMethods: [],
    countries: ['IN'],
    currencies: ['INR'],
    maxAmount: 0,
    minAmount: 0,
    riskScore: 0,
    maintenanceWindow: '-',
    apiVersion: 'v1',
    status: g.is_active ? 'ACTIVE' : 'INACTIVE',
    lastHealthCheck: '',
    failoverEnabled: !!g.supports_webhook,
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const resp = await GatewayApiService.getGatewayConfigurations({ page: 1, page_size: 100 });
      const rows = ((resp.data as any)?.results || (resp.data as any) || []) as ApiGatewayConfig[];
      setGateways(rows.map(mapGateway));
      // Load routing policies from server
      const policiesList = await RoutingApiService.list();
      setPolicies(policiesList);
      setRoutingRules(policiesList.map(mapPolicyToRule));
    } catch (e) {
      // fallback to mock if API fails
      setGateways([]);
      message.error((e as any)?.message || 'Failed to load gateway configurations');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleGateway = async (gatewayId: string, enabled: boolean) => {
    try {
      await GatewayApiService.toggleGateway(Number(gatewayId), enabled);
      setGateways(prev => prev.map(g => g.id === gatewayId ? { ...g, enabled, status: enabled ? 'ACTIVE' : 'INACTIVE' } : g));
      notifySuccess(`Gateway ${enabled ? 'enabled' : 'disabled'} successfully`);
    } catch (error) {
      message.error((error as any)?.message || 'Failed to update gateway');
    }
  };

  const handleToggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      if (enabled) await RoutingApiService.activate(Number(ruleId));
      else await RoutingApiService.deactivate(Number(ruleId));
      setRoutingRules(prev => prev.map(r => r.id === ruleId ? { ...r, enabled } : r));
      notifySuccess(`Routing policy ${enabled ? 'activated' : 'deactivated'}`);
    } catch (error) {
      message.error((error as any)?.message || 'Failed to update routing rule');
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'ACTIVE': 'green',
      'MAINTENANCE': 'orange',
      'INACTIVE': 'red'
    };
    return colors[status as keyof typeof colors] || 'default';
  };

  const gatewayColumns = [
    {
      title: 'Gateway',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: Gateway) => (
        <StyledSpace>
          <GlobalOutlined  />
          <div>
            <div >{name}</div>
            <CentralText type="secondary" >
              {record.provider}
            </CentralText>
          </div>
        </StyledSpace>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: Gateway) => (
        <StyledSpace direction="vertical" size={0}>
          <Switch
            checked={record.enabled}
            onChange={(checked) => handleToggleGateway(record.id, checked)}
            disabled={status === 'MAINTENANCE'}
          />
          <CentralBadge status={getStatusColor(status) as any} text={status} />
        </StyledSpace>
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: number) => (
        <CentralTag color="blue">{priority}</CentralTag>
      ),
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_: any, record: Gateway) => (
        <StyledSpace direction="vertical" size={4}>
          <div>
            <CentralText >Success: </CentralText>
            <CentralTag color={record.successRate > 95 ? 'green' : record.successRate > 90 ? 'orange' : 'red'}>
              {record.successRate}%
            </CentralTag>
          </div>
          <div>
            <CentralText >Response: </CentralText>
            <CentralTag>{record.averageResponseTime}ms</CentralTag>
          </div>
        </StyledSpace>
      ),
    },
    {
      title: 'Volume (Monthly)',
      dataIndex: 'monthlyVolume',
      key: 'monthlyVolume',
      render: (volume: number) => (
        <CentralText>₹{(volume / 10000000).toFixed(1)}Cr</CentralText>
      ),
    },
    {
      title: 'Processing Fee',
      dataIndex: 'processingFee',
      key: 'processingFee',
      render: (fee: number) => (
        <CentralTag color="purple">{fee}%</CentralTag>
      ),
    },
    {
      title: 'Settlement',
      dataIndex: 'settlementCycle',
      key: 'settlementCycle',
      render: (cycle: string) => (
        <CentralTag color="orange">{cycle}</CentralTag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Gateway) => (
        <StyledSpace>
          <Tooltip title="View Details">
            <CentralButton
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                Modal.info({
                  title: `${record.name} Gateway Details`,
                  width: 800,
                  content: (
                    <div>
                      <ResponsiveRow>
                        <ResponsiveCol {...LAYOUT_CONFIG.common.sideWidget}>
                          <StyledStatistic title="Success Rate" value={record.successRate} suffix="%" />
                        </ResponsiveCol>
                        <ResponsiveCol {...LAYOUT_CONFIG.common.sideWidget}>
                          <StyledStatistic title="Response Time" value={record.averageResponseTime} suffix="ms" />
                        </ResponsiveCol>
                        <ResponsiveCol {...LAYOUT_CONFIG.common.sideWidget}>
                          <StyledStatistic title="Risk Score" value={record.riskScore} suffix="/100" />
                        </ResponsiveCol>
                        <ResponsiveCol {...LAYOUT_CONFIG.common.sideWidget}>
                          <StyledStatistic title="Max Amount" value={record.maxAmount} prefix="₹" />
                        </ResponsiveCol>
                        <ResponsiveCol {...LAYOUT_CONFIG.common.sideWidget}>
                          <StyledStatistic title="Daily Volume" value={record.dailyVolume} prefix="₹" />
                        </ResponsiveCol>
                        <ResponsiveCol {...LAYOUT_CONFIG.common.sideWidget}>
                          <StyledStatistic title="Processing Fee" value={record.processingFee} suffix="%" />
                        </ResponsiveCol>
                      </ResponsiveRow>
                      <Divider />
                      <div>
                        <CentralText strong>Supported Payment Methods:</CentralText>
                        <div >
                          {record.supportedMethods.map(method => (
                            <CentralTag key={method} >{method}</CentralTag>
                          ))}
                        </div>
                      </div>
                      <div >
                        <CentralText strong>Supported Countries:</CentralText>
                        <div >
                          {record.countries.map(country => (
                            <CentralTag key={country} >{country}</CentralTag>
                          ))}
                        </div>
                      </div>
                      <div >
                        <CentralText strong>Maintenance Window:</CentralText>
                        <div >
                          <CentralTag color="orange">{record.maintenanceWindow}</CentralTag>
                        </div>
                      </div>
                    </div>
                  )
                });
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Configuration">
            <CentralButton
              icon={<EditOutlined />}
              size="small"
              onClick={async () => {
                try {
                  setEditingGateway(record);
                  form.resetFields();
                  // Fetch full configuration to prefill supported fields
                  const { data } = await GatewayApiService.getGatewayConfiguration(Number(record.id));
                  form.setFieldsValue({
                    isActive: !!data.is_active,
                    failoverEnabled: !!data.supports_webhook,
                    apiEndpoint: data.api_endpoint,
                    statusCheckEndpoint: data.status_check_endpoint,
                    refundEndpoint: data.refund_endpoint,
                    webhookUrl: data.webhook_url,
                    timeoutSeconds: data.timeout_seconds,
                    maxRetryAttempts: data.max_retry_attempts,
                    retryDelaySeconds: data.retry_delay_seconds,
                  });
                } catch (e) {
                  // If details load fails, fall back to current row values for toggles
                  form.setFieldsValue({
                    isActive: record.enabled,
                    failoverEnabled: record.failoverEnabled,
                  });
                } finally {
                  setModalVisible(true);
                }
              }}
            />
          </Tooltip>
        </StyledSpace>
      ),
    },
  ];

  const routingRulesColumns = [
    {
      title: 'Rule Name',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: RoutingRule) => (
        <div>
          <div >{name}</div>
          <CentralText type="secondary" >
            {record.description}
          </CentralText>
        </div>
      ),
    },
    {
      title: 'Weights',
      key: 'weights',
      render: (_: any, record: RoutingRule) => (
        <StyledSpace wrap>
          {record.gatewayPreferences.map((gId) => {
            const pol = policies.find(p => String(p.id) === record.id);
            const w = pol?.weights_json?.[gId] || 0;
            const gw = gateways.find(g => g.id === gId);
            return <CentralTag key={gId} color={w >= 50 ? 'green' : w >= 25 ? 'blue' : 'default'}>{gw?.name || gId}: {w}%</CentralTag>;
          })}
        </StyledSpace>
      )
    },
    {
      title: 'Status',
      dataIndex: 'enabled',
      key: 'enabled',
      render: (enabled: boolean, record: RoutingRule) => (
        <Switch
          checked={enabled}
          onChange={(checked) => handleToggleRule(record.id, checked)}
        />
      ),
    },
    {
      title: 'Priority',
      dataIndex: 'priority',
      key: 'priority',
      render: (priority: number) => (
        <CentralTag color="blue">#{priority}</CentralTag>
      ),
    },
    {
      title: 'Conditions',
      key: 'conditions',
      render: (_: any, record: RoutingRule) => (
        <StyledSpace direction="vertical" size={2}>
          {record.conditions.amount && (
            <CentralText >
              Amount: ₹{record.conditions.amount.min?.toLocaleString() || '0'} - 
              ₹{record.conditions.amount.max?.toLocaleString() || '∞'}
            </CentralText>
          )}
          {record.conditions.paymentMethod && (
            <div>
              {record.conditions.paymentMethod.map(method => (
                <CentralTag key={method} size="small" >{method}</CentralTag>
              ))}
            </div>
          )}
        </StyledSpace>
      ),
    },
    {
      title: 'Gateway Preferences',
      dataIndex: 'gatewayPreferences',
      key: 'gatewayPreferences',
      render: (preferences: string[]) => (
        <StyledSpace direction="vertical" size={2}>
          {preferences.map((gatewayId, index) => {
            const gateway = gateways.find(g => g.id === gatewayId);
            return (
              <CentralTag key={gatewayId} color={index === 0 ? 'green' : index === 1 ? 'orange' : 'default'}>
                {index + 1}. {gateway?.name || gatewayId}
              </CentralTag>
            );
          })}
        </StyledSpace>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: RoutingRule) => (
        <StyledSpace>
          <Tooltip title="Edit Rule">
            <CentralButton
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingRule(record);
                const policy = policies.find(p => String(p.id) === record.id);
                const cond = (policy?.conditions_json || {}) as any;
                // Pre-fill form: include is_active and weights
                ruleForm.setFieldsValue({
                  name: policy?.name || record.name,
                  is_active: policy?.is_active,
                  priority: cond.priority || record.priority,
                  description: cond.description,
                  conditions: {
                    amount: cond.amount || record.conditions.amount,
                    paymentMethod: cond.payment_method || record.conditions.paymentMethod,
                  },
                  gatewayPreferences: Object.keys(policy?.weights_json || {}),
                  weights: policy?.weights_json || {}
                });
                setRuleModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title="Simulate">
            <CentralButton
              icon={<NodeIndexOutlined />}
              size="small"
              onClick={async () => {
                try {
                  const res = await RoutingApiService.simulate(Number(record.id));
                  Modal.info({
                    title: `Simulation - ${record.name}`,
                    width: 700,
                    content: (
                      <div>
                        <CentralText strong>Weights</CentralText>
                        <div style={{ marginTop: 8 }}>
                          {Object.entries(res.weights || {}).map(([gId, w]) => {
                            const gw = gateways.find(g => g.id === gId);
                            return <div key={gId} style={{ display: 'flex', justifyContent: 'space-between' }}>
                              <CentralText>{gw?.name || gId}</CentralText>
                              <CentralText strong>{String(w)}%</CentralText>
                            </div>
                          })}
                        </div>
                        <Divider />
                        <CentralText type="secondary">Conditions: <code>{JSON.stringify(res.conditions || {})}</code></CentralText>
                      </div>
                    )
                  });
                } catch (e: any) {
                  message.error(e?.message || 'Simulation failed');
                }
              }}
            />
          </Tooltip>
        </StyledSpace>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    totalGateways: gateways.length,
    activeGateways: gateways.filter(g => g.enabled).length,
    averageSuccessRate: gateways.reduce((sum, g) => sum + g.successRate, 0) / gateways.length,
    totalMonthlyVolume: gateways.reduce((sum, g) => sum + g.monthlyVolume, 0),
    activeRules: routingRules.filter(r => r.enabled).length
  };

  return (
    <div >
      <div >
        <div>
          <CentralTitle level={3}>
            <GlobalOutlined  />
            Gateway Routing Configuration
          </CentralTitle>
          <CentralText type="secondary">
            Manage payment gateways, routing rules and failover strategies
          </CentralText>
        </div>
        <StyledSpace>
          <CentralButton icon={<SyncOutlined />} onClick={loadData}>
            Refresh
          </CentralButton>
          <CentralButton
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingRule(null);
              ruleForm.resetFields();
              setRuleModalVisible(true);
            }}
          >
            Add Routing Rule
          </CentralButton>
        </StyledSpace>
      </div>

      {/* Statistics Cards */}
      <ResponsiveRow>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <StyledStatistic title="Total Gateways" value={stats.totalGateways} />
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <StyledStatistic title="Active Gateways" value={stats.activeGateways} />
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <StyledStatistic title="Monthly Volume" value={(stats.totalMonthlyVolume / 10000000).toFixed(1)} suffix="Cr" />
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <StyledStatistic title="Active Rules" value={stats.activeRules} />
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Payment Gateways" key="gateways">
          <StyledCard>
            <div className="ant-pro-table" id="payment-gateways">
            <CentralTable
              columns={gatewayColumns}
              dataSource={gateways}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} gateways`,
              }}
            />
            </div>
          </StyledCard>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Routing Rules" key="rules">
          <StyledCard
            extra={
              <CentralAlert
                message="Routing rules are processed in priority order. Lower numbers have higher priority."
                type="info"
                showIcon
                banner
              />
            }
          >
            <div className="ant-pro-table" id="routing-rules">
            <CentralTable
              columns={routingRulesColumns}
              dataSource={routingRules}
              rowKey="id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
              }}
            />
            </div>
          </StyledCard>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Performance Analytics" key="analytics">
          <ResponsiveRow 
            >
            <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
              <StyledCard title="Gateway Performance Overview" loading={loading}>
                <div >
                  <CentralText type="secondary">Gateway performance analytics charts will be displayed here</CentralText>
                </div>
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>
        </Tabs.TabPane>
      </Tabs>

      {/* Edit Gateway Modal */}
      <Modal
        title={`Edit ${editingGateway?.name} Configuration`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingGateway(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={async (values) => {
            try {
              if (!editingGateway) return;
              const payload: Partial<ApiGatewayConfig> = {};
              if (typeof values.isActive === 'boolean') payload.is_active = values.isActive;
              if (typeof values.failoverEnabled === 'boolean') payload.supports_webhook = values.failoverEnabled;
              if (values.apiEndpoint) payload.api_endpoint = values.apiEndpoint;
              if (values.statusCheckEndpoint) payload.status_check_endpoint = values.statusCheckEndpoint;
              if (values.refundEndpoint) payload.refund_endpoint = values.refundEndpoint;
              if (values.webhookUrl) payload.webhook_url = values.webhookUrl;
              if (typeof values.timeoutSeconds === 'number') payload.timeout_seconds = values.timeoutSeconds;
              if (typeof values.maxRetryAttempts === 'number') payload.max_retry_attempts = values.maxRetryAttempts;
              if (typeof values.retryDelaySeconds === 'number') payload.retry_delay_seconds = values.retryDelaySeconds;

              await GatewayApiService.updateGatewayConfiguration(Number(editingGateway.id), payload);
              notifySuccess('Gateway configuration updated successfully');
              setModalVisible(false);
              setEditingGateway(null);
              form.resetFields();
              loadData();
            } catch (e: any) {
              message.error(e?.message || 'Failed to update gateway configuration');
            }
          }}
        >
          <ResponsiveRow>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item name="isActive" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item name="failoverEnabled" label="Supports Webhook" valuePropName="checked">
                <Switch />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item name="apiEndpoint" label="API Endpoint">
                <Input placeholder="https://api.example.com" />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item name="statusCheckEndpoint" label="Status Check Endpoint">
                <Input placeholder="/status" />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item name="refundEndpoint" label="Refund Endpoint">
                <Input placeholder="/refund" />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item name="webhookUrl" label="Webhook URL">
                <Input placeholder="https://yourapp.com/webhook" />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item name="timeoutSeconds" label="Timeout (seconds)">
                <InputNumber min={1} max={120} />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item name="maxRetryAttempts" label="Max Retry Attempts">
                <InputNumber min={0} max={10} />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item name="retryDelaySeconds" label="Retry Delay (seconds)">
                <InputNumber min={0} max={300} />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>
          <ResponsiveRow 
            >
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please set priority' }]}
              >
                <Slider
                  min={1}
                  max={10}
                  marks={{ 1: '1 (Highest)', 10: '10 (Lowest)' }}
                />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="processingFee"
                label="Processing Fee (%)"
                rules={[{ required: true, message: 'Please enter processing fee' }]}
              >
                <InputNumber
                  
                  min={0}
                  max={10}
                  step={0.1}
                  precision={2}
                />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow 
            >
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="maxAmount"
                label="Maximum Amount (₹)"
                rules={[{ required: true, message: 'Please enter maximum amount' }]}
              >
                <InputNumber
                  
                  min={0}
                  formatter={(value) => `₹ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  parser={(value) => value!.replace(/₹\s?|(,*)/g, '') as any}
                />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="failoverEnabled"
                label="Enable Failover"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <Form.Item>
            <StyledSpace>
              <CentralButton type="primary" htmlType="submit">
                Update Configuration
              </CentralButton>
              <CentralButton onClick={() => setModalVisible(false)}>
                Cancel
              </CentralButton>
            </StyledSpace>
          </Form.Item>
        </Form>
      </Modal>

      {/* Add/Edit Routing Rule Modal */}
      <Modal
        title={`${editingRule ? 'Edit' : 'Add'} Routing Policy`}
        open={ruleModalVisible}
        onCancel={() => {
          setRuleModalVisible(false);
          setEditingRule(null);
          ruleForm.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={ruleForm}
          layout="vertical"
          onFinish={async (values) => {
            try {
              // Build policy payload
              const conditions_json: any = {
                description: values.description,
                priority: values.priority,
              };
              if (values.conditions?.amount && (values.conditions.amount.min || values.conditions.amount.max)) {
                conditions_json.amount = { ...values.conditions.amount };
              }
              if (values.conditions?.paymentMethod?.length) {
                conditions_json.payment_method = values.conditions.paymentMethod;
              }
              // Weights: use explicit weights if provided, else equal split across gatewayPreferences
              let weights_json: Record<string, number> = {};
              const gp: string[] = values.gatewayPreferences || [];
              const w: Record<string, number> = values.weights || {};
              if (Object.keys(w).length) {
                weights_json = w;
              } else if (gp.length) {
                const pct = Math.floor(100 / gp.length);
                gp.forEach((id, i) => {
                  weights_json[id] = i === gp.length - 1 ? 100 - pct * (gp.length - 1) : pct;
                });
              }
              const payload = {
                name: values.name,
                is_active: values.is_active !== false,
                conditions_json,
                weights_json,
              } as any;
              if (editingRule) await RoutingApiService.update(Number(editingRule.id), payload);
              else await RoutingApiService.create(payload);
              notifySuccess(`Policy ${editingRule ? 'updated' : 'created'}`);
              setRuleModalVisible(false);
              ruleForm.resetFields();
              await loadData();
            } catch (e:any) {
              message.error(e?.message || 'Failed to save policy');
            }
          }}
        >
          <ResponsiveRow 
            >
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="name"
                label="Rule Name"
                rules={[{ required: true, message: 'Please enter rule name' }]}
              >
                <Input placeholder="e.g., High Value Transactions" />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item name="is_active" label="Active" valuePropName="checked">
                <Switch />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please set priority' }]}
              >
                <InputNumber
                 
                  min={1}
                  placeholder="1 (highest priority)"
                />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please enter description' }]}
          >
            <Input.TextArea 
              rows={2} 
              placeholder="Describe when this rule should be applied"
            />
          </Form.Item>

          <Divider>Conditions</Divider>

          <ResponsiveRow 
            >
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item name={['conditions', 'amount', 'min']} label="Minimum Amount (₹)">
                <InputNumber
                  
                  min={0}
                  placeholder="Leave empty for no minimum"
                />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item name={['conditions', 'amount', 'max']} label="Maximum Amount (₹)">
                <InputNumber
                  
                  min={0}
                  placeholder="Leave empty for no maximum"
                />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <Form.Item
            name={['conditions', 'paymentMethod']}
            label="Payment Methods"
          >
            <Select
              mode="multiple"
              placeholder="Select payment methods (empty = all methods)"
            >
              <Option value="CARD">Cards</Option>
              <Option value="UPI">UPI</Option>
              <Option value="NETBANKING">Net Banking</Option>
              <Option value="WALLET">Digital Wallets</Option>
              <Option value="EMI">EMI</Option>
            </Select>
          </Form.Item>

          <Divider>Gateway Preferences</Divider>

          <Form.Item
            name="gatewayPreferences"
            label="Gateway Priority Order"
            rules={[{ required: true, message: 'Please select at least one gateway' }]}
          >
            <Select
              mode="multiple"
              placeholder="Select gateways (weights below)"
              onChange={(list)=>{
                // Initialize missing weights equally
                const w = ruleForm.getFieldValue('weights') || {};
                const missing = (list as string[]).filter((k)=> w[k] == null);
                if (missing.length) {
                  const eq = Math.floor(100 / (list as string[]).length);
                  const next: any = { ...w };
                  (list as string[]).forEach((k, i) => {
                    next[k] = i === (list as string[]).length - 1 ? 100 - eq * ((list as string[]).length - 1) : (next[k] ?? eq);
                  });
                  ruleForm.setFieldsValue({ weights: next });
                }
              }}
            >
              {gateways.map(gateway => (
                <Option key={gateway.id} value={gateway.id}>
                  {gateway.name} (Success: {gateway.successRate}%)
                </Option>
              ))}
            </Select>
          </Form.Item>

          {/* Weight designer */}
          <StyledCard>
            <CentralTitle level={5}>Weight Allocation</CentralTitle>
            <CentralText type="secondary">Distribute traffic weights to selected gateways. Total should be 100%.</CentralText>
            {(ruleForm.getFieldValue('gatewayPreferences') || []).map((gId: string) => {
              const gw = gateways.find(g => g.id === gId);
              const weight = (ruleForm.getFieldValue(['weights', gId]) ?? 0) as number;
              return (
                <div key={gId} style={{ marginTop: 12 }}>
                  <StyledSpace style={{ width: '100%', alignItems: 'center' }}>
                    <div style={{ width: 160 }}>{gw?.name || gId}</div>
                    <div style={{ flex: 1 }}>
                      <Slider min={0} max={100} value={weight} onChange={(val:number)=>{
                        const w = ruleForm.getFieldValue('weights') || {}; w[gId] = val; ruleForm.setFieldsValue({ weights: w });
                      }} />
                    </div>
                    <InputNumber min={0} max={100} value={weight} onChange={(val:any)=>{ const w = ruleForm.getFieldValue('weights') || {}; w[gId] = Number(val||0); ruleForm.setFieldsValue({ weights: w }); }} />
                    <CentralText type="secondary">%</CentralText>
                  </StyledSpace>
                </div>
              );
            })}
            <Divider />
            <StyledSpace>
              <CentralButton onClick={()=>{
                const gp: string[] = ruleForm.getFieldValue('gatewayPreferences') || [];
                if (!gp.length) return;
                const eq = Math.floor(100 / gp.length);
                const next: any = {};
                gp.forEach((k, i) => { next[k] = i === gp.length - 1 ? 100 - eq * (gp.length - 1) : eq; });
                ruleForm.setFieldsValue({ weights: next });
              }}>Equal Split</CentralButton>
              <CentralText type="secondary">Total: {Object.values(ruleForm.getFieldValue('weights')||{}).reduce((a:number,b:any)=>a+Number(b||0),0)}%</CentralText>
            </StyledSpace>
          </StyledCard>

          <Form.Item>
            <StyledSpace>
              <CentralButton type="primary" htmlType="submit">
                {editingRule ? 'Update Rule' : 'Create Rule'}
              </CentralButton>
              <CentralButton onClick={() => setRuleModalVisible(false)}>
                Cancel
              </CentralButton>
            </StyledSpace>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default GatewayRoutingConfiguration;
