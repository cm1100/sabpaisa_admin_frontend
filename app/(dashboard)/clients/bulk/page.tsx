/**
 * Bulk Upload Clients Page
 * Route: /clients/bulk - Bulk client upload interface
 */
'use client';

import React, { useState } from 'react';
import type { ColumnsType } from 'antd/es/table';
import { useRouter } from 'next/navigation';
import { useResponsive } from '@/hooks/useResponsive';
import {
  StyledCard,
  CentralButton,
  StyledSpace,
  CentralTitle,
  CentralText,
  CentralParagraph,
  CentralTable,
  CentralTag,
  CentralAlert,
  CentralProgress,
  StyledStatistic,
  Divider,
  Tooltip,
  Steps,
  Result,
  List,
  message,
  Upload,
  theme
} from '@/components/ui';
import type { UploadProps } from '@/components/ui';
import {
  CloudUploadOutlined,
  FileExcelOutlined,
  DownloadOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  WarningOutlined,
  InboxOutlined,
  ReloadOutlined,
  ArrowLeftOutlined,
  FileTextOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { notifySuccess, notifyWarning } from '@/utils/notify';
import { ClientApiService } from '@/services/api/ClientApiService';

const { Dragger } = Upload;

interface UploadResult {
  success_count: number;
  failed_count: number;
  errors: Array<{
    row: number;
    error: string;
    data?: any;
  }>;
  created_clients: any[];
}

const BulkUploadPage: React.FC = () => {
  const router = useRouter();
  const responsive = useResponsive();
  const { token } = theme.useToken();
  const clientApi = new ClientApiService();
  const [currentStep, setCurrentStep] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [fileList, setFileList] = useState<any[]>([]);

  const steps = [
    {
      title: 'Upload File',
      description: 'Select CSV/Excel file',
      icon: <CloudUploadOutlined />
    },
    {
      title: 'Processing',
      description: 'Validating data',
      icon: <ReloadOutlined />
    },
    {
      title: 'Complete',
      description: 'View results',
      icon: <CheckCircleOutlined />
    }
  ];

  const downloadTemplate = () => {
    const csvContent = `client_code,client_name,client_type,email,contact,address,risk_category,active
BULK001,Bulk Client 1,Business,bulk1@test.com,9876543211,Address 1,1,true
BULK002,Bulk Client 2,E-commerce,bulk2@test.com,9876543212,Address 2,2,true
BULK003,Bulk Client 3,Education,bulk3@test.com,9876543213,Address 3,1,true`;
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'client_bulk_upload_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    notifySuccess('Template downloaded successfully');
  };

  const uploadProps: UploadProps = {
    name: 'file',
    multiple: false,
    maxCount: 1,
    accept: '.csv,.xlsx,.xls',
    fileList,
    beforeUpload: (file) => {
      const isValidType = file.type === 'text/csv' || 
                         file.type === 'application/vnd.ms-excel' ||
                         file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
      
      if (!isValidType) {
        message.error('You can only upload CSV or Excel files!');
        return false;
      }
      
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error('File must be smaller than 10MB!');
        return false;
      }
      
      setFileList([file]);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
    }
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.error('Please select a file to upload');
      return;
    }

    try {
      setUploading(true);
      setCurrentStep(1);
      
      const file = fileList[0];
      const response = await clientApi.bulkUpload(file);
      const failed = (response as any).failed_count ?? (response as any).error_count ?? ((response as any).errors?.length || 0);
      setUploadResult({
        success_count: response.success_count || 0,
        failed_count: failed,
        errors: response.errors || [],
        created_clients: (response as any).created_clients || []
      });
      
      setCurrentStep(2);
      
      if (response.success_count > 0) {
        notifySuccess(`Successfully uploaded ${response.success_count} clients`);
      }
      
      if (response.failed_count > 0) {
        notifyWarning(`Failed to upload ${response.failed_count} clients`);
      }
    } catch (error: any) {
      console.error('Upload failed:', error);
      message.error(error.response?.data?.error || 'Failed to upload file');
      setCurrentStep(0);
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setCurrentStep(0);
    setFileList([]);
    setUploadResult(null);
  };

  const errorColumns: ColumnsType<UploadResult['errors'][number]> = [
    {
      title: 'Row',
      dataIndex: 'row',
      key: 'row',
      width: 80,
      render: (row: number) => <CentralTag color="blue">Row {row}</CentralTag>
    },
    {
      title: 'Error',
      dataIndex: 'error',
      key: 'error',
      render: (error: string) => (
        <CentralText type="danger" >
          {error}
        </CentralText>
      )
    },
    {
      title: 'Data',
      dataIndex: 'data',
      key: 'data',
      responsive: ['md'] as const,
      render: (data: any) => (
        <CentralText code >
          {data ? JSON.stringify(data, null, 2).substring(0, 100) + '...' : 'N/A'}
        </CentralText>
      )
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <ResponsiveGrid layout="dashboard" background="none">
            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[24, 24]}>
              <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
                <CentralAlert
                  message="File Format Requirements"
                  description={
                    <List
                      size="small"
                      dataSource={[
                        'File must be in CSV or Excel format (.csv, .xlsx, .xls)',
                        'Maximum file size: 10MB',
                        'Required columns: client_code, client_name, client_type, email, contact',
                        'Optional columns: address, risk_category, active',
                        'First row should contain column headers'
                      ]}
                      renderItem={(item) => (
                        <List.Item>
                          <StyledSpace>
                            <InfoCircleOutlined />
                            <CentralText >{item}</CentralText>
                          </StyledSpace>
                        </List.Item>
                      )}
                    />
                  }
                  type="info"
                  showIcon
                                  />
              </ResponsiveCol>

              <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
                <StyledCard >
                  <Dragger {...uploadProps}>
                    <p className="ant-upload-drag-icon">
                      <InboxOutlined  />
                    </p>
                    <p className="ant-upload-text" >
                      Click or drag file to this area to upload
                    </p>
                    <p className="ant-upload-hint" >
                      Support for CSV and Excel files. Strictly prohibit from uploading company data or other confidential files.
                    </p>
                  </Dragger>

                  {fileList.length > 0 && (
                    <div >
                      <StyledCard  >
                        <StyledSpace>
                          <FileExcelOutlined  />
                          <div>
                            <CentralText strong>{fileList[0].name}</CentralText>
                            <br />
                            <CentralText type="secondary" >
                              {(fileList[0].size / 1024).toFixed(2)} KB
                            </CentralText>
                          </div>
                        </StyledSpace>
                      </StyledCard>
                    </div>
                  )}

                  <Divider />

                  <StyledSpace  wrap>
                    <CentralButton
                      icon={<DownloadOutlined />}
                      onClick={downloadTemplate}
                    >
                      Download Template
                    </CentralButton>
                    <CentralButton
                      type="primary"
                      icon={<CloudUploadOutlined />}
                      onClick={handleUpload}
                      disabled={fileList.length === 0}
                      size={responsive.isMobile ? 'middle' : 'large'}
                                          >
                      Upload & Process
                    </CentralButton>
                  </StyledSpace>
                </StyledCard>
              </ResponsiveCol>
            </ResponsiveRow>
          </ResponsiveGrid>
        );

      case 1:
        return (
          <StyledCard >
            <Result
              icon={<ReloadOutlined spin  />}
              title="Processing File"
              subTitle="Please wait while we validate and import your data..."
            />
            <CentralProgress percent={60} status="active" strokeColor="var(--app-colorPrimary)" />
          </StyledCard>
        );

      case 2:
        return (
          <ResponsiveGrid layout="dashboard" background="none">
            {uploadResult && (
              <>
                <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[24, 24]}>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard} >
                    <StyledCard>
                      <StyledStatistic
                        title="Total Processed"
                        value={uploadResult.success_count + uploadResult.failed_count}
                        prefix={<FileTextOutlined />}
                      />
                    </StyledCard>
                  </ResponsiveCol>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard} >
                    <StyledCard>
                      <StyledStatistic
                        title="Successful"
                        value={uploadResult.success_count}
                        prefix={<CheckCircleOutlined />}
                      />
                    </StyledCard>
                  </ResponsiveCol>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard} >
                    <StyledCard>
                      <StyledStatistic
                        title="Failed"
                        value={uploadResult.failed_count}
                        prefix={<CloseCircleOutlined />}
                      />
                    </StyledCard>
                  </ResponsiveCol>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard} >
                    <StyledCard>
                      <StyledStatistic
                        title="Success Rate"
                        value={
                          uploadResult.success_count + uploadResult.failed_count > 0
                            ? (uploadResult.success_count / (uploadResult.success_count + uploadResult.failed_count) * 100)
                            : 0
                        }
                        precision={1}
                        suffix="%"
                      />
                    </StyledCard>
                  </ResponsiveCol>
                </ResponsiveRow>

                {uploadResult.errors.length > 0 && (
                  <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[24, 24]} >
                    <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
                      <StyledCard 
                        title={
                          <StyledSpace>
                            <WarningOutlined  />
                            <span>Upload Errors</span>
                          </StyledSpace>
                        }
                                              >
                        <CentralTable
                          dataSource={uploadResult.errors}
                          columns={errorColumns}
                          rowKey={(record, index) => `error-${index}`}
                          pagination={{ 
                            pageSize: responsive.isMobile ? 5 : 10,
                            showSizeChanger: !responsive.isMobile
                          }}
                          scroll={{ x: responsive.isMobile ? 400 : undefined }}
                          size={responsive.isMobile ? 'small' : 'middle'}
                        />
                      </StyledCard>
                    </ResponsiveCol>
                  </ResponsiveRow>
                )}

                <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[24, 24]} >
                  <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
                    <StyledCard >
                      <StyledSpace  size="large">
                        <CentralButton
                          icon={<ReloadOutlined />}
                          onClick={resetUpload}
                          size={responsive.isMobile ? 'middle' : 'large'}
                        >
                          Upload Another File
                        </CentralButton>
                        <CentralButton
                          type="primary"
                          icon={<CheckCircleOutlined />}
                          onClick={() => router.push('/clients/list')}
                          size={responsive.isMobile ? 'middle' : 'large'}
                                                  >
                          View All Clients
                        </CentralButton>
                      </StyledSpace>
                    </StyledCard>
                  </ResponsiveCol>
                </ResponsiveRow>
              </>
            )}
          </ResponsiveGrid>
        );

      default:
        return null;
    }
  };

  return (
    <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
        <ResponsiveRow 
          mobileGutter={[12, 12]} 
          tabletGutter={[16, 16]} 
          desktopGutter={[24, 24]}
          
          animate
        >
          <ResponsiveCol {...LAYOUT_CONFIG.fullWidth} >
            <div >
              <CentralTitle level={2} >Bulk Upload Clients</CentralTitle>
              <CentralButton 
                key="back" 
                onClick={() => router.push('/clients')}
                icon={<ArrowLeftOutlined />}
                              >
                Back to Clients
              </CentralButton>
            </div>
          </ResponsiveCol>
        </ResponsiveRow>

        <ResponsiveRow 
          mobileGutter={[12, 12]} 
          tabletGutter={[16, 16]} 
          desktopGutter={[24, 24]}
          animate
        >
          <ResponsiveCol {...LAYOUT_CONFIG.fullWidth} >
            <StyledCard>
              <Steps 
                current={currentStep} 
                items={steps}
                
                responsive={!responsive.isMobile}
              />
              
              {renderStepContent()}
            </StyledCard>
          </ResponsiveCol>
        </ResponsiveRow>

        <ResponsiveRow 
          mobileGutter={[12, 12]} 
          tabletGutter={[16, 16]} 
          desktopGutter={[24, 24]}
          
          animate
        >
          <ResponsiveCol {...LAYOUT_CONFIG.fullWidth} >
            <StyledCard>
              <CentralTitle level={4}>
                <InfoCircleOutlined /> Instructions
              </CentralTitle>
              <CentralParagraph >
                <ol>
                  <li>Download the CSV template using the button above</li>
                  <li>Fill in the client information in the template</li>
                  <li>Save the file in CSV or Excel format</li>
                  <li>Upload the file using the drag & drop area</li>
                  <li>Review the results and fix any errors if needed</li>
                </ol>
              </CentralParagraph>
              
              <CentralAlert
                message="Important Notes"
                description={
                  <ul >
                    <li>Client codes must be unique across the system</li>
                    <li>Email addresses must be valid and unique</li>
                    <li>Risk category should be a number between 1-5</li>
                    <li>Active field should be true or false</li>
                    <li>Empty cells will use default values where applicable</li>
                  </ul>
                }
                type="warning"
                showIcon
                              />
            </StyledCard>
          </ResponsiveCol>
        </ResponsiveRow>
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
};

export default BulkUploadPage;
