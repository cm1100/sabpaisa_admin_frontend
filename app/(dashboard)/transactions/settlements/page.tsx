/**
 * Settlements Management Page
 * Based on EXHAUSTIVE_DATABASE_ANALYSIS.md
 * Tables: settled_transactions, transaction_detail (with is_settled flag)
 * Following SOLID principles and clean architecture
 */

'use client';

import React, { useState, useRef } from 'react';
import { Alert, CentralBadge as Badge, CentralButton as Button, StyledCard as Card, CentralPageContainer, CentralProTable, DatePicker, Modal, Progress, Select, StyledSpace as Space, StyledStatistic as Statistic, Table, Tag, Tooltip, Typography, App, Dropdown } from '@/components/ui';
import SavedFiltersApiService, { SavedFilter } from '@/services/api/SavedFiltersApiService';
import type { ProColumns } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
// Removed pro-components import - using centralized components
import {
  CheckCircleOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BankOutlined,
  FileTextOutlined,
  DownloadOutlined,
  SyncOutlined,
  WarningOutlined,
  CalendarOutlined,
  RiseOutlined
} from '@ant-design/icons';
import { transactionService } from '@/services/api/transactionService';
import type { ISettlement, ITransaction } from '@/types/transaction';
import dayjs from 'dayjs';
import { notifyError, notifySuccess } from '@/utils/notify';
import ResponsiveHeaderActions from '@/components/common/ResponsiveHeaderActions';

// Bind Typography.Text for local usage
const { Text } = Typography as any;
const { RangePicker } = DatePicker;

/**
 * Settlement Status Configuration
 * Based on transaction_detail.settlement_status field
 */
const SETTLEMENT_STATUS = {
  PENDING: { color: 'processing', text: 'Pending Settlement' },
  PROCESSING: { color: 'processing', text: 'Processing' },
  COMPLETED: { color: 'success', text: 'Settled' },
  FAILED: { color: 'error', text: 'Failed' },
  ON_HOLD: { color: 'warning', text: 'On Hold' }
} as const;

/**
 * Settlements Management Page
 * Manages settled_transactions and transaction_detail settlement fields
 */
