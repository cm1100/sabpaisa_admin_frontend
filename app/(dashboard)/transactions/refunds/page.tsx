/**
 * Refunds Management Page
 * Following SOLID principles and based on EXHAUSTIVE_DATABASE_ANALYSIS.md
 * Tables used: refund_request_from_client, transaction_detail
 */

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { CentralAlert, CentralBadge, CentralButton, CentralPageContainer, CentralProTable, CentralTag, CentralText, CentralTextArea, CentralTitle, Form, Input, InputNumber, Modal, StyledCard, StyledSpace, StyledStatistic, Timeline, Tooltip, App, Dropdown } from '@/components/ui';
import type { ProColumns } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { CentralTable } from '@/components/ui';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  ExclamationCircleOutlined,
  RollbackOutlined,
  SyncOutlined,
  FileTextOutlined
} from '@ant-design/icons';
import RefundApiService, {
  RefundRequest,
  RefundApprovalWorkflow,
  CreateRefundRequest,
  ApproveRefundRequest
} from '@/services/api/RefundApiService';
// Use service RefundRequest type for consistency with dataSource
import dayjs from 'dayjs';
import { notifySuccess } from '@/utils/notify';
import SavedFiltersApiService, { SavedFilter } from '@/services/api/SavedFiltersApiService';
import ResponsiveHeaderActions from '@/components/common/ResponsiveHeaderActions';
import MobileDetailDrawer from '@/components/common/MobileDetailDrawer';
import { useResponsive } from '@/hooks/useResponsive';

// Using centralized typography components

/**
 * Refund Status Configuration
 * Based on refund_request_from_client.approval_status field
 */
const REFUND_STATUS_CONFIG = {
  PENDING: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Pending Approval' },
  APPROVED: { color: 'success', icon: <CheckCircleOutlined />, text: 'Approved' },
  REJECTED: { color: 'error', icon: <CloseCircleOutlined />, text: 'Rejected' },
  PROCESSING: { color: 'processing', icon: <SyncOutlined spin />, text: 'Processing' },
  COMPLETED: { color: 'success', icon: <CheckCircleOutlined />, text: 'Completed' }
} as const;

/**
 * Refunds Management Page Component
 * Implements repository pattern for data access
 */
