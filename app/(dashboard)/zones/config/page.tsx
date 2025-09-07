'use client';

import React, { useState, useEffect } from 'react';
import { CentralBadge as Badge, CentralButton as Button, CentralProTable, CentralProgress as Progress, CentralTable as Table, CentralTag as Tag, CentralText, CentralTextArea, CentralTitle, CentralTree as Tree, Descriptions, Form, Input, Modal, Select, Spin, StyledCard as Card, StyledSpace as Space, StyledStatistic as Statistic, Switch, Tabs, Tooltip, TreeSelect, App, CentralPageContainer } from '@/components/ui';
import MobileDetailDrawer from '@/components/common/MobileDetailDrawer';
import { useResponsive } from '@/hooks/useResponsive';
import ResponsiveHeaderActions from '@/components/common/ResponsiveHeaderActions';
import type { ProColumns } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { notifySuccess } from '@/utils/notify';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  TeamOutlined,
  SettingOutlined,
  HolderOutlined,
  EyeOutlined,
  GlobalOutlined,
  BankOutlined,
  FunctionOutlined,
  SafetyOutlined,
  ClockCircleOutlined,
  SyncOutlined
} from '@ant-design/icons';
import ZoneApiService, { 
  ZoneConfig, 
  ZoneHierarchy, 
  ZoneStatistics,
  CreateZoneRequest,
  AssignUsersRequest,
  AssignClientsRequest
} from '@/services/api/ZoneApiService';
import dayjs from 'dayjs';

const { Option } = Select;
// Replaced by CentralTextArea
const { TabPane } = Tabs;
// Typography components imported directly from centralized UI

