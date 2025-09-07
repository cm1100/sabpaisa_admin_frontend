/**
 * KYC Verification Page
 * Route: /clients/kyc - Client KYC verification management
 */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { CentralAvatar, CentralBadge, CentralButton, CentralProTable, CentralTable, CentralTag, CentralText, CentralTextArea, CentralTitle, DatePicker, Divider, Dropdown, Empty, Form, Input, List, Modal, Select, Spin, StyledCard, StyledSpace, StyledStatistic, Tooltip, Upload, App, theme } from '@/components/ui';
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined,
  SafetyOutlined,
  ReloadOutlined,
  FilterOutlined,
  DownloadOutlined,
  UserOutlined,
  WarningOutlined,
  UploadOutlined,
  EyeOutlined,
  DeleteOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileTextOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { CentralPageContainer, ProTable } from '@/components/ui';
import type { ProColumns } from '@/components/ui';
import { ClientApiService } from '@/services/api/ClientApiService';
import { notifySuccess } from '@/utils/notify';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { useResponsive } from '@/hooks/useResponsive';
import dayjs from 'dayjs';

const { Option } = Select;
// Replaced by CentralTextArea
const { Dragger } = Upload;

interface KYCClient {
  client_id: string;
  client_code: string;
  client_name: string;
  client_email: string;
  client_contact: string;
  risk_category: number;
  kyc_status: string;
  last_verified?: string;
  documents?: any[];
}

