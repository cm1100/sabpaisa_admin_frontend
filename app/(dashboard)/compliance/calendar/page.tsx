'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, List, Tag, Spin, CentralPageContainer, SmartLoader, Empty, App, Modal, Form, Input, DatePicker, Select, StyledSpace, CentralButton } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import ComplianceApiService, { RegulatoryEvent } from '@/services/api/ComplianceApiService';

export default function ComplianceCalendarPage() {
  const { message } = App.useApp();
  const [events, setEvents] = useState<RegulatoryEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await ComplianceApiService.listCalendar();
        const data: any = (resp as any).data ?? resp;
        setEvents(data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const headerExtra = (
    <StyledSpace>
      <CentralButton type="primary" onClick={() => setShowModal(true)}>Add Event</CentralButton>
    </StyledSpace>
  );

  const refresh = async () => {
    try {
      setLoading(true);
      const resp = await ComplianceApiService.listCalendar();
      const data: any = (resp as any).data ?? resp;
      setEvents(data || []);
    } finally {
      setLoading(false);
    }
  };

  const onCreate = async (values: any) => {
    try {
      setAdding(true);
      const payload = {
        title: values.title,
        description: values.description,
        category: values.category,
        rbi_reference: values.rbi_reference,
        due_date: values.due_date?.format?.('YYYY-MM-DD'),
        status: values.status,
      };
      await ComplianceApiService.createCalendarEvent(payload);
      message.success('Event created');
      setShowModal(false);
      form.resetFields();
      await refresh();
    } catch (e: any) {
      message.error(e?.message || 'Failed to create event');
    } finally {
      setAdding(false);
    }
  };

  return (
    <>
    <CentralPageContainer withBackground title="Compliance Regulatory Calendar" extra={headerExtra}>
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
      <ResponsiveRow gutter={16}>
        <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
        <StyledCard title="Compliance Regulatory Calendar" data-testid="stub-compliance-calendar">
          <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 6, title: true }}>
            {(!events || events.length === 0) ? (
              <Empty description={<CentralText type="secondary">No events scheduled</CentralText>} />
            ) : (
              <List
                size="small"
                dataSource={events}
                renderItem={(item) => (
                  <List.Item>
                    <CentralText>
                      <Tag color={item.status === 'OVERDUE' ? 'red' : item.status === 'DUE_SOON' ? 'orange' : 'green'}>
                        {item.status}
                      </Tag>
                      {item.title} • {new Date(item.due_date).toLocaleDateString()} {item.rbi_reference ? `• ${item.rbi_reference}` : ''}
                    </CentralText>
                  </List.Item>
                )}
              />
            )}
          </SmartLoader>
        </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>
      </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
    <Modal
      title="Add Regulatory Event"
      open={showModal}
      onCancel={() => setShowModal(false)}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onCreate}>
        <Form.Item name="title" label="Title" rules={[{ required: true, message: 'Title is required' }]}>
          <Input placeholder="Event title" />
        </Form.Item>
        <Form.Item name="description" label="Description">
          <Input.TextArea rows={3} placeholder="Optional description" />
        </Form.Item>
        <Form.Item name="category" label="Category" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'RBI', label: 'RBI' },
              { value: 'PCI_DSS', label: 'PCI DSS' },
              { value: 'INTERNAL_AUDIT', label: 'Internal Audit' },
            ]}
          />
        </Form.Item>
        <Form.Item name="rbi_reference" label="RBI Reference">
          <Input placeholder="Optional RBI ref" />
        </Form.Item>
        <Form.Item name="due_date" label="Due Date" rules={[{ required: true }]}>
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="status" label="Status" initialValue="UPCOMING" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'UPCOMING', label: 'Upcoming' },
              { value: 'DUE_SOON', label: 'Due Soon' },
              { value: 'OVERDUE', label: 'Overdue' },
              { value: 'COMPLETED', label: 'Completed' },
            ]}
          />
        </Form.Item>
        <StyledSpace>
          <CentralButton type="primary" htmlType="submit" loading={adding}>Create</CentralButton>
          <CentralButton onClick={() => setShowModal(false)}>Cancel</CentralButton>
        </StyledSpace>
      </Form>
    </Modal>
    </>
  );
}