const ZoneConfigurationPage: React.FC = () => {
  const { message } = App.useApp();
  const [zones, setZones] = useState<ZoneConfig[]>([]);
  const [hierarchyData, setHierarchyData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const responsive = useResponsive();
  const [detailOpen, setDetailOpen] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [statisticsModalVisible, setStatisticsModalVisible] = useState(false);
  const [editingZone, setEditingZone] = useState<ZoneConfig | null>(null);
  const [selectedZone, setSelectedZone] = useState<ZoneConfig | null>(null);
  const [statistics, setStatistics] = useState<ZoneStatistics | null>(null);
  const [activeTab, setActiveTab] = useState('zones');
  const [form] = Form.useForm();
  const [assignForm] = Form.useForm();

  const zoneTypes = ZoneApiService.getZoneTypes();
  const accessLevels = ZoneApiService.getAccessLevels();
  const indianStates = ZoneApiService.getIndianStates();
  const businessTypes = ZoneApiService.getBusinessTypes();

  useEffect(() => {
    loadZones();
    loadHierarchy();
  }, []);

  const loadZones = async () => {
    try {
      setLoading(true);
      const response = await ZoneApiService.getZones({ page_size: 100 } as any);
      const data = response.data;
      setZones(data.results || (data as any) || []);
    } catch (error: any) {
      message.error(error?.message || 'Failed to load zones');
    } finally {
      setLoading(false);
    }
  };

  const loadHierarchy = async () => {
    try {
      const response = await ZoneApiService.getZoneHierarchy();
      setHierarchyData(convertToTreeData(response.data));
    } catch (error) {
      console.error('Failed to load hierarchy');
    }
  };

  const loadStatistics = async (zoneId: number) => {
    try {
      const response = await ZoneApiService.getZoneStatistics(zoneId);
      setStatistics(response.data);
    } catch (error: any) {
      message.error(error?.message || 'Failed to load statistics');
    }
  };

  const convertToTreeData = (zones: ZoneHierarchy[]): any[] => {
    return zones.map(zone => ({
      title: (
        <span>
          <Tag color={ZoneApiService.getZoneTypeColor(zone.zone_type)}>
            {getZoneTypeIcon(zone.zone_type)}
          </Tag>
          {zone.zone_name} ({zone.zone_code})
        </span>
      ),
      key: zone.zone_id.toString(),
      children: zone.children ? convertToTreeData(zone.children) : []
    }));
  };

  const getZoneTypeIcon = (type: string) => {
    const icons = {
      'GEOGRAPHIC': <GlobalOutlined />,
      'BUSINESS_UNIT': <BankOutlined />,
      'FUNCTIONAL': <FunctionOutlined />,
      'REGULATORY': <SafetyOutlined />,
      'TEMPORAL': <ClockCircleOutlined />
    };
    return icons[type as keyof typeof icons] || <SettingOutlined />;
  };

  const handleSubmit = async (values: any) => {
    try {
      const requestData: CreateZoneRequest = {
        zone_name: values.zone_name,
        zone_code: values.zone_code,
        zone_type: values.zone_type,
        parent_zone_id: values.parent_zone_id || undefined,
        description: values.description,
        is_active: values.is_active !== undefined ? values.is_active : true,
        requires_approval: values.requires_approval || false,
        auto_assign_new_clients: values.auto_assign_new_clients || false,
        supported_states: values.supported_states || [],
        supported_cities: values.supported_cities || [],
        business_rules: {
          supported_business_types: values.supported_business_types || [],
          transaction_volume_limits: values.transaction_volume_limits || {},
          operational_hours: values.operational_hours || {}
        },
        transaction_limits: {
          min_amount: values.min_amount || 0,
          max_amount: values.max_amount || 0
        },
        allowed_payment_methods: values.allowed_payment_methods || []
      };

      if (values.zone_type === 'GEOGRAPHIC' && values.geographic_bounds) {
        try {
          requestData.geographic_bounds = JSON.parse(values.geographic_bounds);
        } catch (e) {
          message.error('Invalid GeoJSON format');
          return;
        }
      }

      if (editingZone) {
        await ZoneApiService.updateZone(editingZone.zone_id, requestData);
        notifySuccess('Zone updated successfully');
      } else {
        await ZoneApiService.createZone(requestData);
        notifySuccess('Zone created successfully');
      }
      
      setModalVisible(false);
      setEditingZone(null);
      form.resetFields();
      loadZones();
      loadHierarchy();
    } catch (error: any) {
      message.error(error.message || 'Failed to save zone');
    }
  };

  const handleAssignUsers = async (values: any) => {
    if (!selectedZone) return;

    try {
      const assignData: AssignUsersRequest = {
        user_ids: values.user_ids,
        access_level: values.access_level
      };

      await ZoneApiService.assignUsers(selectedZone.zone_id, assignData);
      notifySuccess('Users assigned successfully');
      setAssignModalVisible(false);
      assignForm.resetFields();
      loadZones();
    } catch (error: any) {
      message.error(error.message || 'Failed to assign users');
    }
  };

  const handleDelete = (zone: ZoneConfig) => {
    Modal.confirm({
      title: 'Delete Zone',
      content: `Are you sure you want to delete "${zone.zone_name}"? This action cannot be undone.`,
      okText: 'Delete',
      okType: 'danger',
      onOk: async () => {
        try {
          await ZoneApiService.deleteZone(zone.zone_id);
          notifySuccess('Zone deleted successfully');
          loadZones();
          loadHierarchy();
        } catch (error: any) {
          message.error(error.message || 'Failed to delete zone');
        }
      }
    });
  };

  const columns: ProColumns<ZoneConfig>[] = [
    {
      title: 'Zone Code',
      dataIndex: 'zone_code',
      key: 'zone_code',
      width: 120,
      render: (text: string) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Zone Name',
      dataIndex: 'zone_name',
      key: 'zone_name',
      width: 200,
    },
    {
      title: 'Type',
      dataIndex: 'zone_type',
      key: 'zone_type',
      width: 150,
      render: (type: string) => (
        <Tag color={ZoneApiService.getZoneTypeColor(type)} icon={getZoneTypeIcon(type)}>
          {zoneTypes.find(t => t.value === type)?.label || type}
        </Tag>
      ),
    },
    {
      title: 'Parent Zone',
      dataIndex: 'parent_zone_name',
      key: 'parent_zone_name',
      width: 150,
      render: (name: string) => name || '-',
    },
    {
      title: 'Users',
      dataIndex: 'total_users',
      key: 'total_users',
      width: 80,
      render: (count: number) => (
          <Tag icon={<UserOutlined />} color="success">{count}</Tag>
      ),
    },
    {
      title: 'Clients',
      dataIndex: 'total_clients',
      key: 'total_clients',
      width: 80,
      render: (count: number) => (
          <Tag icon={<TeamOutlined />} color="processing">{count}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive: boolean) => (
        <Badge
          status={isActive ? 'success' : 'error'}
          text={isActive ? 'Active' : 'Inactive'}
        />
      ),
    },
    {
      title: 'Created',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date: string) => dayjs(date).format('DD MMM YYYY'),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: ZoneConfig) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingZone(record);
              form.setFieldsValue({
                ...record,
                geographic_bounds: record.geographic_bounds ? 
                  JSON.stringify(record.geographic_bounds, null, 2) : '',
                supported_business_types: record.business_rules?.supported_business_types || [],
                min_amount: record.transaction_limits?.min_amount || 0,
                max_amount: record.transaction_limits?.max_amount || 0
              });
              setModalVisible(true);
            }}
          />
          <Button
            icon={<UserOutlined />}
            size="small"
            onClick={() => {
              setSelectedZone(record);
              setAssignModalVisible(true);
            }}
          />
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={async () => {
              setSelectedZone(record);
              await loadStatistics(record.zone_id);
              setStatisticsModalVisible(true);
            }}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDelete(record)}
          />
        </Space>
      ),
    },
  ];

  // Calculate zone metrics
  const zoneMetrics = [
    {
      label: 'Total Zones',
      value: zones.length,
      status: 'success'
    },
    {
      label: 'Active Zones',
      value: zones.filter(z => z.is_active).length,
      status: zones.filter(z => z.is_active).length > 0 ? 'success' : 'warning'
    },
    {
      label: 'Total Users',
      value: zones.reduce((sum, z) => sum + z.total_users, 0),
      status: 'success'
    },
    {
      label: 'Total Clients',
      value: zones.reduce((sum, z) => sum + z.total_clients, 0),
      status: 'success'
    }
  ];

  return (
    <CentralPageContainer withBackground title="Zone Configuration" subTitle="Manage zone-based access control and hierarchy">
      <div className="header-actions">
        <div>
          <CentralTitle level={3}>Zone Configuration</CentralTitle>
          <CentralText type="secondary">Manage zone-based access control and hierarchy</CentralText>
        </div>
        <ResponsiveHeaderActions
          primary={[{ key: 'refresh', label: 'Refresh', icon: <SyncOutlined />, onClick: () => { loadZones(); loadHierarchy(); } }]}
          secondary={[{ key: 'add', label: 'Add Zone', icon: <PlusOutlined />, onClick: () => { setEditingZone(null); form.resetFields(); setModalVisible(true); } }]}
        />
      </div>

      <Spin spinning={loading}>
        {/* Zone Metrics */}
        <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]} >
          {zoneMetrics.map((metric, index) => (
            <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard} key={index}>
              <Card>
                <Space direction="vertical">
                  <CentralText strong>{metric.label}</CentralText>
                  <Statistic title="" value={metric.value} />
                  <Progress
                    type="circle"
                    percent={Math.min((metric.value / 10) * 100, 100)}
                    width={60}
                    status={metric.status as any}
                  />
                </Space>
              </Card>
            </ResponsiveCol>
          ))}
        </ResponsiveRow>

        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab="Zone Hierarchy" key="hierarchy">
            <Card title="Zone Hierarchy Tree">
              <Tree
                treeData={hierarchyData}
                showLine={{ showLeafIcon: false }}
                defaultExpandAll
                
              />
            </Card>
          </Tabs.TabPane>

          <Tabs.TabPane tab="All Zones" key="zones">
            <CentralProTable<ZoneConfig>
              id="zones:config"
              columns={columns}
              dataSource={zones}
              loading={loading}
              rowKey="zone_id"
              search={false}
              toolBarRender={() => [
                <Button key="refresh" icon={<SyncOutlined />} onClick={loadZones}>
                  Refresh
                </Button>
              ]}
              pagination={{
                pageSize: 20,
                showSizeChanger: true
              }}
              scroll={{ x: 1200 }}
              className="transaction-table"
              onRow={(record) => ({ onClick: () => { if (responsive.isMobile) { setSelectedZone(record); setDetailOpen(true); } } })}
            />
          </Tabs.TabPane>
        </Tabs>
      </Spin>

      {/* Add/Edit Zone Modal */}
      <Modal
        title={`${editingZone ? 'Edit' : 'Add'} Zone`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingZone(null);
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
          <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="zone_name"
                label="Zone Name"
                rules={[{ required: true, message: 'Please enter zone name' }]}
              >
                <Input placeholder="e.g., North Zone" />
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="zone_code"
                label="Zone Code"
                rules={[
                  { required: true, message: 'Please enter zone code' },
                  { pattern: /^[A-Z0-9_]{2,20}$/, message: 'Code must be 2-20 uppercase letters, numbers, or underscores' }
                ]}
              >
                <Input placeholder="e.g., NORTH_01" />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="zone_type"
                label="Zone Type"
                rules={[{ required: true, message: 'Please select zone type' }]}
              >
                <Select placeholder="Select zone type">
                  {zoneTypes.map(type => (
                    <Option key={type.value} value={type.value}>
                      <Space>
                        {getZoneTypeIcon(type.value)}
                        {type.label}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="parent_zone_id"
                label="Parent Zone"
              >
                <Select allowClear placeholder="Select parent zone">
                  {zones.filter(z => z.zone_id !== editingZone?.zone_id).map(zone => (
                    <Option key={zone.zone_id} value={zone.zone_id}>
                      {zone.zone_name} ({zone.zone_code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <Form.Item
            name="description"
            label="Description"
          >
            <CentralTextArea rows={3} placeholder="Optional description for this zone" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingZone ? 'Update Zone' : 'Create Zone'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Assign Users Modal */}
      <Modal
        title={`Assign to Zone: ${selectedZone?.zone_name}`}
        open={assignModalVisible}
        onCancel={() => {
          setAssignModalVisible(false);
          setSelectedZone(null);
          assignForm.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={assignForm}
          layout="vertical"
          onFinish={handleAssignUsers}
        >
          <Form.Item
            name="user_ids"
            label="Select Users"
            rules={[{ required: true, message: 'Please select users' }]}
          >
            <Select mode="multiple" placeholder="Select users">
              <Option value={1}>John Doe (john@example.com)</Option>
              <Option value={2}>Jane Smith (jane@example.com)</Option>
              <Option value={3}>Admin User (admin@example.com)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="access_level"
            label="Access Level"
            rules={[{ required: true, message: 'Please select access level' }]}
            initialValue="VIEW"
          >
            <Select>
              {accessLevels.map(level => (
                <Option key={level.value} value={level.value}>
                  <Tag color={level.color}>{level.label}</Tag>
                  - {level.description}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit">
              Assign Users
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* Zone Statistics Modal */}
      <Modal
        title={`Statistics - ${selectedZone?.zone_name}`}
        open={statisticsModalVisible}
        onCancel={() => {
          setStatisticsModalVisible(false);
          setStatistics(null);
          setSelectedZone(null);
        }}
        footer={[
          <Button key="close" onClick={() => setStatisticsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {statistics && (
          <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Card size="small">
                <Statistic
                  title="Total Users"
                  value={statistics.total_users}
                  prefix={<UserOutlined />}
                />
              </Card>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Card size="small">
                <Statistic
                  title="Total Clients"
                  value={statistics.total_clients}
                  prefix={<TeamOutlined />}
                />
              </Card>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Card size="small">
                <Statistic
                  title="Child Zones"
                  value={statistics.child_zones}
                  prefix={<HolderOutlined />}
                />
              </Card>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Card size="small">
                <Statistic
                  title="Active Restrictions"
                  value={statistics.active_restrictions}
                  prefix={<SafetyOutlined />}
                />
              </Card>
            </ResponsiveCol>
          </ResponsiveRow>
        )}
      </Modal>
    </CentralPageContainer>
  );
};

export default ZoneConfigurationPage;
