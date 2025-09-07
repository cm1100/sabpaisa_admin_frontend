'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, List, Spin, CentralButton as Button, Form, Input, Select, App, CentralPageContainer, CentralProTable, ProColumns, StyledSpace } from '@/components/ui';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import ReportsApiService, { ReportTemplate } from '@/services/api/ReportsApiService';

export default function ReportsTemplatesPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [rows, setRows] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  // Use global App message instance

  const load = async () => {
    setLoading(true);
    try {
      const list = await ReportsApiService.listTemplates();
      setRows(list);
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
      } as any);
      message.success('Template created');
      form.resetFields();
      load();
    } catch (e: any) {
      message.error(e?.message || 'Failed to create template');
    }
  };

  const headerExtra = (
    <StyledSpace>
      <Button onClick={load}>Refresh</Button>
    </StyledSpace>
  );

  const columns: ProColumns<ReportTemplate>[] = [
    { title: 'Name', dataIndex: 'name', key: 'name', ellipsis: true },
    { title: 'Type', dataIndex: 'report_type', key: 'report_type' },
    { title: 'Format', dataIndex: 'format', key: 'format', render: (_, r) => String(r.format || '').toUpperCase() },
    { title: 'Description', dataIndex: 'description', key: 'description', ellipsis: true },
    {
      title: 'Actions', valueType: 'option', key: 'action',
      render: (_, r) => [
        <a key="run" onClick={() => ReportsApiService.runTemplate(r.template_id).then(() => message.success('Run triggered'))}>Run</a>,
      ]
    }
  ];

  return (
    <CentralPageContainer withBackground title="Report Templates" extra={headerExtra}>
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
        <ResponsiveGrid layout="dashboard" background="none">
          <ResponsiveRow gutter={16}>
            <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
              <StyledCard data-testid="stub-reports-templates">
                <Form layout="inline" form={form} onFinish={onCreate} style={{ marginBottom: 16 }}>
                  <Form.Item name="name" rules={[{ required: true }]}>
                    <Input placeholder="Template name" />
                  </Form.Item>
                  <Form.Item name="type" rules={[{ required: true }]}>
                    <Select style={{ width: 180 }} options={[
                      { value: 'TRANSACTIONS', label: 'Transactions' },
                      { value: 'REFUNDS', label: 'Refunds' },
                      { value: 'SETTLEMENTS', label: 'Settlements' },
                      { value: 'CLIENTS', label: 'Clients' },
                      { value: 'COMPLIANCE', label: 'Compliance' },
                    ]} />
                  </Form.Item>
                  <Form.Item name="format" initialValue="csv" rules={[{ required: true }]}>
                    <Select style={{ width: 120 }} options={[{ value: 'csv', label: 'CSV' }, { value: 'excel', label: 'Excel' }, { value: 'pdf', label: 'PDF' }]} />
                  </Form.Item>
                  <Form.Item name="description">
                    <Input placeholder="Description" />
                  </Form.Item>
                  <Button type="primary" htmlType="submit">Add</Button>
                </Form>
                {loading ? <Spin /> : (
                  <CentralProTable<ReportTemplate>
                    rowKey={(r) => r.template_id}
                    search={false}
                    columns={columns}
                    dataSource={rows}
                    pagination={{ pageSize: 10, showSizeChanger: false }}
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
