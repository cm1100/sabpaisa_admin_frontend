'use client';

import React, { useState, useEffect } from 'react';
import { CentralAlert as Alert, CentralBadge as Badge, CentralButton as Button, CentralProTable, CentralProgress as Progress, CentralTag as Tag, CentralText, CentralTextArea, CentralTitle, DatePicker, Descriptions, Form, Input, Modal, Select, Spin, StyledCard as Card, StyledSpace as Space, Tabs, TimePicker, Tooltip, App, CentralPageContainer } from '@/components/ui';
import { notifySuccess, notifyWarning } from '@/utils/notify';
import type { ProColumns } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import {
  UserOutlined,
  ClockCircleOutlined,
  GlobalOutlined,
  EditOutlined,
  PlusOutlined,
  ExclamationCircleOutlined,
  DeleteOutlined,
  CalendarOutlined,
  SafetyOutlined,
  EyeOutlined,
  SyncOutlined
} from '@ant-design/icons';
import ZoneApiService, { 
  UserZoneAccess,
  ZoneConfig,
  CreateUserAccessRequest,
  ExtendAccessRequest,
  BulkUpdateAccessRequest
} from '@/services/api/ZoneApiService';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = TimePicker;
// Replaced by CentralTextArea
// Typography components imported directly from centralized UI

