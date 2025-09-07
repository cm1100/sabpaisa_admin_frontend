/**
 * Exception Queue Page
 * Shows transactions requiring manual intervention based on <5min exception detection requirement
 * Accessible to operations_manager role
 */
'use client';

import React, { useState, useEffect } from 'react';
import type { ProColumns } from '@/components/ui';
// Removed pro-components import - using centralized components
import { Alert, CentralBadge as Badge, CentralButton as Button, StyledCard as Card, CentralPageContainer, CentralProTable, CentralTextArea, Divider, Form, Input, Modal, PageContainer, ProTable, Progress, Select, StyledSpace as Space, StyledStatistic as Statistic, CentralTag as Tag, Timeline, Tooltip, App, CentralText as Text } from '@/components/ui';
import ResponsiveHeaderActions from '@/components/common/ResponsiveHeaderActions';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  FireOutlined,
  BugOutlined,
  DollarOutlined,
  RocketOutlined,
  ThunderboltOutlined,
  WarningOutlined,
  SolutionOutlined
} from '@ant-design/icons';
import { transactionService } from '@/services/api/transactionService';
import type { ITransaction } from '@/types/transaction';
import dayjs from 'dayjs';
import { notifySuccess } from '@/utils/notify';
import duration from 'dayjs/plugin/duration';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(duration);
dayjs.extend(relativeTime);

// Removed Typography destructuring - using centralized components
// Replaced by CentralTextArea
const { Option } = Select;

interface ExceptionTransaction extends ITransaction {
  exceptionType: 'TIMEOUT' | 'DUPLICATE' | 'AMOUNT_MISMATCH' | 'STUCK_PENDING' | 'REFUND_FAILED';
  exceptionDuration: number; // in minutes
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  assignedTo?: string;
  resolutionStatus?: 'PENDING' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED';
}