const KYCVerificationPage: React.FC = () => {
  const { message } = App.useApp();
  const { token } = theme.useToken();
  const responsive = useResponsive();
  const actionRef = useRef<any>(null);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedClient, setSelectedClient] = useState<KYCClient | null>(null);
  const [form] = Form.useForm();
  const [documentModalVisible, setDocumentModalVisible] = useState(false);
  const [uploadModalVisible, setUploadModalVisible] = useState(false);
  const [documents, setDocuments] = useState<any[]>([]);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [uploadForm] = Form.useForm();
  const clientApi = new ClientApiService();
  
  const [stats, setStats] = useState({
    total: 0,
    verified: 0,
    pending: 0,
    rejected: 0
  });

  // Load statistics
  useEffect(() => {
    loadStatistics();
  }, []);

  const loadStatistics = async () => {
    try {
      const clients = await clientApi.getAll();
      const clientList = Array.isArray(clients) ? clients : clients.results || [];
      
      setStats({
        total: clientList.length,
        verified: clientList.filter((c: any) => c.risk_category === 1).length,
        pending: clientList.filter((c: any) => c.risk_category === 3).length,
        rejected: clientList.filter((c: any) => c.risk_category === 5).length
      });
    } catch (error) {
      console.error('Failed to load KYC statistics:', error);
    }
  };

  const getKYCStatus = (riskCategory: number) => {
    if (riskCategory === 1) return 'VERIFIED';
    if (riskCategory === 2) return 'VERIFIED';
    if (riskCategory === 3) return 'PENDING';
    if (riskCategory === 4) return 'PENDING';
    if (riskCategory === 5) return 'REJECTED';
    return 'PENDING';
  };

  const getStatusConfig = (status: string) => {
    const configs: any = {
      VERIFIED: { color: 'success', icon: <CheckCircleOutlined />, text: 'Verified' },
      PENDING: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Pending' },
      REJECTED: { color: 'error', icon: <CloseCircleOutlined />, text: 'Rejected' },
      EXPIRED: { color: 'warning', icon: <ExclamationCircleOutlined />, text: 'Expired' },
      // Lowercase fallbacks for compatibility
      verified: { color: 'success', icon: <CheckCircleOutlined />, text: 'Verified' },
      pending: { color: 'processing', icon: <ClockCircleOutlined />, text: 'Pending' },
      rejected: { color: 'error', icon: <CloseCircleOutlined />, text: 'Rejected' }
    };
    return configs[status] || configs.PENDING;
  };

  const getRiskLevelConfig = (level: number) => {
    const configs: any = {
      1: { color: 'success', text: 'Low' },
      2: { color: 'processing', text: 'Low-Medium' },
      3: { color: 'warning', text: 'Medium' },
      4: { color: 'warning', text: 'Medium-High' },
      5: { color: 'error', text: 'High' }
    };
    return configs[level] || configs[3];
  };

  const columns: ProColumns<KYCClient>[] = [
    {
      title: 'Client',
      key: 'client',
      width: responsive.isMobile ? 200 : 300,
      fixed: responsive.isDesktop ? 'left' : undefined,
      render: (_: any, record: KYCClient) => (
        <StyledSpace direction="vertical" size={0}>
          <StyledSpace>
            <CentralAvatar 
              icon={<UserOutlined />} 
              
              size={responsive.isMobile ? 'small' : 'default'}
            />
            <div>
              <CentralText strong >
                {record.client_name}
              </CentralText>
              <br />
              <CentralText type="secondary" >
                {record.client_code}
              </CentralText>
            </div>
          </StyledSpace>
        </StyledSpace>
      )
    },
    {
      title: 'Contact',
      key: 'contact',
      width: responsive.isMobile ? 150 : 200,
      responsive: ['md'] as const,
      render: (_: any, record: KYCClient) => (
        <StyledSpace direction="vertical" size={0}>
          <CentralText >
            {record.client_email}
          </CentralText>
          <CentralText type="secondary" >
            {record.client_contact}
          </CentralText>
        </StyledSpace>
      )
    },
    {
      title: 'KYC Status',
      key: 'kyc_status',
      width: responsive.isMobile ? 120 : 150,
      filters: [
        { text: 'Verified', value: 'VERIFIED' },
        { text: 'Pending', value: 'PENDING' },
        { text: 'Rejected', value: 'REJECTED' },
        { text: 'Expired', value: 'EXPIRED' }
      ],
      render: (_: any, record: KYCClient) => {
        const status = getKYCStatus(record.risk_category);
        const config = getStatusConfig(status);
        return (
          <CentralBadge status={config.color as any} text={
            <StyledSpace>
              {config.icon}
              <CentralText >
                {config.text}
              </CentralText>
            </StyledSpace>
          } />
        );
      }
    },
    {
      title: 'Risk Level',
      key: 'risk_level',
      width: responsive.isMobile ? 100 : 120,
      responsive: ['lg'] as const,
      render: (_: any, record: KYCClient) => {
        const config = getRiskLevelConfig(record.risk_category);
        return (
          <CentralTag color={config.color}>
            {config.text}
          </CentralTag>
        );
      }
    },
    {
      title: 'Last Verified',
      key: 'last_verified',
      width: responsive.isMobile ? 120 : 150,
      responsive: ['xl'] as const,
      render: (_: any, record: KYCClient) => (
        <CentralText >
          {record.last_verified ? dayjs(record.last_verified).format('DD MMM YYYY') : 'Never'}
        </CentralText>
      )
    },
    {
      title: 'Actions',
      key: 'actions',
      width: responsive.isMobile ? 150 : 200,
      fixed: responsive.isDesktop ? 'right' : undefined,
      render: (_: any, record: KYCClient) => (
        <StyledSpace size="small" wrap>
          <CentralButton
            type="primary"
            size={responsive.isMobile ? 'small' : 'middle'}
            icon={<FileSearchOutlined />}
            onClick={() => handleVerify(record)}
          >
            {responsive.isMobile ? 'Verify' : 'Verify KYC'}
          </CentralButton>
          <Dropdown
            menu={{
              items: [
                {
                  key: 'view',
                  label: 'View Documents',
                  icon: <FileSearchOutlined />,
                  onClick: () => handleViewDocuments(record)
                },
                {
                  key: 'upload',
                  label: 'Upload Documents',
                  icon: <UploadOutlined />,
                  onClick: () => handleUploadDocuments(record)
                },
                {
                  type: 'divider'
                },
                {
                  key: 'reject',
                  label: 'Reject KYC',
                  icon: <CloseCircleOutlined />,
                  danger: true
                }
              ]
            }}
          >
            <CentralButton size={responsive.isMobile ? 'small' : 'middle'}>
              More
            </CentralButton>
          </Dropdown>
        </StyledSpace>
      )
    }
  ];

  const handleVerify = (client: KYCClient) => {
    setSelectedClient(client);
    const status = getKYCStatus(client.risk_category);
    form.setFieldsValue({
      kyc_status: status,
      risk_category: client.risk_category,
      notes: ''
    });
    setModalVisible(true);
  };

  const handleViewDocuments = async (client: KYCClient) => {
    setSelectedClient(client);
    setLoadingDocuments(true);
    setDocumentModalVisible(true);
    
    try {
      const response = await clientApi.getDocuments(client.client_id);
      setDocuments(response.documents || []);
    } catch (error: any) {
      console.error('Failed to load documents:', error);
      message.error(error?.message || 'Failed to load documents');
      setDocuments([]);
    } finally {
      setLoadingDocuments(false);
    }
  };

  const handleUploadDocuments = (client: KYCClient) => {
    setSelectedClient(client);
    setUploadModalVisible(true);
    uploadForm.resetFields();
  };

  const handleDocumentUpload = async () => {
    try {
      const values = await uploadForm.validateFields();
      const formData = new FormData();
      
      formData.append('document_type', values.document_type);
      formData.append('document_name', values.document_name);
      formData.append('document_file', values.document_file.file);
      
      if (values.document_number) {
        formData.append('document_number', values.document_number);
      }
      if (values.issue_date) {
        formData.append('issue_date', values.issue_date.format('YYYY-MM-DD'));
      }
      if (values.expiry_date) {
        formData.append('expiry_date', values.expiry_date.format('YYYY-MM-DD'));
      }
      if (values.notes) {
        formData.append('notes', values.notes);
      }
      
      setLoading(true);
      await clientApi.uploadDocument(selectedClient!.client_id, formData);
      
      notifySuccess('Document uploaded successfully');
      setUploadModalVisible(false);
      uploadForm.resetFields();
      
      // Refresh documents if document modal is open
      if (documentModalVisible) {
        handleViewDocuments(selectedClient!);
      }
    } catch (error: any) {
      console.error('Failed to upload document:', error);
      message.error(error.response?.data?.error || 'Failed to upload document');
    } finally {
      setLoading(false);
    }
  };

  const handleDocumentVerify = async (documentId: string, status: 'VERIFIED' | 'REJECTED') => {
    try {
      await clientApi.verifyDocument(selectedClient!.client_id, documentId, {
        status,
        notes: `Document ${status.toLowerCase()} via KYC verification`
      });
      
      notifySuccess(`Document ${status.toLowerCase()} successfully`);
      handleViewDocuments(selectedClient!);
    } catch (error: any) {
      console.error('Failed to verify document:', error);
      message.error(error?.message || 'Failed to verify document');
    }
  };

  const handleDocumentDelete = async (documentId: string) => {
    Modal.confirm({
      title: 'Delete Document',
      content: 'Are you sure you want to delete this document?',
      onOk: async () => {
        try {
          await clientApi.deleteDocument(selectedClient!.client_id, documentId);
          notifySuccess('Document deleted successfully');
          handleViewDocuments(selectedClient!);
        } catch (error: any) {
          console.error('Failed to delete document:', error);
          message.error(error?.message || 'Failed to delete document');
        }
      }
    });
  };

  const getDocumentIcon = (fileName: string) => {
    const ext = fileName.toLowerCase().split('.').pop();
    if (ext === 'pdf') return <FilePdfOutlined  />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <FileImageOutlined  />;
    return <FileTextOutlined  />;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const values = await form.validateFields();
      
      if (selectedClient) {
        await clientApi.updateKYCStatus(selectedClient.client_id, {
          kyc_status: values.kyc_status,
          risk_category: values.risk_category,
          notes: values.notes
        });
        
        notifySuccess('KYC status updated successfully');
        setModalVisible(false);
        actionRef.current?.reload();
        loadStatistics();
      }
    } catch (error: any) {
      console.error('Failed to update KYC status:', error);
      message.error(error.response?.data?.error || 'Failed to update KYC status');
    } finally {
      setLoading(false);
    }
  };

  return (
    <CentralPageContainer withBackground title="KYC Verification">
      <div >
        <CentralTitle level={2}>KYC Verification</CentralTitle>
        <StyledSpace>
        <CentralButton 
          key="refresh" 
          icon={<ReloadOutlined />}
          onClick={() => {
            actionRef.current?.reload();
            loadStatistics();
          }}
        >
          Refresh
        </CentralButton>,
        <CentralButton 
          key="export" 
          icon={<DownloadOutlined />}
        >
          Export
        </CentralButton>
        </StyledSpace>
      </div>
      
      <div>
        {/* Statistics Cards */}
        <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[24, 24]} >
          <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric} wide={6}>
            <StyledCard hoverable>
              <StyledStatistic
                title="Total Clients"
                value={stats.total}
                prefix={<UserOutlined />}
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric} wide={6}>
            <StyledCard hoverable>
              <StyledStatistic
                title="Verified"
                value={stats.verified}
                prefix={<CheckCircleOutlined />}
                suffix={
                  <CentralText type="secondary">
                    ({stats.total > 0 ? ((stats.verified / stats.total) * 100).toFixed(1) : 0}%)
                  </CentralText>
                }
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric} wide={6}>
            <StyledCard hoverable>
              <StyledStatistic
                title="Pending"
                value={stats.pending}
                prefix={<ClockCircleOutlined />}
              />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric} wide={6}>
            <StyledCard hoverable>
              <StyledStatistic
                title="Rejected"
                value={stats.rejected}
                prefix={<CloseCircleOutlined />}
              />
            </StyledCard>
          </ResponsiveCol>
        </ResponsiveRow>

        {/* KYC Table */}
        <StyledCard>
          <CentralProTable<KYCClient>
            id="clients:kyc"
            actionRef={actionRef}
            columns={columns}
            request={async (params: any) => {
              try {
                const response = await clientApi.getAll(params);
                const clients = Array.isArray(response) ? response : response.results || [];
                
                return {
                  data: clients.map((client: any) => ({
                    ...client,
                    kyc_status: getKYCStatus(client.risk_category)
                  })),
                  success: true,
                  total: clients.length
                };
              } catch (error: any) {
                message.error(error?.message || 'Failed to load clients');
                return { data: [] as KYCClient[], success: false, total: 0 };
              }
            }}
            rowKey="client_id"
            search={{
              labelWidth: 'auto',
              span: responsive.isMobile ? 24 : 6
            }}
            pagination={{
              pageSize: responsive.isMobile ? 10 : 20,
              showSizeChanger: !responsive.isMobile
            }}
            scroll={{ x: responsive.isMobile ? 800 : 1200 }}
            options={{
              density: !responsive.isMobile,
              fullScreen: !responsive.isMobile,
              reload: true,
              setting: !responsive.isMobile
            }}
            dateFormatter="string"
            headerTitle="KYC Verification Queue"
            toolBarRender={() => [
              <CentralButton
                key="bulk"
                icon={<SafetyOutlined />}
              >
                Bulk Verify
              </CentralButton>
            ]}
          />
        </StyledCard>

        {/* Verification Modal */}
        <Modal
          title={
            <StyledSpace>
              <SafetyOutlined />
              <span>KYC Verification</span>
            </StyledSpace>
          }
          open={modalVisible}
          onCancel={() => setModalVisible(false)}
          footer={[
            <CentralButton key="cancel" onClick={() => setModalVisible(false)}>
              Cancel
            </CentralButton>,
            <CentralButton
              key="submit"
              type="primary"
              loading={loading}
              onClick={handleSubmit}
            >
              Update Status
            </CentralButton>
          ]}
          width={responsive.isMobile ? '95%' : 600}
        >
          {selectedClient && (
            <Form form={form} layout="vertical">
              <StyledCard >
                <ResponsiveRow mobileGutter={[8, 8]} tabletGutter={[12, 8]} desktopGutter={[16, 8]}>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.halfWidth}>
                    <CentralText strong>Client:</CentralText> {selectedClient.client_name}
                  </ResponsiveCol>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.halfWidth}>
                    <CentralText strong>Code:</CentralText> {selectedClient.client_code}
                  </ResponsiveCol>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.halfWidth}>
                    <CentralText strong>Email:</CentralText> {selectedClient.client_email}
                  </ResponsiveCol>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.halfWidth}>
                    <CentralText strong>Contact:</CentralText> {selectedClient.client_contact}
                  </ResponsiveCol>
                </ResponsiveRow>
              </StyledCard>

              <Form.Item
                name="kyc_status"
                label="KYC Status"
                rules={[{ required: true, message: 'Please select KYC status' }]}
              >
                <Select size="large">
                  <Option value="VERIFIED">
                    <StyledSpace>
                      <CheckCircleOutlined  />
                      Verified
                    </StyledSpace>
                  </Option>
                  <Option value="PENDING">
                    <StyledSpace>
                      <ClockCircleOutlined  />
                      Pending
                    </StyledSpace>
                  </Option>
                  <Option value="REJECTED">
                    <StyledSpace>
                      <CloseCircleOutlined  />
                      Rejected
                    </StyledSpace>
                  </Option>
                  <Option value="EXPIRED">
                    <StyledSpace>
                      <ExclamationCircleOutlined  />
                      Expired
                    </StyledSpace>
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="risk_category"
                label="Risk Category"
                rules={[{ required: true, message: 'Please select risk category' }]}
              >
                <Select size="large">
                  <Option value={1}>Low Risk (1)</Option>
                  <Option value={2}>Low-Medium Risk (2)</Option>
                  <Option value={3}>Medium Risk (3)</Option>
                  <Option value={4}>Medium-High Risk (4)</Option>
                  <Option value={5}>High Risk (5)</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="notes"
                label="Verification Notes"
              >
                <CentralTextArea 
                  rows={4} 
                  placeholder="Enter any notes about this KYC verification..."
                />
              </Form.Item>
            </Form>
          )}
        </Modal>

        {/* Documents View Modal */}
        <Modal
          title={
            <StyledSpace>
              <FileSearchOutlined />
              <span>KYC Documents - {selectedClient?.client_name}</span>
            </StyledSpace>
          }
          open={documentModalVisible}
          onCancel={() => setDocumentModalVisible(false)}
          width={800}
          footer={[
            <CentralButton key="close" onClick={() => setDocumentModalVisible(false)}>
              Close
            </CentralButton>,
            <CentralButton
              key="upload"
              type="primary"
              icon={<UploadOutlined />}
              onClick={() => handleUploadDocuments(selectedClient!)}
            >
              Upload New Document
            </CentralButton>
          ]}
        >
          {loadingDocuments ? (
            <div >
              <Spin size="large" />
            </div>
          ) : documents.length === 0 ? (
            <Empty
              description="No documents uploaded yet"
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            >
              <CentralButton
                type="primary"
                icon={<UploadOutlined />}
                onClick={() => handleUploadDocuments(selectedClient!)}
              >
                Upload First Document
              </CentralButton>
            </Empty>
          ) : (
            <List
              dataSource={documents}
              renderItem={(doc) => (
                <List.Item
                  key={doc.document_id}
                  actions={[
                    <Tooltip title="View Document">
                      <CentralButton
                        type="text"
                        icon={<EyeOutlined />}
                        href={doc.file_url}
                        target="_blank"
                      />
                    </Tooltip>,
                    doc.status === 'PENDING' && (
                      <StyledSpace>
                        <Tooltip title="Verify">
                          <CentralButton
                            type="text"
                            icon={<CheckCircleOutlined />}
                            
                            onClick={() => handleDocumentVerify(doc.document_id, 'VERIFIED')}
                          />
                        </Tooltip>
                        <Tooltip title="Reject">
                          <CentralButton
                            type="text"
                            icon={<CloseCircleOutlined />}
                            danger
                            onClick={() => handleDocumentVerify(doc.document_id, 'REJECTED')}
                          />
                        </Tooltip>
                      </StyledSpace>
                    ),
                    <Tooltip title="Delete">
                      <CentralButton
                        type="text"
                        icon={<DeleteOutlined />}
                        danger
                        onClick={() => handleDocumentDelete(doc.document_id)}
                      />
                    </Tooltip>
                  ].filter(Boolean)}
                >
                  <List.Item.Meta
                    avatar={getDocumentIcon(doc.document_name)}
                    title={
                      <StyledSpace>
                        <CentralText strong>{doc.document_name}</CentralText>
                        <CentralTag color={
                          doc.status === 'VERIFIED' ? 'success' :
                          doc.status === 'REJECTED' ? 'error' :
                          doc.status === 'EXPIRED' ? 'warning' : 'processing'
                        }>
                          {doc.status}
                        </CentralTag>
                      </StyledSpace>
                    }
                    description={
                      <StyledSpace direction="vertical" size={0}>
                        <CentralText type="secondary">Type: {doc.document_type}</CentralText>
                        {doc.document_number && (
                          <CentralText type="secondary">Number: {doc.document_number}</CentralText>
                        )}
                        <CentralText type="secondary">
                          Uploaded: {new Date(doc.upload_date).toLocaleDateString()}
                        </CentralText>
                        {doc.verified_by && (
                          <CentralText type="secondary">
                            Verified by: {doc.verified_by} on {new Date(doc.verified_date).toLocaleDateString()}
                          </CentralText>
                        )}
                      </StyledSpace>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </Modal>

        {/* Document Upload Modal */}
        <Modal
          title={
            <StyledSpace>
              <UploadOutlined />
              <span>Upload KYC Document</span>
            </StyledSpace>
          }
          open={uploadModalVisible}
          onCancel={() => setUploadModalVisible(false)}
          footer={[
            <CentralButton key="cancel" onClick={() => setUploadModalVisible(false)}>
              Cancel
            </CentralButton>,
            <CentralButton
              key="submit"
              type="primary"
              loading={loading}
              onClick={handleDocumentUpload}
            >
              Upload Document
            </CentralButton>
          ]}
          width={600}
        >
          <Form form={uploadForm} layout="vertical">
            <Form.Item
              name="document_type"
              label="Document Type"
              rules={[{ required: true, message: 'Please select document type' }]}
            >
              <Select size="large" placeholder="Select document type">
                <Option value="PAN">PAN Card</Option>
                <Option value="AADHAAR">Aadhaar Card</Option>
                <Option value="GST">GST Certificate</Option>
                <Option value="BANK_STATEMENT">Bank Statement</Option>
                <Option value="INCORPORATION">Certificate of Incorporation</Option>
                <Option value="PARTNERSHIP_DEED">Partnership Deed</Option>
                <Option value="TRADE_LICENSE">Trade License</Option>
                <Option value="OTHER">Other Document</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="document_name"
              label="Document Name"
              rules={[{ required: true, message: 'Please enter document name' }]}
            >
              <Input size="large" placeholder="e.g., PAN Card - Company Name" />
            </Form.Item>

            <Form.Item
              name="document_file"
              label="Upload File"
              rules={[{ required: true, message: 'Please upload a file' }]}
              valuePropName="file"
            >
              <Upload
                beforeUpload={() => false}
                maxCount={1}
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              >
                <CentralButton icon={<UploadOutlined />} size="large" >
                  Click to Upload (Max 10MB)
                </CentralButton>
              </Upload>
            </Form.Item>

            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.common.halfWidth}>
                <Form.Item
                  name="document_number"
                  label="Document Number (Optional)"
                >
                  <Input placeholder="e.g., ABCDE1234F" />
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.halfWidth}>
                <Form.Item
                  name="issue_date"
                  label="Issue Date (Optional)"
                >
                  <DatePicker  />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <Form.Item
              name="expiry_date"
              label="Expiry Date (Optional)"
            >
              <DatePicker  />
            </Form.Item>

            <Form.Item
              name="notes"
              label="Notes (Optional)"
            >
              <CentralTextArea rows={3} placeholder="Any additional notes about this document" />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    </CentralPageContainer>
  );
};

export default KYCVerificationPage;
