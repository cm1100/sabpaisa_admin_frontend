'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ProColumns, ProTable } from '@/components/ui';
import { App, CentralBadge as Badge, CentralButton as Button, CentralProTable, CentralProgress as Progress, CentralTag as Tag, CentralText, CentralTitle, DatePicker, Descriptions, Form, Input, InputNumber, Modal, Select, Spin, StyledCard as Card, StyledSpace as Space, Switch, Tooltip, CentralPageContainer } from '@/components/ui';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CalculatorOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  EyeOutlined,
  SyncOutlined,
  DollarOutlined,
  PercentageOutlined
} from '@ant-design/icons';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import FeeConfigurationApiService, {
  FeeConfiguration,
  CreateFeeConfigurationRequest,
  FeeCalculationRequest,
  FeeStatistics
} from '@/services/api/FeeConfigurationApiService';
import { ClientApiService } from '@/services/api/ClientApiService';
import dayjs from 'dayjs';
import { notifySuccess } from '@/utils/notify';

const { Option } = Select;

// Form value interfaces
interface FeeConfigFormValues {
  client_id: string;
  fee_name: string;
  fee_type: string;
  fee_structure: string;
  base_rate: number;
  minimum_fee?: number;
  maximum_fee?: number;
  tier_rates?: Array<{ min: number; max: number; rate: number }>;
  volume_slabs?: Array<{ min: number; max?: number; rate: number }>;
  payment_method_rates?: { [key: string]: number };
  effective_from: dayjs.Dayjs;
  effective_until?: dayjs.Dayjs;
  is_active?: boolean;
  requires_approval?: boolean;
}

interface FeeCalculationFormValues {
  transaction_amount: number;
  calc_client_id: string;
  calc_fee_type: string;
  payment_method?: string;
  promo_code?: string;
  monthly_volume?: number;
}
// Typography components imported directly from centralized UI

