'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, Form, Select, Switch, Input, CentralButton as Button, List, Spin, App, CentralPageContainer } from '@/components/ui';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import ReportsApiService, { ScheduledReport, ReportTemplate } from '@/services/api/ReportsApiService';

export default function ReportsScheduledPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [schedules, setSchedules] = useState<ScheduledReport[]>([]);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [s, t] = await Promise.all([
        ReportsApiService.listSchedules(),
        ReportsApiService.listTemplates(),
      ]);
      setSchedules(s);
      setTemplates(t);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const onCreate = async (values: any) => {
    try {
      await ReportsApiService.createSchedule({
        template: values.template,
        cadence: values.cadence,
        cron: values.cron,
        enabled: values.enabled,
        recipients: values.recipients ? values.recipients.split(',').map((s: string) => s.trim()) : [],
      } as any);
      message.success('Schedule created');
      form.resetFields();
      load();
    } catch (e: any) {
      message.error(e?.message || 'Failed to create schedule');
    }
  };

  return (
    <CentralPageContainer withBackground title="Scheduled Reports">
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
      <ResponsiveRow gutter={16}>
        <ResponsiveCol span={24}>
          <StyledCard data-testid="stub-reports-scheduled">
          {/* message via App */}
          <Form layout="vertical" form={form} onFinish={onCreate} style={{ marginBottom: 16 }}>
            <Form.Item name="template" label="Template" rules={[{ required: true }]}>
              <Select options={templates.map(t => ({ value: t.template_id, label: `${t.name} (${t.report_type})` }))} />
            </Form.Item>
            <Form.Item name="cadence" label="Cadence" rules={[{ required: true }]} initialValue="DAILY">
              <Select options={[{ value: 'DAILY', label: 'Daily' }, { value: 'WEEKLY', label: 'Weekly' }, { value: 'MONTHLY', label: 'Monthly' }, { value: 'CRON', label: 'CRON' }]} />
            </Form.Item>
            <Form.Item name="cron" label="CRON (optional)">
              <Input placeholder="e.g. 0 8 * * *" />
            </Form.Item>
            <Form.Item name="enabled" label="Enabled" valuePropName="checked" initialValue={true}>
              <Switch />
            </Form.Item>
            <Form.Item name="recipients" label="Recipients (comma-separated emails)">
              <Input />
            </Form.Item>
            <Button type="primary" htmlType="submit">Create Schedule</Button>
          </Form>

          {loading ? <Spin /> : (
            <List
              size="small"
              dataSource={schedules}
              renderItem={(s) => (
                <List.Item>
                  {templates.find(t => t.template_id === (s.template as any))?.name || s.template}
                  &nbsp;• {s.cadence} • {s.enabled ? 'Enabled' : 'Disabled'}
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