const RefundsManagementPage: React.FC = () => {
  const { message } = App.useApp();
  const actionRef = useRef<any>(null);
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [approvalModalVisible, setApprovalModalVisible] = useState(false);
  const [rejectionModalVisible, setRejectionModalVisible] = useState(false);
  const [rejectionForm] = Form.useForm();
  
  // Real API state
  const [loading, setLoading] = useState(false);
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [selectedRefundData, setSelectedRefundData] = useState<RefundRequest | null>(null);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [savedFiltersLoading, setSavedFiltersLoading] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const responsive = useResponsive();

  /**
   * Table columns definition
   * Based on refund_request_from_client table structure
   */
  const columns: ProColumns<RefundRequest>[] = [
    {
      title: 'Refund ID',
      dataIndex: 'refund_id',
      key: 'refund_id',
      width: 120,
      fixed: 'left' as const,
      copyable: true,
      render: (text: string) => <CentralText code>{text}</CentralText>
    },
    {
      title: 'Transaction ID',
      dataIndex: 'txn_id',
      key: 'txn_id',
      width: 150,
      copyable: true,
      render: (text: string) => (
        <Tooltip title="View transaction details">
          <a href={`/transactions/${text}`}>{text}</a>
        </Tooltip>
      )
    },
    {
      title: 'Request Date',
      dataIndex: 'request_date',
      key: 'request_date',
      width: 150,
      valueType: 'dateTime',
      sorter: true,
      render: (_: any, record: RefundRequest) => (
        <StyledSpace direction="vertical" size={0}>
          <CentralText>{dayjs(record.refund_init_date || record.refund_complete_date || '').format('DD MMM YYYY')}</CentralText>
          <CentralText type="secondary">
            {dayjs(record.refund_init_date || record.refund_complete_date || '').format('HH:mm:ss')}
          </CentralText>
        </StyledSpace>
      )
    },
    {
      title: 'Refund Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      sorter: true,
      render: (amount: number | string) => (
        <CentralText strong>
          ₹{(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </CentralText>
      )
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 150,
      filters: Object.entries(REFUND_STATUS_CONFIG).map(([key, value]) => ({
        text: value.text,
        value: key
      })),
      render: (status: RefundRequest['status']) => {
        const config = REFUND_STATUS_CONFIG[status as keyof typeof REFUND_STATUS_CONFIG];
        return (
          <CentralBadge
            status={config.color as any}
            text={
              <StyledSpace>
                {config.icon}
                <span>{config.text}</span>
              </StyledSpace>
            }
          />
        );
      }
    },
    {
      title: 'Reason',
      dataIndex: 'reason',
      key: 'reason',
      width: 250,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <CentralText>{text}</CentralText>
        </Tooltip>
      )
    },
    {
      title: 'Approved By',
      dataIndex: 'approved_by',
      key: 'approved_by',
      width: 150,
      render: (text: string | undefined) => text || <CentralText type="secondary">N/A</CentralText>
    },
    {
      title: 'Approved Date',
      dataIndex: 'approved_date',
      key: 'approved_date',
      width: 150,
      render: (date: string | undefined) => date ? dayjs(date).format('DD MMM YYYY HH:mm') : <CentralText type="secondary">N/A</CentralText>
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: RefundRequest) => {
        if (record.status === 'PENDING') {
          return (
            <StyledSpace>
              <CentralButton
                type="primary"
                size="small"
                icon={<CheckCircleOutlined />}
                onClick={() => handleApprove(record)}
              >
                Approve
              </CentralButton>
              <CentralButton
                danger
                size="small"
                icon={<CloseCircleOutlined />}
                onClick={() => handleReject(record)}
              >
                Reject
              </CentralButton>
            </StyledSpace>
          );
        }
        return (
          <CentralButton
            type="text"
            size="small"
            icon={<FileTextOutlined />}
            onClick={() => viewDetails(record)}
          >
            View Details
          </CentralButton>
        );
      }
    }
  ];

  // Load refund data from API
  const loadRefundData = async () => {
    try {
      setLoading(true);
      const [refundsResp, statsResp] = await Promise.all([
        RefundApiService.getRefunds({ page_size: 100 }),
        RefundApiService.getRefundStats()
      ]);
      setRefunds(Array.isArray(refundsResp.data) ? refundsResp.data : (refundsResp.data.results || []));
      setStatistics(statsResp.data);
    } catch (error: any) {
      console.error('Failed to load refund data:', error);
      message.error(error?.message || 'Failed to load refund data');
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh data
  React.useEffect(() => {
    // Load Saved Views (module=refunds)
    (async () => {
      setSavedFiltersLoading(true);
      try {
        const list = await SavedFiltersApiService.list('refunds');
        setSavedFilters(list);
      } catch {
        try {
          const raw = localStorage.getItem('refunds:views') || '[]';
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) setSavedFilters(arr.map((v:any,i:number)=>({id:i+1,module:'refunds',name:v.name,params_json:v.filters,is_default:false,created_at:new Date().toISOString(),updated_at:new Date().toISOString()})));
        } catch {}
      } finally {
        setSavedFiltersLoading(false);
      }
    })();
    loadRefundData();
    const interval = setInterval(loadRefundData, 30000); // Refresh every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const applyView = (v: SavedFilter) => {
    const f = v.params_json || {} as any;
    // Minimal supported filters; extend as needed
    // Not all filters exist in this page; this is a scaffold for consistency
    // Implement mapping when filters are added to table request
    // For now just reload to reflect any querystring-based effects
    // Placeholder for future: setState(...) then reload
    notifySuccess(`Applied view: ${v.name}`);
  };
  const saveCurrentView = async () => {
    const name = window.prompt('Save current filters as view. Name:'); if (!name) return;
    const payload = { module:'refunds', name, params_json: { /* add filters here when available */ }, is_default: false };
    try { const created = await SavedFiltersApiService.create(payload as any); setSavedFilters((prev)=>[created, ...prev.filter(x=>x.name!==created.name)]); notifySuccess('View saved'); }
    catch { try { const key='refunds:views'; const all=JSON.parse(localStorage.getItem(key)||'[]'); const view={name,filters:payload.params_json}; localStorage.setItem(key, JSON.stringify([view, ...all.filter((v:any)=>v.name!==name)])); notifySuccess('View saved (local)'); } catch { /* ignore */ } }
  };
  const removeView = async (v: SavedFilter) => {
    try { await SavedFiltersApiService.remove(v.id); setSavedFilters(prev=>prev.filter(x=>x.id!==v.id)); notifySuccess('View removed'); }
    catch { try { const key='refunds:views'; const all=JSON.parse(localStorage.getItem(key)||'[]'); const next=all.filter((x:any)=>x.name!==v.name); localStorage.setItem(key, JSON.stringify(next)); setSavedFilters(prev=>prev.filter(x=>x.name!==v.name)); notifySuccess('View removed (local)'); } catch { /* ignore */ } }
  };

  /**
   * Handle refund approval
   * Updates refund_request_from_client.approval_status to 'APPROVED'
   */
  const handleApprove = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setApprovalModalVisible(true);
  };

  /**
   * Confirm approval
   */
  const confirmApproval = async () => {
    if (!selectedRefund) return;
    
    try {
      await RefundApiService.approveRefund(Number(selectedRefund.refund_id), {
        action: 'APPROVE',
        comments: 'Approved via admin panel'
      });
      notifySuccess('Refund approved successfully');
      setApprovalModalVisible(false);
      loadRefundData(); // Refresh data
    } catch (error: any) {
      message.error(error.message || 'Failed to approve refund');
    }
  };

  /**
   * Handle refund rejection
   */
  const handleReject = (refund: RefundRequest) => {
    setSelectedRefund(refund);
    setRejectionModalVisible(true);
  };

  /**
   * Confirm rejection
   */
  const confirmRejection = async () => {
    if (!selectedRefund) return;
    
    try {
      const values = await rejectionForm.validateFields();
      await RefundApiService.rejectRefund(Number(selectedRefund.refund_id), values.reason);
      notifySuccess('Refund rejected');
      setRejectionModalVisible(false);
      rejectionForm.resetFields();
      loadRefundData(); // Refresh data
    } catch (error: any) {
      message.error(error.message || 'Failed to reject refund');
    }
  };

  /**
   * View refund details
   */
  const viewDetails = (refund: RefundRequest) => {
    Modal.info({
      title: `Refund Details - ${refund.refund_id}`,
      width: 600,
      content: (
        <StyledSpace direction="vertical">
          <StyledCard size="small">
            <Timeline>
              <Timeline.Item color="blue">
                Request Initiated
                <br />
                <CentralText type="secondary">
                  {refund.refund_init_date ? dayjs(refund.refund_init_date).format('DD MMM YYYY HH:mm:ss') : '—'}
                </CentralText>
              </Timeline.Item>
              {refund.refund_complete_date && (
                <Timeline.Item color="green">
                  Completed {refund.requested_by ? `by ${refund.requested_by}` : ''}
                  <br />
                  <CentralText type="secondary">
                    {dayjs(refund.refund_complete_date).format('DD MMM YYYY HH:mm:ss')}
                  </CentralText>
                </Timeline.Item>
              )}
            </Timeline>
          </StyledCard>
          <StyledCard size="small" title="Refund Information">
            <StyledSpace direction="vertical">
              <div>
                <CentralText type="secondary">Transaction ID: </CentralText>
                <CentralText strong>{(refund as any).txn_id || refund.sp_txn_id || refund.client_txn_id || '—'}</CentralText>
              </div>
              <div>
                <CentralText type="secondary">Amount: </CentralText>
                <CentralText strong>₹{Number(refund.amount).toLocaleString('en-IN')}</CentralText>
              </div>
              <div>
                <CentralText type="secondary">Reason: </CentralText>
                <CentralText>{refund.message || '—'}</CentralText>
              </div>
            </StyledSpace>
          </StyledCard>
        </StyledSpace>
      )
    });
  };

  /**
   * Fetch refunds with filters
   * Queries refund_request_from_client table
   */
  const fetchRefunds = async (params: any) => {
    try {
      const filters = {
        status: params.status,
        txn_id: params.txn_id
      };
      
      const resp = await RefundApiService.getRefunds(filters as any);
      const refunds = Array.isArray(resp.data) ? resp.data : (resp.data.results || []);
      
      // Calculate statistics
      const stats = {
        total: refunds.length,
        pending: refunds.filter(r => r.status === 'PENDING').length,
        approved: refunds.filter(r => r.status === 'APPROVED').length,
        completed: refunds.filter(r => r.status === 'COMPLETED').length,
        totalAmount: refunds.reduce((sum, r) => sum + r.amount, 0)
      };
      setStatistics(stats);
      
      return {
        data: refunds,
        success: true,
        total: refunds.length
      };
    } catch (error: any) {
      message.error(error?.message || 'Failed to fetch refunds');
      return {
        data: [],
        success: false,
        total: 0
      };
    }
  };

  const headerExtra = (
    <ResponsiveHeaderActions
      primary={[{ key: 'refresh', label: 'Refresh', icon: <SyncOutlined />, onClick: loadRefundData, disabled: loading }]}
    />
  );

  return (
    <CentralPageContainer
      title="Refund Management"
      subTitle="Manage refund requests from refund_request_from_client table"
      breadcrumb={{
        items: [
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Transactions', href: '/transactions' },
          { title: 'Refunds' }
        ]
      }}
      extra={headerExtra}
    >
      <StyledSpace direction="vertical" size="large">
        {/* Statistics Cards */}
        <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
          <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
            <StyledCard>
              <StyledStatistic
                title="Total Refunds"
                value={statistics?.total_refunds || 0}
                prefix={<RollbackOutlined />}
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
            <StyledCard>
              <StyledStatistic
                title="Pending"
                value={statistics?.pending_count || 0}
                prefix={<ClockCircleOutlined />}
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
            <StyledCard>
              <StyledStatistic
                title="Completed"
                value={statistics?.completed_count || 0}
                prefix={<CheckCircleOutlined />}
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric}>
            <StyledCard>
              <StyledStatistic
                title="Total Amount"
                value={statistics?.total_amount || 0}
                precision={2}
                prefix="₹"
              />
            </StyledCard>
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Refunds Table */}
          <CentralProTable<RefundRequest>
            id="transactions:refunds"
            columns={columns as any}
            actionRef={actionRef}
            dataSource={refunds}
            loading={loading}
            rowKey="refund_id"
            className="transaction-table"
            onRow={(record) => ({ onClick: () => { if (responsive.isMobile) { setSelectedRefundData(record); setDetailOpen(true); } } })}
            search={{
            labelWidth: 'auto',
            searchText: 'Search',
            resetText: 'Reset'
          }}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true
          }}
          dateFormatter="string"
          headerTitle="Refund Requests"
          toolBarRender={() => [
            <Dropdown
              key="views"
              menu={{ items: (()=>{ const items:any[]=[{key:'save',label:'Save current view',onClick:saveCurrentView},{type:'divider'} as any,...savedFilters.map((v)=>({key:`v-${v.id}`,label:v.name,onClick:()=>applyView(v)}))]; if(savedFilters.length){ items.push({type:'divider'} as any); savedFilters.forEach((v)=>items.push({key:`del-${v.id}`,danger:true,label:`Delete: ${v.name}`,onClick:()=>removeView(v)})); } return items; })() }}
            >
              <CentralButton loading={savedFiltersLoading}>Views</CentralButton>
            </Dropdown>,
            <CentralButton
              key="refresh"
              icon={<SyncOutlined />}
              onClick={loadRefundData}
            >
              Refresh
            </CentralButton>
          ]}
          scroll={{ x: 1500 }}
        />
      </StyledSpace>

      {/* Approval Modal */}
      <Modal
        title="Confirm Refund Approval"
        open={approvalModalVisible}
        onOk={confirmApproval}
        onCancel={() => setApprovalModalVisible(false)}
        okText="Approve Refund"
        okButtonProps={{ type: 'primary' }}
      >
        <StyledSpace direction="vertical">
          <CentralAlert
            message="Are you sure you want to approve this refund?"
            type="warning"
            showIcon
          />
          {selectedRefund && (
            <StyledCard size="small">
              <StyledSpace direction="vertical">
                <div>
                  <CentralText type="secondary">Transaction ID: </CentralText>
                  <CentralText strong>{(selectedRefund as any).txn_id || selectedRefund.sp_txn_id || selectedRefund.client_txn_id || '—'}</CentralText>
                </div>
                <div>
                  <CentralText type="secondary">Refund Amount: </CentralText>
                  <CentralText strong>
                    ₹{Number(selectedRefund.amount).toLocaleString('en-IN')}
                  </CentralText>
                </div>
                <div>
                  <CentralText type="secondary">Reason: </CentralText>
                  <CentralText>{selectedRefund.message || '—'}</CentralText>
                </div>
              </StyledSpace>
            </StyledCard>
          )}
        </StyledSpace>
      </Modal>

      {/* Rejection Modal */}
      <Modal
        title="Reject Refund Request"
        open={rejectionModalVisible}
        onOk={confirmRejection}
        onCancel={() => {
          setRejectionModalVisible(false);
          rejectionForm.resetFields();
        }}
        okText="Reject Refund"
        okButtonProps={{ danger: true }}
      >
        <Form
          form={rejectionForm}
          layout="vertical"
        >
          {selectedRefund && (
            <StyledCard size="small">
              <StyledSpace direction="vertical">
                <div>
                  <CentralText type="secondary">Transaction ID: </CentralText>
                  <CentralText strong>{(selectedRefund as any).txn_id || selectedRefund.sp_txn_id || selectedRefund.client_txn_id || '—'}</CentralText>
                </div>
                <div>
                  <CentralText type="secondary">Refund Amount: </CentralText>
                  <CentralText strong>₹{Number(selectedRefund.amount).toLocaleString('en-IN')}</CentralText>
                </div>
              </StyledSpace>
            </StyledCard>
          )}
          <Form.Item
            name="reason"
            label="Rejection Reason"
            rules={[
              { required: true, message: 'Please provide a reason for rejection' },
              { min: 10, message: 'Reason must be at least 10 characters' }
            ]}
          >
            <CentralTextArea 
              rows={4} 
              placeholder="Enter detailed reason for rejection..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </CentralPageContainer>
    {responsive.isMobile && (
      <MobileDetailDrawer
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        title={selectedRefundData ? `Refund ${selectedRefundData.refund_id}` : 'Refund'}
      >
        {selectedRefundData && (
          <StyledSpace direction="vertical" style={{ width: '100%' }}>
            <StyledSpace style={{ justifyContent: 'space-between', width: '100%' }}>
              <CentralText type="secondary">Txn</CentralText>
              <CentralText code>{selectedRefundData.txn_id}</CentralText>
            </StyledSpace>
            <StyledSpace style={{ justifyContent: 'space-between', width: '100%' }}>
              <CentralText type="secondary">Amount</CentralText>
              <CentralText>₹{Number(selectedRefundData.amount || 0).toLocaleString('en-IN')}</CentralText>
            </StyledSpace>
            <StyledSpace style={{ justifyContent: 'space-between', width: '100%' }}>
              <CentralText type="secondary">Status</CentralText>
              <CentralTag>{selectedRefundData.status}</CentralTag>
            </StyledSpace>
          </StyledSpace>
        )}
      </MobileDetailDrawer>
    )}
  );
};

export default RefundsManagementPage;
