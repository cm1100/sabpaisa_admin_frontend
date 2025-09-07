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
  StyledStatistic,
  CentralTitle,
  CentralText,
  Tabs,
  CentralBadge,
  Tooltip,
  CentralProgress,
  Divider,
  App
 } from '@/components/ui';
import ResponsiveHeaderActions from '@/components/common/ResponsiveHeaderActions';
import { notifySuccess } from '@/utils/notify';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import PaymentMethodsApiService, {
  PaymentMethod,
  ClientPaymentMethod,
  CreatePaymentMethodRequest,
  UpdateClientPaymentMethodRequest
} from '@/services/api/PaymentMethodsApiService';
import {
  CreditCardOutlined,
  BankOutlined,
  WalletOutlined,
  MobileOutlined,
  SettingOutlined,
  EditOutlined,
  EyeOutlined,
  PlusOutlined,
  SyncOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  PercentageOutlined,
  SafetyOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';

const { Option } = Select;


const PaymentMethodsConfiguration: React.FC = () => {
  const { message } = App.useApp();
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [clientMethods, setClientMethods] = useState<ClientPaymentMethod[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState('methods');
  const [statistics, setStatistics] = useState<any>(null);


  useEffect(() => {
    loadMethods();
    loadClientMethods();
  }, []);

  const loadMethods = async () => {
    try {
      setLoading(true);
      const response = await PaymentMethodsApiService.getPaymentMethods({ page_size: 100 });
      setMethods(response.data.results || []);
      
      // Load statistics if endpoint exists
      try {
        const statsResponse = await PaymentMethodsApiService.getStatistics();
        setStatistics(statsResponse.data);
      } catch (statsError) {
        console.log('Statistics endpoint not available');
      }
    } catch (error: any) {
      message.error(error?.message || 'Failed to load payment methods');
      console.error('Error loading payment methods:', error);
      // Use empty array if API fails
      setMethods([]);
    } finally {
      setLoading(false);
    }
  };

  const loadClientMethods = async () => {
    try {
      const response = await PaymentMethodsApiService.getClientPaymentMethods({ page_size: 100 });
      setClientMethods(response.data.results || []);
    } catch (error) {
      console.error('Failed to load client payment methods', error);
    }
  };

  const handleToggle = async (methodId: string, isActive: boolean) => {
    try {
      await PaymentMethodsApiService.togglePaymentMethod(methodId, isActive);
      notifySuccess(`Payment method ${isActive ? 'enabled' : 'disabled'} successfully`);
      loadMethods();
    } catch (error: any) {
      message.error(error?.message || 'Failed to update payment method');
      console.error(error);
    }
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    form.setFieldsValue(method);
    setModalVisible(true);
  };

  const handleSubmit = async (values: any) => {
    try {
      const data: CreatePaymentMethodRequest = {
        method_code: values.method_code || values.method_name?.toUpperCase().replace(/\s+/g, '_'),
        method_name: values.method_name,
        method_type: values.method_type,
        provider_name: values.provider_name || 'Default',
        provider_code: values.provider_code || values.provider_name?.toUpperCase() || 'DEFAULT',
        is_active: values.is_active !== undefined ? values.is_active : true,
        requires_otp: values.requires_otp || false,
        requires_3ds: values.requires_3ds || false,
        min_amount: values.min_amount || 1,
        max_amount: values.max_amount || 100000,
        processing_time: values.processing_time || 60,
        success_rate: values.success_rate || 95,
        description: values.description
      };

      if (editingMethod) {
        await PaymentMethodsApiService.updatePaymentMethod(editingMethod.method_id, data);
        notifySuccess('Payment method updated successfully');
      } else {
        await PaymentMethodsApiService.createPaymentMethod(data);
        notifySuccess('Payment method created successfully');
      }
      
      setModalVisible(false);
      setEditingMethod(null);
      form.resetFields();
      loadMethods();
    } catch (error: any) {
      message.error(error.message || 'Failed to save payment method');
      console.error('Error saving payment method:', error);
    }
  };

  const getMethodIcon = (type: string) => {
    const icons = {
      'CARD': <CreditCardOutlined />,
      'UPI': <MobileOutlined />,
      'NETBANKING': <BankOutlined />,
      'WALLET': <WalletOutlined />,
      'EMI': <DollarOutlined />
    };
    return icons[type as keyof typeof icons] || <CreditCardOutlined />;
  };


  const columns = [
    {
      title: 'Payment Method',
      dataIndex: 'method_name',
      key: 'method_name',
      render: (name: string, record: PaymentMethod) => (
        <StyledSpace>
          <div >
            {getMethodIcon(record.method_type)}
          </div>
          <div>
            <div >{record.method_name}</div>
            <CentralText type="secondary" >
              {record.provider_name} • {record.method_type}
            </CentralText>
          </div>
        </StyledSpace>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive: boolean, record: PaymentMethod) => (
        <StyledSpace direction="vertical" size={0}>
          <Switch
            checked={isActive}
            onChange={(checked) => handleToggle(record.method_id, checked)}
            checkedChildren="ON"
            unCheckedChildren="OFF"
          />
          <CentralBadge
            status={isActive ? 'success' : 'error'}
            text={isActive ? 'Active' : 'Inactive'}
          />
        </StyledSpace>
      ),
    },
    {
      title: 'Processing Time',
      dataIndex: 'processing_time',
      key: 'processing_time',
      render: (time: number) => (
        <CentralTag color="blue">
          {time}s
        </CentralTag>
      ),
    },
    {
      title: 'Limits',
      key: 'limits',
      render: (_: any, record: PaymentMethod) => (
        <StyledSpace direction="vertical" size={0}>
          <CentralText >
            Min: ₹{record.min_amount.toLocaleString()}
          </CentralText>
          <CentralText >
            Max: ₹{record.max_amount.toLocaleString()}
          </CentralText>
        </StyledSpace>
      ),
    },
    {
      title: 'Performance',
      key: 'performance',
      render: (_: any, record: PaymentMethod) => (
        <StyledSpace direction="vertical" size={4}>
          <div>
            <CentralText >Success: </CentralText>
            <CentralTag color={record.success_rate > 95 ? 'green' : record.success_rate > 90 ? 'orange' : 'red'}>
              {record.success_rate}%
            </CentralTag>
          </div>
          <div>
            <CentralText >Processing: </CentralText>
            <CentralTag>{record.processing_time}s</CentralTag>
          </div>
        </StyledSpace>
      ),
    },
    // Settlement and Risk columns removed due to lack of backend fields
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: PaymentMethod) => (
        <StyledSpace>
          <Tooltip title="View Details">
            <CentralButton
              icon={<EyeOutlined />}
              size="small"
              onClick={() => {
                Modal.info({
                  title: `${record.method_name} Details`,
                  width: 600,
                  content: (
                    <div>
                      <ResponsiveRow >
                        <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
                          <StyledStatistic title="Success Rate" value={record.success_rate} suffix="%" />
                        </ResponsiveCol>
                        <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
                          <StyledStatistic title="Processing Time" value={record.processing_time} suffix="s" />
                        </ResponsiveCol>
                        <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
                          <StyledStatistic title="Min Amount" value={record.min_amount} prefix="₹" />
                        </ResponsiveCol>
                        <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
                          <StyledStatistic title="Max Amount" value={record.max_amount} prefix="₹" />
                        </ResponsiveCol>
                      </ResponsiveRow>
                      <Divider />
                      <div>
                        <CentralText type="secondary">Additional details will appear here when available.</CentralText>
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
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        </StyledSpace>
      ),
    },
  ];

  // Calculate statistics
  const stats = {
    totalMethods: methods.length,
    enabledMethods: methods.filter(m => m.is_active).length,
    averageSuccessRate: methods.length > 0 ? methods.reduce((sum, m) => sum + (m.success_rate || 0), 0) / methods.length : 0,
    totalVolume: (statistics && (statistics.total_volume || statistics.statistics?.total_volume)) || 0,
  };

  return (
    <div>
      <div className="header-actions">
        <div>
          <CentralTitle level={3}>
            <CreditCardOutlined />
            Payment Methods Configuration
          </CentralTitle>
          <CentralText type="secondary">
            Configure payment methods, processing fees, limits and routing preferences
          </CentralText>
        </div>
        <ResponsiveHeaderActions
          primary={[{ key: 'refresh', label: 'Refresh', icon: <SyncOutlined />, onClick: loadMethods }]}
          secondary={[{ key: 'add', label: 'Add Method', icon: <PlusOutlined />, onClick: () => { setEditingMethod(null); form.resetFields(); setModalVisible(true); } }]}
        />
      </div>

      {/* Statistics Cards */}
      <ResponsiveRow>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <StyledStatistic title="Total Methods" value={stats.totalMethods} />
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <StyledStatistic title="Enabled Methods" value={stats.enabledMethods} />
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <StyledStatistic title="Avg Success Rate" value={stats.averageSuccessRate.toFixed(1)} suffix="%" />
          </StyledCard>
        </ResponsiveCol>
        {stats.totalVolume > 0 && (
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledCard>
              <StyledStatistic title="Monthly Volume" value={stats.totalVolume} suffix="L" />
            </StyledCard>
          </ResponsiveCol>
        )}
      </ResponsiveRow>

      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="Payment Methods" key="methods">
          <StyledCard>
            <div className="ant-pro-table">
            <CentralTable
              id="config:payment-methods"
              columns={columns}
              dataSource={methods}
              rowKey="method_id"
              loading={loading}
              pagination={{
                pageSize: 10,
                showSizeChanger: true,
                showTotal: (total, range) =>
                  `${range[0]}-${range[1]} of ${total} methods`,
              }}
            />
            </div>
          </StyledCard>
        </Tabs.TabPane>

        <Tabs.TabPane tab="Analytics" key="analytics">
          <ResponsiveRow >
            <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
              <StyledCard title="Payment Method Performance" loading={loading}>
                <div >
                  <CentralText type="secondary">Performance analytics charts will be displayed here</CentralText>
                </div>
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>
        </Tabs.TabPane>
      </Tabs>

      {/* Add/Edit Modal */}
      <Modal
        title={`${editingMethod ? 'Edit' : 'Add'} Payment Method`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingMethod(null);
          form.resetFields();
        }}
        footer={null}
        width={800}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <ResponsiveRow>
            <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
              <Form.Item
                name="name"
                label="Method Name"
                rules={[{ required: true, message: 'Please enter method name' }]}
              >
                <Input placeholder="e.g., Visa Cards" />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
              <Form.Item
                name="type"
                label="Method Type"
                rules={[{ required: true, message: 'Please select method type' }]}
              >
                <Select placeholder="Select type">
                  <Option value="CARD">Card Payments</Option>
                  <Option value="UPI">UPI</Option>
                  <Option value="NETBANKING">Net Banking</Option>
                  <Option value="WALLET">Digital Wallet</Option>
                  <Option value="EMI">EMI</Option>
                </Select>
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="processingFee"
                label="Processing Fee"
                rules={[{ required: true, message: 'Please enter processing fee' }]}
              >
                <InputNumber
                  
                  min={0}
                  precision={2}
                  placeholder="2.5"
                />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="feeType"
                label="Fee Type"
                rules={[{ required: true, message: 'Please select fee type' }]}
              >
                <Select>
                  <Option value="PERCENTAGE">Percentage</Option>
                  <Option value="FLAT">Flat Amount</Option>
                </Select>
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="priority"
                label="Priority"
                rules={[{ required: true, message: 'Please enter priority' }]}
              >
                <InputNumber
                  
                  min={1}
                  max={10}
                  placeholder="1"
                />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow>
            <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
              <Form.Item
                name="minAmount"
                label="Minimum Amount (₹)"
                rules={[{ required: true, message: 'Please enter minimum amount' }]}
              >
                <InputNumber
                  
                  min={0}
                  placeholder="1"
                />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
              <Form.Item
                name="maxAmount"
                label="Maximum Amount (₹)"
                rules={[{ required: true, message: 'Please enter maximum amount' }]}
              >
                <InputNumber
                  
                  min={0}
                  placeholder="500000"
                />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow>
            <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
              <Form.Item
                name="settlementCycle"
                label="Settlement Cycle"
                rules={[{ required: true, message: 'Please select settlement cycle' }]}
              >
                <Select>
                  <Option value="T+0">Same Day (T+0)</Option>
                  <Option value="T+1">Next Day (T+1)</Option>
                  <Option value="T+2">Two Days (T+2)</Option>
                  <Option value="T+3">Three Days (T+3)</Option>
                </Select>
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
              <Form.Item
                name="gateway"
                label="Gateway"
                rules={[{ required: true, message: 'Please enter gateway' }]}
              >
                <Input placeholder="e.g., Razorpay" />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <Form.Item>
            <StyledSpace>
              <CentralButton type="primary" htmlType="submit">
                {editingMethod ? 'Update Method' : 'Add Method'}
              </CentralButton>
              <CentralButton onClick={() => setModalVisible(false)}>
                Cancel
              </CentralButton>
            </StyledSpace>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PaymentMethodsConfiguration;