const SettlementsManagementPage: React.FC = () => {
  const { message } = App.useApp();
  const [savedFilters, setSavedFilters] = React.useState<SavedFilter[]>([]);
  const [savedFiltersLoading, setSavedFiltersLoading] = React.useState(false);
  const actionRef = useRef<any>(null);
  const pendingActionRef = useRef<any>(null);
  const [selectedTransactions, setSelectedTransactions] = useState<string[]>([]);
  const [settlementModalVisible, setSettlementModalVisible] = useState(false);
  const [statistics, setStatistics] = useState({
    totalPending: 0,
    pendingAmount: 0,
    settledToday: 0,
    settledAmount: 0,
    processingCount: 0,
    averageSettlementTime: '2.5 days'
  });

  /**
   * Pending settlements columns
   * Based on transaction_detail table where is_settled = false
   */
  const pendingColumns: ProColumns<ITransaction>[] = [
    {
      title: 'Transaction ID',
      dataIndex: 'txn_id',
      key: 'txn_id',
      width: 150,
      fixed: 'left' as const,
      copyable: true,
      render: (text: string) => <Text code>{text}</Text>
    },
    {
      title: 'Transaction Date',
      dataIndex: 'trans_date',
      key: 'trans_date',
      width: 150,
      sorter: true,
      render: (date: string) => dayjs(date).format('DD MMM YYYY HH:mm')
    },
    {
      title: 'Client',
      dataIndex: 'client_name',
      key: 'client_name',
      width: 200,
      ellipsis: true,
      render: (text: string, record: ITransaction) => (
        <Space direction="vertical" size={0}>
          <Text>{text || 'Unknown'}</Text>
          <Text type="secondary" >
            {record.client_code}
          </Text>
        </Space>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'paid_amount',
      key: 'paid_amount',
      width: 150,
      align: 'right',
      sorter: true,
      render: (amount: number) => (
        <Text strong >
          ₹{(amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
        </Text>
      )
    },
    {
      title: 'Settlement Amount',
      dataIndex: 'settlement_amount',
      key: 'settlement_amount',
      width: 150,
      align: 'right',
      render: (amount: number, record: ITransaction) => {
        const netAmount = amount || (record.paid_amount - (record.total_fees || 0));
        return (
          <Space direction="vertical" size={0}>
            <Text strong>₹{netAmount.toFixed(2)}</Text>
            <Text type="secondary" >
              Fees: ₹{(record.total_fees || 0).toFixed(2)}
            </Text>
          </Space>
        );
      }
    },
    {
      title: 'Days Pending',
      key: 'days_pending',
      width: 120,
      render: (_: any, record: ITransaction) => {
        const days = dayjs().diff(dayjs(record.trans_date), 'day');
        return (
          <Tag color={days > 3 ? 'red' : days > 1 ? 'orange' : 'green'}>
            {days} {days === 1 ? 'day' : 'days'}
          </Tag>
        );
      }
    },
    {
      title: 'Payment Mode',
      dataIndex: 'payment_mode',
      key: 'payment_mode',
      width: 120,
      filters: [
        { text: 'UPI', value: 'UPI' },
        { text: 'Credit Card', value: 'CC' },
        { text: 'Debit Card', value: 'DC' },
        { text: 'Net Banking', value: 'NB' }
      ]
    }
  ];

  /**
   * Settled transactions columns
   * Based on settled_transactions table
   */
  const settledColumns: ProColumns<ISettlement>[] = [
    {
      title: 'Settlement ID',
      dataIndex: 'id',
      key: 'id',
      width: 120,
      fixed: 'left' as const,
      render: (text: string | number) => <Text code>{String(text)}</Text>
    },
    {
      title: 'Transaction IDs',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      width: 200,
      ellipsis: true,
      render: (text: string) => (
        <Tooltip title={text}>
          <Text copyable={{ text }}>{text}</Text>
        </Tooltip>
      )
    },
    {
      title: 'Settlement Date',
      dataIndex: 'payment_date',
      key: 'payment_date',
      width: 150,
      sorter: true,
      render: (date: string) => dayjs(date).format('DD MMM YYYY')
    },
    {
      title: 'Bank',
      dataIndex: 'bank_name',
      key: 'bank_name',
      width: 150
    },
    {
      title: 'Gross Amount',
      dataIndex: 'gross_amount',
      key: 'gross_amount',
      width: 150,
      align: 'right',
      render: (amount: number) => `₹${(amount || 0).toFixed(2)}`
    },
    {
      title: 'Fees',
      key: 'fees',
      width: 150,
      align: 'right',
      render: (_: any, record: ISettlement) => {
        const conv = (record as any).conv_fee || 0;
        const gst = (record as any).gst_fee || 0;
        const pipe = (record as any).pipe_fee || 0;
        const totalFees = conv + gst + pipe;
        return (
          <Space direction="vertical" size={0}>
            <Text>₹{totalFees.toFixed(2)}</Text>
            <Text type="secondary" >
              Conv: ₹{conv.toFixed(2)}
            </Text>
          </Space>
        );
      }
    },
    {
      title: 'Net Amount',
      dataIndex: 'net_amount',
      key: 'net_amount',
      width: 150,
      align: 'right',
      render: (amount: number) => (
        <Text strong >
          ₹{(amount || 0).toFixed(2)}
        </Text>
      )
    },
    {
      title: 'Payout Status',
      dataIndex: 'payout_status',
      key: 'payout_status',
      width: 120,
      render: (status: boolean) => (
        <Badge
          status={status ? 'success' : 'processing'}
          text={status ? 'Completed' : 'Pending'}
        />
      )
    },
    {
      title: 'UTR',
      dataIndex: 'settlement_utr',
      key: 'settlement_utr',
      width: 150,
      copyable: true,
      render: (text: string | null) => text || <Text type="secondary">N/A</Text>
    }
  ];

  /**
   * Process batch settlement
   * Updates transaction_detail.is_settled and creates settled_transactions record
   */
  const processBatchSettlement = async () => {
    if (selectedTransactions.length === 0) {
      message.warning('Please select transactions to settle');
      return;
    }

    try {
      const result = await transactionService.processSettlementBatch(selectedTransactions);
      const batchId = (result as any).settlement_id || (result as any).batch_id || 'batch';
      notifySuccess(`Settlement batch created: ${batchId}`);
      setSettlementModalVisible(false);
      setSelectedTransactions([]);
      pendingActionRef.current?.reload();
      actionRef.current?.reload();
      fetchStatistics();
    } catch (error: any) {
      notifyError(error, 'Failed to process settlement');
    }
  };

  /**
   * Fetch settlement statistics
   * Queries both transaction_detail and settled_transactions tables
   */
  const fetchStatistics = async () => {
    try {
      const pendingSettlements = await transactionService.getPendingSettlements();
      
      setStatistics({
        totalPending: pendingSettlements.total_count,
        pendingAmount: pendingSettlements.total_amount,
        settledToday: 0, // Would query settled_transactions with date filter
        settledAmount: 0,
        processingCount: 0,
        averageSettlementTime: '2.5 days'
      });
    } catch (error) {
      console.error('Failed to fetch statistics:', error);
    }
  };

  React.useEffect(() => {
    (async () => {
      setSavedFiltersLoading(true);
      try {
        const list = await SavedFiltersApiService.list('settlements');
        setSavedFilters(list);
      } catch {
        try { const raw=localStorage.getItem('settlements:views')||'[]'; const arr=JSON.parse(raw); if(Array.isArray(arr)) setSavedFilters(arr.map((v:any,i:number)=>({id:i+1,module:'settlements',name:v.name,params_json:v.filters,is_default:false,created_at:new Date().toISOString(),updated_at:new Date().toISOString()}))); } catch {}
      } finally { setSavedFiltersLoading(false); }
    })();
    fetchStatistics();
  }, []);

  const saveCurrentView = async () => {
    const name = window.prompt('Save current filters as view. Name:'); if(!name) return;
    const payload = { module:'settlements', name, params_json: { /* add filters when implemented */ }, is_default: false };
    try { const created = await SavedFiltersApiService.create(payload as any); setSavedFilters(prev=>[created, ...prev.filter(x=>x.name!==created.name)]); message.success('View saved'); }
    catch { try { const key='settlements:views'; const all=JSON.parse(localStorage.getItem(key)||'[]'); const view={name,filters:payload.params_json}; localStorage.setItem(key, JSON.stringify([view, ...all.filter((v:any)=>v.name!==name)])); message.success('View saved (local)'); } catch {} }
  };
  const applyView = (v: SavedFilter) => { message.success(`Applied view: ${v.name}`); /* map params later */ };
  const removeView = async (v: SavedFilter) => { try { await SavedFiltersApiService.remove(v.id); setSavedFilters(prev=>prev.filter(x=>x.id!==v.id)); message.success('View removed'); } catch { try { const key='settlements:views'; const all=JSON.parse(localStorage.getItem(key)||'[]'); const next=all.filter((x:any)=>x.name!==v.name); localStorage.setItem(key, JSON.stringify(next)); setSavedFilters(prev=>prev.filter(x=>x.name!==v.name)); message.success('View removed (local)'); } catch {} } };

  const headerExtra = (
    <ResponsiveHeaderActions
      primary={[{ key: 'refresh', label: 'Refresh', icon: <SyncOutlined />, onClick: fetchStatistics }]}
    />
  );

  return (
    <CentralPageContainer
      title="Settlement Management"
      subTitle="Manage transaction settlements from settled_transactions and transaction_detail tables"
      breadcrumb={{
        items: [
          { title: 'Dashboard', href: '/dashboard' },
          { title: 'Transactions', href: '/transactions' },
          { title: 'Settlements' }
        ]
      }}
      extra={headerExtra}
    >
      <Space direction="vertical" size="large" >
        {/* Statistics Cards */}
        <ResponsiveRow gutter={16}>
          <ResponsiveCol span={6}>
            <Card>
              <Statistic
                title="Pending Settlements"
                value={statistics.totalPending}
                prefix={<ClockCircleOutlined />}
              />
              <Progress
                percent={75}
                strokeColor="var(--app-colorWarning)"
                showInfo={false}
                size="small"
              />
            </Card>
          </ResponsiveCol>
          <ResponsiveCol span={6}>
            <Card>
              <Statistic
                title="Pending Amount"
                value={statistics.pendingAmount}
                precision={2}
                prefix="₹"
              />
            </Card>
          </ResponsiveCol>
          <ResponsiveCol span={6}>
            <Card>
              <Statistic
                title="Settled Today"
                value={statistics.settledToday}
                prefix={<CheckCircleOutlined />}
              />
            </Card>
          </ResponsiveCol>
          <ResponsiveCol span={6}>
            <Card>
              <Statistic
                title="Average Settlement Time"
                value={statistics.averageSettlementTime}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Pending Settlements */}
        <Card title="Pending Settlements" extra={
          <Space>
            <Dropdown key="views" menu={{ items: (()=>{ const items:any[]=[{key:'save',label:'Save current view',onClick:saveCurrentView},{type:'divider'} as any,...savedFilters.map((v)=>({key:`v-${v.id}`,label:v.name,onClick:()=>applyView(v)}))]; if(savedFilters.length){ items.push({type:'divider'} as any); savedFilters.forEach((v)=>items.push({key:`del-${v.id}`,danger:true,label:`Delete: ${v.name}`,onClick:()=>removeView(v)})); } return items; })() }}>
              <Button loading={savedFiltersLoading}>Views</Button>
            </Dropdown>
            <Button
              type="primary"
              icon={<DollarOutlined />}
              disabled={selectedTransactions.length === 0}
              onClick={() => setSettlementModalVisible(true)}
            >
              Process Settlement ({selectedTransactions.length})
            </Button>
            <Button icon={<SyncOutlined />} onClick={() => pendingActionRef.current?.reload()}>
              Refresh
            </Button>
          </Space>
        }>
          <CentralProTable<ITransaction>
            id="transactions:settlements:pending"
            columns={pendingColumns}
            actionRef={pendingActionRef}
            request={async (params: any) => {
              try {
                const filters = {
                  ...params,
                  is_settled: false,
                  status: 'SUCCESS'
                };
                const response = await transactionService.getAll(filters);
                return {
                  data: response.results,
                  success: true,
                  total: response.count
                };
              } catch (error: any) {
                message.error(error?.message || 'Failed to fetch pending settlements');
                return { data: [], success: false, total: 0 };
              }
            }}
            rowKey="txn_id"
            search={false}
            options={false}
            pagination={{
              pageSize: 10,
              showSizeChanger: true
            }}
            rowSelection={{
              onChange: (keys: React.Key[]) => setSelectedTransactions(keys as string[])
            }}
            tableAlertRender={({ selectedRowKeys, selectedRows }: any) => (
              <Space>
                <span>Selected {selectedRowKeys.length} transaction(s)</span>
                <span>
                  Total: ₹{selectedRows
                    .reduce((sum: number, row: any) => sum + (row.settlement_amount || row.paid_amount || 0), 0)
                    .toFixed(2)}
                </span>
              </Space>
            )}
            scroll={{ x: 1200 }}
          />
        </Card>

        {/* Settled Transactions */}
        <Card title="Settlement History">
          <CentralProTable<ISettlement>
            id="transactions:settlements:history"
            columns={settledColumns}
            actionRef={actionRef}
            request={async (params: any) => {
              try {
                const settlements = await transactionService.getSettlementHistory(params);
                return {
                  data: settlements,
                  success: true,
                  total: settlements.length
                };
              } catch (error: any) {
                message.error(error?.message || 'Failed to fetch settlement history');
                return { data: [], success: false, total: 0 };
              }
            }}
            rowKey="id"
            search={{
              labelWidth: 'auto',
              searchText: 'Search',
              resetText: 'Reset'
            }}
            pagination={{
              pageSize: 20,
              showSizeChanger: true
            }}
            toolBarRender={() => [
              <Dropdown key="views" menu={{ items: (()=>{ const items:any[]=[{key:'save',label:'Save current view',onClick:saveCurrentView},{type:'divider'} as any,...savedFilters.map((v)=>({key:`v-${v.id}`,label:v.name,onClick:()=>applyView(v)}))]; if(savedFilters.length){ items.push({type:'divider'} as any); savedFilters.forEach((v)=>items.push({key:`del-${v.id}`,danger:true,label:`Delete: ${v.name}`,onClick:()=>removeView(v)})); } return items; })() }}>
                <Button loading={savedFiltersLoading}>Views</Button>
              </Dropdown>,
              <Button key="export" icon={<DownloadOutlined />}>
                Export Report
              </Button>
            ]}
            scroll={{ x: 1500 }}
          />
        </Card>
      </Space>

      {/* Settlement Confirmation Modal */}
      <Modal
        title="Process Settlement Batch"
        open={settlementModalVisible}
        onOk={processBatchSettlement}
        onCancel={() => setSettlementModalVisible(false)}
        okText="Process Settlement"
        width={600}
      >
        <Alert
          message={`You are about to settle ${selectedTransactions.length} transaction(s)`}
          description="This will mark these transactions as settled and create a settlement batch record."
          type="info"
          showIcon
        />
        <Card  size="small">
          <Space direction="vertical" >
            <div>
              <Text type="secondary">Number of Transactions: </Text>
              <Text strong>{selectedTransactions.length}</Text>
            </div>
            <div>
              <Text type="secondary">Settlement Date: </Text>
              <Text strong>{dayjs().format('DD MMM YYYY')}</Text>
            </div>
            <div>
              <Text type="secondary">Transaction IDs: </Text>
              <Text copyable={{ text: selectedTransactions.join(', ') }}>
                {selectedTransactions.slice(0, 3).join(', ')}
                {selectedTransactions.length > 3 && ` ... +${selectedTransactions.length - 3} more`}
              </Text>
            </div>
          </Space>
        </Card>
      </Modal>
    </CentralPageContainer>
  );
};

export default SettlementsManagementPage;
