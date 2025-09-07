'use client';

import React, { useState } from 'react';
import { StyledCard as Card, Form, Input, CentralButton as Button, StyledSpace as Space, Divider, message, CentralTitle, CentralText } from '@/components/ui';
import { notifySuccess } from '@/utils/notify';
import { UserOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Typography components imported directly from centralized UI

interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function SignupPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const onFinish = async (values: SignupFormData) => {
    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Call Django registration API
      const api = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${api}/auth/register/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: values.email,
          password: values.password,
          firstName: values.firstName,
          lastName: values.lastName,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }
      
      notifySuccess('Account created successfully! You can now log in.');
      router.push('/login?message=signup-success');
      
    } catch (err: any) {
      console.error('Signup error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Social signup removed

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--glass-bg-gradient)',
      padding: 'var(--spacing-lg)'
    }}>
      <Card
        style={{
          width: '100%',
          maxWidth: 480,
          borderRadius: 'var(--border-radius-lg)',
          boxShadow: 'var(--shadow-card-xl)',
          background: 'var(--glass-bg-card)',
          backdropFilter: 'var(--glass-backdrop-filter)',
          border: 'var(--glass-border)'
        }}
        styles={{ body: { padding: 'var(--spacing-xxxxl)' } }}
      >
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'var(--glass-bg-primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto var(--spacing-lg)',
              color: 'var(--color-white)',
              fontSize: '32px',
              fontWeight: 'bold',
              boxShadow: 'var(--shadow-primary)'
            }}>
              S
            </div>
            <CentralTitle level={2} style={{ margin: '0 0 var(--spacing-sm) 0', color: 'var(--color-text-primary)' }}>
              Create Account
            </CentralTitle>
            <CentralText type="secondary" style={{ fontSize: 'var(--font-size-16)' }}>
              Join SabPaisa Admin Dashboard
            </CentralText>
          </div>

          {error && (
            <div style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              backgroundColor: 'var(--color-error-bg)',
              border: '1px solid var(--color-error-border)',
              borderRadius: 'var(--border-radius-sm)',
              color: 'var(--color-error)'
            }}>
              {error}
            </div>
          )}

          <Form
            name="signup"
            onFinish={onFinish}
            layout="vertical"
            size="large"
            autoComplete="off"
          >
            <Space direction="horizontal" style={{ width: '100%' }}>
              <Form.Item
                name="firstName"
                label="First Name"
                rules={[{ required: true, message: 'Please enter your first name!' }]}
                style={{ flex: 1, marginBottom: 'var(--spacing-lg)' }}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="First Name"
                  style={{ borderRadius: 'var(--border-radius-sm)' }}
                />
              </Form.Item>
              <Form.Item
                name="lastName"
                label="Last Name"
                rules={[{ required: true, message: 'Please enter your last name!' }]}
                style={{ flex: 1, marginBottom: 'var(--spacing-lg)' }}
              >
                <Input 
                  prefix={<UserOutlined />} 
                  placeholder="Last Name"
                  style={{ borderRadius: 'var(--border-radius-sm)' }}
                />
              </Form.Item>
            </Space>

            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, message: 'Please enter your email!' },
                { type: 'email', message: 'Please enter a valid email!' }
              ]}
            >
              <Input 
                prefix={<MailOutlined />} 
                placeholder="Enter your email"
                style={{ borderRadius: 'var(--border-radius-sm)' }}
              />
            </Form.Item>

            <Form.Item
              name="password"
              label="Password"
              rules={[
                { required: true, message: 'Please enter your password!' },
                { min: 8, message: 'Password must be at least 8 characters!' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Create a password"
                style={{ borderRadius: 'var(--border-radius-sm)' }}
              />
            </Form.Item>

            <Form.Item
              name="confirmPassword"
              label="Confirm Password"
              rules={[
                { required: true, message: 'Please confirm your password!' }
              ]}
            >
              <Input.Password 
                prefix={<LockOutlined />} 
                placeholder="Confirm your password"
                style={{ borderRadius: 'var(--border-radius-sm)' }}
              />
            </Form.Item>

            <Form.Item style={{ marginBottom: 0 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                loading={loading}
                style={{ 
                  width: '100%', 
                  height: 48, 
                  borderRadius: 'var(--border-radius-sm)',
                  background: 'var(--glass-bg-primary-gradient)',
                  border: 'none',
                  fontSize: 'var(--font-size-16)',
                  fontWeight: 600
                }}
              >
                Create Account
              </Button>
            </Form.Item>
          </Form>

          {/* Social signup removed */}

          <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)' }}>
            <CentralText type="secondary">
              Already have an account?{' '}
              <Link 
                href="/login" 
                style={{ 
                  color: 'var(--color-primary)', 
                  fontWeight: 500,
                  textDecoration: 'none'
                }}
              >
                Sign In
              </Link>
            </CentralText>
          </div>
        </Space>
      </Card>
    </div>
  );
}
