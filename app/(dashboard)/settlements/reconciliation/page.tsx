'use client';

import React, { useState, useEffect } from 'react';
import { CentralAlert, CentralButton, CentralTable, CentralTag, CentralText, CentralTextArea, CentralTitle, Form, Input, InputNumber, Modal, Select, StyledCard, StyledSpace } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { FileTextOutlined, CheckCircleOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import { useSettlementStore } from '@/stores/settlementStore';
import { themeConfig } from '@/styles/theme';
import dayjs from 'dayjs';

// Using centralized typography components
// Replaced by CentralTextArea

/**
 * Settlement Reconciliation Page
 * Manage settlement reconciliations and discrepancies
 */
const SettlementReconciliationPage: React.FC = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [selectedBatch, setSelectedBatch] = useState<any>(null);
  
  const { 
    batches, 
    reconciliations,
    fetchBatches, 
    fetchReconciliations,
    createReconciliation,
    isProcessing 
  } = useSettlementStore();

  useEffect(() => {
    fetchBatches({ status: 'COMPLETED' });
    fetchReconciliations();
  }, []);

  // Use real reconciliation data from store
  const reconciliationData = (reconciliations || []).map(recon => ({
    id: recon.reconciliation_id,
    batch_id: recon.batch_id,
    system_amount: recon.system_amount,
    bank_amount: recon.bank_statement_amount,
    difference: recon.difference,
    status: recon.status,
    reconciled_at: recon.reconciled_at,
    remarks: recon.remarks
  }));

  const handleCreateReconciliation = () => {
    setModalVisible(true);
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      await createReconciliation(
        values.batch_id,
        values.bank_amount,
        values.remarks
      );
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error creating reconciliation:', error);
    }
  };

  const columns = [
    {
      title: 'Batch ID',
      dataIndex: 'batch_id',
      key: 'batch_id',
      render: (text: string) => <CentralText code>{text}</CentralText>,
    },
    {
      title: 'System Amount',
      dataIndex: 'system_amount',
      key: 'system_amount',
      align: 'right' as const,
      render: (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Bank Amount',
      dataIndex: 'bank_amount',
      key: 'bank_amount',
      align: 'right' as const,
      render: (amount: number) => `₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
    },
    {
      title: 'Difference',
      dataIndex: 'difference',
      key: 'difference',
      align: 'right' as const,
      render: (diff: number) => (
        <CentralText>
          {diff > 0 ? '+' : ''}₹{Math.abs(diff).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </CentralText>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const config = {
          'MATCHED': { color: 'success', icon: <CheckCircleOutlined /> },
          'MISMATCHED': { color: 'error', icon: <CloseCircleOutlined /> },
          'PENDING': { color: 'processing', icon: <ExclamationCircleOutlined /> }
        };
        const statusConfig = config[status as keyof typeof config];
        return (
          <CentralTag color={statusConfig?.color} icon={statusConfig?.icon}>
            {status}
          </CentralTag>
        );
      },
    },
    {
      title: 'Reconciled At',
      dataIndex: 'reconciled_at',
      key: 'reconciled_at',
      render: (date: string) => date ? dayjs(date).format('DD MMM YYYY HH:mm') : <CentralText type="secondary">Pending</CentralText>,
    },
    {
      title: 'Remarks',
      dataIndex: 'remarks',
      key: 'remarks',
      ellipsis: true,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <StyledSpace>
          <CentralButton size="small" type="link" onClick={() => {
            setSelectedBatch(record);
            // Open details modal
          }}>
            View Details
          </CentralButton>
          {record.status === 'MISMATCHED' && (
            <CentralButton size="small" type="primary">
              Resolve
            </CentralButton>
          )}
        </StyledSpace>
      ),
    },
  ];

  const mismatchedCount = reconciliationData.filter(r => r.status === 'MISMATCHED').length;
  const totalDifference = reconciliationData.reduce((sum, r) => sum + Math.abs(r.difference || 0), 0);

  return (
    <div >
      <ResponsiveRow justify="space-between" align="middle" >
        <ResponsiveCol {...LAYOUT_CONFIG.twoThirds}>
          <CentralTitle level={2}>
            <FileTextOutlined /> Settlement Reconciliation
          </CentralTitle>
          <CentralText type="secondary">
            Monitor and resolve settlement discrepancies
          </CentralText>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.oneThird} >
          <CentralButton
            type="primary"
            icon={<FileTextOutlined />}
            onClick={handleCreateReconciliation}
          >
            New Reconciliation
          </CentralButton>
        </ResponsiveCol>
      </ResponsiveRow>

      {/* Summary Cards */}
      <ResponsiveRow>
        <ResponsiveCol {...LAYOUT_CONFIG.oneThird}>
          <StyledCard>
            <div >
              <div >
                <ExclamationCircleOutlined />
              </div>
              <div >
                {mismatchedCount}
              </div>
              <div >Mismatched</div>
            </div>
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.oneThird}>
          <StyledCard>
            <div >
              <div >
                <CheckCircleOutlined />
              </div>
              <div >
                {reconciliationData.filter(r => r.status === 'MATCHED').length}
              </div>
              <div >Matched</div>
            </div>
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.oneThird}>
          <StyledCard>
            <div >
              <div >
                ₹
              </div>
              <div >
                {totalDifference.toFixed(2)}
              </div>
              <div >Total Difference</div>
            </div>
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>

      {/* Alerts for critical issues */}
      {mismatchedCount > 0 && (
        <CentralAlert
          message={`${mismatchedCount} settlement(s) require attention`}
          description="There are discrepancies between system and bank amounts that need to be resolved."
          type="warning"
          showIcon
          action={
            <CentralButton size="small" type="primary">
              Review All
            </CentralButton>
          }
        />
      )}

      {/* Reconciliation Table */}
      <StyledCard title="Reconciliation Records">
        <CentralTable
          columns={columns}
          dataSource={reconciliationData}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
          scroll={{ x: 1000 }}
        />
      </StyledCard>

      {/* Create Reconciliation Modal */}
      <Modal
        title="Create New Reconciliation"
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        onOk={handleSubmit}
        confirmLoading={isProcessing}
        width={600}
      >
        <Form form={form} layout="vertical" >
          <Form.Item
            label="Settlement Batch"
            name="batch_id"
            rules={[{ required: true, message: 'Please select a batch' }]}
          >
            <Select placeholder="Select completed settlement batch">
              {batches
                .filter(batch => batch.status === 'COMPLETED')
                .map(batch => (
                  <Select.Option key={batch.batch_id} value={batch.batch_id}>
                    {batch.batch_id} - {dayjs(batch.batch_date).format('DD MMM YYYY')} 
                    (₹{batch.net_settlement_amount.toLocaleString('en-IN')})
                  </Select.Option>
                ))
              }
            </Select>
          </Form.Item>

          <Form.Item
            label="Bank Statement Amount"
            name="bank_amount"
            rules={[{ required: true, message: 'Please enter the bank amount' }]}
          >
            <InputNumber<number>
              
              placeholder="Enter amount from bank statement"
              formatter={(value?: string | number) => `₹ ${value ?? ''}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={(value?: string) => Number((value ?? '').replace(/₹\s?|(,*)/g, ''))}
              min={0}
              precision={2}
            />
          </Form.Item>

          <Form.Item
            label="Remarks"
            name="remarks"
            rules={[{ required: true, message: 'Please add remarks' }]}
          >
            <CentralTextArea
              rows={3}
              placeholder="Add notes about the reconciliation, any discrepancies found, or resolution details"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SettlementReconciliationPage;
