'use client';

import React, { useState, useRef, useMemo, useCallback } from 'react';
import { CentralProTable as ProTable, ProColumns } from '@/components/ui';
import { Tag, Tooltip, Badge, message, Modal, Form, InputNumber, Input, Select, DatePicker, StyledCard, Segmented, Checkbox, Dropdown } from '@/components/ui';
import { StyledSpace as Space, CentralButton as Button, CentralText as Text } from '@/components/ui';
import {
  SearchOutlined,
  FilterOutlined,
  DownloadOutlined,
  ReloadOutlined,
  EyeOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  DollarOutlined,
  RollbackOutlined
} from '@ant-design/icons';
import { transactionService } from '@/services/api/transactionService';
import SavedFiltersApiService, { SavedFilter } from '@/services/api/SavedFiltersApiService';
import { ClientApiService } from '@/services/api/ClientApiService';
import type { ITransaction, ITransactionFilter, IRefundRequest } from '@/types/transaction';
import dayjs from 'dayjs';
import { getAllowedColumns, BreakpointKey } from '@/config/columnPolicy';
import { useResponsive } from '@/hooks/useResponsive';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import FilterDrawer from '@/components/common/FilterDrawer';
import MobileDetailDrawer from '@/components/common/MobileDetailDrawer';

const Link = (props: any) => <a {...props} />; // Use native link styling; Central link not defined
const { TextArea } = Input;

// SOLID Principle: Single Responsibility - Constants separated
const STATUS_CONFIG = {
  colorMap: {
    SUCCESS: 'success',
    PENDING: 'processing',
    FAILED: 'error',
    REFUNDED: 'warning',
    CANCELLED: 'default'
  } as Record<string, string>,
  iconMap: {
    SUCCESS: <CheckCircleOutlined />,
    PENDING: <ClockCircleOutlined />,
    FAILED: <CloseCircleOutlined />,
    REFUNDED: <ExclamationCircleOutlined />,
    CANCELLED: <CloseCircleOutlined />
  } as Record<string, React.ReactNode>
};

const PAYMENT_METHOD_COLORS = {
  'UPI': 'purple',
  'Credit Card': 'blue',
  'Debit Card': 'cyan',
  'Net Banking': 'green',
  'Wallet': 'orange',
  'CASH': 'gold',
  'NEFT': 'magenta',
  'RTGS': 'red',
  'IMPS': 'volcano'
} as Record<string, string>;

// SOLID Principle: Interface Segregation - Separate interfaces for different concerns
interface ResponsiveColumn {
  mobile: boolean;
  tablet: boolean;
  desktop: boolean;
}

interface ColumnConfig {
  responsive?: ResponsiveColumn;
  minWidth?: number;
}

interface TransactionTableProps {
  clientId?: string;
  embedded?: boolean;
}

// Use centralized responsive hook for consistent breakpoints across the app

// SOLID Principle: Single Responsibility - Separate component for amount rendering
const AmountRenderer: React.FC<{ record: ITransaction }> = React.memo(({ record }) => {
  const amount = record.amount || record.paid_amount || 0;
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount) || 0;

  return (
    <Text strong className="transaction-amount">
      ₹{numAmount.toLocaleString('en-IN', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      })}
    </Text>
  );
});

AmountRenderer.displayName = 'AmountRenderer';

// SOLID Principle: Single Responsibility - Separate component for status rendering
const StatusRenderer: React.FC<{ status: string }> = React.memo(({ status }) => (
  <Badge
    status={STATUS_CONFIG.colorMap[status] as any || 'default'}
    text={
      <Space size={4}>
        {STATUS_CONFIG.iconMap[status]}
        <span className="status-text">
          {(status || 'Unknown').toLowerCase()}
        </span>
      </Space>
    }
  />
));

StatusRenderer.displayName = 'StatusRenderer';

// SOLID Principle: Single Responsibility - Separate component for payment mode rendering
const PaymentModeRenderer: React.FC<{ method: string }> = React.memo(({ method }) => (
  <Tag 
    color={PAYMENT_METHOD_COLORS[method as string] || 'default'}
    className="payment-mode-tag"
  >
    {method || 'UNKNOWN'}
  </Tag>
));

PaymentModeRenderer.displayName = 'PaymentModeRenderer';