const FeeConfigurationPage: React.FC = () => {
  const { message } = App.useApp();
  const [feeConfigs, setFeeConfigs] = useState<FeeConfiguration[]>([]);
  const [statistics, setStatistics] = useState<FeeStatistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [calculatorModalVisible, setCalculatorModalVisible] = useState(false);
  const [editingConfig, setEditingConfig] = useState<FeeConfiguration | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [selectedFeeType, setSelectedFeeType] = useState<string>('');
  const [form] = Form.useForm();
  const [calculatorForm] = Form.useForm();
  const [clientOptions, setClientOptions] = useState<Array<{ value: string; label: string }>>([]);
  const clientApi = new ClientApiService();

  const feeTypes = FeeConfigurationApiService.getFeeTypes();
  const feeStructures = FeeConfigurationApiService.getFeeStructures();
  const paymentMethods = FeeConfigurationApiService.getPaymentMethods();

  const loadFeeConfigurations = useCallback(async () => {
    try {
      setLoading(true);
      const params: Record<string, string | number> = { page_size: 100 };
      if (selectedClientId) params.client_id = selectedClientId;
      if (selectedFeeType) params.fee_type = selectedFeeType;
      
      const response = await FeeConfigurationApiService.getFeeConfigurations(params);
      setFeeConfigs(response.data.results || []);
    } catch (error: any) {
      message.error(error?.message || 'Failed to load fee configurations');
    } finally {
      setLoading(false);
    }
  }, [selectedClientId, selectedFeeType, message]);

  useEffect(() => {
    loadFeeConfigurations();
    loadStatistics();
    // Load clients for filters and form selects
    (async () => {
      try {
        const res = await clientApi.getAll({ page: 1, page_size: 200 } as any);
        const list = (res as any).results || res || [];
        const opts = list.map((c: any) => ({
          value: (c.client_id || c.id || '').toString(),
          label: `${c.client_name || c.name} (${c.client_code || c.clientId || ''})`,
        }));
        setClientOptions(opts);
      } catch (e) {
        console.warn('Failed to load clients for fee config', e);
      }
    })();
  }, [loadFeeConfigurations]);

  const loadStatistics = async () => {
    try {
      const response = await FeeConfigurationApiService.getFeeStatistics();
      setStatistics(response.data);
    } catch (error) {
      console.error('Failed to load statistics', error);
    }
  };

  const handleSubmit = async (values: FeeConfigFormValues) => {
    try {
      const configData: CreateFeeConfigurationRequest = {
        client_id: values.client_id,
        fee_name: values.fee_name,
        fee_type: values.fee_type as any,
        fee_structure: values.fee_structure as any,
        base_rate: values.base_rate,
        minimum_fee: values.minimum_fee || 0,
        maximum_fee: values.maximum_fee,
        tier_rates: values.tier_rates || [],
        volume_slabs: values.volume_slabs || [],
        payment_method_rates: values.payment_method_rates || {},
        effective_from: values.effective_from.toISOString(),
        effective_until: values.effective_until ? values.effective_until.toISOString() : undefined,
        is_active: values.is_active !== undefined ? values.is_active : true,
        requires_approval: values.requires_approval || false,
        created_by: 'Admin'
      };

      // Validate configuration
      const errors = FeeConfigurationApiService.validateFeeConfiguration(configData);
      if (errors.length > 0) {
        message.error(errors[0]);
        return;
      }

      if (editingConfig) {
        await FeeConfigurationApiService.updateFeeConfiguration(editingConfig.fee_id, configData);
            notifySuccess('Fee configuration updated successfully');
      } else {
        await FeeConfigurationApiService.createFeeConfiguration(configData);
            notifySuccess('Fee configuration created successfully');
      }
      
      setModalVisible(false);
      setEditingConfig(null);
      form.resetFields();
      loadFeeConfigurations();
      loadStatistics();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to save fee configuration';
      message.error(errorMessage);
    }
  };

  const handleCalculateFee = async (values: FeeCalculationFormValues) => {
    try {
      const calculationRequest: FeeCalculationRequest = {
        transaction_amount: values.transaction_amount,
        client_id: values.calc_client_id,
        fee_type: values.calc_fee_type,
        payment_method: values.payment_method,
        promo_code: values.promo_code,
        volume_data: values.monthly_volume ? {
          monthly_volume: values.monthly_volume
        } : undefined
      };

      const response = await FeeConfigurationApiService.calculateFee(calculationRequest);
      
      Modal.info({
        title: 'Fee Calculation Result',
        width: 600,
        content: (
          <div>
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Transaction Amount">
                {FeeConfigurationApiService.formatCurrency(values.transaction_amount)}
              </Descriptions.Item>
              <Descriptions.Item label="Base Fee">
                {FeeConfigurationApiService.formatCurrency(response.data.base_fee_amount)}
              </Descriptions.Item>
              <Descriptions.Item label="Discount Applied">
                {FeeConfigurationApiService.formatCurrency(response.data.discount_amount)}
              </Descriptions.Item>
              <Descriptions.Item label="Final Fee">
                <CentralText strong >
                  {FeeConfigurationApiService.formatCurrency(response.data.final_fee_amount)}
                </CentralText>
              </Descriptions.Item>
              <Descriptions.Item label="Calculation Method">
                <Tag color="blue">{response.data.calculation_method}</Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Structure Used">
                {response.data.calculation_details.structure_used}
              </Descriptions.Item>
              <Descriptions.Item label="Rate Applied">
                {FeeConfigurationApiService.formatPercentage(response.data.calculation_details.rate_applied)}
              </Descriptions.Item>
            </Descriptions>
            
            {response.data.breakdown && response.data.breakdown.length > 0 && (
              <div >
                <CentralText strong>Fee Breakdown:</CentralText>
                {response.data.breakdown.map((item, index) => (
                  <div key={index} >
                    <span>{item.component}</span>
                    <span>{FeeConfigurationApiService.formatCurrency(item.amount)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )
      });
      
      calculatorForm.resetFields();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to calculate fee';
      message.error(errorMessage);
    }
  };

  const handleToggleStatus = async (config: FeeConfiguration) => {
    try {
      await FeeConfigurationApiService.toggleFeeConfiguration(config.fee_id);
      notifySuccess(`Configuration ${config.is_active ? 'deactivated' : 'activated'} successfully`);
      loadFeeConfigurations();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to toggle configuration status';
      message.error(errorMessage);
    }
  };

  const handleDelete = (config: FeeConfiguration) => {
    Modal.confirm({
      title: 'Delete Fee Configuration',
      content: `Are you sure you want to delete "${config.fee_name}"?`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await FeeConfigurationApiService.deleteFeeConfiguration(config.fee_id);
          notifySuccess('Configuration deleted successfully');
          loadFeeConfigurations();
          loadStatistics();
        } catch (error: unknown) {
          const errorMessage = error instanceof Error ? error.message : 'Failed to delete configuration';
          message.error(errorMessage);
        }
      }
    });
  };

  const columns: ProColumns<FeeConfiguration>[] = [
    {
      title: 'Fee Name',
      dataIndex: 'fee_name',
      key: 'fee_name',
      width: 200,
      render: (text: string, record: FeeConfiguration) => (
        <Space direction="vertical" size={0}>
          <CentralText strong>{text}</CentralText>
          <CentralText type="secondary" >ID: {record.fee_id}</CentralText>
        </Space>
      ),
    },
    {
      title: 'Client',
      dataIndex: 'client_id',
      key: 'client_id',
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Fee Type',
      dataIndex: 'fee_type',
      key: 'fee_type',
      width: 120,
      render: (type: string) => (
        <Tag color={FeeConfigurationApiService.getFeeTypeColor(type)}>
          {feeTypes.find(t => t.value === type)?.label || type}
        </Tag>
      ),
    },
    {
      title: 'Structure',
      dataIndex: 'fee_structure',
      key: 'fee_structure',
      width: 120,
      render: (structure: string) => (
        <Tag color={FeeConfigurationApiService.getFeeStructureColor(structure)}>
          {feeStructures.find(s => s.value === structure)?.label || structure}
        </Tag>
      ),
    },
    {
      title: 'Base Rate',
      dataIndex: 'base_rate',
      key: 'base_rate',
      width: 100,
      render: (rate: number, record: FeeConfiguration) => (
        <Space>
          {record.fee_structure === 'FLAT' ? (
            <Tag color="green">
              {FeeConfigurationApiService.formatCurrency(rate)}
            </Tag>
          ) : (
            <Tag color="blue">
              {FeeConfigurationApiService.formatPercentage(rate)}
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Min/Max Fee',
      key: 'fee_limits',
      width: 150,
      render: (_: unknown, record: FeeConfiguration) => (
        <Space direction="vertical" size={0}>
          <CentralText >
            Min: {FeeConfigurationApiService.formatCurrency(record.minimum_fee)}
          </CentralText>
          {record.maximum_fee && (
            <CentralText >
              Max: {FeeConfigurationApiService.formatCurrency(record.maximum_fee)}
            </CentralText>
          )}
        </Space>
      ),
    },
    {
      title: 'Effective Period',
      key: 'effective_period',
      width: 200,
      render: (_: unknown, record: FeeConfiguration) => (
        <Space direction="vertical" size={0}>
          <CentralText >
            From: {dayjs(record.effective_from).format('DD MMM YYYY')}
          </CentralText>
          {record.effective_until && (
            <CentralText >
              Until: {dayjs(record.effective_until).format('DD MMM YYYY')}
            </CentralText>
          )}
        </Space>
      ),
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_: unknown, record: FeeConfiguration) => (
        <Space direction="vertical" size={0}>
          <Badge
            status={record.is_active ? 'success' : 'error'}
            text={record.is_active ? 'Active' : 'Inactive'}
          />
          <Badge
            status={record.is_currently_active ? 'success' : 'warning'}
            text={record.is_currently_active ? 'Current' : 'Not Current'}
          />
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right',
      render: (_: unknown, record: FeeConfiguration) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                Modal.info({
                  title: `Fee Configuration Details - ${record.fee_name}`,
                  width: 800,
                  content: (
                    <Descriptions column={2} bordered size="small">
                      <Descriptions.Item label="Fee ID">{record.fee_id}</Descriptions.Item>
                      <Descriptions.Item label="Client ID">{record.client_id}</Descriptions.Item>
                      <Descriptions.Item label="Fee Type">{record.fee_type}</Descriptions.Item>
                      <Descriptions.Item label="Fee Structure">{record.fee_structure}</Descriptions.Item>
                      <Descriptions.Item label="Base Rate">{record.base_rate}</Descriptions.Item>
                      <Descriptions.Item label="Min Fee">{record.minimum_fee}</Descriptions.Item>
                      <Descriptions.Item label="Max Fee">{record.maximum_fee || 'No limit'}</Descriptions.Item>
                      <Descriptions.Item label="Created By">{record.created_by}</Descriptions.Item>
                      <Descriptions.Item label="Effective From">
                        {dayjs(record.effective_from).format('DD MMM YYYY HH:mm')}
                      </Descriptions.Item>
                      <Descriptions.Item label="Effective Until">
                        {record.effective_until ? dayjs(record.effective_until).format('DD MMM YYYY HH:mm') : 'No expiry'}
                      </Descriptions.Item>
                    </Descriptions>
                  )
                });
              }}
            />
          </Tooltip>
          <Tooltip title="Edit Configuration">
            <Button
              icon={<EditOutlined />}
              size="small"
              onClick={() => {
                setEditingConfig(record);
                form.setFieldsValue({
                  ...record,
                  effective_from: dayjs(record.effective_from),
                  effective_until: record.effective_until ? dayjs(record.effective_until) : null
                });
                setModalVisible(true);
              }}
            />
          </Tooltip>
          <Tooltip title={record.is_active ? 'Deactivate' : 'Activate'}>
            <Button
              icon={record.is_active ? <CloseCircleOutlined /> : <CheckCircleOutlined />}
              size="small"
              onClick={() => handleToggleStatus(record)}
            />
          </Tooltip>
          <Tooltip title="Delete Configuration">
            <Button
              icon={<DeleteOutlined />}
              size="small"
              danger
              onClick={() => handleDelete(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  // Calculate statistics
  const configMetrics = statistics ? [
    {
      label: 'Total Configurations',
      value: statistics.total_configurations,
      status: 'success'
    },
    {
      label: 'Active Configurations',
      value: statistics.active_configurations,
      status: 'success'
    },
    {
      label: 'Current Month Revenue',
      value: statistics.total_revenue_current_month,
      format: 'currency',
      status: 'success'
    },
    {
      label: 'Revenue Growth',
      value: statistics.revenue_growth_percentage,
      format: 'percentage',
      status: statistics.revenue_growth_percentage >= 0 ? 'success' : 'error'
    }
  ] : [];

  return (
    <CentralPageContainer withBackground title="Fee Configuration" subTitle="Manage dynamic pricing and fee structures">
      <div >
        <div>
          <CentralTitle level={3}>Fee Configuration</CentralTitle>
          <CentralText type="secondary">Manage dynamic pricing and fee structures</CentralText>
        </div>
        <Space>
          <Button 
            icon={<CalculatorOutlined />} 
            onClick={() => setCalculatorModalVisible(true)}
          >
            Fee Calculator
          </Button>
          <Button icon={<SyncOutlined />} onClick={() => {
            loadFeeConfigurations();
            loadStatistics();
          }}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingConfig(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Add Configuration
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        {/* Statistics Cards */}
        <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[24, 24]} >
          {configMetrics.map((metric, index) => (
            <ResponsiveCol span={6} key={index}>
              <Card>
                <CentralTitle level={5}>{metric.label}</CentralTitle>
                <CentralText>
                  {metric.format === 'currency' 
                    ? FeeConfigurationApiService.formatCurrency(metric.value)
                    : metric.format === 'percentage'
                    ? FeeConfigurationApiService.formatPercentage(metric.value)
                    : metric.value}
                </CentralText>
                <div style={{ marginTop: 8 }}>
                  <Progress
                    type="circle"
                    percent={metric.format === 'percentage' ? Math.abs(metric.value) : Math.min((metric.value / 100) * 100, 100)}
                    width={60}
                    status={metric.status as 'success' | 'exception' | 'normal' | 'active'}
                  />
                </div>
              </Card>
            </ResponsiveCol>
          ))}
        </ResponsiveRow>

        {/* Filters */}
        <Card >
          <ResponsiveRow gutter={16}>
            <ResponsiveCol span={8}>
              <Select
                placeholder="Filter by client"
                showSearch
                optionFilterProp="label"
                value={selectedClientId || undefined}
                onChange={setSelectedClientId}
                allowClear
                data-testid="fee-filter-client"
              >
                {clientOptions.map(opt => (
                  <Option key={opt.value} value={opt.value} label={opt.label}>
                    {opt.label}
                  </Option>
                ))}
              </Select>
            </ResponsiveCol>
            <ResponsiveCol span={8}>
              <Select
                placeholder="Filter by fee type"
                
                value={selectedFeeType || undefined}
                onChange={setSelectedFeeType}
                allowClear
              >
                {feeTypes.map(type => (
                  <Option key={type.value} value={type.value}>{type.label}</Option>
                ))}
              </Select>
            </ResponsiveCol>
          </ResponsiveRow>
        </Card>

        {/* Fee Configurations Table */}
        <CentralProTable<FeeConfiguration, any>
          columns={columns}
          dataSource={feeConfigs}
          loading={loading}
          rowKey="fee_id"
          search={false}
          toolBarRender={() => [
            <Button key="refresh" icon={<SyncOutlined />} onClick={loadFeeConfigurations}>
              Refresh
            </Button>
          ]}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true
          }}
          scroll={{ x: 1600 }}
        />
      </Spin>

      {/* Add/Edit Configuration Modal */}
      <Modal
        title={`${editingConfig ? 'Edit' : 'Add'} Fee Configuration`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingConfig(null);
          form.resetFields();
        }}
        footer={null}
        width={900}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <ResponsiveRow gutter={16}>
            <ResponsiveCol span={12}>
              <Form.Item
                name="client_id"
                label="Client"
                rules={[{ required: true, message: 'Please select client' }]}
              >
                <Select
                  placeholder="Select client"
                  showSearch
                  optionFilterProp="label"
                  options={clientOptions}
                  data-testid="fee-form-client"
                />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol span={12}>
              <Form.Item
                name="fee_name"
                label="Fee Name"
                rules={[{ required: true, message: 'Please enter fee name' }]}
              >
                <Input placeholder="e.g., Card Processing Fee" />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow gutter={16}>
            <ResponsiveCol span={12}>
              <Form.Item
                name="fee_type"
                label="Fee Type"
                rules={[{ required: true, message: 'Please select fee type' }]}
              >
                <Select placeholder="Select fee type">
                  {feeTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      {type.label} - {type.description}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol span={12}>
              <Form.Item
                name="fee_structure"
                label="Fee Structure"
                rules={[{ required: true, message: 'Please select fee structure' }]}
              >
                <Select placeholder="Select fee structure">
                  {feeStructures.map(structure => (
                    <Option key={structure.value} value={structure.value}>
                      {structure.label} - {structure.description}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow gutter={16}>
            <ResponsiveCol span={8}>
              <Form.Item
                name="base_rate"
                label="Base Rate"
                rules={[{ required: true, message: 'Please enter base rate' }]}
              >
                <InputNumber
                  
                  min={0}
                  precision={4}
                  placeholder="2.5"
                />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol span={8}>
              <Form.Item
                name="minimum_fee"
                label="Minimum Fee (₹)"
              >
                <InputNumber
                  
                  min={0}
                  precision={2}
                  placeholder="0"
                />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol span={8}>
              <Form.Item
                name="maximum_fee"
                label="Maximum Fee (₹)"
              >
                <InputNumber
                  
                  min={0}
                  precision={2}
                  placeholder="Optional"
                />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow gutter={16}>
            <ResponsiveCol span={12}>
              <Form.Item
                name="effective_from"
                label="Effective From"
                rules={[{ required: true, message: 'Please select effective date' }]}
              >
                <DatePicker
                  showTime
                  
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol span={12}>
              <Form.Item
                name="effective_until"
                label="Effective Until"
              >
                <DatePicker
                  showTime
                  
                  format="YYYY-MM-DD HH:mm"
                  placeholder="Optional - leave empty for no expiry"
                />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow gutter={16}>
            <ResponsiveCol span={8}>
              <Form.Item
                name="is_active"
                label="Active"
                valuePropName="checked"
                initialValue={true}
              >
                <Switch />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol span={8}>
              <Form.Item
                name="requires_approval"
                label="Requires Approval"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingConfig ? 'Update Configuration' : 'Create Configuration'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Fee Calculator Modal */}
      <Modal
        title="Fee Calculator"
        open={calculatorModalVisible}
        onCancel={() => {
          setCalculatorModalVisible(false);
          calculatorForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={calculatorForm}
          layout="vertical"
          onFinish={handleCalculateFee}
        >
          <ResponsiveRow gutter={16}>
            <ResponsiveCol span={12}>
              <Form.Item
                name="calc_client_id"
                label="Client ID"
                rules={[{ required: true, message: 'Please enter client ID' }]}
              >
                <Input placeholder="CLIENT001" />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol span={12}>
              <Form.Item
                name="calc_fee_type"
                label="Fee Type"
                rules={[{ required: true, message: 'Please select fee type' }]}
              >
                <Select placeholder="Select fee type">
                  {feeTypes.map(type => (
                    <Option key={type.value} value={type.value}>{type.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow gutter={16}>
            <ResponsiveCol span={12}>
              <Form.Item
                name="transaction_amount"
                label="Transaction Amount (₹)"
                rules={[{ required: true, message: 'Please enter amount' }]}
              >
                <InputNumber
                  
                  min={0}
                  precision={2}
                  placeholder="10000"
                />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol span={12}>
              <Form.Item
                name="payment_method"
                label="Payment Method"
              >
                <Select placeholder="Select payment method">
                  {paymentMethods.map(method => (
                    <Option key={method.value} value={method.value}>{method.label}</Option>
                  ))}
                </Select>
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow gutter={16}>
            <ResponsiveCol span={12}>
              <Form.Item
                name="promo_code"
                label="Promo Code"
              >
                <Input placeholder="Optional promo code" />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol span={12}>
              <Form.Item
                name="monthly_volume"
                label="Monthly Volume (₹)"
              >
                <InputNumber
                  
                  min={0}
                  precision={2}
                  placeholder="For volume-based pricing"
                />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<CalculatorOutlined />} block>
              Calculate Fee
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </CentralPageContainer>
  );
};

export default FeeConfigurationPage;
