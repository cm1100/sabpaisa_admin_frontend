'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, Form, Input, Select, DatePicker, CentralButton as Button, List, App, Spin, CentralPageContainer } from '@/components/ui';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import ReportsApiService, { ReportTemplate } from '@/services/api/ReportsApiService';

export default function ReportsBuilderPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const list = await ReportsApiService.listTemplates();
      setTemplates(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (values: any) => {
    try {
      await ReportsApiService.createTemplate({
        name: values.name,
        report_type: values.type,
        format: values.format,
        description: values.description,
        query_params: {
          date_from: values.period?.[0]?.format?.('YYYY-MM-DD'),
          date_to: values.period?.[1]?.format?.('YYYY-MM-DD'),
        }
      } as any);
      message.success('Template created');
      form.resetFields();
      load();
    } catch (e: any) {
      message.error(e?.message || 'Failed to create template');
    }
  };

  return (
    <CentralPageContainer withBackground title="Report Builder">
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
      <ResponsiveRow gutter={16}>
        <ResponsiveCol span={24}>
          <StyledCard data-testid="stub-reports-builder">
          {/* message via App */}
          <Form form={form} layout="vertical" onFinish={onCreate} style={{ marginBottom: 16 }}>
            <Form.Item name="name" label="Name" rules={[{ required: true }]}>
              <Input placeholder="e.g. Monthly Settlements" />
            </Form.Item>
            <Form.Item name="type" label="Type" rules={[{ required: true }]}>
              <Select options={[
                { value: 'TRANSACTIONS', label: 'Transactions' },
                { value: 'REFUNDS', label: 'Refunds' },
                { value: 'SETTLEMENTS', label: 'Settlements' },
                { value: 'CLIENTS', label: 'Clients' },
                { value: 'COMPLIANCE', label: 'Compliance' },
              ]} />
            </Form.Item>
            <Form.Item name="format" label="Format" initialValue="csv" rules={[{ required: true }]}>
              <Select options={[{ value: 'csv', label: 'CSV' }, { value: 'excel', label: 'Excel' }, { value: 'pdf', label: 'PDF' }]} />
            </Form.Item>
            <Form.Item name="period" label="Period">
              <DatePicker.RangePicker />
            </Form.Item>
            <Form.Item name="description" label="Description">
              <Input.TextArea rows={2} />
            </Form.Item>
            <Button type="primary" htmlType="submit">Create Template</Button>
          </Form>

          {loading ? <Spin /> : (
            <List
              size="small"
              dataSource={templates}
              renderItem={(t) => (
                <List.Item>
                  <CentralText>{t.name} • {t.report_type} • {t.format.toUpperCase()}</CentralText>
                </List.Item>
              )}
            />
          )}
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>
      </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
  );
}
