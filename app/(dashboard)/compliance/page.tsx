'use client';

import React, { useState, useEffect } from 'react';
import { CentralAlert, CentralAvatar, CentralBadge, CentralButton, CentralProgress, CentralTable, CentralTag, CentralText, CentralTextArea, CentralTitle, DatePicker, Descriptions, Divider, Form, Input, List, Modal, Select, Spin, StyledCard, StyledSpace, StyledStatistic, Tabs, Timeline, App, theme, CentralPageContainer, SmartLoader } from '@/components/ui';
import type { ProColumns } from '@/components/ui';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  DownloadOutlined,
  AuditOutlined,
  SafetyOutlined,
  FileSearchOutlined,
  SecurityScanOutlined,
  UserOutlined,
  CalendarOutlined,
  FlagOutlined,
  WarningOutlined,
  AlertOutlined,
  SafetyCertificateOutlined,
  FileProtectOutlined,
  SyncOutlined
} from '@ant-design/icons';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { useResponsive } from '@/hooks/useResponsive';
import dayjs from 'dayjs';
import { notifySuccess } from '@/utils/notify';
import ComplianceApiService, {
  ComplianceDashboard,
  ComplianceAlert,
  SuspiciousTransaction,
  AuditLog,
  KYCSummary
} from '@/services/api/ComplianceApiService';

// Removed Typography destructuring - using centralized components
// Replaced by CentralTextArea
const { RangePicker } = DatePicker;
const { Option } = Select;
const { token } = theme.useToken();

