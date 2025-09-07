'use client';

import React, { useState, useEffect, useRef } from 'react';
// Using centralized components instead of Pro Components
import {
  StyledCard,
  CentralButton,
  StyledSpace,
  CentralTag,
  CentralTitle,
  CentralText,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  InputNumber,
  message,
  CentralBadge,
  Tooltip,
  Timeline,
  CentralProgress,
  CentralAlert,
  Divider,
  Steps,
  Result,
  StyledStatistic,
  CentralTable,
  Descriptions
} from '@/components/ui';
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  DollarOutlined,
  BankOutlined,
  SyncOutlined,
  FileTextOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  RightOutlined,
  WarningOutlined,
  CalendarOutlined,
  MoneyCollectOutlined
} from '@ant-design/icons';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { useResponsive } from '@/hooks/useResponsive';
import { useSettlementStore } from '@/stores/settlementStore';
import type { SettlementBatch, SettlementDetail } from '@/services/api/SettlementApiService';
import { theme } from '@/components/ui';
import dayjs from 'dayjs';

// Using centralized typography components
const { RangePicker } = DatePicker;
const { Step } = Steps;

/**
 * Settlement Processing Page
 * Following SOLID principles and project design patterns
 * Single Responsibility: Manages settlement UI only
 */
const SettlementProcessingPage: React.FC = () => {
  const responsive = useResponsive();
  const actionRef = useRef<any>(null);
  const [processModalVisible, setProcessModalVisible] = useState(false);
  const [reconcileModalVisible, setReconcileModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<SettlementBatch | null>(null);
  const [selectedRows, setSelectedRows] = useState<SettlementBatch[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [reconcileForm] = Form.useForm();

  // Zustand store - Following Dependency Inversion Principle
  const {
    batches,
    statistics,
    activities,
    cycleDistribution,
    settlementDetails,
    isLoading,
    isProcessing,
    isCreatingBatch,
    fetchBatches,
    fetchStatistics,
    fetchActivities,
    fetchCycleDistribution,
    fetchSettlementDetails,
    createBatch,
    processBatch,
    approveBatch,
    retrySettlement,
    bulkProcessSettlements,
    createReconciliation,
    exportSettlements,
    setFilter
  } = useSettlementStore();

  // Load initial data
  useEffect(() => {
    fetchBatches();
    fetchStatistics();
    fetchActivities(); // Now implemented in backend
    fetchCycleDistribution(); // Now implemented in backend
  }, []);

  // Status configuration - Following Open/Closed Principle
  const statusConfig = {
    PENDING: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Pending' },
    PROCESSING: { color: 'processing', icon: <SyncOutlined spin />, text: 'Processing' },
    APPROVED: { color: 'warning', icon: <ExclamationCircleOutlined />, text: 'Approved' },
    COMPLETED: { color: 'success', icon: <CheckCircleOutlined />, text: 'Completed' },
    FAILED: { color: 'error', icon: <CloseCircleOutlined />, text: 'Failed' },
    CANCELLED: { color: 'default', icon: <CloseCircleOutlined />, text: 'Cancelled' }
  };

  // Table columns configuration - Following Interface Segregation
  const { token } = theme.useToken();

  const columns = [
    {
      title: 'Batch ID',
      dataIndex: 'batch_id',
      key: 'batch_id',
      width: 280,
      fixed: 'left' as const,
      ellipsis: true,
      copyable: true,
      render: (text: string) => (
        <a onClick={() => handleViewDetails(text as string)} style={{ cursor: 'pointer' }}>
          <CentralText code>{text}</CentralText>
        </a>
      )
    },
    {
      title: 'Batch Date',
      dataIndex: 'batch_date',
      key: 'batch_date',
      width: 140,
      valueType: 'date',
      sorter: true,
      render: (_: any, record: any) => {
        const dateStr = record.batch_date;
        if (!dateStr) return '-';
        const parsedDate = dayjs(dateStr);
        return (
          <StyledSpace>
            <CalendarOutlined />
            {parsedDate.isValid() ? parsedDate.format('DD MMM YYYY') : dateStr}
          </StyledSpace>
        );
      }
    },
    {
      title: 'Total Amount',
      dataIndex: 'total_amount',
      key: 'total_amount',
      width: 150,
      align: 'right',
      sorter: true,
      render: (amount: number) => (
        <CentralText strong>
          ₹{(amount as number).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </CentralText>
      )
    },
    {
      title: 'Transactions',
      dataIndex: 'total_transactions',
      key: 'total_transactions',
      width: 120,
      align: 'center',
      render: (count: number) => (
        <CentralBadge count={count as number} showZero color={token.colorInfo} />
      )
    },
    {
      title: 'Processing Fee',
      dataIndex: 'processing_fee',
      key: 'processing_fee',
      width: 130,
      align: 'right',
      render: (fee?: number) => fee ? (
        <CentralText type="secondary">
          ₹{(fee as number).toLocaleString('en-IN')}
        </CentralText>
      ) : '-'
    },
    {
      title: 'Net Amount',
      dataIndex: 'net_settlement_amount',
      key: 'net_settlement_amount',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        <CentralText strong>
          ₹{(amount as number).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </CentralText>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      filters: Object.entries(statusConfig).map(([value, config]) => ({
        text: config.text,
        value
      })),
      render: (status: string) => {
        const config = statusConfig[status as keyof typeof statusConfig];
        return config ? (
          <CentralBadge
            status={config.color as any}
            text={
              <StyledSpace>
                {config.icon}
                {config.text}
              </StyledSpace>
            }
          />
        ) : status;
      }
    },
    {
      title: 'Processed At',
      dataIndex: 'processed_at',
      key: 'processed_at',
      width: 150,
      render: (date: string | null) => {
        if (!date) return <CentralText type="secondary">Not processed</CentralText>;
        const parsedDate = dayjs(date as string);
        return parsedDate.isValid() ? 
          parsedDate.format('DD MMM YYYY HH:mm') : 
          <CentralText type="secondary">Invalid Date</CentralText>;
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <StyledSpace>
          {record.status === 'PENDING' && (
            <CentralButton
              type="primary"
              size="small"
              icon={<SyncOutlined />}
              onClick={() => handleProcess(record)}
              loading={isProcessing}
            >
              Process
            </CentralButton>
          )}
          {record.status === 'PROCESSING' && (
            <CentralButton
              size="small"
              icon={<CheckCircleOutlined />}
              onClick={() => handleApprove(record)}
              loading={isProcessing}
            >
              Approve
            </CentralButton>
          )}
          {record.status === 'FAILED' && (
            <CentralButton
              size="small"
              danger
              icon={<SyncOutlined />}
              onClick={() => handleRetry(record)}
            >
              Retry
            </CentralButton>
          )}
          <CentralButton
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => handleViewDetails(record.batch_id)}
          >
            Details
          </CentralButton>
        </StyledSpace>
      )
    }
  ];

  // Event handlers - Following Single Responsibility Principle
  const handleViewDetails = async (batchId: string) => {
    const batch = (batches || []).find(b => b.batch_id === batchId);
    if (batch) {
      setSelectedBatch(batch);
      await fetchSettlementDetails(batchId);
      setDetailsModalVisible(true);
    }
  };

  const handleProcess = (batch: SettlementBatch) => {
    setSelectedBatch(batch);
    setProcessModalVisible(true);
    setCurrentStep(0);
  };

  const handleProcessSubmit = async () => {
    if (!selectedBatch) return;
    
    // Simulate processing steps
    for (let i = 0; i <= 3; i++) {
      setCurrentStep(i);
      if (i === 2) {
        // Actually process the batch
        await processBatch(selectedBatch.batch_id);
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    
    setProcessModalVisible(false);
    setCurrentStep(0);
    // Refresh data
    fetchBatches();
    fetchStatistics();
  };

  const handleApprove = async (batch: SettlementBatch) => {
    Modal.confirm({
      title: 'Approve Settlement Batch',
      content: `Are you sure you want to approve batch ${batch.batch_id}?`,
      onOk: async () => {
        await approveBatch(batch.batch_id);
        fetchBatches();
        fetchStatistics();
      }
    });
  };

  const handleRetry = (batch: SettlementBatch) => {
    Modal.confirm({
      title: 'Retry Settlement',
      content: `Are you sure you want to retry batch ${batch.batch_id}?`,
      onOk: async () => {
        await processBatch(batch.batch_id);
        fetchBatches();
      }
    });
  };

  const handleBulkProcess = () => {
    if (selectedRows.length === 0) {
      message.warning('Please select batches to process');
      return;
    }
    
    Modal.confirm({
      title: 'Bulk Process Settlements',
      content: `Process ${selectedRows.length} selected batches?`,
      onOk: async () => {
        const batchIds = selectedRows.map(b => b.batch_id);
        await bulkProcessSettlements(batchIds);
        setSelectedRows([]);
        fetchBatches();
        fetchStatistics();
      }
    });
  };

  const handleCreateBatch = async () => {
    let selectedDate = dayjs().format('YYYY-MM-DD');
    
    Modal.confirm({
      title: 'Create Settlement Batch',
      content: (
        <div>
          <p>Select the settlement date (T+1 rule applies):</p>
          <DatePicker
            defaultValue={dayjs()}
            onChange={(date) => {
              selectedDate = date ? date.format('YYYY-MM-DD') : dayjs().format('YYYY-MM-DD');
            }}
            
            disabledDate={(current) => {
              // Disable future dates beyond today
              return current && current > dayjs().endOf('day');
            }}
          />
          <CentralAlert
            message="T+1 Settlement Rule"
            description={`Selecting ${dayjs().format('DD MMM YYYY')} will settle transactions from ${dayjs().subtract(1, 'day').format('DD MMM YYYY')}`}
            type="info"
            showIcon
          />
        </div>
      ),
      onOk: async () => {
        const batch = await createBatch(selectedDate);
        if (batch) {
          await fetchBatches();
          await fetchStatistics();
        }
      },
      okText: 'Create Batch',
      width: 500
    });
  };

  const handleReconcile = async () => {
    try {
      const values = await reconcileForm.validateFields();
      await createReconciliation(
        values.batchId,
        values.bankAmount,
        values.remarks
      );
      setReconcileModalVisible(false);
      reconcileForm.resetFields();
    } catch (error) {
      console.error('Reconciliation error:', error);
    }
  };

  const handleExport = (format: 'csv' | 'xlsx') => {
    exportSettlements(format);
  };

  return (
    <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
        {/* Statistics Cards */}
        <ResponsiveRow 
          animate
        >
          <ResponsiveCol {...LAYOUT_CONFIG.common.compactMetric} >
            <StyledStatistic
              title="Pending Settlements"
              value={statistics?.pending_count || 0}
              icon={<ClockCircleOutlined />}
              description={(
                <CentralText type="secondary">
                  ₹{((statistics?.pending_amount || 0) / 100000).toFixed(1)}L total
                </CentralText>
              )}
            />
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.compactMetric} >
            <StyledStatistic
              title="Processing"
              value={statistics?.processing_count || 0}
              icon={<SyncOutlined spin />}
              description={(
                <CentralText type="secondary">
                  ₹{((statistics?.processing_amount || 0) / 100000).toFixed(1)}L total
                </CentralText>
              )}
            />
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.compactMetric} >
            <StyledStatistic
              title="Completed Today"
              value={statistics?.completed_today_count || 0}
              icon={<CheckCircleOutlined />}
              description={(
                <CentralText type="secondary">
                  ₹{((statistics?.completed_today_amount || 0) / 100000).toFixed(1)}L total
                </CentralText>
              )}
            />
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.compactMetric} >
            <StyledStatistic
              title="Failed"
              value={statistics?.failed_count || 0}
              icon={<CloseCircleOutlined />}
              description={(
                <CentralText type="secondary">
                  ₹{((statistics?.failed_amount || 0) / 100000).toFixed(1)}L total
                </CentralText>
              )}
            />
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Analytics Cards */}
        <ResponsiveRow 
          animate
        >
          <ResponsiveCol {...LAYOUT_CONFIG.common.formField} >
            <StyledCard title="Settlement Cycle Distribution" size="small">
              <StyledSpace direction="vertical">
                {(Array.isArray(cycleDistribution) ? cycleDistribution : []).map(cycle => (
                  <div key={cycle.cycle}>
                    <CentralText>{cycle.cycle}</CentralText>
                    <CentralProgress 
                      percent={cycle.percentage} 
                      status="active"
                      strokeColor={token.colorInfo}
                    />
                  </div>
                ))}
              </StyledSpace>
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.formField} >
            <StyledCard title="Recent Settlement Activity" size="small">
              <Timeline>
                {(Array.isArray(activities) ? activities : []).slice(0, 4).map((activity, index) => (
                  <Timeline.Item 
                    key={index}
                    color={
                      activity.status === 'success' ? token.colorSuccess : 
                      activity.status === 'error' ? token.colorError : token.colorInfo
                    }
                  >
                    {activity.description}
                    {activity.amount && (
                      <> - ₹{(activity.amount / 100000).toFixed(1)}L</>
                    )}
                    <br />
                    <CentralText type="secondary">
                      {(() => {
                        const diff = dayjs().diff(dayjs(activity.timestamp), 'minute');
                        if (diff < 60) return `${diff} minutes ago`;
                        const hours = Math.floor(diff / 60);
                        if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                        const days = Math.floor(hours / 24);
                        return `${days} day${days > 1 ? 's' : ''} ago`;
                      })()}
                    </CentralText>
                  </Timeline.Item>
                ))}
              </Timeline>
            </StyledCard>
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Main Table */}
        <ResponsiveRow 
          animate
        >
          <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
            <StyledCard 
              title={(
                <StyledSpace>
                  <CentralTitle level={4}>Settlement Batches</CentralTitle>
                  <StyledSpace>
                    <CentralButton
                      type="primary"
                      icon={<CalendarOutlined />}
                      onClick={handleCreateBatch}
                      loading={isCreatingBatch}
                      size={responsive.isMobile ? 'middle' : 'large'}
                    >
                      Create Batch
                    </CentralButton>
                    <CentralButton
                      icon={<SyncOutlined />}
                      onClick={handleBulkProcess}
                      disabled={selectedRows.length === 0}
                      size={responsive.isMobile ? 'middle' : 'large'}
                    >
                      Bulk Process
                    </CentralButton>
                    <CentralButton
                      icon={<FileTextOutlined />}
                      onClick={() => setReconcileModalVisible(true)}
                      size={responsive.isMobile ? 'middle' : 'large'}
                    >
                      Reconcile
                    </CentralButton>
                    <CentralButton
                      icon={<DownloadOutlined />}
                      onClick={() => handleExport('csv')}
                      size={responsive.isMobile ? 'middle' : 'large'}
                    >
                      {responsive.isMobile ? 'CSV' : 'Export CSV'}
                    </CentralButton>
                    <CentralButton
                      icon={<DownloadOutlined />}
                      onClick={() => handleExport('xlsx')}
                      size={responsive.isMobile ? 'middle' : 'large'}
                    >
                      {responsive.isMobile ? 'Excel' : 'Export Excel'}
                    </CentralButton>
                  </StyledSpace>
                </StyledSpace>
              )}
              extra={selectedRows.length > 0 && (
                <CentralAlert
                  message={`Selected ${selectedRows.length} batch(es) - Total: ₹${selectedRows.reduce((sum, row) => sum + row.total_amount, 0).toLocaleString('en-IN')}`}
                  type="info"
                  showIcon
                />
              )}
            >
              <CentralTable
                columns={columns as any}
                dataSource={batches || []}
                rowKey="batch_id"
                pagination={{
                  pageSize: responsive.isMobile ? 10 : 20,
                  showSizeChanger: !responsive.isMobile,
                  showQuickJumper: !responsive.isMobile
                }}
                rowSelection={{
                  onChange: (_, selectedRows) => {
                    setSelectedRows(selectedRows);
                  }
                }}
                scroll={{ x: responsive.isMobile ? 1400 : undefined }}
                loading={isLoading}
                size={responsive.isMobile ? 'small' : 'middle'}
              />
            </StyledCard>
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Process Settlement Modal */}
        <Modal
          title="Process Settlement Batch"
          open={processModalVisible}
          onCancel={() => setProcessModalVisible(false)}
          footer={[
            <CentralButton key="cancel" onClick={() => setProcessModalVisible(false)}>
              Cancel
            </CentralButton>,
            <CentralButton
              key="process"
              type="primary"
              loading={isProcessing}
              onClick={handleProcessSubmit}
            >
              Start Processing
            </CentralButton>
          ]}
          width={responsive.isMobile ? '95vw' : 700}
        >
          <CentralAlert
            message="Settlement Processing Steps"
            description="The system will automatically process the settlement through the following steps"
            type="info"
            showIcon
          />
          
          <Steps current={currentStep} direction={responsive.isMobile ? 'vertical' : 'horizontal'}>
            <Step 
              title="Validation" 
              description="Verify transactions" 
              icon={isProcessing && currentStep === 0 ? <SyncOutlined spin /> : null} 
            />
            <Step 
              title="Calculation" 
              description="Calculate amounts" 
              icon={isProcessing && currentStep === 1 ? <SyncOutlined spin /> : null} 
            />
            <Step 
              title="Bank Transfer" 
              description="Initiate transfer" 
              icon={isProcessing && currentStep === 2 ? <SyncOutlined spin /> : null} 
            />
            <Step 
              title="Confirmation" 
              description="Update status" 
              icon={isProcessing && currentStep === 3 ? <SyncOutlined spin /> : null} 
            />
          </Steps>

          {selectedBatch && (
            <Descriptions
              column={responsive.isMobile ? 1 : 2}
              title="Batch Details"
              bordered
            >
              <Descriptions.Item label="Batch ID">
                {selectedBatch.batch_id}
              </Descriptions.Item>
              <Descriptions.Item label="Batch Date">
                {dayjs(selectedBatch.batch_date).format('DD MMM YYYY')}
              </Descriptions.Item>
              <Descriptions.Item label="Total Amount">
                ₹{selectedBatch.total_amount.toLocaleString('en-IN')}
              </Descriptions.Item>
              <Descriptions.Item label="Transactions">
                {selectedBatch.total_transactions}
              </Descriptions.Item>
              <Descriptions.Item label="Processing Fee">
                ₹{selectedBatch.processing_fee.toLocaleString('en-IN')}
              </Descriptions.Item>
              <Descriptions.Item label="Net Amount">
                ₹{selectedBatch.net_settlement_amount.toLocaleString('en-IN')}
              </Descriptions.Item>
            </Descriptions>
          )}
        </Modal>

        {/* Reconciliation Modal */}
        <Modal
          title="Settlement Reconciliation"
          open={reconcileModalVisible}
          onCancel={() => {
            setReconcileModalVisible(false);
            reconcileForm.resetFields();
          }}
          width={responsive.isMobile ? '95vw' : 800}
          footer={[
            <CentralButton 
              key="cancel" 
              onClick={() => {
                setReconcileModalVisible(false);
                reconcileForm.resetFields();
              }}
            >
              Cancel
            </CentralButton>,
            <CentralButton 
              key="reconcile" 
              type="primary" 
              icon={<FileTextOutlined />}
              onClick={handleReconcile}
              loading={isProcessing}
            >
              Create Reconciliation
            </CentralButton>
          ]}
        >
          <Form 
            form={reconcileForm}
            layout="vertical"
          >
            <ResponsiveRow>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item 
                  label="Batch ID" 
                  name="batchId"
                  rules={[{ required: true, message: 'Please select a batch' }]}
                >
                  <Select placeholder="Select batch">
                    {(batches || [])
                      .filter(b => b.status === 'COMPLETED')
                      .map(batch => (
                        <Select.Option key={batch.batch_id} value={batch.batch_id}>
                          {batch.batch_id} - {dayjs(batch.batch_date).format('DD MMM YYYY')}
                        </Select.Option>
                      ))
                    }
                  </Select>
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item 
                  label="Bank Statement Amount" 
                  name="bankAmount"
                  rules={[{ required: true, message: 'Please enter bank amount' }]}
                >
                  <InputNumber<number>
                    
                    placeholder="Enter amount from bank statement"
                    formatter={(value?: string | number) => `₹ ${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    parser={(value?: string) => Number((value ?? '').replace(/₹\s?|(,*)/g, ''))}
                    min={0}
                    precision={2}
                  />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>
            <Form.Item 
              label="Remarks" 
              name="remarks"
            >
              <Input.TextArea 
                rows={4} 
                placeholder="Enter any remarks or notes"
              />
            </Form.Item>
          </Form>
        </Modal>

        {/* Settlement Details Modal */}
        <Modal
          title="Settlement Batch Details"
          open={detailsModalVisible}
          onCancel={() => setDetailsModalVisible(false)}
          width={responsive.isMobile ? '95vw' : 1200}
          footer={[
            <CentralButton key="close" onClick={() => setDetailsModalVisible(false)}>
              Close
            </CentralButton>
          ]}
        >
          {selectedBatch && (
            <>
              <Descriptions column={responsive.isMobile ? 1 : 3} title="Batch Information" bordered>
                <Descriptions.Item label="Batch ID">
                  {selectedBatch.batch_id}
                </Descriptions.Item>
                <Descriptions.Item label="Batch Date">
                  {dayjs(selectedBatch.batch_date).format('DD MMM YYYY')}
                </Descriptions.Item>
                <Descriptions.Item label="Status">
                  <CentralBadge
                    status={statusConfig[selectedBatch.status]?.color as any}
                    text={statusConfig[selectedBatch.status]?.text}
                  />
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount">
                  ₹{selectedBatch.total_amount.toLocaleString('en-IN')}
                </Descriptions.Item>
                <Descriptions.Item label="Transaction Count">
                  {selectedBatch.total_transactions}
                </Descriptions.Item>
                <Descriptions.Item label="Processing Fee">
                  ₹{selectedBatch.processing_fee.toLocaleString('en-IN')}
                </Descriptions.Item>
                <Descriptions.Item label="GST Amount">
                  ₹{selectedBatch.gst_amount.toLocaleString('en-IN')}
                </Descriptions.Item>
                <Descriptions.Item label="Net Settlement">
                  ₹{selectedBatch.net_settlement_amount.toLocaleString('en-IN')}
                </Descriptions.Item>
                <Descriptions.Item label="Processed At">
                  {selectedBatch.processed_at 
                    ? dayjs(selectedBatch.processed_at).format('DD MMM YYYY HH:mm:ss')
                    : 'Not processed'
                  }
                </Descriptions.Item>
              </Descriptions>

              <Divider />

              {/* Settlement Details Table */}
              <StyledCard title="Settlement Details">
                <CentralTable
                  columns={[
                    {
                      title: 'Transaction ID',
                      dataIndex: 'txn_id',
                      key: 'txn_id',
                      width: responsive.isMobile ? 120 : 150,
                      render: (text) => <CentralText code copyable>{text}</CentralText>
                    },
                    {
                      title: 'Client Code',
                      dataIndex: 'client_code',
                      key: 'client_code',
                      width: responsive.isMobile ? 100 : 120
                    },
                    {
                      title: 'Transaction Amount',
                      dataIndex: 'transaction_amount',
                      key: 'transaction_amount',
                      align: 'right',
                      render: (amount) => `₹${(amount as number).toLocaleString('en-IN')}`
                    },
                    {
                      title: 'Settlement Amount',
                      dataIndex: 'settlement_amount',
                      key: 'settlement_amount',
                      align: 'right',
                      render: (amount) => `₹${(amount as number).toLocaleString('en-IN')}`
                    },
                    {
                      title: 'Fees',
                      dataIndex: 'processing_fee',
                      key: 'processing_fee',
                      align: 'right',
                      render: (fee) => `₹${(fee as number).toLocaleString('en-IN')}`
                    },
                    {
                      title: 'Net Amount',
                      dataIndex: 'net_amount',
                      key: 'net_amount',
                      align: 'right',
                      render: (amount) => (
                        <CentralText strong>₹{(amount as number).toLocaleString('en-IN')}</CentralText>
                      )
                    },
                    {
                      title: 'Status',
                      dataIndex: 'settlement_status',
                      key: 'settlement_status',
                      render: (status) => (
                        <CentralTag color={
                          status === 'SETTLED' ? 'success' :
                          status === 'PENDING' ? 'warning' :
                          status === 'FAILED' ? 'error' : 'default'
                        }>
                          {status}
                        </CentralTag>
                      )
                    },
                    {
                      title: 'UTR Number',
                      dataIndex: 'utr_number',
                      key: 'utr_number',
                      render: (utr) => utr || '-'
                    }
                  ]}
                  dataSource={settlementDetails}
                  rowKey="settlement_id"
                  pagination={{
                    pageSize: responsive.isMobile ? 5 : 10,
                    showSizeChanger: !responsive.isMobile
                  }}
                  scroll={{ x: responsive.isMobile ? 800 : undefined }}
                  size={responsive.isMobile ? 'small' : 'middle'}
                />
              </StyledCard>
            </>
          )}
        </Modal>
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
};

export default SettlementProcessingPage;
