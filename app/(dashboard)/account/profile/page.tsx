'use client';

import React, { useState, useEffect } from 'react';
import { 
  StyledCard, 
  CentralAvatar, 
  CentralTitle,
  CentralText, 
  CentralButton, 
  Form, 
  Input, 
  Select, 
  Divider,
  StyledSpace,
  CentralBadge,
  CentralTag,
  message,
  Spin,
  CentralAlert
} from '@/components/ui';
import { notifyError, notifySuccess } from '@/utils/notify';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { useResponsive } from '@/hooks/useResponsive';
import {
  UserOutlined,
  MailOutlined,
  EditOutlined,
  SaveOutlined,
  IdcardOutlined,
  TeamOutlined
} from '@ant-design/icons';


interface UserProfile {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
}

const ProfilePage: React.FC = () => {
  const responsive = useResponsive();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [form] = Form.useForm();

  // Fetch user data from localStorage (set during login)
  useEffect(() => {
    const fetchUserProfile = () => {
      try {
        // Get user data from localStorage (stored during login)
        const userData = localStorage.getItem('user');
        if (userData) {
          const user = JSON.parse(userData);
          setUserProfile(user);
          form.setFieldsValue({
            first_name: user.first_name,
            last_name: user.last_name,
            username: user.username,
            email: user.email,
            role: user.role
          });
        } else {
          notifyError(null, 'No user data found. Please login again.');
        }
      } catch (error) {
        console.error('Error loading user profile:', error);
        notifyError(error, 'Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      
      // TODO: Call backend API to update user profile
      // For now, update localStorage
      const updatedUser = {
        ...userProfile,
        first_name: values.first_name,
        last_name: values.last_name
      };
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUserProfile(updatedUser);
      
      notifySuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      notifyError(error, 'Please fill in all required fields');
    }
  };

  const getRoleColor = (role: string) => {
    const roleColors: { [key: string]: string } = {
      super_admin: 'purple',
      operations_manager: 'blue',
      settlement_admin: 'green',
      client_manager: 'orange',
      compliance_officer: 'red',
      auditor: 'cyan',
      viewer: 'default'
    };
    return roleColors[role] || 'default';
  };

  const getRoleDisplayName = (role: string) => {
    const roleNames: { [key: string]: string } = {
      super_admin: 'Super Admin',
      operations_manager: 'Operations Manager',
      settlement_admin: 'Settlement Admin',
      client_manager: 'Client Manager',
      compliance_officer: 'Compliance Officer',
      auditor: 'Auditor',
      viewer: 'Viewer'
    };
    return roleNames[role] || role;
  };

  if (loading) {
    return (
      <ResponsiveContainer padding>
        <div>
          <Spin size="large" tip="Loading profile..." />
        </div>
      </ResponsiveContainer>
    );
  }

  if (!userProfile) {
    return (
      <ResponsiveContainer padding>
        <CentralAlert
          message="Profile Not Found"
          description="Unable to load user profile. Please login again."
          type="error"
          showIcon
        />
      </ResponsiveContainer>
    );
  }

  const fullName = `${userProfile.first_name} ${userProfile.last_name}`.trim() || userProfile.username;

  return (
    <ResponsiveContainer maxWidth="xl" padding background="glass" animate>
      <ResponsiveGrid layout="dashboard" background="none">
        <ResponsiveRow 
          animate
        >
          {/* Profile Header */}
          <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
            <div>
              <ResponsiveRow align="middle">
                <ResponsiveCol {...LAYOUT_CONFIG.common.compactSidebar}>
                  <div>
                    <CentralAvatar 
                      size={responsive.isMobile ? 80 : 100} 
                      icon={<UserOutlined />}
                    >
                      {fullName.charAt(0).toUpperCase()}
                    </CentralAvatar>
                  </div>
                </ResponsiveCol>
                <ResponsiveCol {...LAYOUT_CONFIG.common.wideContent}>
                  <div>
                    <CentralTitle level={2} ellipsis>
                      {fullName}
                    </CentralTitle>
                    <StyledSpace 
                      split={<Divider type="vertical" />} 
                      direction={responsive.isMobile ? 'vertical' : 'horizontal'}
                    >
                      <CentralText type="secondary" ellipsis>@{userProfile.username}</CentralText>
                      <CentralTag color={getRoleColor(userProfile.role)}>
                        {getRoleDisplayName(userProfile.role)}
                      </CentralTag>
                      <CentralText type="secondary" ellipsis>{userProfile.email}</CentralText>
                    </StyledSpace>
                  </div>
                </ResponsiveCol>
                <ResponsiveCol {...LAYOUT_CONFIG.common.quarter}>
                  <div>
                    {!isEditing ? (
                      <CentralButton 
                        type="primary" 
                        icon={<EditOutlined />}
                        onClick={() => setIsEditing(true)}
                        size={responsive.isMobile ? 'middle' : 'large'}
                      >
                        Edit Profile
                      </CentralButton>
                    ) : (
                      <StyledSpace direction={responsive.isMobile ? 'vertical' : 'horizontal'}>
                        <CentralButton 
                          type="primary" 
                          icon={<SaveOutlined />}
                          onClick={handleSave}
                          size={responsive.isMobile ? 'middle' : 'large'}
                        >
                          Save Changes
                        </CentralButton>
                        <CentralButton 
                          onClick={() => {
                            setIsEditing(false);
                            form.resetFields();
                          }}
                          size={responsive.isMobile ? 'middle' : 'large'}
                        >
                          Cancel
                        </CentralButton>
                      </StyledSpace>
                    )}
                  </div>
                </ResponsiveCol>
              </ResponsiveRow>
            </div>
          </ResponsiveCol>
        </ResponsiveRow>

        <ResponsiveRow 
          animate
        >
          {/* Profile Details */}
          <ResponsiveCol {...LAYOUT_CONFIG.twoThirds}>
            <div>
              <CentralTitle level={4} ellipsis>
                <IdcardOutlined />
                Profile Information
              </CentralTitle>
              <Form
                form={form}
                layout="vertical"
                disabled={!isEditing}
                onFinish={handleSave}
              >
                <ResponsiveRow>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                    <Form.Item
                      label="First Name"
                      name="first_name"
                      rules={[{ required: true, message: 'Please input your first name!' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="First Name" />
                    </Form.Item>
                  </ResponsiveCol>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                    <Form.Item
                      label="Last Name"
                      name="last_name"
                      rules={[{ required: true, message: 'Please input your last name!' }]}
                    >
                      <Input prefix={<UserOutlined />} placeholder="Last Name" />
                    </Form.Item>
                  </ResponsiveCol>
                </ResponsiveRow>

                <ResponsiveRow>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                    <Form.Item
                      label="Username"
                      name="username"
                    >
                      <Input prefix={<UserOutlined />} disabled />
                    </Form.Item>
                  </ResponsiveCol>
                  <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
                    <Form.Item
                      label="Email"
                      name="email"
                    >
                      <Input prefix={<MailOutlined />} disabled />
                    </Form.Item>
                  </ResponsiveCol>
                </ResponsiveRow>

                <Form.Item
                  label="Role"
                  name="role"
                >
                  <Select disabled>
                    <Select.Option value="super_admin">Super Admin</Select.Option>
                    <Select.Option value="operations_manager">Operations Manager</Select.Option>
                    <Select.Option value="settlement_admin">Settlement Admin</Select.Option>
                    <Select.Option value="client_manager">Client Manager</Select.Option>
                    <Select.Option value="compliance_officer">Compliance Officer</Select.Option>
                    <Select.Option value="auditor">Auditor</Select.Option>
                    <Select.Option value="viewer">Viewer</Select.Option>
                  </Select>
                </Form.Item>
              </Form>
            </div>
          </ResponsiveCol>

          {/* Quick Actions */}
          <ResponsiveCol {...LAYOUT_CONFIG.oneThird}>
            <div>
              <CentralTitle level={4} ellipsis>
                <TeamOutlined />
                Quick Actions
              </CentralTitle>
              <StyledSpace direction="vertical" size="large">
                <StyledCard size="small">
                  <div>
                    <CentralBadge status="success" />
                  <CentralText strong ellipsis>Account Active</CentralText>
                  </div>
                </StyledCard>
                
                <CentralButton 
                  block 
                  icon={<EditOutlined />}
                  disabled={isEditing}
                  onClick={() => setIsEditing(true)}
                >
                  Edit Information
                </CentralButton>
                
                <CentralButton 
                  block 
                  type="default"
                  icon={<MailOutlined />}
                >
                  Change Password
                </CentralButton>
                
                <div>
                  <CentralText type="secondary" ellipsis>Last login: </CentralText>
                  <CentralText ellipsis>Today, 2:30 PM</CentralText>
                </div>
              </StyledSpace>
            </div>
          </ResponsiveCol>
        </ResponsiveRow>
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
};

export default ProfilePage;