const ComplianceAuditPage: React.FC = () => {
  const { message } = App.useApp();
  const responsive = useResponsive();
  const [activeTab, setActiveTab] = useState('overview');
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [auditDetailsModalVisible, setAuditDetailsModalVisible] = useState(false);
  const [alertModalVisible, setAlertModalVisible] = useState(false);
  const [selectedAudit, setSelectedAudit] = useState<AuditLog | null>(null);
  const [selectedAlert, setSelectedAlert] = useState<ComplianceAlert | null>(null);
  const [form] = Form.useForm();
  const [alertForm] = Form.useForm();
  
  // API Data States
  const [loading, setLoading] = useState(false);
  const [dashboard, setDashboard] = useState<ComplianceDashboard | null>(null);
  const [alerts, setAlerts] = useState<ComplianceAlert[]>([]);
  const [suspiciousTransactions, setSuspiciousTransactions] = useState<SuspiciousTransaction[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Fetch dashboard data
  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const resp = await ComplianceApiService.getDashboard();
      const data: any = (resp as any).data ?? resp;
      if (data) {
        setDashboard(data);
        setAlerts(data.recent_alerts || []);
        setSuspiciousTransactions(data.suspicious_transactions || []);
      }
    } catch (error: any) {
      message.error(error?.message || 'Failed to fetch compliance dashboard');
    } finally {
      setLoading(false);
    }
  };

  // Fetch alerts
  const fetchAlerts = async () => {
    try {
      const resp = await ComplianceApiService.getAlerts();
      const data: any = (resp as any).data ?? resp;
      if (data?.results) setAlerts(data.results);
      else if (Array.isArray(data)) setAlerts(data);
    } catch (error) {
      console.error('Failed to fetch alerts:', error);
    }
  };

  // Fetch suspicious transactions
  const fetchSuspiciousTransactions = async () => {
    try {
      const resp = await ComplianceApiService.getSuspiciousTransactions();
      const data: any = (resp as any).data ?? resp;
      if (data?.results) setSuspiciousTransactions(data.results);
      else if (Array.isArray(data)) setSuspiciousTransactions(data);
    } catch (error) {
      console.error('Failed to fetch suspicious transactions:', error);
    }
  };

  // Fetch audit logs
  const fetchAuditLogs = async () => {
    try {
      const resp = await ComplianceApiService.getAuditTrail();
      const data: any = (resp as any).data ?? resp;
      if (data?.results) setAuditLogs(data.results);
      else if (Array.isArray(data)) setAuditLogs(data);
    } catch (error) {
      console.error('Failed to fetch audit logs:', error);
    }
  };

  // Review alert
  const handleAlertReview = async (values: any) => {
    if (!selectedAlert) return;
    
    try {
      await ComplianceApiService.reviewAlert(selectedAlert.alert_id, {
        action: values.action,
        comments: values.comments
      });
      notifySuccess('Alert reviewed successfully');
      setAlertModalVisible(false);
      alertForm.resetFields();
      fetchAlerts();
      fetchDashboard();
    } catch (error: any) {
      message.error(error?.message || 'Failed to review alert');
    }
  };

  // Generate RBI Report
  const handleGenerateReport = async (values: any) => {
    try {
      await ComplianceApiService.generateRBIReport({
        report_type: values.reportType,
        start_date: values.dateRange[0].format('YYYY-MM-DD'),
        end_date: values.dateRange[1].format('YYYY-MM-DD')
      });
      notifySuccess('Report generation started');
      setReportModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      message.error(error?.message || 'Failed to generate report');
    }
  };

  useEffect(() => {
    fetchDashboard();
    fetchAuditLogs();
    fetchAlerts();
    fetchSuspiciousTransactions();
  }, []);

  // Compute compliance metrics
  const complianceMetrics = dashboard ? [
    { 
      label: 'Compliance Score', 
      value: dashboard.compliance_score, 
      status: dashboard.compliance_score >= 80 ? 'success' : 'warning' 
    },
    { 
      label: 'KYC Verification Rate', 
      value: dashboard.kyc_summary.verification_rate, 
      status: dashboard.kyc_summary.verification_rate >= 75 ? 'success' : 'warning' 
    },
    { 
      label: 'Pending Reviews', 
      value: dashboard.pending_reviews, 
      status: dashboard.pending_reviews > 20 ? 'warning' : 'success' 
    },
    { 
      label: 'High Risk Alerts', 
      value: dashboard.alerts_by_severity?.HIGH || 0, 
      status: (dashboard.alerts_by_severity?.HIGH || 0) > 5 ? 'error' : 'success' 
    }
  ] : [];

  const auditColumns = [
    {
      title: 'Timestamp',
      dataIndex: 'timestamp',
      key: 'timestamp',
      width: 180,
      render: (timestamp: string) => (
        <StyledSpace direction="vertical" size="small">
          <CentralText>{dayjs(timestamp as string).format('DD MMM YYYY')}</CentralText>
          <CentralText type="secondary">
            {dayjs(timestamp as string).format('HH:mm:ss')}
          </CentralText>
        </StyledSpace>
      ),
      sorter: true
    },
    {
      title: 'User',
      dataIndex: 'user_name',
      key: 'user_name',
      width: 150,
      render: (user: string) => (
        <StyledSpace>
          <CentralAvatar size="small" icon={<UserOutlined />} />
          <CentralText>{user || 'System'}</CentralText>
        </StyledSpace>
      )
    },
    {
      title: 'Action',
      dataIndex: 'action',
      key: 'action',
      width: 150,
      render: (action: string) => {
        const actionColors: Record<string, string> = {
          create: 'green',
          update: 'blue',
          delete: 'red',
          view: 'default',
          export: 'purple',
          login: 'cyan'
        };
        return <CentralTag color={actionColors[action as string] || 'default'}>{action}</CentralTag>;
      }
    },
    {
      title: 'Entity',
      dataIndex: 'entity_type',
      key: 'entity_type',
      width: 120
    },
    {
      title: 'Entity ID',
      dataIndex: 'entity_id',
      key: 'entity_id',
      width: 150,
      render: (id: string) => <CentralText code>{id}</CentralText>
    },
    {
      title: 'IP Address',
      dataIndex: 'ip_address',
      key: 'ip_address',
      width: 120
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <CentralButton
          type="link"
          size="small"
          onClick={() => {
            setSelectedAudit(record);
            setAuditDetailsModalVisible(true);
          }}
        >
          Details
        </CentralButton>
      )
    }
  ];

  // Alerts columns
  const alertColumns = [
    {
      title: 'Alert ID',
      dataIndex: 'alert_id',
      key: 'alert_id',
      width: 100,
      render: (id: string) => <CentralText code>{id}</CentralText>
    },
    {
      title: 'Type',
      dataIndex: 'alert_type',
      key: 'alert_type',
      width: 150,
      render: (type: string) => {
        const typeColors: Record<string, string> = {
          SUSPICIOUS_TXN: 'error',
          HIGH_VALUE: 'warning',
          VELOCITY: 'processing',
          KYC_EXPIRED: 'warning',
          BLACKLIST: 'error'
        };
        return <CentralTag color={typeColors[type] || 'default'}>{type}</CentralTag>;
      }
    },
    {
      title: 'Severity',
      dataIndex: 'severity',
      key: 'severity',
      width: 100,
      render: (severity: string) => {
        const colors: Record<string, string> = {
          HIGH: 'red',
          MEDIUM: 'orange',
          LOW: 'green'
        };
        return <CentralTag color={colors[severity] || 'default'}>{severity}</CentralTag>;
      }
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
    },
    {
      title: 'Detected At',
      dataIndex: 'detected_at',
      key: 'detected_at',
      width: 180,
      render: (date: string) => dayjs(date).format('DD MMM YYYY HH:mm')
    },
    {
      title: 'Status',
      dataIndex: 'reviewed',
      key: 'reviewed',
      width: 120,
      render: (reviewed: boolean, record: any) => (
        <CentralBadge
          status={reviewed ? 'success' : 'warning'}
          text={reviewed ? record.review_status : 'Pending'}
        />
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right' as const,
      render: (_: any, record: any) => (
        <CentralButton
          type="link"
          size="small"
          onClick={() => {
            setSelectedAlert(record);
            setAlertModalVisible(true);
          }}
        >
          Review
        </CentralButton>
      )
    }
  ];

  // Suspicious transactions columns
  const suspiciousColumns = [
    {
      title: 'Transaction ID',
      dataIndex: 'transaction_id',
      key: 'transaction_id',
      width: 150,
      render: (id: string) => <CentralText code>{id}</CentralText>
    },
    {
      title: 'Client',
      dataIndex: 'client_name',
      key: 'client_name',
      width: 150
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount: number) => `₹${amount.toLocaleString()}`
    },
    {
      title: 'Risk Score',
      dataIndex: 'risk_score',
      key: 'risk_score',
      width: 120,
      render: (score: number) => {
        const color = score >= 80 ? 'var(--app-colorError)' : score >= 60 ? 'var(--app-colorWarning)' : 'var(--app-colorSuccess)';
        return <CentralProgress percent={score} size="small" strokeColor={color} />;
      }
    },
    {
      title: 'Risk Indicators',
      dataIndex: 'risk_indicators',
      key: 'risk_indicators',
      render: (indicators: string[]) => (
        <StyledSpace wrap>
          {indicators.map(indicator => (
            <CentralTag key={indicator} color="red">{indicator}</CentralTag>
          ))}
        </StyledSpace>
      )
    },
    {
      title: 'Detected At',
      dataIndex: 'detected_at',
      key: 'detected_at',
      width: 180,
      render: (date: string) => dayjs(date).format('DD MMM YYYY HH:mm')
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => (
        <CentralBadge
          status={status === 'RESOLVED' ? 'success' : status === 'INVESTIGATING' ? 'processing' : 'warning'}
          text={status}
        />
      )
    }
  ];

  const headerExtra = (
    <StyledSpace wrap>
      <CentralButton icon={<SyncOutlined />} onClick={() => {
        fetchDashboard();
        fetchAlerts();
        fetchSuspiciousTransactions();
        fetchAuditLogs();
      }}
      size={responsive.isMobile ? 'middle' : 'large'}>
        Refresh
      </CentralButton>
      <CentralButton
        type="primary"
        icon={<FileTextOutlined />}
        onClick={() => setReportModalVisible(true)}
        size={responsive.isMobile ? 'middle' : 'large'}
      >
        Generate RBI Report
      </CentralButton>
    </StyledSpace>
  );

  return (
    <CentralPageContainer
      withBackground
      title="Compliance & Audit"
      subTitle="Monitor compliance status, audit trails, and regulatory reports"
      extra={headerExtra}
    >
    <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">

        <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 6, title: true }}>
          {/* Compliance Metrics */}
          <ResponsiveRow animate>
            {complianceMetrics.map((metric, index) => (
              <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard} key={index} >
                <StyledCard>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <StyledStatistic
                        title={metric.label}
                        value={metric.value}
                        suffix="%"
                      />
                    </div>
                    <CentralProgress
                      type="circle"
                      percent={metric.value}
                      width={60}
                      status={metric.status as any}
                      strokeColor={
                        metric.status === 'success' ? 'var(--app-colorSuccess)' : 
                        metric.status === 'warning' ? 'var(--app-colorWarning)' : 
                        'var(--app-colorError)'
                      }
                    />
                  </div>
                </StyledCard>
              </ResponsiveCol>
            ))}
          </ResponsiveRow>

          {/* KYC Summary */}
          {dashboard && (
            <ResponsiveRow animate>
              <ResponsiveCol {...LAYOUT_CONFIG.fullWidth} >
                <StyledCard title={
                  <StyledSpace>
                    <SafetyCertificateOutlined />
                    <span>KYC Summary</span>
                  </StyledSpace>
                }>
                  <ResponsiveRow>
                    <ResponsiveCol {...LAYOUT_CONFIG.common.sixthWidth}>
                      <StyledStatistic title="Total Clients" value={dashboard.kyc_summary.total_clients} />
                    </ResponsiveCol>
                    <ResponsiveCol {...LAYOUT_CONFIG.common.sixthWidth}>
                      <StyledStatistic 
                        title="Verified" 
                        value={dashboard.kyc_summary.verified} 
                      />
                    </ResponsiveCol>
                    <ResponsiveCol {...LAYOUT_CONFIG.common.sixthWidth}>
                      <StyledStatistic 
                        title="Pending" 
                        value={dashboard.kyc_summary.pending}
                      />
                    </ResponsiveCol>
                    <ResponsiveCol {...LAYOUT_CONFIG.common.sixthWidth}>
                      <StyledStatistic 
                        title="Rejected" 
                        value={dashboard.kyc_summary.rejected}
                      />
                    </ResponsiveCol>
                    <ResponsiveCol {...LAYOUT_CONFIG.common.sixthWidth}>
                      <StyledStatistic 
                        title="Expired" 
                        value={dashboard.kyc_summary.expired}
                      />
                    </ResponsiveCol>
                    <ResponsiveCol {...LAYOUT_CONFIG.common.sixthWidth}>
                      <StyledStatistic 
                        title="Verification Rate" 
                        value={dashboard.kyc_summary.verification_rate}
                        suffix="%"
                      />
                    </ResponsiveCol>
                  </ResponsiveRow>
                </StyledCard>
              </ResponsiveCol>
            </ResponsiveRow>
          )}

          <ResponsiveRow animate>
            <ResponsiveCol {...LAYOUT_CONFIG.fullWidth} >
              <Tabs activeKey={activeTab} onChange={setActiveTab}>
                <Tabs.TabPane tab="Compliance Alerts" key="alerts">
                  <div style={{ marginBottom: token.marginMD }}>
                    <CentralButton icon={<SyncOutlined />} onClick={fetchAlerts}>
                      Refresh
                    </CentralButton>
                  </div>
                  <CentralTable
                    columns={alertColumns}
                    dataSource={alerts}
                    rowKey="alert_id"
                    pagination={{
                      pageSize: responsive.isMobile ? 5 : 10,
                      showSizeChanger: !responsive.isMobile
                    }}
                    locale={{ emptyText: <CentralText type="secondary">No alerts</CentralText> }}
                    scroll={{ x: responsive.isMobile ? 800 : undefined }}
                    size={responsive.isMobile ? 'small' : 'middle'}
                  />
                </Tabs.TabPane>

                <Tabs.TabPane tab="Suspicious Transactions" key="suspicious">
                  <div style={{ marginBottom: token.marginMD }}>
                    <CentralButton icon={<SyncOutlined />} onClick={fetchSuspiciousTransactions}>
                      Refresh
                    </CentralButton>
                  </div>
                  <CentralTable
                    columns={suspiciousColumns}
                    dataSource={suspiciousTransactions}
                    rowKey="id"
                    pagination={{
                      pageSize: responsive.isMobile ? 5 : 10,
                      showSizeChanger: !responsive.isMobile
                    }}
                    locale={{ emptyText: <CentralText type="secondary">No suspicious transactions</CentralText> }}
                    scroll={{ x: responsive.isMobile ? 1000 : undefined }}
                    size={responsive.isMobile ? 'small' : 'middle'}
                  />
                </Tabs.TabPane>

                <Tabs.TabPane tab="Audit Trail" key="audit">
                  <div style={{ marginBottom: token.marginMD }}>
                    <CentralButton icon={<SyncOutlined />} onClick={fetchAuditLogs}>
                      Refresh
                    </CentralButton>
                  </div>
                  <CentralTable
                    columns={auditColumns}
                    dataSource={auditLogs}
                    rowKey="log_id"
                    pagination={{
                      pageSize: responsive.isMobile ? 5 : 10,
                      showSizeChanger: !responsive.isMobile
                    }}
                    locale={{ emptyText: <CentralText type="secondary">No audit logs</CentralText> }}
                    scroll={{ x: responsive.isMobile ? 800 : undefined }}
                    size={responsive.isMobile ? 'small' : 'middle'}
                  />
                </Tabs.TabPane>
              </Tabs>
            </ResponsiveCol>
          </ResponsiveRow>
        </SmartLoader>

        {/* Generate Report Modal */}
        <Modal
          title="Generate RBI Compliance Report"
          open={reportModalVisible}
          onCancel={() => setReportModalVisible(false)}
          footer={null}
          width={responsive.isMobile ? '95vw' : 600}
        >
          <Form
            form={form}
            layout="vertical"
            onFinish={handleGenerateReport}
          >
            <Form.Item
              name="reportType"
              label="Report Type"
              rules={[{ required: true, message: 'Please select report type' }]}
            >
              <Select placeholder="Select report type">
                <Option value="CTR">Currency Transaction Report (CTR)</Option>
                <Option value="STR">Suspicious Transaction Report (STR)</Option>
                <Option value="MONTHLY">Monthly Compliance Report</Option>
                <Option value="QUARTERLY">Quarterly Compliance Report</Option>
                <Option value="ANNUAL">Annual Compliance Report</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="dateRange"
              label="Period"
              rules={[{ required: true, message: 'Please select date range' }]}
            >
              <RangePicker  />
            </Form.Item>

            <Form.Item>
              <StyledSpace>
                <CentralButton type="primary" htmlType="submit" icon={<DownloadOutlined />}>
                  Generate Report
                </CentralButton>
                <CentralButton onClick={() => setReportModalVisible(false)}>
                  Cancel
                </CentralButton>
              </StyledSpace>
            </Form.Item>
          </Form>
        </Modal>

        {/* Alert Review Modal */}
        <Modal
          title="Review Compliance Alert"
          open={alertModalVisible}
          onCancel={() => setAlertModalVisible(false)}
          footer={null}
          width={responsive.isMobile ? '95vw' : 600}
        >
          {selectedAlert && (
            <>
              <Descriptions column={1} bordered size="small" >
                <Descriptions.Item label="Alert ID">
                  {selectedAlert.alert_id}
                </Descriptions.Item>
                <Descriptions.Item label="Type">
                  {selectedAlert.alert_type}
                </Descriptions.Item>
                <Descriptions.Item label="Severity">
                  <CentralTag color={selectedAlert.severity === 'HIGH' ? 'red' : selectedAlert.severity === 'MEDIUM' ? 'orange' : 'green'}>
                    {selectedAlert.severity}
                  </CentralTag>
                </Descriptions.Item>
                <Descriptions.Item label="Entity">
                  {selectedAlert.entity_type} - {selectedAlert.entity_id}
                </Descriptions.Item>
                <Descriptions.Item label="Description">
                  {selectedAlert.description}
                </Descriptions.Item>
                <Descriptions.Item label="Detected At">
                  {dayjs(selectedAlert.detected_at).format('DD MMM YYYY HH:mm:ss')}
                </Descriptions.Item>
              </Descriptions>

              <Form
                form={alertForm}
                layout="vertical"
                onFinish={handleAlertReview}
              >
                <Form.Item
                  name="action"
                  label="Action"
                  rules={[{ required: true, message: 'Please select an action' }]}
                >
                  <Select placeholder="Select action">
                    <Option value="RESOLVE">Resolve</Option>
                    <Option value="ESCALATE">Escalate</Option>
                    <Option value="FALSE_POSITIVE">Mark as False Positive</Option>
                  </Select>
                </Form.Item>

                <Form.Item
                  name="comments"
                  label="Comments"
                  rules={[{ required: true, message: 'Please provide comments' }]}
                >
                  <CentralTextArea rows={4} placeholder="Enter your review comments..." />
                </Form.Item>

                <Form.Item>
                  <StyledSpace>
                    <CentralButton type="primary" htmlType="submit">
                      Submit Review
                    </CentralButton>
                    <CentralButton onClick={() => setAlertModalVisible(false)}>
                      Cancel
                    </CentralButton>
                  </StyledSpace>
                </Form.Item>
              </Form>
            </>
          )}
        </Modal>

        {/* Audit Details Modal */}
        <Modal
          title="Audit Log Details"
          open={auditDetailsModalVisible}
          onCancel={() => setAuditDetailsModalVisible(false)}
          footer={[
            <CentralButton key="close" onClick={() => setAuditDetailsModalVisible(false)}>
              Close
            </CentralButton>
          ]}
          width={responsive.isMobile ? '95vw' : 600}
        >
          {selectedAudit && (
            <Descriptions column={1} bordered size="small">
              <Descriptions.Item label="Log ID">
                {selectedAudit.log_id}
              </Descriptions.Item>
              <Descriptions.Item label="Timestamp">
                {dayjs(selectedAudit.timestamp).format('DD MMM YYYY HH:mm:ss')}
              </Descriptions.Item>
              <Descriptions.Item label="User">
                {selectedAudit.user_name || 'System'}
              </Descriptions.Item>
              <Descriptions.Item label="Action">
                {selectedAudit.action}
              </Descriptions.Item>
              <Descriptions.Item label="Entity">
                {selectedAudit.entity_type} - {selectedAudit.entity_id}
              </Descriptions.Item>
              <Descriptions.Item label="IP Address">
                {selectedAudit.ip_address}
              </Descriptions.Item>
              <Descriptions.Item label="User Agent">
                {selectedAudit.user_agent || 'N/A'}
              </Descriptions.Item>
              {selectedAudit.details && (
                <Descriptions.Item label="Details">
                  <pre >
                    {JSON.stringify(selectedAudit.details, null, 2)}
                  </pre>
                </Descriptions.Item>
              )}
            </Descriptions>
          )}
        </Modal>
      </ResponsiveGrid>
    </ResponsiveContainer>
    </CentralPageContainer>
  );
};

export default ComplianceAuditPage;
