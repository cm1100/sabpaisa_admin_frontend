/**
 * Client Management Page
 * Implements responsive design using project's responsive system
 */
'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CentralAvatar, CentralBadge, CentralButton, CentralPageContainer, CentralProTable, CentralTag, CentralText, CentralTitle, Dropdown, Form, Input, Modal, Select, StyledCard, StyledSpace, StyledStatistic, Tooltip, App, theme } from '@/components/ui';
import ResponsiveHeaderActions from '@/components/common/ResponsiveHeaderActions';
import type { ProColumns } from '@/components/ui';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  MoreOutlined,
  UserOutlined,
  ShopOutlined,
  BankOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  DownloadOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined
} from '@ant-design/icons';
import { IClient } from '@/types';
import SavedFiltersApiService, { SavedFilter } from '@/services/api/SavedFiltersApiService';
import ClientTemplatesApiService, { ClientTemplate } from '@/services/api/ClientTemplatesApiService';
import { ClientApiService } from '@/services/api/ClientApiService';
import dayjs from 'dayjs';
import { useQueryClient } from '@tanstack/react-query';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { useResponsive } from '@/hooks/useResponsive';
import { notifySuccess } from '@/utils/notify';
// Removed custom CSS import - using only Ant Design

const ClientManagementPage: React.FC = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const actionRef = useRef<any>(null);
  const responsive = useResponsive();
  const [selectedRows, setSelectedRows] = useState<IClient[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingClient, setEditingClient] = useState<IClient | null>(null);
  const [form] = Form.useForm();
  const clientApi = new ClientApiService();
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState<string>('');
  const [stats, setStats] = useState({ total: 0, active: 0, totalVolume: 0, avgTransaction: 0 });

  // AntD modal instance to avoid static Modal.confirm warning
  const [modal, modalContextHolder] = Modal.useModal();
  const queryClient = useQueryClient();

  // Filter masters for UI selects
  const statusOptions = [
    { label: 'Any Status', value: '' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
  ];
  const clientTypeOptions = [
    'Business', 'Education', 'E-commerce', 'Government', 'Healthcare', 'Insurance', 'Travel', 'NGO', 'Real Estate', 'Entertainment', 'Utilities'
  ].map(v => ({ label: v, value: v }));
  const riskCategoryOptions = [
    { label: 'Any Risk', value: '' },
    { label: '1 - Low', value: 1 },
    { label: '2 - Low-Medium', value: 2 },
    { label: '3 - Medium', value: 3 },
    { label: '4 - Medium-High', value: 4 },
    { label: '5 - High', value: 5 },
  ];

  // Selected filters
  const [selectedStatus, setSelectedStatus] = useState<string | ''>('');
  const [selectedClientType, setSelectedClientType] = useState<string | ''>('');
  const [selectedRisk, setSelectedRisk] = useState<number | ''>('');
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [savedFiltersLoading, setSavedFiltersLoading] = useState(false);
  const [templates, setTemplates] = useState<ClientTemplate[]>([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);

  // Load remote saved filters (with graceful fallback to localStorage)
  useEffect(() => {
    const load = async () => {
      setSavedFiltersLoading(true);
      try {
        const list = await SavedFiltersApiService.list('clients');
        setSavedFilters(list);
      } catch (e) {
        // Fallback: seed from localStorage if API not available
        try {
          const raw = localStorage.getItem('clients:views') || '[]';
          const views = JSON.parse(raw);
          if (Array.isArray(views)) {
            setSavedFilters(
              views.map((v: any, idx: number) => ({
                id: idx + 1,
                module: 'clients',
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

  // Load client statistics for metric cards
  useEffect(() => {
    (async () => {
      try {
        const s = await clientApi.getStatistics();
        setStats({
          total: s.total_clients ?? 0,
          active: s.active_clients ?? 0,
          totalVolume: s.total_volume ?? 0,
          avgTransaction: s.avg_transaction_value ?? 0,
        });
      } catch (e) {
        // Leave defaults if endpoint unavailable
      }
    })();
  }, []);

  // Load Client Templates (active only)
  useEffect(() => {
    const loadTemplates = async () => {
      setTemplatesLoading(true);
      try {
        const list = await ClientTemplatesApiService.list({ active: true });
        setTemplates(list);
      } catch (e) {
        // Ignore if API unavailable
      } finally {
        setTemplatesLoading(false);
      }
    };
    loadTemplates();
  }, []);

  // Load statistics on component mount
  React.useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await clientApi.getStatistics();
        setStats({
          total: response.total_clients || 0,
          active: response.active_clients || 0,
          totalVolume: response.total_volume || 0,
          avgTransaction: response.avg_transaction_value || 0
        });
      } catch (error) {
        console.error('Failed to load client statistics:', error);
      }
    };
    loadStats();
  }, []);

  const statusConfig = {
    active: { color: 'success', icon: <CheckCircleOutlined />, text: 'Active' },
    inactive: { color: 'default', icon: <CloseCircleOutlined />, text: 'Inactive' },
    suspended: { color: 'error', icon: <ExclamationCircleOutlined />, text: 'Suspended' },
    pending: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Pending' }
  };

  const tierConfig = {
    enterprise: { color: 'warning', label: 'Enterprise' },
    premium: { color: 'processing', label: 'Premium' },
    standard: { color: 'processing', label: 'Standard' },
    basic: { color: 'default', label: 'Basic' }
  };

  const handleExport = (format: 'csv' | 'excel' = 'csv') => {
    modal.confirm({
      title: 'Export Clients',
      content: `Export all clients data as ${format.toUpperCase()} file?`,
      onOk: async () => {
        try {
          const blob = await clientApi.export(format);
          
          // Create download link
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `clients_export_${new Date().toISOString().split('T')[0]}.${format === 'excel' ? 'xlsx' : 'csv'}`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
          
          notifySuccess(`Clients exported successfully as ${format.toUpperCase()}`);
        } catch (error: any) {
          console.error('Failed to export clients:', error);
          message.error(error?.message || 'Failed to export clients');
        }
      }
    });
  };

  const columns: ProColumns<any>[] = [
    {
      title: 'Code',
      dataIndex: ['client_code'],
      key: 'client_code',
      width: 140,
      fixed: (responsive.isDesktop ? 'left' : undefined) as any,
      render: (_: any, r: any) => <CentralText code>{r.clientId || r.client_code}</CentralText>,
    },
    {
      title: 'Name',
      key: 'client_name',
      width: responsive.isMobile ? 220 : 300,
      ellipsis: true,
      render: (_: any, record: any) => (
        <StyledSpace size={responsive.isMobile ? 8 : 12}>
          <CentralAvatar size={responsive.isMobile ? 32 : 40} icon={<ShopOutlined />} />
          <StyledSpace direction="vertical" size={0}>
            <CentralText strong ellipsis>{record.name || record.client_name}</CentralText>
          </StyledSpace>
        </StyledSpace>
      ),
    },
    {
      title: 'Type',
      dataIndex: ['client_type'],
      key: 'client_type',
      width: 140,
      responsive: ['lg'] as const,
      render: (_: any, r: any) => r.client_type || '-',
    },
    {
      title: 'Contact',
      key: 'contact',
      width: responsive.isMobile ? 220 : 280,
      responsive: ['lg'] as const,
      ellipsis: true,
      render: (_: any, record: any) => (
        <StyledSpace direction="vertical" size={0}>
          <StyledSpace>
            <MailOutlined aria-hidden="true" />
            <a href={`mailto:${record.email || record.client_email}`}>{record.email || record.client_email || '-'}</a>
          </StyledSpace>
          {!responsive.isMobile && (
            <StyledSpace>
              <PhoneOutlined aria-hidden="true" />
              <CentralText type="secondary">{record.phone || record.client_contact || '-'}</CentralText>
            </StyledSpace>
          )}
        </StyledSpace>
      )
    },
    {
      title: 'Address',
      dataIndex: ['client_address'],
      key: 'client_address',
      width: responsive.isMobile ? 200 : 260,
      ellipsis: true,
      responsive: ['xl'] as const,
      render: (_: any, r: any) => <CentralText ellipsis>{r.client_address || '-'}</CentralText>,
    },
    {
      title: 'Risk',
      key: 'risk',
      width: 100,
      responsive: ['md'] as const,
      render: (_: any, record: any) => (
        <CentralTag color={(record.risk_category <= 2) ? 'green' : (record.risk_category <= 4 ? 'orange' : 'red')}>
          {record.risk_category || '-'}
        </CentralTag>
      )
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      responsive: ['md'] as const,
      render: (_: any, record: any) => (
        <CentralBadge status={record.active ? 'success' as any : 'default' as any} text={record.active ? 'Active' : 'Inactive'} />
      )
    },
    {
      title: 'Txns',
      key: 'transaction_count',
      width: 100,
      responsive: ['lg'] as const,
      render: (_: any, r: any) => (r.transactionCount ?? r.transaction_count ?? 0).toLocaleString('en-IN'),
    },
    {
      title: 'Volume (₹)',
      key: 'total_volume',
      width: 140,
      responsive: ['lg'] as const,
      render: (_: any, r: any) => `₹${Number(r.totalVolume ?? r.total_volume ?? 0).toLocaleString('en-IN')}`,
    },
    {
      title: 'Modes',
      key: 'payment_modes_count',
      width: 90,
      responsive: ['xl'] as const,
      render: (_: any, r: any) => r.payment_modes_count ?? '-',
    },
    {
      title: 'Success',
      key: 'successful_transaction_count',
      width: 110,
      responsive: ['xl'] as const,
      render: (_: any, r: any) => r.successful_transaction_count ?? '-',
    },
    {
      title: 'Created',
      key: 'createdAt',
      width: 140,
      responsive: ['lg'] as const,
      render: (_: any, record: any) => dayjs(record.createdAt || record.creation_date).format('DD MMM YYYY')
    },
    {
      title: 'Actions',
      key: 'actions',
      width: responsive.isMobile ? 60 : 100,
      fixed: (responsive.isDesktop ? 'right' : undefined) as any,
      render: (_: any, record: any) => (
        <Dropdown
          menu={{
            items: [
              {
                key: 'view',
                label: 'View Details',
                icon: <EyeOutlined />,
                onClick: () => router.push(`/clients/${record.id || record.client_id}`)
              },
              { type: 'divider' },
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
          <CentralButton type="text" icon={<MoreOutlined />} />
        </Dropdown>
      )
    }
  ];

  const handleEdit = (client: IClient) => {
    setEditingClient(client);
    form.setFieldsValue({
      name: client.name,
      clientCode: client.clientId,
      email: client.email,
      phone: client.phone,
      website: client.website,
      industry: client.industry,
      contactPerson: client.contactPerson,
      status: client.status,
      tier: client.tier,
      settlementCycle: client.settlementCycle,
      settlementAccount: client.settlementAccount
    });
    setModalVisible(true);
  };

  const handleSuspend = async (client: IClient) => {
    modal.confirm({
      title: 'Suspend Client',
      content: `Are you sure you want to suspend ${client.name}?`,
      okText: 'Yes, Suspend',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await clientApi.update((client as any).id || (client as any).client_id, { active: false } as any);
          notifySuccess('Client suspended successfully');
          actionRef.current?.reload();
        } catch (error: any) {
          message.error(error?.message || 'Failed to suspend client');
        }
      }
    });
  };

  const handleDelete = async (client: IClient) => {
    modal.confirm({
      title: 'Delete Client',
      content: `Are you sure you want to delete ${client.name}? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await clientApi.deleteClient((client as any).id || (client as any).client_id);
          notifySuccess('Client deleted successfully');
          actionRef.current?.reload();
        } catch (error: any) {
          message.error(error?.message || 'Failed to delete client');
        }
      }
    });
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      
      // Prepare minimal backend payload; delegate full onboarding to backend action
      const clientData: any = {
        client_name: values.name,
        client_code: values.clientCode || `CLT${Date.now()}`,
        client_email: values.email,
        client_contact: values.phone,
        client_address: values.address || '',
        client_type: values.industry || 'Business',
        risk_category: values.risk_category || 1,
        active: values.status === 'active',
      };

      try {
        if (editingClient) {
          // Update existing client
          await clientApi.update((editingClient as any).id || (editingClient as any).client_id, clientData as any);
          notifySuccess('Client updated successfully');
        } else {
          // Full onboarding path creates and wires defaults server-side
          const res = await clientApi.onboard(clientData);
          notifySuccess(res.message || 'Client onboarded successfully');
        }
        
        setModalVisible(false);
        form.resetFields();
        actionRef.current?.reload();
      } catch (apiError: any) {
        console.error('API Error:', apiError);
        message.error(apiError.message || 'Failed to save client');
      }
    } catch (error) {
      message.error('Please fill in all required fields');
    }
  };

  const headerExtra = (
    <ResponsiveHeaderActions
      primary={[{ key: 'add', label: 'Add Client', icon: <PlusOutlined />, onClick: () => { setEditingClient(null as any); form.resetFields(); setModalVisible(true); } }]}
      secondary={[{ key: 'export', label: 'Export', icon: <DownloadOutlined />, onClick: () => handleExport('csv') }]}
    />
  );

  return (
    <CentralPageContainer
      ghost
      header={{
        title: 'Client Management',
        breadcrumb: {
          items: [
            { title: 'Home', href: '/' },
            { title: 'Client Management' },
          ],
        },
        extra: headerExtra,
      }}
    >
      {modalContextHolder}
      <ResponsiveContainer maxWidth="full" padding={!responsive.isMobile}>
        <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[24, 24]}>
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledCard >
              <StyledStatistic
                title="Total Clients"
                value={stats.total}
                prefix={<ShopOutlined />}
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledCard >
              <StyledStatistic
                title="Active Clients"
                value={stats.active}
                prefix={<CheckCircleOutlined />}
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledCard >
              <StyledStatistic
                title="Total Volume (Month)"
                value={stats.totalVolume}
                prefix="₹"
                formatter={(value) => `${Number(value).toLocaleString('en-IN')}`}
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledCard >
              <StyledStatistic
                title="Avg. Transaction Value"
                value={stats.avgTransaction}
                prefix="₹"
                formatter={(value) => `${Number(value).toLocaleString('en-IN')}`}
              />
            </StyledCard>
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Use central provider tokens; avoid local ConfigProvider */}
          {/* Lightweight filter toolbar */}
          <StyledCard style={{ marginBottom: 12 }}>
            <StyledSpace wrap>
              <Input.Search
                placeholder="Search clients (code, name, email, contact)"
                allowClear
                className="filter-lg"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onSearch={() => actionRef.current?.reload()}
                enterButton
              />
              <Select
                placeholder="Status"
                className="filter-md"
                value={selectedStatus}
                options={statusOptions}
                onChange={(v) => setSelectedStatus(v)}
                allowClear
              />
              <Select
                placeholder="Client Type"
                className="filter-lg"
                value={selectedClientType}
                options={[{ label: 'Any Type', value: '' }, ...clientTypeOptions]}
                onChange={(v) => setSelectedClientType(v)}
                allowClear
              />
              <Select
                placeholder="Risk Category"
                className="filter-md"
                value={selectedRisk as any}
                options={riskCategoryOptions}
                onChange={(v) => setSelectedRisk(v as any)}
                allowClear
              />
              <CentralButton onClick={() => actionRef.current?.reload()}>
                Apply Filters
              </CentralButton>
              <CentralButton onClick={() => { setSelectedStatus(''); setSelectedClientType(''); setSelectedRisk(''); setSearchText(''); actionRef.current?.reload(); }}>
                Clear
              </CentralButton>
            </StyledSpace>
          </StyledCard>

          <CentralProTable<IClient>
            id="clients"
            columns={columns}
            actionRef={actionRef}
            cardBordered
            loading={loading}
            bordered={false}
            request={async (params: any) => {
              setLoading(true);
              try {
                const fetchParams = {
                  page: params.current || 1,
                  page_size: params.pageSize || (responsive.isMobile ? 10 : 20),
                  ...(searchText ? { search: searchText } : {}),
                  // Map UI filters to backend params
                  ...(selectedStatus === 'active' ? { active: true } : {}),
                  ...(selectedStatus === 'inactive' ? { active: false } : {}),
                  ...(selectedClientType ? { client_type: selectedClientType } : {}),
                  ...(selectedRisk !== '' ? { risk_category: selectedRisk } : {}),
                } as any;
                const response = await queryClient.fetchQuery({
                  queryKey: ['clients', fetchParams],
                  queryFn: () => clientApi.getAll(fetchParams),
                });

                // Transform backend data to match IClient interface
                const resp: any = response;
                const list: any[] = resp.results || resp;
                const transformedData = list.map((client: any) => ({
                  id: client.client_id?.toString() || client.id,
                  client_id: client.client_id,
                  clientId: client.client_code,
                  name: client.client_name,
                  email: client.client_email,
                  phone: client.client_contact,
                  client_address: client.client_address,
                  client_type: client.client_type,
                  risk_category: client.risk_category,
                  active: client.active,
                  totalVolume: client.total_volume ?? 0,
                  transactionCount: client.transaction_count ?? 0,
                  payment_modes_count: client.payment_modes_count ?? undefined,
                  successful_transaction_count: client.successful_transaction_count ?? undefined,
                  createdAt: client.creation_date,
                }));

                return {
                  data: transformedData,
                  success: true,
                  total: resp.count || transformedData.length || 0
                };
              } catch (error: any) {
                console.error('Failed to fetch clients:', error);
                message.error(error?.message || 'Failed to load clients');
                return {
                  data: [],
                  success: false,
                  total: 0
                };
              } finally {
                setLoading(false);
              }
            }}
            rowKey="id"
            search={{
              labelWidth: responsive.isMobile ? 60 : 'auto',
              searchText: 'Search',
              resetText: 'Reset',
              span: responsive.isMobile ? 24 : 8,
              collapseRender: responsive.isMobile ? (() => null as React.ReactNode) : undefined,
            }}
            pagination={{
              pageSize: responsive.isMobile ? 10 : 20,
              showSizeChanger: true,
              showQuickJumper: !responsive.isMobile,
              showTotal: responsive.isMobile ? undefined : (total: number, range: [number, number]) => 
                `${range[0]}-${range[1]} of ${total.toLocaleString()} clients`,
              size: responsive.isMobile ? 'small' : 'default',
            }}
            dateFormatter="string"
            headerTitle={responsive.isMobile ? null : 'Client List'}
            toolBarRender={() => [
              // Client Templates quick-create
              <Dropdown
                key="templates"
                menu={{ items: [
                  { key: 'manage', label: 'Manage Templates…', onClick: () => router.push('/clients/templates') },
                  { type: 'divider' } as any,
                  ...templates.map(t => ({ key: `tpl-${t.id}`, label: `Apply Template: ${t.name}`, onClick: () => {
                    const vals = t.template_json || {} as any;
                    const allowed = ['name','clientCode','industry','contactPerson','email','address','phone','website','tier','status','risk_category','settlementCycle','settlementAccount'];
                    const values: any = {};
                    allowed.forEach((k) => { if (vals[k] !== undefined) values[k] = vals[k]; });
                    setEditingClient(null);
                    setModalVisible(true);
                    form.setFieldsValue(values);
                    message.success(`Applied template: ${t.name}`);
                }})) ] }}
              >
                <CentralButton loading={templatesLoading}>Templates</CentralButton>
              </Dropdown>,
              (() => {
                const saveCurrentView = async () => {
                  const name = window.prompt('Save current filters as view. Name:');
                  if (!name) return;
                  const payload = { module: 'clients', name, params_json: { searchText, selectedStatus, selectedClientType, selectedRisk }, is_default: false };
                  try {
                    const created = await SavedFiltersApiService.create(payload as any);
                    setSavedFilters((prev) => [created, ...prev.filter((x) => x.name !== created.name)]);
                    message.success('View saved');
                  } catch (e) {
                    // fallback to localStorage
                    const VIEWS_KEY = 'clients:views';
                    try {
                      const all = JSON.parse(localStorage.getItem(VIEWS_KEY) || '[]');
                      const view = { name, filters: payload.params_json };
                      localStorage.setItem(VIEWS_KEY, JSON.stringify([view, ...all.filter((v:any)=>v.name!==name)]));
                      message.success('View saved (local)');
                    } catch {
                      message.error('Failed to save view');
                    }
                  }
                };
                const applyView = (v: any) => {
                  const filters = v.params_json || v.filters || {};
                  setSearchText(filters.searchText || '');
                  setSelectedStatus(filters.selectedStatus || '');
                  setSelectedClientType(filters.selectedClientType || '');
                  setSelectedRisk(filters.selectedRisk || '');
                  actionRef.current?.reload();
                };
                const removeView = async (v: SavedFilter) => {
                  try {
                    await SavedFiltersApiService.remove(v.id);
                    setSavedFilters((prev) => prev.filter((x) => x.id !== v.id));
                    notifySuccess('View removed');
                  } catch {
                    // local fallback
                    try {
                      const VIEWS_KEY = 'clients:views';
                      const all = JSON.parse(localStorage.getItem(VIEWS_KEY) || '[]');
                      const next = all.filter((x:any) => x.name !== v.name);
                      localStorage.setItem(VIEWS_KEY, JSON.stringify(next));
                      notifySuccess('View removed (local)');
                      setSavedFilters(next);
                    } catch {}
                  }
                };
                const menuItems = [
                  { key: 'save', label: 'Save current view', onClick: saveCurrentView },
                  { type: 'divider' } as any,
                  ...savedFilters.map((v) => ({ key: `remote-${v.id}`, label: v.name, onClick: () => applyView(v) })),
                ];
                if (savedFilters.length) {
                  menuItems.push({ type: 'divider' } as any);
                  savedFilters.forEach((v) => {
                    menuItems.push({ key: `del-${v.id}`, danger: true, label: `Delete: ${v.name}`, onClick: () => removeView(v) } as any);
                  });
                }
                return (
                  <Dropdown key="views" menu={{ items: menuItems }}>
                    <CentralButton loading={savedFiltersLoading}>Views</CentralButton>
                  </Dropdown>
                );
              })(),
              responsive.isMobile ? (
                <Dropdown
                  key="actions"
                  menu={{
                    items: [
                      {
                        key: 'add',
                        label: 'Add Client',
                        icon: <PlusOutlined />,
                        onClick: () => {
                          setEditingClient(null);
                          form.resetFields();
                          setModalVisible(true);
                        },
                      },
                      {
                        key: 'export',
                        label: 'Export',
                        icon: <DownloadOutlined />,
                        onClick: () => handleExport('csv')
                      },
                    ],
                  }}
                >
                  <CentralButton type="primary">Actions</CentralButton>
                </Dropdown>
              ) : (
                <>
                  <CentralButton
                    key="add"
                    type="primary"
                    icon={<PlusOutlined />}
                                        onClick={() => {
                      setEditingClient(null);
                      form.resetFields();
                      setModalVisible(true);
                    }}
                  >
                    Add Client
                  </CentralButton>
                  <Dropdown
                    menu={{
                      items: [
                        {
                          key: 'csv',
                          label: 'Export as CSV',
                          icon: <DownloadOutlined />,
                          onClick: () => handleExport('csv')
                        },
                        {
                          key: 'excel',
                          label: 'Export as Excel',
                          icon: <DownloadOutlined />,
                          onClick: () => handleExport('excel')
                        }
                      ]
                    }}
                  >
                    <CentralButton
                      key="export"
                      icon={<DownloadOutlined />}
                                          >
                      Export
                    </CentralButton>
                  </Dropdown>
                </>
              ),
            ]}
            rowSelection={responsive.isMobile ? undefined : {
              onChange: (_: React.Key[], selectedRows: IClient[]) => {
                setSelectedRows(selectedRows);
              },
              columnWidth: responsive.isMobile ? 40 : 60,
            }}
            tableAlertRender={responsive.isMobile ? false : ({ selectedRowKeys }: any) => (
              <StyledSpace>
                <span>Selected {selectedRowKeys.length} client(s)</span>
              </StyledSpace>
            )}
            tableAlertOptionRender={responsive.isMobile ? false : () => (
              <StyledSpace>
                <CentralButton size="small">Bulk Edit</CentralButton>
                <CentralButton size="small" danger>Bulk Delete</CentralButton>
              </StyledSpace>
            )}
            scroll={{ x: responsive.isMobile ? 800 : 1800 }}
            sticky={{
              offsetHeader: responsive.isMobile ? 0 : 64,
            }}
            options={{
              fullScreen: !responsive.isMobile,
              reload: true,
              density: !responsive.isMobile,
              setting: !responsive.isMobile,
            }}
          />


        <Modal
          title={editingClient ? 'Edit Client' : 'Add New Client'}
          open={modalVisible}
          onOk={handleSubmit}
          onCancel={() => {
            setModalVisible(false);
            form.resetFields();
          }}
          width={responsive.isMobile ? '100%' : 720}
          centered={responsive.isMobile}
          okText={editingClient ? 'Update' : 'Create'}
                  >
          {/* Template loader */}
          <StyledCard style={{ marginBottom: 12 }}>
            <StyledSpace>
              <span>Load from template:</span>
              <Select
                loading={templatesLoading}
                placeholder="Select a template"
                style={{ minWidth: 260 }}
                onChange={(templateId:number) => {
                  const tpl = templates.find(t => t.id === templateId);
                  if (!tpl) return;
                  const t = tpl.template_json || {} as any;
                  const allowed = ['name','clientCode','industry','contactPerson','email','address','phone','website','tier','status','risk_category','settlementCycle','settlementAccount'];
                  const values: any = {};
                  allowed.forEach((k) => { if (t[k] !== undefined) values[k] = t[k]; });
                  form.setFieldsValue(values);
                  message.success(`Applied template: ${tpl.name}`);
                }}
                options={templates.map(t => ({ label: t.name, value: t.id }))}
                allowClear
              />
            </StyledSpace>
          </StyledCard>
          <Form
            form={form}
            layout="vertical"
            requiredMark="optional"
          >
            <ResponsiveRow>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="name"
                  label="Client Name"
                  rules={[{ required: true, message: 'Please enter client name' }]}
                >
                  <Input prefix={<ShopOutlined />} placeholder="Enter client name"  />
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="clientCode"
                  label="Client Code"
                  rules={[{ required: !editingClient, message: 'Please enter client code' }]}
                  extra={editingClient ? "Cannot change client code" : "Unique identifier for the client"}
                >
                  <Input 
                    placeholder="e.g., CLT001" 
                     
                    disabled={!!editingClient}
                  />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="industry"
                  label="Industry"
                  rules={[{ required: true, message: 'Please select industry' }]}
                >
                  <Select placeholder="Select industry" >
                    <Select.Option value="Education">Education</Select.Option>
                    <Select.Option value="E-commerce">E-commerce</Select.Option>
                    <Select.Option value="Government">Government</Select.Option>
                    <Select.Option value="Healthcare">Healthcare</Select.Option>
                    <Select.Option value="Insurance">Insurance</Select.Option>
                    <Select.Option value="Travel">Travel</Select.Option>
                    <Select.Option value="NGO">NGO</Select.Option>
                    <Select.Option value="Real Estate">Real Estate</Select.Option>
                    <Select.Option value="Entertainment">Entertainment</Select.Option>
                    <Select.Option value="Utilities">Utilities</Select.Option>
                  </Select>
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="contactPerson"
                  label="Contact Person"
                  rules={[{ required: true, message: 'Please enter contact person' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Enter contact person name"  />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Enter email address"  />
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="address"
                  label="Address"
                >
                  <Input placeholder="Enter address" />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="phone"
                  label="Phone"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input prefix={<PhoneOutlined aria-hidden="true" />} placeholder="Enter phone number"  />
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="website"
                  label="Website"
                >
                  <Input prefix={<GlobalOutlined />} placeholder="Enter website URL"  />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="tier"
                  label="Tier"
                  rules={[{ required: true, message: 'Please select tier' }]}
                >
                  <Select placeholder="Select tier" >
                    <Select.Option value="basic">Basic</Select.Option>
                    <Select.Option value="standard">Standard</Select.Option>
                    <Select.Option value="premium">Premium</Select.Option>
                    <Select.Option value="enterprise">Enterprise</Select.Option>
                  </Select>
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="status"
                  label="Status"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Select placeholder="Select status" >
                    <Select.Option value="active">Active</Select.Option>
                    <Select.Option value="inactive">Inactive</Select.Option>
                    <Select.Option value="pending">Pending</Select.Option>
                    <Select.Option value="suspended">Suspended</Select.Option>
                  </Select>
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="risk_category"
                  label="Risk Category"
                  rules={[{ required: false }]}
                >
                  <Select placeholder="Select risk category">
                    <Select.Option value={1}>1 - Low</Select.Option>
                    <Select.Option value={2}>2 - Low-Medium</Select.Option>
                    <Select.Option value={3}>3 - Medium</Select.Option>
                    <Select.Option value={4}>4 - Medium-High</Select.Option>
                    <Select.Option value={5}>5 - High</Select.Option>
                  </Select>
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="settlementCycle"
                  label="Settlement Cycle"
                  rules={[{ required: true, message: 'Please select settlement cycle' }]}
                >
                  <Select placeholder="Select settlement cycle" >
                    <Select.Option value="T+0">T+0 (Same Day)</Select.Option>
                    <Select.Option value="T+1">T+1 (Next Day)</Select.Option>
                    <Select.Option value="T+2">T+2 (2 Days)</Select.Option>
                    <Select.Option value="T+3">T+3 (3 Days)</Select.Option>
                  </Select>
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="settlementAccount"
                  label="Settlement Account"
                  rules={[{ required: true, message: 'Please enter settlement account' }]}
                >
                  <Input prefix={<BankOutlined />} placeholder="Enter account number"  />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>
          </Form>
        </Modal>
      </ResponsiveContainer>
    </CentralPageContainer>
  );
};

export default ClientManagementPage;