const ExceptionQueuePage: React.FC = () => {
  const { message } = App.useApp();
  const [exceptions, setExceptions] = useState<ExceptionTransaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedException, setSelectedException] = useState<ExceptionTransaction | null>(null);
  const [resolveModalVisible, setResolveModalVisible] = useState(false);
  const [escalateModalVisible, setEscalateModalVisible] = useState(false);
  const [resolveForm] = Form.useForm();
  const [escalateForm] = Form.useForm();
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    critical: 0,
    pending: 0,
    inProgress: 0,
    resolved: 0,
    avgResolutionTime: 0,
    slaBreached: 0
  });

  const fetchExceptions = async () => {
    setLoading(true);
    try {
      // Fetch pending transactions that have been stuck for >5 minutes
      const [pendingResponse, failedResponse] = await Promise.all([
        transactionService.getAll({
          status: 'PENDING',
          page: 1,
          page_size: 100,
          date_from: dayjs().subtract(24, 'hours').toISOString(),
          date_to: dayjs().toISOString()
        }),
        transactionService.getAll({
          status: 'FAILED',
          page: 1,
          page_size: 50,
          date_from: dayjs().subtract(24, 'hours').toISOString(),
          date_to: dayjs().toISOString()
        })
      ]);

      const pendingTxns = pendingResponse.results || [];
      const failedTxns = failedResponse.results || [];

      // Filter and categorize exceptions
      const exceptionsList: ExceptionTransaction[] = [];
      const now = dayjs();

      // Check pending transactions for timeout (>5 minutes as per requirement)
      pendingTxns.forEach((txn: ITransaction) => {
        const transTime = dayjs(txn.trans_date);
        const duration = now.diff(transTime, 'minute');
        
        if (duration > 5) {
          const exception: ExceptionTransaction = {
            ...txn,
            exceptionType: duration > 30 ? 'STUCK_PENDING' : 'TIMEOUT',
            exceptionDuration: duration,
            priority: duration > 60 ? 'HIGH' : duration > 30 ? 'MEDIUM' : 'LOW',
            resolutionStatus: 'PENDING'
          };
          exceptionsList.push(exception);
        }
      });

      // Check for amount mismatches and other exceptions
      failedTxns.forEach((txn: ITransaction) => {
        if (txn.pg_message?.includes('duplicate') || txn.bank_message?.includes('duplicate')) {
          const exception: ExceptionTransaction = {
            ...txn,
            exceptionType: 'DUPLICATE',
            exceptionDuration: now.diff(dayjs(txn.trans_date), 'minute'),
            priority: 'MEDIUM',
            resolutionStatus: 'PENDING'
          };
          exceptionsList.push(exception);
        }
      });

      // Sort by priority and duration
      exceptionsList.sort((a, b) => {
        const priorityOrder = { HIGH: 0, MEDIUM: 1, LOW: 2 };
        if (a.priority !== b.priority) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return b.exceptionDuration - a.exceptionDuration;
      });

      setExceptions(exceptionsList);

      // Calculate statistics
      const critical = exceptionsList.filter(e => e.priority === 'HIGH').length;
      const pending = exceptionsList.filter(e => e.resolutionStatus === 'PENDING').length;
      const inProgress = exceptionsList.filter(e => e.resolutionStatus === 'IN_PROGRESS').length;
      const resolved = exceptionsList.filter(e => e.resolutionStatus === 'RESOLVED').length;
      const slaBreached = exceptionsList.filter(e => e.exceptionDuration > 30).length;

      setStats({
        total: exceptionsList.length,
        critical,
        pending,
        inProgress,
        resolved,
        avgResolutionTime: 15, // Mock average resolution time
        slaBreached
      });
    } catch (error: any) {
      console.error('Failed to fetch exceptions:', error);
      message.error(error?.message || 'Failed to load exception queue');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExceptions();
    
    if (autoRefresh) {
      const interval = setInterval(fetchExceptions, 30000); // Refresh every 30 seconds
      return () => clearInterval(interval);
    }
    return undefined;
  }, [autoRefresh]);

  const getExceptionIcon = (type: string) => {
    switch (type) {
      case 'TIMEOUT':
        return <ClockCircleOutlined  />;
      case 'DUPLICATE':
        return <ExclamationCircleOutlined  />;
      case 'AMOUNT_MISMATCH':
        return <DollarOutlined  />;
      case 'STUCK_PENDING':
        return <BugOutlined  />;
      case 'REFUND_FAILED':
        return <WarningOutlined  />;
      default:
        return <ExclamationCircleOutlined />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'red';
      case 'MEDIUM':
        return 'orange';
      case 'LOW':
        return 'blue';
      default:
        return 'default';
    }
  };

  const handleResolve = (exception: ExceptionTransaction) => {
    setSelectedException(exception);
    setResolveModalVisible(true);
  };

  const handleEscalate = (exception: ExceptionTransaction) => {
    setSelectedException(exception);
    setEscalateModalVisible(true);
  };

  const confirmResolve = async () => {
    try {
      const values = await resolveForm.validateFields();
      // In production, this would update the transaction status
      notifySuccess('Exception resolved successfully');
      setResolveModalVisible(false);
      resolveForm.resetFields();
      fetchExceptions();
    } catch (error: any) {
      message.error(error?.message || 'Failed to resolve exception');
    }
  };

  const confirmEscalate = async () => {
    try {
      const values = await escalateForm.validateFields();
      // In production, this would escalate to higher level
      notifySuccess('Exception escalated successfully');
      setEscalateModalVisible(false);
      escalateForm.resetFields();
      fetchExceptions();
    } catch (error: any) {
      message.error(error?.message || 'Failed to escalate exception');
    }
  };

  const columns: ProColumns<ExceptionTransaction>[] = [
    {
      title: 'Priority',
      key: 'priority',
      width: 100,
      fixed: 'left',
      filters: [
        { text: 'High', value: 'HIGH' },
        { text: 'Medium', value: 'MEDIUM' },
        { text: 'Low', value: 'LOW' }
      ],
      render: (_: any, record: ExceptionTransaction) => (
        <Tag color={getPriorityColor(record.priority)}>
          {record.priority === 'HIGH' && <FireOutlined />}
          {record.priority}
        </Tag>
      )
    },
    {
      title: 'Exception Type',
      key: 'exceptionType',
      width: 150,
      filters: [
        { text: 'Timeout', value: 'TIMEOUT' },
        { text: 'Stuck Pending', value: 'STUCK_PENDING' },
        { text: 'Duplicate', value: 'DUPLICATE' },
        { text: 'Amount Mismatch', value: 'AMOUNT_MISMATCH' },
        { text: 'Refund Failed', value: 'REFUND_FAILED' }
      ],
      render: (_: any, record: ExceptionTransaction) => (
        <Space>
          {getExceptionIcon(record.exceptionType)}
          <Text>{record.exceptionType.replace('_', ' ')}</Text>
        </Space>
      )
    },
    {
      title: 'Transaction ID',
      dataIndex: 'txn_id',
      key: 'txn_id',
      width: 180,
      copyable: true,
      render: (id: string) => (
        <Text copyable >
          {id}
        </Text>
      )
    },
    {
      title: 'Duration',
      key: 'duration',
      width: 120,
      sorter: (a: any, b: any) => a.exceptionDuration - b.exceptionDuration,
      render: (_: any, record: ExceptionTransaction) => {
        const isBreached = record.exceptionDuration > 30;
        return (
          <Space direction="vertical" size={0}>
            <Text type={isBreached ? 'danger' : 'warning'}>
              {record.exceptionDuration < 60 
                ? `${record.exceptionDuration} mins`
                : `${Math.floor(record.exceptionDuration / 60)}h ${record.exceptionDuration % 60}m`
              }
            </Text>
            {isBreached && (
              <Text type="danger" >
                SLA Breached
              </Text>
            )}
          </Space>
        );
      }
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      align: 'right',
      render: (amount: number) => (
        <Text strong>
          ₹{Number(amount || 0).toLocaleString('en-IN')}
        </Text>
      )
    },
    {
      title: 'Customer',
      dataIndex: 'customer_name',
      key: 'customer_name',
      ellipsis: true,
      render: (name: string, record: ExceptionTransaction) => (
        <Space direction="vertical" size={0}>
          <Text>{name || 'N/A'}</Text>
          <Text type="secondary" >
            {record.customer_mobile || 'No contact'}
          </Text>
        </Space>
      )
    },
    {
      title: 'Status',
      key: 'resolutionStatus',
      width: 130,
      render: (_: any, record: ExceptionTransaction) => {
        const statusConfig = {
          PENDING: { color: 'default', icon: <ClockCircleOutlined /> },
          IN_PROGRESS: { color: 'processing', icon: <SyncOutlined spin /> },
          RESOLVED: { color: 'success', icon: <CheckCircleOutlined /> },
          ESCALATED: { color: 'warning', icon: <RocketOutlined /> }
        };
        const config = statusConfig[(record.resolutionStatus || 'PENDING') as keyof typeof statusConfig];
        return (
          <Badge
            status={config.color as any}
            text={
              <Space>
                {config.icon}
                <span>{record.resolutionStatus || 'PENDING'}</span>
              </Space>
            }
          />
        );
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 180,
      fixed: 'right',
      render: (_: any, record: ExceptionTransaction) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleResolve(record)}
            disabled={record.resolutionStatus === 'RESOLVED'}
          >
            Resolve
          </Button>
          <Button
            size="small"
            icon={<RocketOutlined />}
            onClick={() => handleEscalate(record)}
            disabled={record.resolutionStatus === 'ESCALATED'}
          >
            Escalate
          </Button>
        </Space>
      )
    }
  ];

  return (
    <CentralPageContainer
      title="Exception Queue"
      subTitle="Transactions requiring manual intervention (<5min exception detection)"
      tags={<Tag color="red">Operations Manager Only</Tag>}
      extra={
        <ResponsiveHeaderActions
          primary={[{ key: 'refresh', label: 'Refresh Now', icon: <ThunderboltOutlined />, onClick: fetchExceptions, disabled: loading }]}
          secondary={[
            { key: 'auto', label: autoRefresh ? 'Auto-refresh ON' : 'Auto-refresh OFF', icon: <SyncOutlined />, onClick: () => setAutoRefresh(!autoRefresh) },
            { key: 'critical', label: `${stats.critical} Critical`, icon: <FireOutlined /> },
          ]}
        />
      }
    >
      <Space direction="vertical" size="large" >
        {/* Critical Alert */}
        {stats.slaBreached > 0 && (
          <Alert
            message={`SLA Breach Alert: ${stats.slaBreached} exceptions exceeded 30-minute resolution time`}
            description="These transactions require immediate attention to maintain 97% SLA adherence target."
            type="error"
            showIcon
            icon={<ExclamationCircleOutlined />}
            action={
              <Button size="small" danger>
                View SLA Breached
              </Button>
            }
          />
        )}

        {/* Statistics Dashboard */}
        <ResponsiveRow gutter={16}>
          <ResponsiveCol xs={24} sm={12} md={6}>
            <Card >
              <Statistic
                title="Total Exceptions"
                value={stats.total}
                prefix={<ExclamationCircleOutlined />}
              />
              <Progress 
                percent={stats.total > 0 ? Math.min((stats.resolved / stats.total) * 100, 100) : 100}
                strokeColor="var(--app-colorSuccess)"
                size="small"
              />
            </Card>
          </ResponsiveCol>
          <ResponsiveCol xs={24} sm={12} md={6}>
            <Card >
              <Statistic
                title="Critical Priority"
                value={stats.critical}
                prefix={<FireOutlined />}
              />
              {stats.critical > 0 && (
                <Text type="danger" >
                  Requires immediate action
                </Text>
              )}
            </Card>
          </ResponsiveCol>
          <ResponsiveCol xs={24} sm={12} md={6}>
            <Card >
              <Statistic
                title="SLA Breached"
                value={stats.slaBreached}
                prefix={<ClockCircleOutlined />}
              />
              <Text type="secondary" >
                Target: &lt;5min detection, 97% SLA
              </Text>
            </Card>
          </ResponsiveCol>
          <ResponsiveCol xs={24} sm={12} md={6}>
            <Card >
              <Statistic
                title="Avg Resolution"
                value={stats.avgResolutionTime}
                suffix="min"
                prefix={<SolutionOutlined />}
              />
              <Progress 
                percent={Math.min((30 - stats.avgResolutionTime) / 30 * 100, 100)}
                strokeColor={stats.avgResolutionTime < 30 ? 'var(--app-colorSuccess)' : 'var(--app-colorError)'}
                showInfo={false}
                size="small"
              />
            </Card>
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Exception Queue Table */}
        <CentralProTable<ExceptionTransaction>
          id="transactions:exceptions"
          columns={columns}
          dataSource={exceptions}
          rowKey="txn_id"
          loading={loading}
          className="transaction-table"
          search={false}
          pagination={{
            pageSize: 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total: number) => `Total ${total} exceptions`
          }}
          headerTitle={
            <Space>
              <ExclamationCircleOutlined />
              <span>Exception Queue</span>
              {autoRefresh && (
                <Badge status="processing" text="Auto-refreshing" />
              )}
            </Space>
          }
          scroll={{ x: 1300 }}
          rowClassName={(record: ExceptionTransaction) => {
            if (record.priority === 'HIGH') return 'high-priority-row';
            if (record.exceptionDuration > 30) return 'sla-breached-row';
            return '';
          }}
        />
      </Space>

      {/* Resolve Modal */}
      <Modal
        title="Resolve Exception"
        open={resolveModalVisible}
        onOk={confirmResolve}
        onCancel={() => {
          setResolveModalVisible(false);
          resolveForm.resetFields();
        }}
        width={600}
      >
        <Form form={resolveForm} layout="vertical">
          <Alert
            message={`Resolving exception for transaction: ${selectedException?.txn_id}`}
            type="info"
            showIcon
            
          />
          
          <Form.Item
            name="resolution"
            label="Resolution Action"
            rules={[{ required: true, message: 'Please select resolution action' }]}
          >
            <Select placeholder="Select resolution action">
              <Option value="retry">Retry Transaction</Option>
              <Option value="refund">Initiate Refund</Option>
              <Option value="manual_success">Mark as Success</Option>
              <Option value="manual_failed">Mark as Failed</Option>
              <Option value="contact_bank">Contact Bank</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="notes"
            label="Resolution Notes"
            rules={[
              { required: true, message: 'Please provide resolution notes' },
              { min: 10, message: 'Notes must be at least 10 characters' }
            ]}
          >
            <CentralTextArea 
              rows={4} 
              placeholder="Describe the resolution steps taken..."
            />
          </Form.Item>
          
          <Form.Item
            name="notify_customer"
            label="Notify Customer"
            valuePropName="checked"
          >
            <Select defaultValue="no">
              <Option value="no">No Notification</Option>
              <Option value="sms">SMS</Option>
              <Option value="email">Email</Option>
              <Option value="both">SMS & Email</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Escalate Modal */}
      <Modal
        title="Escalate Exception"
        open={escalateModalVisible}
        onOk={confirmEscalate}
        onCancel={() => {
          setEscalateModalVisible(false);
          escalateForm.resetFields();
        }}
        width={600}
      >
        <Form form={escalateForm} layout="vertical">
          <Alert
            message={`Escalating exception for transaction: ${selectedException?.txn_id}`}
            type="warning"
            showIcon
            
          />
          
          <Form.Item
            name="escalate_to"
            label="Escalate To"
            rules={[{ required: true, message: 'Please select escalation target' }]}
          >
            <Select placeholder="Select team/person to escalate">
              <Option value="tech_lead">Technical Lead</Option>
              <Option value="manager">Operations Manager</Option>
              <Option value="bank_ops">Bank Operations Team</Option>
              <Option value="gateway_support">Gateway Support</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="priority"
            label="Update Priority"
            rules={[{ required: true }]}
            initialValue="HIGH"
          >
            <Select>
              <Option value="HIGH">High</Option>
              <Option value="CRITICAL">Critical</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            name="reason"
            label="Escalation Reason"
            rules={[
              { required: true, message: 'Please provide escalation reason' },
              { min: 20, message: 'Reason must be at least 20 characters' }
            ]}
          >
            <CentralTextArea 
              rows={4} 
              placeholder="Explain why this needs escalation..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </CentralPageContainer>
  );
};

export default ExceptionQueuePage;
