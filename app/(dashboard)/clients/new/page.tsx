/**
 * Onboard Client Page
 * Route: /clients/new - Client onboarding form
 */
'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CentralAlert, CentralButton, CentralText, CentralTextArea, CentralTitle, Divider, Form, Input, Select, Steps, StyledCard, StyledSpace, Switch, App, theme, CentralPageContainer } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import {
  ArrowLeftOutlined,
  SaveOutlined,
  ShopOutlined,
  UserOutlined,
  MailOutlined,
  PhoneOutlined,
  GlobalOutlined,
  CheckCircleOutlined,
  SafetyOutlined
} from '@ant-design/icons';
import { ClientApiService } from '@/services/api/ClientApiService';
import { notifySuccess } from '@/utils/notify';
import { useResponsive } from '@/hooks/useResponsive';

const { Option } = Select;
// Replaced by CentralTextArea

const OnboardClientPage: React.FC = () => {
  const { message } = App.useApp();
  const router = useRouter();
  const { token } = theme.useToken();
  const responsive = useResponsive();
  const clientApi = new ClientApiService();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState<any>({});

  // Restore form values when step changes
  useEffect(() => {
    form.setFieldsValue(formData);
  }, [currentStep, form, formData]);

  const steps = [
    {
      title: 'Client Information',
      description: 'Basic client details',
      icon: <UserOutlined />
    },
    {
      title: 'Business Details',
      description: 'Business type and category',
      icon: <ShopOutlined />
    },
    {
      title: 'API Configuration',
      description: 'API and integration settings',
      icon: <SafetyOutlined />
    },
    {
      title: 'Review & Submit',
      description: 'Review and confirm',
      icon: <CheckCircleOutlined />
    }
  ];

  const handleSubmit = async () => {
    try {
      setLoading(true);
      
      // Get values from the last step
      const lastStepValues = await form.validateFields();
      
      // Combine all form data from all steps
      const allValues = {
        ...formData,
        ...lastStepValues
      };
      
      console.log('All form values:', allValues); // Debug log
      
      // Ensure required fields have values
      if (!allValues.client_name || !allValues.client_contact) {
        message.error('Client name and contact are required. Please go back to step 1.');
        setCurrentStep(0); // Go back to first step
        setLoading(false);
        return;
      }
      
      const clientData = {
        client_name: allValues.client_name,
        client_code: allValues.client_code,
        client_email: allValues.client_email,
        client_contact: allValues.client_contact,
        client_address: allValues.client_address || 'Not Provided',
        client_type: allValues.client_type || 'Business',
        client_user_name: allValues.client_user_name || allValues.client_email?.split('@')[0],
        client_pass: allValues.client_pass || 'TempPass123!',
        active: true,
        auth_key: `auth_${Date.now()}`,
        auth_iv: `iv_${Date.now()}`,
        success_ru_url: allValues.success_ru_url || 'https://example.com/success',
        failed_ru_url: allValues.failed_ru_url || 'https://example.com/failed',
        push_api_url: allValues.push_api_url || 'https://example.com/webhook',
        client_logo_path: '/logos/default.png',
        refund_applicable: allValues.refund_applicable !== undefined ? allValues.refund_applicable : true,
        push_api_flag: allValues.push_api_flag !== undefined ? allValues.push_api_flag : true,
        auth_flag: allValues.auth_flag !== undefined ? allValues.auth_flag : true,
        risk_category: allValues.risk_category || 1
      };

      console.log('Sending data:', clientData); // Debug log
      
      const response = await clientApi.onboard(clientData as any);
      notifySuccess(response.message || 'Client onboarded successfully!');
      router.push('/clients');
    } catch (error: any) {
      console.error('Failed to onboard client:', error);
      
      // Handle validation errors from backend
      if (error.response?.data) {
        const errors = error.response.data;
        let errorMessage = 'Failed to onboard client:\n';
        
        // Check if it's a validation error object
        if (typeof errors === 'object' && !errors.error) {
          Object.keys(errors).forEach(field => {
            const fieldErrors = Array.isArray(errors[field]) ? errors[field] : [errors[field]];
            errorMessage += `${field}: ${fieldErrors.join(', ')}\n`;
          });
          message.error(errorMessage);
        } else {
          message.error(errors.error || errors.message || 'Failed to onboard client. Please try again.');
        }
      } else {
        message.error(error?.message || 'Failed to onboard client. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const nextStep = async () => {
    try {
      // Only validate fields for the current step
      const fieldsToValidate = getFieldsForStep(currentStep);
      const values = await form.validateFields(fieldsToValidate);
      
      // Store the values from current step
      setFormData((prevData: any) => ({
        ...prevData,
        ...values
      }));
      
      console.log('Step', currentStep, 'values:', values);
      console.log('Accumulated form data:', { ...formData, ...values });
      
      setCurrentStep(currentStep + 1);
    } catch (error: any) {
      console.error('Validation error:', error);
      message.error(error?.message || 'Please fill in all required fields');
    }
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 0:
        return ['client_name', 'client_code', 'client_email', 'client_contact', 'client_user_name', 'client_pass', 'client_address'];
      case 1:
        return ['client_type', 'risk_category', 'success_ru_url', 'failed_ru_url'];
      case 2:
        return ['push_api_url', 'auth_flag', 'push_api_flag', 'refund_applicable'];
      default:
        return [];
    }
  };

  const prevStep = () => {
    // Save current form values before going back
    const currentValues = form.getFieldsValue();
    setFormData((prevData: any) => ({
      ...prevData,
      ...currentValues
    }));
    setCurrentStep(currentStep - 1);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <>
            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="client_name"
                  label="Client Name"
                  rules={[{ required: true, message: 'Please enter client name' }]}
                >
                  <Input 
                    prefix={<ShopOutlined />} 
                    placeholder="Enter client name" 
                    size="large"
                  />
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="client_code"
                  label="Client Code"
                  rules={[{ required: true, message: 'Please enter client code' }]}
                >
                  <Input 
                    placeholder="Enter unique client code" 
                    size="large"
                  />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="client_email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input 
                    prefix={<MailOutlined />} 
                    placeholder="client@example.com" 
                    size="large"
                  />
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="client_contact"
                  label="Contact Number"
                  rules={[{ required: true, message: 'Please enter contact number' }]}
                >
                  <Input 
                    prefix={<PhoneOutlined />} 
                    placeholder="+91 9876543210" 
                    size="large"
                  />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="client_user_name"
                  label="Username"
                  rules={[{ required: true, message: 'Please enter username' }]}
                >
                  <Input 
                    prefix={<UserOutlined />} 
                    placeholder="Enter username" 
                    size="large"
                  />
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="client_pass"
                  label="Password"
                  rules={[{ required: true, message: 'Please enter password' }]}
                >
                  <Input.Password 
                    placeholder="Enter password" 
                    size="large"
                  />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
                <Form.Item
                  name="client_address"
                  label="Address"
                  rules={[{ required: true, message: 'Please enter client address' }]}
                >
                  <Input.TextArea 
                    placeholder="Enter client address" 
                    rows={3}
                  />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>
          </>
        );

      case 1:
        return (
          <>
            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="client_type"
                  label="Business Type"
                  rules={[{ required: true, message: 'Please select business type' }]}
                >
                  <Select placeholder="Select business type" size="large">
                    <Option value="Business">Business</Option>
                    <Option value="E-commerce">E-commerce</Option>
                    <Option value="Education">Education</Option>
                    <Option value="Healthcare">Healthcare</Option>
                    <Option value="Finance">Finance</Option>
                    <Option value="Technology">Technology</Option>
                    <Option value="Retail">Retail</Option>
                    <Option value="Other">Other</Option>
                  </Select>
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="risk_category"
                  label="Risk Category"
                  rules={[{ required: true, message: 'Please select risk category' }]}
                >
                  <Select placeholder="Select risk category" size="large">
                    <Option value={1}>Low Risk (1)</Option>
                    <Option value={2}>Low-Medium Risk (2)</Option>
                    <Option value={3}>Medium Risk (3)</Option>
                    <Option value={4}>Medium-High Risk (4)</Option>
                    <Option value={5}>High Risk (5)</Option>
                  </Select>
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
                <Form.Item
                  name="success_ru_url"
                  label="Success Redirect URL"
                  rules={[{ required: true, message: 'Please enter success redirect URL' }]}
                >
                  <Input 
                    prefix={<GlobalOutlined />} 
                    placeholder="https://your-domain.com/success" 
                    size="large"
                  />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
                <Form.Item
                  name="failed_ru_url"
                  label="Failed Redirect URL"
                  rules={[{ required: true, message: 'Please enter failed redirect URL' }]}
                >
                  <Input 
                    prefix={<GlobalOutlined />} 
                    placeholder="https://your-domain.com/failed" 
                    size="large"
                  />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>
          </>
        );

      case 2:
        return (
          <>
            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
                <Form.Item
                  name="push_api_url"
                  label="Webhook URL"
                  rules={[{ required: true, message: 'Please enter webhook URL' }]}
                >
                  <Input 
                    prefix={<GlobalOutlined />} 
                    placeholder="https://your-domain.com/webhook" 
                    size="large"
                  />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.oneThird}>
                <Form.Item
                  name="auth_flag"
                  label="Enable Authentication"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.oneThird}>
                <Form.Item
                  name="push_api_flag"
                  label="Enable Webhooks"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.oneThird}>
                <Form.Item
                  name="refund_applicable"
                  label="Enable Refunds"
                  valuePropName="checked"
                  initialValue={true}
                >
                  <Switch checkedChildren="Yes" unCheckedChildren="No" />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <Divider />

            <ResponsiveRow>
              <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
                <StyledCard >
                  <CentralText strong>API Configuration Notes:</CentralText>
                  <ul>
                    <li>Authentication flag enables API key verification</li>
                    <li>Webhook flag enables transaction status updates</li>
                    <li>Refund flag allows processing refunds for this client</li>
                  </ul>
                </StyledCard>
              </ResponsiveCol>
            </ResponsiveRow>
          </>
        );

      case 3:
        // Combine all accumulated data with current form values
        const currentValues = form.getFieldsValue();
        const values = { ...formData, ...currentValues };
        console.log('Review data:', values);
        return (
          <StyledCard>
            <CentralTitle level={4}>Review Client Information</CentralTitle>
            <Divider />
            
            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <CentralText strong>Client Name:</CentralText> {values.client_name}
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <CentralText strong>Client Code:</CentralText> {values.client_code}
              </ResponsiveCol>
            </ResponsiveRow>
            
            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]} >
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <CentralText strong>Email:</CentralText> {values.client_email}
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <CentralText strong>Contact:</CentralText> {values.client_contact}
              </ResponsiveCol>
            </ResponsiveRow>
            
            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]} >
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <CentralText strong>Business Type:</CentralText> {values.client_type}
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <CentralText strong>Risk Category:</CentralText> {values.risk_category}
              </ResponsiveCol>
            </ResponsiveRow>
            
            <Divider />
            
            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
                <CentralText strong>Success URL:</CentralText> {values.success_ru_url}
              </ResponsiveCol>
            </ResponsiveRow>
            
            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]} >
              <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
                <CentralText strong>Failed URL:</CentralText> {values.failed_ru_url}
              </ResponsiveCol>
            </ResponsiveRow>
            
            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]} >
              <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
                <CentralText strong>Webhook URL:</CentralText> {values.push_api_url}
              </ResponsiveCol>
            </ResponsiveRow>
            
            <Divider />
            
            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.oneThird}>
                <CentralText strong>Authentication:</CentralText> {values.auth_flag ? 'Enabled' : 'Disabled'}
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.oneThird}>
                <CentralText strong>Webhooks:</CentralText> {values.push_api_flag ? 'Enabled' : 'Disabled'}
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.oneThird}>
                <CentralText strong>Refunds:</CentralText> {values.refund_applicable ? 'Enabled' : 'Disabled'}
              </ResponsiveCol>
            </ResponsiveRow>
          </StyledCard>
        );

      default:
        return null;
    }
  };

  return (
    <CentralPageContainer withBackground title="Onboard New Client" subTitle="Create a new client and configure defaults">
      <div >
        <CentralTitle level={2}>Onboard New Client</CentralTitle>
        <CentralButton 
          onClick={() => router.push('/clients')}
          icon={<ArrowLeftOutlined />}
        >
          Back to Clients
        </CentralButton>
      </div>
      
      <StyledCard>
        <Steps 
          current={currentStep} 
          items={steps}
          
        />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {renderStepContent()}

          <Divider />

          <ResponsiveRow justify="space-between">
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              {currentStep > 0 && (
                <CentralButton onClick={prevStep} size="large">
                  Previous
                </CentralButton>
              )}
            </ResponsiveCol>
            <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
              <StyledSpace>
                <CentralButton onClick={() => router.push('/clients')}>
                  Cancel
                </CentralButton>
                {currentStep < steps.length - 1 ? (
                  <CentralButton type="primary" onClick={nextStep} size="large">
                    Next
                  </CentralButton>
                ) : (
                  <CentralButton
                    type="primary"
                    htmlType="submit"
                    loading={loading}
                    icon={<SaveOutlined />}
                    size="large"
                  >
                    Complete Onboarding
                  </CentralButton>
                )}
              </StyledSpace>
            </ResponsiveCol>
          </ResponsiveRow>
        </Form>
      </StyledCard>
    </CentralPageContainer>
  );
};

export default OnboardClientPage;
