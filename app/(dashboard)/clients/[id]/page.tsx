/**
 * Client Detail Page
 * Route: /clients/[id] - Individual client view
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  StyledCard, 
  CentralButton, 
  StyledSpace, 
  CentralTag, 
  CentralAlert,
  StyledStatistic,
  CentralTitle,
  CentralText,
  Divider,
  Modal,
  Tooltip,
  Input,
  Descriptions,
  Spin,
  message
} from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import {
  ArrowLeftOutlined,
  EditOutlined,
  ShopOutlined,
  UserOutlined,
  BankOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  KeyOutlined,
  CopyOutlined,
  EyeOutlined,
  EyeInvisibleOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import { ClientApiService } from '@/services/api/ClientApiService';
import { IClient } from '@/types';
import { notifySuccess } from '@/utils/notify';


const ClientDetailPage: React.FC = () => {
  const params = useParams();
  const router = useRouter();
  const clientApi = new ClientApiService();
  const [client, setClient] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showApiKey, setShowApiKey] = useState(false);
  const [showAuthIv, setShowAuthIv] = useState(false);
  const [generatingKey, setGeneratingKey] = useState(false);

  useEffect(() => {
    if (params.id) {
      loadClient(params.id as string);
    }
  }, [params.id]);

  const loadClient = async (id: string) => {
    try {
      setLoading(true);
      const clientData = await clientApi.getById(id);
      console.log('Client data loaded:', clientData);
      setClient(clientData);
    } catch (error) {
      console.error('Failed to load client:', error);
      setError('Failed to load client details');
    } finally {
      setLoading(false);
    }
  };

  const generateApiKey = async () => {
    Modal.confirm({
      title: 'Generate New API Key',
      content: 'This will generate a new API key for this client. The old key will be replaced. Continue?',
      onOk: async () => {
        try {
          setGeneratingKey(true);
          
          // Call the backend API to generate keys
          const result = await clientApi.generateApiKey(params.id as string);
          
          // Show the generated keys to the user
          Modal.success({
            title: 'API Key Generated Successfully',
            content: (
              <div>
                <p><strong>Please save these credentials securely. They won't be shown again.</strong></p>
                <div >
                  <CentralText strong>API Key:</CentralText>
                  <Input.Password 
                    value={result.auth_key}
                    readOnly
                    
                  />
                </div>
                <div >
                  <CentralText strong>Auth IV:</CentralText>
                  <Input.Password 
                    value={result.auth_iv}
                    readOnly
                    
                  />
                </div>
              </div>
            ),
            width: 600,
            okText: 'I have saved the credentials'
          });
          
          // Reload client data to show new keys
          await loadClient(params.id as string);
        } catch (error: any) {
          console.error('Failed to generate API key:', error);
          message.error(error?.message || 'Failed to generate API key');
        } finally {
          setGeneratingKey(false);
        }
      }
    });
  };

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    notifySuccess(`${type} copied to clipboard`);
  };

  if (loading) {
    return (
      <div >
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div >
        <CentralAlert
          message="Error"
          description={error}
          type="error"
          action={
            <CentralButton size="small" danger onClick={() => router.back()}>
              Go Back
            </CentralButton>
          }
        />
      </div>
    );
  }

  if (!client) {
    return (
      <div >
        <CentralAlert
          message="Client Not Found"
          description="The requested client could not be found."
          type="warning"
          action={
            <CentralButton onClick={() => router.push('/clients')}>
              Back to Clients
            </CentralButton>
          }
        />
      </div>
    );
  }

  return (
    <div >
      <div >
        <StyledSpace>
          <CentralButton 
            icon={<ArrowLeftOutlined />} 
            onClick={() => router.back()}
          >
            Back
          </CentralButton>
          <CentralTitle level={3} >
            {client.client_name || 'Unknown Client'}
          </CentralTitle>
          <CentralTag color="blue">ID: {client.client_id}</CentralTag>
          <CentralTag color={client.active ? 'green' : 'red'}>
            {client.active ? 'Active' : 'Inactive'}
          </CentralTag>
        </StyledSpace>
      </div>

      <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
        <ResponsiveCol {...LAYOUT_CONFIG.twoThirds}>
          <StyledCard title="Client Information" extra={
            <CentralButton icon={<EditOutlined />} type="primary">
              Edit Client
            </CentralButton>
          }>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Client Name">
                <StyledSpace>
                  <ShopOutlined />
                  {client.client_name}
                </StyledSpace>
              </Descriptions.Item>
              <Descriptions.Item label="Client Code">
                {client.client_code || 'Not assigned'}
              </Descriptions.Item>
              <Descriptions.Item label="Client Type">
                {client.client_type || 'Standard'}
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <StyledSpace>
                  <MailOutlined />
                  {client.client_email ? (
                    <a href={`mailto:${client.client_email}`}>{client.client_email}</a>
                  ) : (
                    'Not provided'
                  )}
                </StyledSpace>
              </Descriptions.Item>
              <Descriptions.Item label="Contact">
                <StyledSpace>
                  <PhoneOutlined />
                  {client.client_contact || 'Not provided'}
                </StyledSpace>
              </Descriptions.Item>
              <Descriptions.Item label="Address">
                {client.client_address || 'Not provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Risk Category">
                <CentralTag color={client.risk_category <= 2 ? 'green' : client.risk_category <= 4 ? 'orange' : 'red'}>
                  Level {client.risk_category || 3}
                </CentralTag>
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <CentralTag color={client.active ? 'green' : 'red'}>
                  {client.active ? 'Active' : 'Inactive'}
                </CentralTag>
              </Descriptions.Item>
              <Descriptions.Item label="Created By">
                {client.created_by || 'System'}
              </Descriptions.Item>
              <Descriptions.Item label="Partner Bank ID">
                {client.partner_bank_id || 'Not assigned'}
              </Descriptions.Item>
            </Descriptions>
          </StyledCard>
        </ResponsiveCol>

        <ResponsiveCol {...LAYOUT_CONFIG.oneThird}>
          <StyledSpace direction="vertical"  size="large">
            <StyledCard title="Configuration Flags">
              <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
                <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
                  <CentralText type="secondary">Auth Flag:</CentralText>
                  <CentralTag color={client.auth_flag ? 'green' : 'red'}>
                    {client.auth_flag ? 'Enabled' : 'Disabled'}
                  </CentralTag>
                </ResponsiveCol>
                <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
                  <CentralText type="secondary">Enquiry:</CentralText>
                  <CentralTag color={client.enquiry_flag ? 'green' : 'red'}>
                    {client.enquiry_flag ? 'Yes' : 'No'}
                  </CentralTag>
                </ResponsiveCol>
                <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
                  <CentralText type="secondary">Refund:</CentralText>
                  <CentralTag color={client.refund_applicable ? 'green' : 'red'}>
                    {client.refund_applicable ? 'Yes' : 'No'}
                  </CentralTag>
                </ResponsiveCol>
                <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
                  <CentralText type="secondary">Push API:</CentralText>
                  <CentralTag color={client.push_api_flag ? 'green' : 'red'}>
                    {client.push_api_flag ? 'Yes' : 'No'}
                  </CentralTag>
                </ResponsiveCol>
                <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
                  <CentralText type="secondary">TPV:</CentralText>
                  <CentralTag color={client.tpv_flag ? 'green' : 'red'}>
                    {client.tpv_flag ? 'Yes' : 'No'}
                  </CentralTag>
                </ResponsiveCol>
                <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
                  <CentralText type="secondary">VAN:</CentralText>
                  <CentralTag color={client.van_flag ? 'green' : 'red'}>
                    {client.van_flag ? 'Yes' : 'No'}
                  </CentralTag>
                </ResponsiveCol>
              </ResponsiveRow>
            </StyledCard>

            <StyledCard 
              title="API Configuration" 
              extra={
                <CentralButton 
                  type="primary" 
                  icon={<KeyOutlined />}
                  onClick={generateApiKey}
                  loading={generatingKey}
                >
                  Generate New Key
                </CentralButton>
              }
            >
              <StyledSpace direction="vertical"  size="middle">
                <div>
                  <CentralText strong>API Key:</CentralText>
                  {client.auth_key ? (
                    <div >
                      <Input.Password
                        value={client.auth_key}
                        readOnly
                        visibilityToggle={{
                          visible: showApiKey,
                          onVisibleChange: setShowApiKey,
                        }}
                        addonAfter={
                          <Tooltip title="Copy API Key">
                            <CentralButton 
                              type="text" 
                              size="small" 
                              icon={<CopyOutlined />}
                              onClick={() => copyToClipboard(client.auth_key, 'API Key')}
                            />
                          </Tooltip>
                        }
                      />
                    </div>
                  ) : (
                    <div >
                      <CentralTag color="red">Not Generated</CentralTag>
                    </div>
                  )}
                </div>
                
                <div>
                  <CentralText strong>Auth IV:</CentralText>
                  {client.auth_iv ? (
                    <div >
                      <Input.Password
                        value={client.auth_iv}
                        readOnly
                        visibilityToggle={{
                          visible: showAuthIv,
                          onVisibleChange: setShowAuthIv,
                        }}
                        addonAfter={
                          <Tooltip title="Copy Auth IV">
                            <CentralButton 
                              type="text" 
                              size="small" 
                              icon={<CopyOutlined />}
                              onClick={() => copyToClipboard(client.auth_iv, 'Auth IV')}
                            />
                          </Tooltip>
                        }
                      />
                    </div>
                  ) : (
                    <div >
                      <CentralTag color="red">Not Generated</CentralTag>
                    </div>
                  )}
                </div>
                
                <div>
                  <CentralText strong>Auth Type:</CentralText>
                  <div >
                    <CentralTag>{client.auth_type || 'Standard'}</CentralTag>
                  </div>
                </div>
              </StyledSpace>
            </StyledCard>

            <StyledCard title="Account Information">
              <Descriptions column={1} size="small">
                <Descriptions.Item label="Created">
                  {client.creation_date ? new Date(client.creation_date).toLocaleDateString() : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Last Updated">
                  {client.update_date ? new Date(client.update_date).toLocaleDateString() : 'N/A'}
                </Descriptions.Item>
                <Descriptions.Item label="Updated By">
                  {client.update_by || 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </StyledCard>
            
            <StyledCard title="URLs Configuration">
              <StyledSpace direction="vertical"  size="small">
                <div>
                  <CentralText type="secondary">Success URL:</CentralText>
                  <div >
                    <CentralText code >
                      {client.success_ru_url || 'Not configured'}
                    </CentralText>
                  </div>
                </div>
                <div>
                  <CentralText type="secondary">Failed URL:</CentralText>
                  <div >
                    <CentralText code >
                      {client.failed_ru_url || 'Not configured'}
                    </CentralText>
                  </div>
                </div>
                <div>
                  <CentralText type="secondary">Push API URL:</CentralText>
                  <div >
                    <CentralText code >
                      {client.push_api_url || 'Not configured'}
                    </CentralText>
                  </div>
                </div>
              </StyledSpace>
            </StyledCard>
          </StyledSpace>
        </ResponsiveCol>
      </ResponsiveRow>
    </div>
  );
};

export default ClientDetailPage;
