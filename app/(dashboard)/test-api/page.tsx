'use client';

import React, { useState } from 'react';
import { CentralButton as Button, CentralText as Text, CentralTextArea, CentralTitle as Title, Divider, Input, StyledCard as Card, StyledSpace as Space, App } from '@/components/ui';
import { apiClient } from '@/services/api/apiClient';
import { notifySuccess, notifyInfo } from '@/utils/notify';

// Replaced by CentralTextArea

export default function TestAPIPage() {
  const { message } = App.useApp();
  const [loginResponse, setLoginResponse] = useState('');
  const [transactionResponse, setTransactionResponse] = useState('');
  const [token, setToken] = useState('');

  const testLogin = async () => {
    try {
      const api = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${api}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@sabpaisa.com',
          password: 'admin123'
        })
      });
      
      const data = await response.json();
      setLoginResponse(JSON.stringify(data, null, 2));
      
      if (data.access_token) {
        setToken(data.access_token);
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        notifySuccess('Login successful! Token saved to localStorage');
      }
    } catch (error: any) {
      setLoginResponse(`Error: ${error?.message || error}`);
      message.error(error?.message || 'Login failed');
    }
  };

  const testTransactions = async () => {
    try {
      const savedToken = localStorage.getItem('access_token');
      
      const api = process.env.NEXT_PUBLIC_API_URL || '';
      const response = await fetch(`${api}/transactions/?page=1&page_size=5`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${savedToken || token}`
        }
      });
      
      const data = await response.json();
      setTransactionResponse(JSON.stringify(data, null, 2));
      
      if (response.ok) {
        notifySuccess('Transactions fetched successfully!');
      } else {
        message.error(`Failed: ${data.detail || data.error}`);
      }
    } catch (error: any) {
      setTransactionResponse(`Error: ${error?.message || error}`);
      message.error(error?.message || 'Failed to fetch transactions');
    }
  };

  const testWithApiClient = async () => {
    try {
      const response = await apiClient.get('/transactions/?page=1&page_size=5');
      setTransactionResponse(JSON.stringify(response.data, null, 2));
      notifySuccess('Transactions fetched with apiClient!');
    } catch (error: any) {
      setTransactionResponse(`Error: ${error?.message}`);
      message.error(error?.message || 'Failed with apiClient');
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setToken('');
    setLoginResponse('');
    setTransactionResponse('');
    notifyInfo('Storage cleared');
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>API Test Page</Title>
      <Text>Test the authentication and transaction API endpoints</Text>
      
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Card title="Step 1: Login">
          <Space>
            <Button type="primary" onClick={testLogin}>
              Test Login (admin@sabpaisa.com)
            </Button>
            <Button onClick={clearStorage}>
              Clear Storage
            </Button>
          </Space>
          {loginResponse && (
            <>
              <Divider />
              <CentralTextArea value={loginResponse} rows={10} readOnly />
            </>
          )}
        </Card>

        <Card title="Step 2: Test Transactions API">
          <Space direction="vertical" style={{ width: '100%' }}>
            <Space>
              <Button type="primary" onClick={testTransactions}>
                Test with Fetch
              </Button>
              <Button onClick={testWithApiClient}>
                Test with apiClient
              </Button>
            </Space>
            
            <Text>Current Token: {token ? `${token.substring(0, 20)}...` : 'Not logged in'}</Text>
            <Text>localStorage Token: {localStorage.getItem('access_token') ? 'Present' : 'Not found'}</Text>
            
            {transactionResponse && (
              <>
                <Divider />
                <CentralTextArea value={transactionResponse} rows={15} readOnly />
              </>
            )}
          </Space>
        </Card>
      </Space>
    </div>
  );
}
