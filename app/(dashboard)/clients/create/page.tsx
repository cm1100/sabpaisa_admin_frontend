/**
 * Create Client Page
 * Route: /clients/create - New client creation form
 */
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  StyledCard,
  Form,
  Input,
  Select,
  CentralButton,
  StyledSpace,
  CentralTitle,
  CentralText,
  Divider,
  message,
  Steps,
  theme
} from '@/components/ui';
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
  BankOutlined
} from '@ant-design/icons';
import { ClientApiService } from '@/services/api/ClientApiService';
import { notifySuccess } from '@/utils/notify';

const { Option } = Select;

const CreateClientPage: React.FC = () => {
  const router = useRouter();
  const { token } = theme.useToken();
  const clientApi = new ClientApiService();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Basic Information',
      description: 'Company and contact details'
    },
    {
      title: 'Business Configuration',
      description: 'Industry and tier settings'
    },
    {
      title: 'Settlement Setup',
      description: 'Payment and settlement configuration'
    }
  ];

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);
      const clientData = {
        ...values,
        status: 'pending', // New clients start as pending
        apiKeys: {
          live: false,
          test: true // Enable test keys by default
        },
        totalVolume: 0,
        transactionCount: 0,
        createdAt: new Date().toISOString()
      };

      await clientApi.create(clientData);
      notifySuccess('Client created successfully!');
      router.push('/clients');
    } catch (error: any) {
      console.error('Failed to create client:', error);
      message.error(error?.message || 'Failed to create client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    form.validateFields().then(() => {
      setCurrentStep(currentStep + 1);
    }).catch((error: any) => {
      message.error(error?.message || 'Please fill in all required fields');
    });
  };

  const prevStep = () => {
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
                  name="name"
                  label="Company Name"
                  rules={[{ required: true, message: 'Please enter company name' }]}
                >
                  <Input prefix={<ShopOutlined />} placeholder="Enter company name" />
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="contactPerson"
                  label="Contact Person"
                  rules={[{ required: true, message: 'Please enter contact person' }]}
                >
                  <Input prefix={<UserOutlined />} placeholder="Enter contact person name" />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="email"
                  label="Email Address"
                  rules={[
                    { required: true, message: 'Please enter email' },
                    { type: 'email', message: 'Please enter a valid email' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} placeholder="Enter email address" />
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="phone"
                  label="Phone Number"
                  rules={[{ required: true, message: 'Please enter phone number' }]}
                >
                  <Input prefix={<PhoneOutlined />} placeholder="Enter phone number" />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
                <Form.Item
                  name="website"
                  label="Website"
                  rules={[{ type: 'url', message: 'Please enter a valid URL' }]}
                >
                  <Input prefix={<GlobalOutlined />} placeholder="https://example.com" />
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
                  name="industry"
                  label="Industry"
                  rules={[{ required: true, message: 'Please select industry' }]}
                >
                  <Select placeholder="Select industry">
                    <Option value="e-commerce">E-commerce</Option>
                    <Option value="education">Education</Option>
                    <Option value="healthcare">Healthcare</Option>
                    <Option value="retail">Retail</Option>
                    <Option value="technology">Technology</Option>
                    <Option value="finance">Finance</Option>
                    <Option value="travel">Travel</Option>
                    <Option value="entertainment">Entertainment</Option>
                    <Option value="government">Government</Option>
                    <Option value="ngo">NGO</Option>
                  </Select>
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="tier"
                  label="Client Tier"
                  rules={[{ required: true, message: 'Please select tier' }]}
                  initialValue="basic"
                >
                  <Select placeholder="Select tier">
                    <Option value="basic">Basic</Option>
                    <Option value="standard">Standard</Option>
                    <Option value="premium">Premium</Option>
                    <Option value="enterprise">Enterprise</Option>
                  </Select>
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>
          </>
        );

      case 2:
        return (
          <>
            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="settlementCycle"
                  label="Settlement Cycle"
                  rules={[{ required: true, message: 'Please select settlement cycle' }]}
                  initialValue="T+1"
                >
                  <Select placeholder="Select settlement cycle">
                    <Option value="T+0">T+0 (Same Day)</Option>
                    <Option value="T+1">T+1 (Next Day)</Option>
                    <Option value="T+2">T+2 (2 Days)</Option>
                    <Option value="T+3">T+3 (3 Days)</Option>
                    <Option value="T+7">T+7 (Weekly)</Option>
                  </Select>
                </Form.Item>
              </ResponsiveCol>
              <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                <Form.Item
                  name="settlementAccount"
                  label="Settlement Account Number"
                  rules={[
                    { required: true, message: 'Please enter settlement account' },
                    { min: 9, message: 'Account number must be at least 9 digits' },
                    { max: 18, message: 'Account number cannot exceed 18 digits' }
                  ]}
                >
                  <Input prefix={<BankOutlined />} placeholder="Enter account number" />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>

            <ResponsiveRow mobileGutter={[12, 12]} tabletGutter={[16, 16]} desktopGutter={[16, 16]}>
              <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
                <Form.Item
                  name="bankName"
                  label="Bank Name"
                  rules={[{ required: true, message: 'Please enter bank name' }]}
                >
                  <Input placeholder="Enter bank name" />
                </Form.Item>
              </ResponsiveCol>
            </ResponsiveRow>
          </>
        );

      default:
        return null;
    }
  };

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
            Create New Client
          </CentralTitle>
        </StyledSpace>
      </div>

      <StyledCard>
        <Steps current={currentStep} items={steps}  />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          requiredMark="optional"
        >
          {renderStepContent()}

          <Divider />

          <div >
            <div>
              {currentStep > 0 && (
                <CentralButton onClick={prevStep}>
                  Previous
                </CentralButton>
              )}
            </div>
            
            <div>
              {currentStep < steps.length - 1 ? (
                <CentralButton type="primary" onClick={nextStep}>
                  Next
                </CentralButton>
              ) : (
                <CentralButton 
                  type="primary" 
                  icon={<SaveOutlined />}
                  htmlType="submit" 
                  loading={loading}
                >
                  Create Client
                </CentralButton>
              )}
            </div>
          </div>
        </Form>
      </StyledCard>
    </div>
  );
};

export default CreateClientPage;