export const TransactionTable: React.FC<TransactionTableProps> = ({ 
  clientId, 
  embedded = false 
}) => {
  const actionRef = useRef<any>(null);
  const router = useRouter();
  const responsive = useResponsive();
  const queryClient = useQueryClient();
  const [selectedRows, setSelectedRows] = useState<ITransaction[]>([]);
  const [exportLoading, setExportLoading] = useState(false);
  const [refundModalVisible, setRefundModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<ITransaction | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [refundForm] = Form.useForm();
  const [latestData, setLatestData] = useState<ITransaction[]>([]);
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table'));
  const [cardsLoading, setCardsLoading] = useState(false);

  // Filter toolbar state
  const [searchText, setSearchText] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>(undefined);
  const [selectedPaymentMode, setSelectedPaymentMode] = useState<string | undefined>(undefined);
  const [selectedClientCode, setSelectedClientCode] = useState<string | undefined>(clientId);
  const [clientOptions, setClientOptions] = useState<{ label: string; value: string }[]>([]);
  const [dateRange, setDateRange] = useState<[string | undefined, string | undefined]>([undefined, undefined]);
  // Additional filters
  const [isSettled, setIsSettled] = useState<boolean | undefined>(undefined);
  const [minAmount, setMinAmount] = useState<number | undefined>(undefined);
  const [maxAmount, setMaxAmount] = useState<number | undefined>(undefined);
  const clientApi = useMemo(() => new ClientApiService(), []);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [savedFiltersLoading, setSavedFiltersLoading] = useState(false);

  // (moved) prunedColumns defined below after getResponsiveColumns is declared

  const fetchClients = useCallback(async (q?: string) => {
    try {
      const res = await clientApi.getAll({ page: 1, page_size: 20, ...(q ? { search: q } : {}) } as any);
      const results: any[] = (res as any).results || (res as any) || [];
      setClientOptions(results.map((c: any) => ({ label: `${c.client_name} (${c.client_code})`, value: c.client_code })));
    } catch (e) {
      // ignore
    }
  }, [clientApi]);

  React.useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  // Load Saved Views (server-backed with graceful local fallback)
  React.useEffect(() => {
    const load = async () => {
      setSavedFiltersLoading(true);
      try {
        const list = await SavedFiltersApiService.list('transactions');
        setSavedFilters(list);
      } catch (e) {
        try {
          const raw = localStorage.getItem('transactions:views') || '[]';
          const views = JSON.parse(raw);
          if (Array.isArray(views)) {
            setSavedFilters(
              views.map((v: any, idx: number) => ({
                id: idx + 1,
                module: 'transactions',
                name: v.name,
                params_json: v.filters || {},
                is_default: false,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }))
            );
          }
        } catch {}
      } finally {
        setSavedFiltersLoading(false);
      }
    };
    load();
  }, []);

  // SOLID Principle: Open/Closed - Column configuration can be extended without modification
  const getResponsiveColumns = useCallback((): ProColumns<ITransaction>[] => [
    {
      title: 'Transaction ID',
      dataIndex: 'txn_id',
      key: 'txn_id',
      width: responsive.isMobile ? 140 : 180,
      fixed: responsive.isMobile ? false : 'left',
      copyable: true,
      render: (text: any, record: ITransaction) => (
        <Tooltip title="Click to view details">
          <Link 
            onClick={() => {
              // Ensure we get the string value of txn_id
              const txnId = typeof record.txn_id === 'string' 
                ? record.txn_id 
                : typeof text === 'string' 
                ? text 
                : JSON.stringify(record.txn_id || text);
              console.log('Clicking transaction:', { 
                text, 
                record_txn_id: record.txn_id, 
                txnId, 
                record_keys: Object.keys(record) 
              });
              router.push(`/transactions/${encodeURIComponent(txnId)}`);
            }}
            className="transaction-id-link"
          >
            {responsive.isMobile ? 
              (record.txn_id || text)?.toString().slice(-8) : 
              (record.txn_id || text)?.toString()
            }
          </Link>
        </Tooltip>
      )
    },
    {
      title: 'Date & Time',
      dataIndex: 'trans_date',
      key: 'trans_date',
      width: responsive.isMobile ? 120 : 180,
      sorter: true,
      valueType: 'dateRange',
      hideInTable: responsive.isMobile,
      search: {
        transform: (value: any) => {
          return {
            startTime: value[0],
            endTime: value[1],
          };
        },
      },
      render: (_: any, record: ITransaction) => (
        <Space direction="vertical" size={0}>
          <Text>{record.trans_date ? dayjs(record.trans_date).format('DD MMM YYYY') : '-'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            {record.trans_date ? dayjs(record.trans_date).format('HH:mm:ss') : '-'}
          </Text>
        </Space>
      )
    },
    {
      title: 'Client',
      dataIndex: 'client_name',
      key: 'client_name',
      width: responsive.isMobile ? 150 : 200,
      ellipsis: true,
      filters: !responsive.isMobile,
      render: (text: any, record: ITransaction) => (
        <Space direction="vertical" size={0}>
          <Text strong>{text || 'Unknown'}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>
            Code: {record.client_code || 'N/A'}
          </Text>
        </Space>
      )
    },
    {
      title: 'Customer',
      dataIndex: 'payee_name',
      key: 'payee_name',
      width: responsive.isMobile ? 120 : 200,
      ellipsis: true,
      hideInTable: responsive.isMobile,
      render: (text: any, record: ITransaction) => (
        <Space direction="vertical" size={0}>
          <Text>{text || record.customer_name || 'Unknown'}</Text>
          <Text type="secondary" style={{ fontSize: 11 }}>
            {record.payee_email || record.payee_mob || 'No contact'}
          </Text>
        </Space>
      )
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 150,
      align: 'right',
      sorter: true,
      render: (_: any, record: ITransaction) => <AmountRenderer record={record} />
    },
    {
      title: 'Net Amount',
      dataIndex: 'net_amount',
      key: 'net_amount',
      width: responsive.isMobile ? 120 : 140,
      align: 'right',
      hideInTable: responsive.isMobile,
      render: (val: any, record: ITransaction) => (
        <Text type="secondary">₹{Number(val ?? record.net_amount ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
      )
    },
    {
      title: 'Payment Mode',
      dataIndex: 'payment_mode',
      key: 'payment_mode',
      width: responsive.isMobile ? 80 : 120,
      filters: [
        { text: 'UPI', value: 'UPI' },
        { text: 'Credit Card', value: 'Credit Card' },
        { text: 'Debit Card', value: 'Debit Card' },
        { text: 'Net Banking', value: 'Net Banking' },
        { text: 'Wallet', value: 'Wallet' }
      ],
      render: (method: string) => <PaymentModeRenderer method={method} />
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: responsive.isMobile ? 80 : 120,
      filters: [
        { text: 'Success', value: 'SUCCESS' },
        { text: 'Pending', value: 'PENDING' },
        { text: 'Failed', value: 'FAILED' },
        { text: 'Refunded', value: 'REFUNDED' },
        { text: 'Cancelled', value: 'CANCELLED' }
      ],
      render: (status: string) => <StatusRenderer status={status} />
    },
    {
      title: 'Refunded',
      dataIndex: 'refund_amount',
      key: 'refund_amount',
      width: responsive.isMobile ? 100 : 120,
      align: 'right',
      hideInTable: responsive.isMobile,
      render: (val: any) => <Text type="secondary">₹{Number(val || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</Text>
    },
    {
      title: 'Refund Status',
      dataIndex: 'refund_status',
      key: 'refund_status',
      width: 140,
      hideInTable: responsive.isMobile,
      render: (val: any) => val ? <Tag color={val === 'APPROVED' || val==='COMPLETED' ? 'green' : val === 'REJECTED' ? 'red' : 'blue'}>{val}</Tag> : <Tag>—</Tag>
    },
    {
      title: 'Chargeback',
      dataIndex: 'has_chargeback',
      key: 'has_chargeback',
      width: 120,
      hideInTable: responsive.isMobile,
      render: (flag: any) => flag ? <Tag color="red">Chargeback</Tag> : <Tag>None</Tag>
    },
    {
      title: 'Settlement',
      dataIndex: 'is_settled',
      key: 'is_settled',
      width: responsive.isMobile ? 100 : 150,
      hideInTable: responsive.isMobile,
      render: (isSettled: boolean, record: ITransaction) => (
        isSettled ? (
          <Space direction="vertical" size={0}>
            <Badge status="success" text="Settled" />
            {record.settlement_date && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                {dayjs(record.settlement_date).format('DD MMM')}
              </Text>
            )}
          </Space>
        ) : (
          <Badge status="processing" text="Pending" />
        )
      )
    },
    {
      title: 'Fees',
      dataIndex: 'total_fees',
      key: 'total_fees',
      width: responsive.isMobile ? 70 : 100,
      hideInTable: responsive.isMobile,
      align: 'right',
      render: (fee: any) => (
        <Text type="secondary">
          ₹{(Number(fee) || 0).toFixed(2)}
        </Text>
      )
    },
    {
      title: 'Gateway',
      dataIndex: 'pg_name',
      key: 'pg_name',
      width: responsive.isMobile ? 80 : 120,
      hideInTable: responsive.isMobile,
      ellipsis: true,
      render: (gateway: string) => (
        <Text type="secondary">{gateway || 'N/A'}</Text>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: responsive.isMobile ? 80 : 120,
      fixed: responsive.isMobile ? false : 'right',
      render: (_: any, record: ITransaction) => (
        <Space>
          <Tooltip title="View Details">
            <Button
              type="text"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => router.push(`/transactions/${record.txn_id}`)}
            />
          </Tooltip>
          {record.is_refundable && (
            <Tooltip title="Initiate Refund">
              <Button
                type="text"
                size="small"
                icon={<RollbackOutlined />}
                onClick={() => handleRefundClick(record)}
              />
            </Tooltip>
          )}
        </Space>
      )
    }
  ], [responsive, router]);

  // Compute table columns with ColumnPolicy applied for current breakpoint
  const prunedColumns = useMemo(() => {
    const cols = getResponsiveColumns();
    try {
      const bp: BreakpointKey = responsive.isMobile ? 'xs' : responsive.isTablet ? 'md' : 'lg';
      const allowed = getAllowedColumns('transactions:main', bp);
      if (allowed && allowed.length) {
        return cols.filter((c: any, idx: number) => {
          const key = String(c.key ?? c.dataIndex ?? idx);
          return allowed.includes(key);
        }) as any;
      }
    } catch {}
    return cols;
  }, [responsive.isMobile, responsive.isTablet, getResponsiveColumns]);

  // SOLID Principle: Single Responsibility - Separate handlers for different actions
  const handleRefundClick = useCallback((transaction: ITransaction) => {
    setSelectedTransaction(transaction);
    refundForm.setFieldsValue({
      amount: transaction.amount
    });
    setRefundModalVisible(true);
  }, [refundForm]);

  const handleRefundSubmit = useCallback(async () => {
    try {
      const values = await refundForm.validateFields();
      
      if (!selectedTransaction) return;

      const refundRequest: IRefundRequest = {
        txn_id: selectedTransaction.txn_id,
        amount: values.amount,
        reason: values.reason
      };

      await transactionService.initiateRefund(refundRequest);
      message.success('Refund initiated successfully');
      setRefundModalVisible(false);
      refundForm.resetFields();
      actionRef.current?.reload();
    } catch (error: any) {
      message.error(error.message || 'Failed to initiate refund');
    }
  }, [selectedTransaction, refundForm, actionRef]);

  const handleExport = useCallback(async () => {
    setExportLoading(true);
    try {
      const filters: ITransactionFilter = {
        client_code: selectedClientCode || clientId,
        ...(selectedStatus ? { status: selectedStatus as any } : {}),
        ...(typeof isSettled === 'boolean' ? { is_settled: isSettled } : {}),
        ...(minAmount !== undefined ? { min_amount: minAmount } : {}),
        ...(maxAmount !== undefined ? { max_amount: maxAmount } : {}),
        ...(dateRange[0] && dateRange[1] ? { date_from: dateRange[0], date_to: dateRange[1] } : {
          date_from: dayjs().subtract(30, 'days').toISOString(),
          date_to: dayjs().toISOString(),
        })
      } as any;
      
      console.log('Exporting with filters:', filters);
      const blob = await transactionService.export('csv', filters);
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transactions_${dayjs().format('YYYY-MM-DD')}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      message.success('Export completed successfully');
    } catch (error: any) {
      console.error('Export failed:', error);
      message.error(error.message || 'Export failed');
    } finally {
      setExportLoading(false);
    }
  }, [clientId, selectedClientCode, selectedStatus, selectedPaymentMode, searchText, dateRange, isSettled, minAmount, maxAmount]);

  // Saved Views (filters only)
  const saveCurrentView = async () => {
    const name = typeof window !== 'undefined' ? window.prompt('Save current filters as view. Name:') : undefined;
    if (!name) return;
    const payload = {
      module: 'transactions',
      name,
      params_json: {
        searchText,
        selectedStatus,
        selectedPaymentMode,
        selectedClientCode,
        isSettled,
        minAmount,
        maxAmount,
        dateRange,
      },
      is_default: false,
    };
    try {
      const created = await SavedFiltersApiService.create(payload as any);
      setSavedFilters((prev) => [created, ...prev.filter((x) => x.name !== created.name)]);
      message.success('View saved');
    } catch (e) {
      // fallback local
      try {
        const key = 'transactions:views';
        const all = JSON.parse(localStorage.getItem(key) || '[]');
        const view = { name, filters: payload.params_json };
        localStorage.setItem(key, JSON.stringify([view, ...all.filter((v:any)=>v.name!==name)]));
        setSavedFilters((prev)=>[...prev.filter((v)=>v.name!==name), { id: Date.now(), module: 'transactions', name, params_json: payload.params_json, is_default: false, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as any]);
        message.success('View saved (local)');
      } catch {
        message.error('Failed to save view');
      }
    }
  };
  const applyView = (v: any) => {
    const filters = v.params_json || v.filters || {};
    setSearchText(filters.searchText || '');
    setSelectedStatus(filters.selectedStatus || undefined);
    setSelectedPaymentMode(filters.selectedPaymentMode || undefined);
    setSelectedClientCode(filters.selectedClientCode || undefined);
    setIsSettled(typeof filters.isSettled === 'boolean' ? filters.isSettled : undefined);
    setMinAmount(typeof filters.minAmount === 'number' ? filters.minAmount : undefined);
    setMaxAmount(typeof filters.maxAmount === 'number' ? filters.maxAmount : undefined);
    setDateRange(Array.isArray(filters.dateRange) ? [filters.dateRange[0], filters.dateRange[1]] : [undefined, undefined]);
    actionRef.current?.reload();
  };
  const removeView = async (v: SavedFilter) => {
    try {
      await SavedFiltersApiService.remove(v.id);
      setSavedFilters((prev)=>prev.filter((x)=>x.id!==v.id));
      message.success('View removed');
    } catch {
      // local fallback
      try {
        const key = 'transactions:views';
        const all = JSON.parse(localStorage.getItem(key) || '[]');
        const next = all.filter((x:any)=>x.name !== v.name);
        localStorage.setItem(key, JSON.stringify(next));
        setSavedFilters((prev)=>prev.filter((x)=>x.name !== v.name));
        message.success('View removed (local)');
      } catch {}
    }
  };

  const handleBatchSettlement = useCallback(async () => {
    if (selectedRows.length === 0) {
      message.warning('Please select transactions to settle');
      return;
    }

    const eligible = selectedRows.filter(
      (t) => !t.is_settled && String(t.status || '').toUpperCase() === 'SUCCESS'
    );
    const ineligible = selectedRows.length - eligible.length;

    if (eligible.length === 0) {
      message.warning('No eligible transactions selected (must be SUCCESS and not settled)');
      return;
    }

    if (ineligible > 0) {
      message.info(`${ineligible} ineligible transaction(s) were excluded (not SUCCESS or already settled).`);
    }

    Modal.confirm({
      title: 'Confirm Batch Settlement',
      content: `Are you sure you want to settle ${eligible.length} transaction(s)?`,
      onOk: async () => {
        try {
          const txnIds = eligible.map(t => t.txn_id);
          await transactionService.processSettlementBatch(txnIds);
          message.success(`${eligible.length} transaction(s) queued for settlement`);
          actionRef.current?.reload();
          setSelectedRows([]);
        } catch (error: any) {
          message.error(error.message || 'Settlement failed');
        }
      }
    });
  }, [selectedRows, actionRef]);

  return (
    <>
      {/* Filters: Drawer on mobile, inline toolbar on desktop */}
      {!embedded && (
        responsive.isMobile ? (
          <div style={{ marginBottom: 12 }}>
            <FilterDrawer
              title="Transaction Filters"
              onApply={() => actionRef.current?.reload()}
              onClear={() => {
                setSearchText('');
                setSelectedStatus(undefined);
                setSelectedClientCode(undefined);
                setSelectedPaymentMode(undefined);
                setIsSettled(undefined);
                setMinAmount(undefined);
                setMaxAmount(undefined);
                setDateRange([undefined, undefined]);
                actionRef.current?.reload();
              }}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Input
                  allowClear
                  placeholder="Search by ID, email, phone, or name"
                  value={searchText}
                  onChange={(e: any) => setSearchText(e.target.value)}
                />
                <Select
                  allowClear
                  placeholder="Status"
                  value={selectedStatus}
                  onChange={(v) => setSelectedStatus(v)}
                  options={[
                    { label: 'Any', value: undefined },
                    { label: 'Success', value: 'SUCCESS' },
                    { label: 'Pending', value: 'PENDING' },
                    { label: 'Failed', value: 'FAILED' },
                    { label: 'Refunded', value: 'REFUNDED' },
                    { label: 'Cancelled', value: 'CANCELLED' },
                  ] as any}
                />
                <Select
                  allowClear
                  showSearch
                  placeholder="Client (code or name)"
                  value={selectedClientCode}
                  onSearch={(q) => fetchClients(q)}
                  onChange={(v) => setSelectedClientCode(v)}
                  filterOption={false}
                  options={clientOptions}
                />
                <Select
                  allowClear
                  placeholder="Payment Mode"
                  value={selectedPaymentMode}
                  onChange={(v) => setSelectedPaymentMode(v)}
                  options={[
                    'UPI','Credit Card','Debit Card','Net Banking','Wallet','NEFT','RTGS','IMPS','CASH'
                  ].map(m => ({ label: m, value: m }))}
                />
                <Select
                  allowClear
                  placeholder="Settlement"
                  value={typeof isSettled === 'boolean' ? (isSettled ? 'SETTLED' : 'PENDING') : undefined}
                  onChange={(v) => setIsSettled(v === 'SETTLED' ? true : v === 'PENDING' ? false : undefined)}
                  options={[
                    { label: 'Any', value: undefined },
                    { label: 'Settled', value: 'SETTLED' },
                    { label: 'Pending', value: 'PENDING' },
                  ] as any}
                />
                <Space>
                  <InputNumber placeholder="Min Amount" value={minAmount as any} onChange={(v:any)=>setMinAmount(v as number)} />
                  <InputNumber placeholder="Max Amount" value={maxAmount as any} onChange={(v:any)=>setMaxAmount(v as number)} />
                </Space>
                <DatePicker.RangePicker
                  showTime
                  onChange={(vals) => setDateRange([
                    vals && vals[0] ? vals[0].toISOString() : undefined,
                    vals && vals[1] ? vals[1].toISOString() : undefined,
                  ])}
                />
              </Space>
            </FilterDrawer>
          </div>
        ) : (
          <StyledCard style={{ marginBottom: 12 }}>
            <Space wrap>
              <Input
                allowClear
                placeholder="Search by ID, email, phone, or name"
                value={searchText}
                onChange={(e: any) => setSearchText(e.target.value)}
                style={{ minWidth: 260 }}
              />
              <Select
                allowClear
                placeholder="Status"
                value={selectedStatus}
                onChange={(v) => setSelectedStatus(v)}
                style={{ minWidth: 160 }}
                options={[
                  { label: 'Any', value: undefined },
                  { label: 'Success', value: 'SUCCESS' },
                  { label: 'Pending', value: 'PENDING' },
                  { label: 'Failed', value: 'FAILED' },
                  { label: 'Refunded', value: 'REFUNDED' },
                  { label: 'Cancelled', value: 'CANCELLED' },
                ] as any}
              />
              <Select
                allowClear
                showSearch
                placeholder="Client (code or name)"
                value={selectedClientCode}
                onSearch={(q) => fetchClients(q)}
                onChange={(v) => setSelectedClientCode(v)}
                filterOption={false}
                options={clientOptions}
                style={{ minWidth: 260 }}
              />
              <Select
                allowClear
                placeholder="Payment Mode"
                value={selectedPaymentMode}
                onChange={(v) => setSelectedPaymentMode(v)}
                style={{ minWidth: 180 }}
                options={[
                  'UPI','Credit Card','Debit Card','Net Banking','Wallet','NEFT','RTGS','IMPS','CASH'
                ].map(m => ({ label: m, value: m }))}
              />
              <Select
                allowClear
                placeholder="Settlement"
                value={typeof isSettled === 'boolean' ? (isSettled ? 'SETTLED' : 'PENDING') : undefined}
                onChange={(v) => setIsSettled(v === 'SETTLED' ? true : v === 'PENDING' ? false : undefined)}
                style={{ minWidth: 160 }}
                options={[
                  { label: 'Any', value: undefined },
                  { label: 'Settled', value: 'SETTLED' },
                  { label: 'Pending', value: 'PENDING' },
                ] as any}
              />
              <InputNumber placeholder="Min Amount" value={minAmount as any} onChange={(v:any)=>setMinAmount(v as number)} />
              <InputNumber placeholder="Max Amount" value={maxAmount as any} onChange={(v:any)=>setMaxAmount(v as number)} />
              <DatePicker.RangePicker
                showTime
                onChange={(vals) => setDateRange([
                  vals && vals[0] ? vals[0].toISOString() : undefined,
                  vals && vals[1] ? vals[1].toISOString() : undefined,
                ])}
              />
              <Button onClick={() => actionRef.current?.reload()}>Apply</Button>
              <Button onClick={() => { 
                setSearchText(''); 
                setSelectedStatus(undefined); 
                setSelectedClientCode(undefined); 
                setSelectedPaymentMode(undefined);
                setIsSettled(undefined);
                setMinAmount(undefined);
                setMaxAmount(undefined);
                setDateRange([undefined, undefined]); 
                actionRef.current?.reload();
              }}>Clear</Button>
            </Space>
          </StyledCard>
        )
      )}

      {/* Mobile Card View */}
      {responsive.isMobile && viewMode === 'cards' ? (
        <div>
          <StyledCard style={{ marginBottom: 8 }}>
            <Segmented
              options={[{ label: 'Cards', value: 'cards' }, { label: 'Table', value: 'table' }]}
              value={viewMode}
              onChange={(v:any)=>setViewMode(v)}
              block
            />
          </StyledCard>
          <Space direction="vertical" size="small" style={{ width: '100%' }}>
            {latestData.map((t) => (
              <StyledCard key={t.txn_id} hoverable>
                <Space direction="vertical" size={4} style={{ width: '100%' }}>
                  <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <Checkbox
                      checked={!!selectedRows.find(r => r.txn_id === t.txn_id)}
                      onChange={(e:any)=>{
                        setSelectedRows((prev)=>{
                          const exists = prev.find(r => r.txn_id === t.txn_id);
                          if (e.target.checked && !exists) return [...prev, t];
                          if (!e.target.checked && exists) return prev.filter(r => r.txn_id !== t.txn_id);
                          return prev;
                        })
                      }}
                    >
                      <Text strong>{t.client_name || t.client_code || 'Client'}</Text>
                    </Checkbox>
                    <StatusRenderer status={t.status as any} />
                  </Space>
                  <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                    <AmountRenderer record={t} />
                    <Tag>{t.payment_mode || '—'}</Tag>
                  </Space>
                  <Space style={{ justifyContent: 'space-between', width: '100%', fontSize: 12 }}>
                    <Text type="secondary">{dayjs(t.trans_date).format('DD MMM YYYY HH:mm')}</Text>
                    <a onClick={()=>router.push(`/transactions/${t.txn_id}`)}>View</a>
                  </Space>
                </Space>
                </StyledCard>
              ))}
          </Space>
          {/* Bottom action bar */}
          {!!selectedRows.length && (
            <div style={{
              position: 'fixed',
              left: 0,
              right: 0,
              bottom: 0,
              padding: 12,
              background: 'var(--color-bg-elevated)',
              borderTop: '1px solid var(--color-border-secondary)',
              boxShadow: '0 -4px 12px var(--shadow-md)',
              display: 'flex',
              gap: 8,
              zIndex: 1000,
            }}>
              <Button type="primary" block icon={<DollarOutlined />} onClick={handleBatchSettlement}>Settle ({selectedRows.length})</Button>
              <Button block icon={<DownloadOutlined />}>Export</Button>
            </div>
          )}
        </div>
      ) : (
      <div className="premium-table" style={{ overflowX: 'auto' }}>
      <ProTable<ITransaction>
        id="transactions:main"
        columns={prunedColumns}
        actionRef={actionRef}
        cardBordered={!embedded}
        tableStyle={{
          backgroundColor: 'var(--color-bg-container)',
        }}
        ghost={false}
        tableRender={(_: any, dom: any) => (
          <div style={{ backgroundColor: 'var(--color-bg-container)' }}>
            {dom}
          </div>
        )}
        postData={(data:any)=>{ setLatestData(data || []); return data; }}
        request={async (params: any, sort: any, filter: any) => {
          try {
            // Process filters from ProTable
            const processedFilters: ITransactionFilter = {
              client_code: selectedClientCode || clientId,
              search: searchText || (params.keyword || params.txn_id),
              page: params.current || 1,
              page_size: params.pageSize || (responsive.isMobile ? 10 : 20)
            };
            
            // Handle payment_mode filter
            if (selectedPaymentMode) processedFilters.payment_mode = selectedPaymentMode;
            else if (filter.payment_mode && filter.payment_mode.length > 0) processedFilters.payment_mode = filter.payment_mode[0];
            
            // Handle status filter
            if (selectedStatus) processedFilters.status = selectedStatus as any;
            else if (filter.status && filter.status.length > 0) processedFilters.status = filter.status[0] as any;
            
            // Settlement / amount filters
            if (typeof isSettled === 'boolean') processedFilters.is_settled = isSettled;
            if (minAmount !== undefined) processedFilters.min_amount = minAmount;
            if (maxAmount !== undefined) processedFilters.max_amount = maxAmount;

            // Handle date range filter
            if (dateRange[0] && dateRange[1]) { processedFilters.date_from = dateRange[0]; processedFilters.date_to = dateRange[1]; }
            else if (params.startTime && params.endTime) { processedFilters.date_from = params.startTime; processedFilters.date_to = params.endTime; }
            
            const filters = processedFilters;

            const response = await queryClient.fetchQuery({
              queryKey: ['transactions', filters],
              queryFn: () => transactionService.getAll(filters),
            });

            return {
              data: response.results || [],
              success: true,
              total: (response as any).count || 0
            };
          } catch (error: any) {
            message.error(error?.message || 'Failed to fetch transactions');
            return {
              data: [],
              success: false,
              total: 0
            };
          }
        }}
        rowKey="txn_id"
        search={embedded ? false : {
          labelWidth: 'auto',
          searchText: 'Search',
          resetText: 'Reset',
          collapseRender: false,
        }}
        pagination={{
          pageSize: responsive.isMobile ? 10 : 20,
          showSizeChanger: !responsive.isMobile,
          showQuickJumper: !responsive.isMobile,
          showTotal: responsive.isMobile ? 
            undefined : 
            (total: number, range: [number, number]) => `${range[0]}-${range[1]} of ${total.toLocaleString()} transactions`,
          simple: responsive.isMobile
        }}
        dateFormatter="string"
        headerTitle={embedded ? undefined : (responsive.isMobile ? undefined : "Transaction Management")}
        options={{
          search: true,
          fullScreen: !embedded,
          reload: true,
          density: !responsive.isMobile,
          setting: !responsive.isMobile
        }}
        toolBarRender={() => {
          if (responsive.isMobile) {
            const menuItems: any[] = [
              { key: 'save', label: 'Save current view', onClick: saveCurrentView },
              { type: 'divider' },
              ...savedFilters.map((v) => ({ key: `v-${v.id}-${v.name}` as string, label: v.name, onClick: () => applyView(v) })),
              ...(savedFilters.length ? [{ type: 'divider' } as any] : []),
              ...savedFilters.map((v) => ({ key: `del-${v.id}` as string, danger: true, label: `Delete: ${v.name}`, onClick: () => removeView(v) })),
              { type: 'divider' } as any,
              { key: 'export', label: <span onClick={handleExport}>Export</span> },
              { key: 'refresh', label: <span onClick={() => actionRef.current?.reload()}>Refresh</span> },
            ];
            return [
              <Segmented
                key="viewmode"
                options={[{ label: 'Table', value: 'table' }, { label: 'Cards', value: 'cards' }]}
                value={viewMode}
                onChange={(v:any)=>setViewMode(v)}
              />,
              <Dropdown key="more" menu={{ items: menuItems }}>
                <Button>More</Button>
              </Dropdown>
            ];
          }
          return [
            <Dropdown
              key="views"
              menu={{
                items: (() => {
                  const items: any[] = [
                    { key: 'save', label: 'Save current view', onClick: saveCurrentView },
                    { type: 'divider' },
                    ...savedFilters.map((v) => ({ key: `v-${v.id}-${v.name}` as string, label: v.name, onClick: () => applyView(v) })),
                  ];
                  if (savedFilters.length) {
                    items.push({ type: 'divider' } as any);
                    savedFilters.forEach((v) => items.push({ key: `del-${v.id}` as string, danger: true, label: `Delete: ${v.name}`, onClick: () => removeView(v) }));
                  }
                  return items;
                })()
              }}
            >
              <Button loading={savedFiltersLoading}>Views</Button>
            </Dropdown>,
            <Button
              key="export"
              icon={<DownloadOutlined />}
              loading={exportLoading}
              onClick={handleExport}
            >
              Export
            </Button>,
            <Button
              key="refresh"
              icon={<ReloadOutlined />}
              onClick={() => actionRef.current?.reload()}
            >
              Refresh
            </Button>
          ];
        }}
        rowSelection={{
          onChange: (_: React.Key[], selectedRows: ITransaction[]) => {
            setSelectedRows(selectedRows);
          }
        }}
        tableAlertRender={({ selectedRowKeys, selectedRows }: any) => (
          <Space>
            <span>
              Selected {selectedRowKeys.length} transaction(s)
            </span>
            <span>
              Total: ₹
              {selectedRows
                .reduce((sum: number, row: ITransaction) => sum + (Number(row.amount) || 0), 0)
                .toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </span>
          </Space>
        )}
        tableAlertOptionRender={() => (
          <Space>
            <Button 
              size="small" 
              type="primary"
              icon={<DollarOutlined />}
              onClick={handleBatchSettlement}
            >
              {responsive.isMobile ? 'Settle' : 'Batch Settlement'}
            </Button>
            <Button 
              size="small"
              icon={<DownloadOutlined />}
            >
              {responsive.isMobile ? 'Export' : 'Export Selected'}
            </Button>
          </Space>
        )}
        scroll={{ 
          x: responsive.isMobile ? 'max-content' : responsive.isTablet ? 1200 : 1500 
        }}
        className={`transaction-table ${responsive.isMobile ? 'mobile-view' : ''}`}
        sticky
        onRow={(record) => ({
          onClick: () => {
            if (responsive.isMobile) {
              setSelectedTransaction(record);
              setDetailOpen(true);
            }
          }
        })}
        defaultSize={responsive.isMobile ? "small" : "middle"}
        style={{
          backgroundColor: 'var(--color-bg-container)'
        }}
      />
      </div>)}

      {/* Mobile detail drawer */}
      {responsive.isMobile && (
        <MobileDetailDrawer
          open={detailOpen}
          onClose={() => setDetailOpen(false)}
          title={selectedTransaction ? `Txn ${selectedTransaction.txn_id}` : 'Transaction'}
        >
          {selectedTransaction && (
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Text strong>Amount</Text>
                <AmountRenderer record={selectedTransaction} />
              </Space>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Text type="secondary">Status</Text>
                <StatusRenderer status={selectedTransaction.status as any} />
              </Space>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Text type="secondary">Date</Text>
                <Text>{dayjs(selectedTransaction.trans_date).format('DD MMM YYYY HH:mm')}</Text>
              </Space>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Text type="secondary">Client</Text>
                <Text>{selectedTransaction.client_name || selectedTransaction.client_code || '—'}</Text>
              </Space>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Text type="secondary">Payment Mode</Text>
                <Tag>{selectedTransaction.payment_mode || '—'}</Tag>
              </Space>
              <Space style={{ justifyContent: 'space-between', width: '100%' }}>
                <Text type="secondary">TXN ID</Text>
                <Text code>{selectedTransaction.txn_id}</Text>
              </Space>
            </Space>
          )}
        </MobileDetailDrawer>
      )}


      <Modal
        title="Initiate Refund"
        open={refundModalVisible}
        onOk={handleRefundSubmit}
        onCancel={() => {
          setRefundModalVisible(false);
          refundForm.resetFields();
        }}
        okText="Initiate Refund"
        width={responsive.isMobile ? '90%' : 520}
      >
        <Form
          form={refundForm}
          layout="vertical"
        >
          <Form.Item label="Transaction ID">
            <Input value={selectedTransaction?.txn_id} disabled />
          </Form.Item>
          <Form.Item label="Original Amount">
            <Input 
              value={`₹${selectedTransaction?.amount?.toLocaleString('en-IN') || 0}`} 
              disabled 
            />
          </Form.Item>
          <Form.Item
            name="amount"
            label="Refund Amount"
            rules={[
              { required: true, message: 'Please enter refund amount' },
              { type: 'number', min: 0.01, message: 'Amount must be greater than 0' },
              {
                validator: (_, value) => {
                  if (value > (selectedTransaction?.amount || 0)) {
                    return Promise.reject('Refund amount cannot exceed transaction amount');
                  }
                  return Promise.resolve();
                }
              }
            ]}
          >
            <InputNumber
              style={{ width: '100%' }}
              prefix="₹"
              precision={2}
              max={selectedTransaction?.amount}
            />
          </Form.Item>
          <Form.Item
            name="reason"
            label="Refund Reason"
            rules={[
              { required: true, message: 'Please provide a reason for refund' },
              { min: 10, message: 'Reason must be at least 10 characters' }
            ]}
          >
            <TextArea 
              rows={4} 
              placeholder="Enter detailed reason for refund..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default TransactionTable;
  // Fetch data for Cards view on mobile because ProTable is not rendered in cards mode
  useEffect(() => {
    const fetchForCards = async () => {
      try {
        if (!responsive.isMobile || viewMode !== 'cards') return;
        setCardsLoading(true);
        const filters: ITransactionFilter = {
          client_code: selectedClientCode || clientId,
          search: searchText,
          page: 1,
          page_size: 20,
          ...(selectedPaymentMode ? { payment_mode: selectedPaymentMode } : {}),
          ...(selectedStatus ? { status: selectedStatus as any } : {}),
          ...(typeof isSettled === 'boolean' ? { is_settled: isSettled } : {}),
          ...(minAmount !== undefined ? { min_amount: minAmount } : {}),
          ...(maxAmount !== undefined ? { max_amount: maxAmount } : {}),
        };
        const res = await transactionService.getAll(filters);
        setLatestData(res.results || []);
      } catch {
        // ignore
      } finally {
        setCardsLoading(false);
      }
    };
    fetchForCards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [responsive.isMobile, viewMode, selectedClientCode, clientId, searchText, selectedPaymentMode, selectedStatus, isSettled, minAmount, maxAmount]);