const UserZoneAccessPage: React.FC = () => {
  const { message } = App.useApp();
  const [userAccess, setUserAccess] = useState<UserZoneAccess[]>([]);
  const [zones, setZones] = useState<ZoneConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailsModalVisible, setDetailsModalVisible] = useState(false);
  const [editingAccess, setEditingAccess] = useState<UserZoneAccess | null>(null);
  const [selectedAccess, setSelectedAccess] = useState<UserZoneAccess | null>(null);
  const [selectedZone, setSelectedZone] = useState<string>('');
  const [selectedAccessLevel, setSelectedAccessLevel] = useState<string>('');
  const [selectedRows, setSelectedRows] = useState<UserZoneAccess[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
  const [activeTab, setActiveTab] = useState('access');
  const [form] = Form.useForm();

  const accessLevels = ZoneApiService.getAccessLevels();
  const weekDays = [
    { value: 0, label: 'Monday' },
    { value: 1, label: 'Tuesday' },
    { value: 2, label: 'Wednesday' },
    { value: 3, label: 'Thursday' },
    { value: 4, label: 'Friday' },
    { value: 5, label: 'Saturday' },
    { value: 6, label: 'Sunday' }
  ];

  useEffect(() => {
    loadUserAccess();
    loadZones();
  }, [selectedZone, selectedAccessLevel]);

  const loadUserAccess = async () => {
    try {
      setLoading(true);
      const params: any = { page_size: 100 };
      if (selectedZone) params.zone_id = selectedZone;
      if (selectedAccessLevel) params.access_level = selectedAccessLevel;
      
      const response = await ZoneApiService.getUserAccess(params);
      const data = response.data;
      setUserAccess(data.results || (data as any) || []);
    } catch (error: any) {
      message.error(error?.message || 'Failed to load user access records');
    } finally {
      setLoading(false);
    }
  };

  const loadZones = async () => {
    try {
      const response = await ZoneApiService.getZones({ is_active: true, page_size: 100 } as any);
      const data = response.data;
      setZones(data.results || (data as any) || []);
    } catch (error) {
      console.error('Failed to load zones');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const data: CreateUserAccessRequest = {
        user_id: values.user_id,
        zone_id: values.zone_id,
        access_level: values.access_level,
        expires_at: values.expires_at ? values.expires_at.toISOString() : undefined,
        time_restrictions: {
          allowed_days: values.allowed_days || [],
          allowed_hours: values.allowed_hours ? {
            start: values.allowed_hours[0].format('HH:mm:ss'),
            end: values.allowed_hours[1].format('HH:mm:ss')
          } : undefined
        },
        ip_restrictions: values.ip_restrictions ? 
          values.ip_restrictions.split('\n').filter((ip: string) => ip.trim()).map((ip: string) => ip.trim()) : 
          []
      };

      if (editingAccess) {
        await ZoneApiService.updateUserAccess(editingAccess.access_id, data);
            notifySuccess('User access updated');
      } else {
        await ZoneApiService.createUserAccess(data);
            notifySuccess('User access granted');
      }
      
      setModalVisible(false);
      setEditingAccess(null);
      form.resetFields();
      loadUserAccess();
    } catch (error: any) {
      message.error(error.message || 'Failed to save user access');
    }
  };

  const handleExtendAccess = async (accessId: number, days: number) => {
    try {
      const extendData: ExtendAccessRequest = { days };
      await ZoneApiService.extendAccess(accessId, extendData);
      notifySuccess(`Access extended by ${days} days`);
      loadUserAccess();
    } catch (error: any) {
      message.error(error.message || 'Failed to extend access');
    }
  };

  const handleBulkUpdateAccess = async (newAccessLevel: string) => {
    if (selectedRows.length === 0) {
      notifyWarning('Please select at least one record');
      return;
    }

    try {
      const bulkData: BulkUpdateAccessRequest = {
        access_ids: selectedRows.map(row => row.access_id),
        access_level: newAccessLevel as any
      };

      await ZoneApiService.bulkUpdateAccess(bulkData);
            notifySuccess(`Updated ${selectedRows.length} access records`);
      setSelectedRows([]);
      setSelectedRowKeys([]);
      loadUserAccess();
    } catch (error: any) {
      message.error(error.message || 'Failed to update access records');
    }
  };

  const handleDeleteAccess = (accessRecord: UserZoneAccess) => {
    Modal.confirm({
      title: 'Revoke Access',
      content: `Are you sure you want to revoke zone access for ${accessRecord.user_name}?`,
      okText: 'Revoke',
      okType: 'danger',
      onOk: async () => {
        try {
          await ZoneApiService.deleteUserAccess(accessRecord.access_id);
          notifySuccess('Access revoked successfully');
          loadUserAccess();
        } catch (error: any) {
          message.error(error.message || 'Failed to revoke access');
        }
      }
    });
  };

  const getExpiryStatus = (expiryDate?: string) => {
    if (!expiryDate) return { status: 'success', text: 'Never expires' };
    
    const expiry = dayjs(expiryDate);
    const now = dayjs();
    const daysUntilExpiry = expiry.diff(now, 'days');
    
    if (daysUntilExpiry < 0) {
      return { status: 'error', text: 'Expired' };
    } else if (daysUntilExpiry <= 7) {
      return { status: 'warning', text: `Expires in ${daysUntilExpiry} days` };
    } else {
      return { status: 'success', text: `Expires ${expiry.format('MMM DD, YYYY')}` };
    }
  };

  const columns: ProColumns<UserZoneAccess>[] = [
    {
      title: 'User',
      key: 'user',
      width: 200,
      render: (_: any, record: UserZoneAccess) => (
        <Space direction="vertical" size={0}>
          <CentralText strong>{record.user_name}</CentralText>
          <CentralText type="secondary" >ID: {record.user_id}</CentralText>
        </Space>
      ),
    },
    {
      title: 'Zone',
      key: 'zone',
      width: 200,
      render: (_: any, record: UserZoneAccess) => (
        <Space direction="vertical" size={0}>
          <CentralText strong>{record.zone_name}</CentralText>
          <Tag size="small" color="blue">{record.zone_code}</Tag>
        </Space>
      ),
    },
    {
      title: 'Access Level',
      dataIndex: 'access_level',
      key: 'access_level',
      width: 150,
      render: (level: string) => {
        const levelConfig = accessLevels.find(l => l.value === level);
        return (
          <Tag color={levelConfig?.color}>
            {levelConfig?.label || level}
          </Tag>
        );
      },
    },
    {
      title: 'Expiry Status',
      key: 'expiry_status',
      width: 200,
      render: (_: any, record: UserZoneAccess) => {
        const status = getExpiryStatus(record.expires_at);
        return (
          <Badge
            status={status.status as any}
            text={status.text}
          />
        );
      },
    },
    {
      title: 'Last Access',
      dataIndex: 'last_accessed',
      key: 'last_accessed',
      width: 150,
      render: (date?: string) => (
        date ? dayjs(date).format('MMM DD, HH:mm') : 'Never'
      ),
    },
    {
      title: 'Access Count',
      dataIndex: 'access_count',
      key: 'access_count',
      width: 100,
      align: 'center',
    },
    {
      title: 'Status',
      key: 'status',
      width: 120,
      render: (_: any, record: UserZoneAccess) => (
        <Space direction="vertical" size={0}>
          <Badge
            status={record.can_access_now ? 'success' : 'error'}
            text={record.can_access_now ? 'Active' : 'Restricted'}
          />
          {record.time_restrictions?.allowed_days && record.time_restrictions.allowed_days.length > 0 && (
            <Tag size="small" color="blue" icon={<CalendarOutlined />}>
              Time Restricted
            </Tag>
          )}
          {record.ip_restrictions && record.ip_restrictions.length > 0 && (
            <Tag size="small" color="orange" icon={<GlobalOutlined />}>
              IP Restricted
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      fixed: 'right' as const,
      render: (_: any, record: UserZoneAccess) => (
        <Space>
          <Button
            icon={<EyeOutlined />}
            size="small"
            onClick={() => {
              setSelectedAccess(record);
              setDetailsModalVisible(true);
            }}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            onClick={() => {
              setEditingAccess(record);
              form.setFieldsValue({
                user_id: record.user_id,
                zone_id: record.zone_id,
                access_level: record.access_level,
                expires_at: record.expires_at ? dayjs(record.expires_at) : null,
                allowed_days: record.time_restrictions?.allowed_days || [],
                allowed_hours: record.time_restrictions?.allowed_hours ? [
                  dayjs(record.time_restrictions.allowed_hours.start, 'HH:mm:ss'),
                  dayjs(record.time_restrictions.allowed_hours.end, 'HH:mm:ss')
                ] : null,
                ip_restrictions: record.ip_restrictions?.join('\n') || ''
              });
              setModalVisible(true);
            }}
          />
          <Button
            icon={<ClockCircleOutlined />}
            size="small"
            onClick={() => handleExtendAccess(record.access_id, 30)}
          />
          <Button
            icon={<DeleteOutlined />}
            size="small"
            danger
            onClick={() => handleDeleteAccess(record)}
          />
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[], selectedRows: UserZoneAccess[]) => {
      setSelectedRowKeys(selectedRowKeys);
      setSelectedRows(selectedRows);
    },
  };

  // Calculate access metrics
  const accessMetrics = [
    {
      label: 'Total Access Records',
      value: userAccess.length,
      status: 'success'
    },
    {
      label: 'Active Users',
      value: userAccess.filter(u => u.can_access_now && !u.is_expired).length,
      status: 'success'
    },
    {
      label: 'Expired Access',
      value: userAccess.filter(u => u.is_expired).length,
      status: userAccess.filter(u => u.is_expired).length > 0 ? 'warning' : 'success'
    },
    {
      label: 'Restricted Access',
      value: userAccess.filter(u => !u.can_access_now).length,
      status: 'warning'
    }
  ];

  return (
    <CentralPageContainer withBackground title="User Zone Access" subTitle="Grant, review, and manage user access to zones">
      <div >
        <div>
          <CentralTitle level={3}>User Zone Access</CentralTitle>
          <CentralText type="secondary">Manage user permissions and access to different zones</CentralText>
        </div>
        <Space>
          <Button icon={<SyncOutlined />} onClick={loadUserAccess}>
            Refresh
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingAccess(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Grant Access
          </Button>
        </Space>
      </div>

      <Spin spinning={loading}>
        {/* Access Metrics */}
        <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]} >
          {accessMetrics.map((metric, index) => (
            <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard} key={index}>
              <Card>
                <Space direction="vertical">
                  <CentralText strong>{metric.label}</CentralText>
                  <Statistic title="" value={metric.value} />
                  <Progress
                    type="circle"
                    percent={Math.min((metric.value / Math.max(userAccess.length, 1)) * 100, 100)}
                    width={60}
                    status={metric.status as any}
                  />
                </Space>
              </Card>
            </ResponsiveCol>
          ))}
        </ResponsiveRow>

        {/* Filters */}
        <Card >
          <ResponsiveRow justify="space-between" align="middle">
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Space>
                <Select
                  placeholder="Filter by zone"
                  
                  value={selectedZone || undefined}
                  onChange={setSelectedZone}
                  allowClear
                >
                  {zones.map(zone => (
                    <Option key={zone.zone_id} value={zone.zone_id}>
                      {zone.zone_name} ({zone.zone_code})
                    </Option>
                  ))}
                </Select>
                <Select
                  placeholder="Filter by access level"
                  
                  value={selectedAccessLevel || undefined}
                  onChange={setSelectedAccessLevel}
                  allowClear
                >
                  {accessLevels.map(level => (
                    <Option key={level.value} value={level.value}>{level.label}</Option>
                  ))}
                </Select>
              </Space>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              {selectedRows.length > 0 && (
                <Select
                  placeholder="Bulk update access level"
                  
                  onChange={handleBulkUpdateAccess}
                >
                  {accessLevels.map(level => (
                    <Option key={level.value} value={level.value}>
                      Update to {level.label}
                    </Option>
                  ))}
                </Select>
              )}
            </ResponsiveCol>
          </ResponsiveRow>
          {selectedRows.length > 0 && (
            <Alert
              message={`${selectedRows.length} records selected`}
              type="info"
              showIcon
              
            />
          )}
        </Card>

        {/* User Access Table */}
        <CentralProTable<UserZoneAccess>
          columns={columns}
          dataSource={userAccess}
          loading={loading}
          rowKey="access_id"
          rowSelection={rowSelection}
          search={false}
          toolBarRender={() => [
            <Button key="refresh" icon={<SyncOutlined />} onClick={loadUserAccess}>
              Refresh
            </Button>
          ]}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true
          }}
          scroll={{ x: 1400 }}
        />
      </Spin>

      {/* Grant/Edit Access Modal */}
      <Modal
        title={`${editingAccess ? 'Edit' : 'Grant'} Zone Access`}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingAccess(null);
          form.resetFields();
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="user_id"
                label="User"
                rules={[{ required: true, message: 'Please select user' }]}
              >
                <Select
                  showSearch
                  placeholder="Search and select user"
                  optionFilterProp="children"
                  disabled={!!editingAccess}
                >
                  <Option value={1}>John Doe (john@example.com)</Option>
                  <Option value={2}>Jane Smith (jane@example.com)</Option>
                  <Option value={3}>Bob Johnson (bob@example.com)</Option>
                  <Option value={4}>Alice Brown (alice@example.com)</Option>
                </Select>
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="zone_id"
                label="Zone"
                rules={[{ required: true, message: 'Please select zone' }]}
              >
                <Select
                  placeholder="Select zone"
                  disabled={!!editingAccess}
                >
                  {zones.map(zone => (
                    <Option key={zone.zone_id} value={zone.zone_id}>
                      {zone.zone_name} ({zone.zone_code})
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="access_level"
                label="Access Level"
                rules={[{ required: true, message: 'Please select access level' }]}
              >
                <Select>
                  {accessLevels.map(level => (
                    <Option key={level.value} value={level.value}>
                      <Space>
                        <Tag color={level.color}>{level.label}</Tag>
                        {level.description}
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <Form.Item
                name="expires_at"
                label="Access Expires At"
              >
                <DatePicker
                  showTime
                  
                  placeholder="Leave empty for permanent access"
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>
            </ResponsiveCol>
          </ResponsiveRow>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingAccess ? 'Update Access' : 'Grant Access'}
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Cancel
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Access Details Modal */}
      <Modal
        title={`Access Details - ${selectedAccess?.user_name}`}
        open={detailsModalVisible}
        onCancel={() => {
          setDetailsModalVisible(false);
          setSelectedAccess(null);
        }}
        footer={[
          <Button key="close" onClick={() => setDetailsModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        {selectedAccess && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="User ID">{selectedAccess.user_id}</Descriptions.Item>
            <Descriptions.Item label="User Name">{selectedAccess.user_name}</Descriptions.Item>
            <Descriptions.Item label="Zone">{selectedAccess.zone_name} ({selectedAccess.zone_code})</Descriptions.Item>
            <Descriptions.Item label="Access Level">
              <Tag color={ZoneApiService.getAccessLevelColor(selectedAccess.access_level)}>
                {selectedAccess.access_level}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Granted By">{selectedAccess.granted_by}</Descriptions.Item>
            <Descriptions.Item label="Granted At">
              {dayjs(selectedAccess.granted_at).format('DD MMM YYYY HH:mm')}
            </Descriptions.Item>
            <Descriptions.Item label="Expires At">
              {selectedAccess.expires_at ? 
                dayjs(selectedAccess.expires_at).format('DD MMM YYYY HH:mm') : 
                'Never'
              }
            </Descriptions.Item>
            <Descriptions.Item label="Last Accessed">
              {selectedAccess.last_accessed ? 
                dayjs(selectedAccess.last_accessed).format('DD MMM YYYY HH:mm') : 
                'Never'
              }
            </Descriptions.Item>
            <Descriptions.Item label="Access Count">{selectedAccess.access_count}</Descriptions.Item>
            <Descriptions.Item label="Can Access Now">
              <Badge
                status={selectedAccess.can_access_now ? 'success' : 'error'}
                text={selectedAccess.can_access_now ? 'Yes' : 'No'}
              />
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </CentralPageContainer>
  );
};

export default UserZoneAccessPage;
