'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, List, Tag, Spin, CentralPageContainer, SmartLoader, Empty, App, Modal, Form, Input, Select, DatePicker, StyledSpace, CentralButton, CentralProTable, ProColumns } from '@/components/ui';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import ComplianceApiService, { ComplianceDocument } from '@/services/api/ComplianceApiService';

export default function ComplianceDocumentsPage() {
  const { message } = App.useApp();
  const [docs, setDocs] = useState<ComplianceDocument[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [adding, setAdding] = useState(false);
  const [form] = Form.useForm();

  const refresh = async () => {
    try {
      setLoading(true);
      const resp = await ComplianceApiService.listDocuments();
      const data: any = (resp as any).data ?? resp;
      setDocs(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const headerExtra = (
    <StyledSpace>
      <CentralButton type="primary" onClick={() => setShowModal(true)}>Add Document</CentralButton>
    </StyledSpace>
  );

  const onCreate = async (values: any) => {
    try {
      setAdding(true);
      const payload = {
        title: values.title,
        doc_type: values.doc_type,
        status: values.status,
        due_date: values.due_date?.format?.('YYYY-MM-DD'),
        tags: values.tags ? { tags: values.tags.split(',').map((s: string) => s.trim()) } : undefined,
      };
      await ComplianceApiService.createDocument(payload as any);
      message.success('Document created');
      setShowModal(false);
      form.resetFields();
      await refresh();
    } catch (e: any) {
      message.error(e?.message || 'Failed to create document');
    } finally {
      setAdding(false);
    }
  };

  const columns: ProColumns<ComplianceDocument>[] = [
    { title: 'Title', dataIndex: 'title', key: 'title', ellipsis: true },
    { title: 'Type', dataIndex: 'doc_type', key: 'doc_type' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
    { title: 'Due Date', dataIndex: 'due_date', key: 'due_date' },
    { title: 'Uploaded By', dataIndex: 'uploaded_by', key: 'uploaded_by' },
    { title: 'Uploaded At', dataIndex: 'uploaded_at', key: 'uploaded_at' },
  ];

  return (
    <>
    <CentralPageContainer withBackground title="Compliance Documents" extra={headerExtra}>
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
      <ResponsiveRow gutter={16}>
        <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
          <StyledCard title="Compliance Documents" data-testid="stub-compliance-documents">
            <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 6, title: true }}>
              <CentralProTable<ComplianceDocument>
                rowKey={(d) => d.doc_id}
                search={false}
                columns={columns}
                dataSource={docs}
                pagination={{ pageSize: 10, showSizeChanger: false }}
              />
            </SmartLoader>
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>
      </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
    <Modal
      title="Add Document"
      open={showModal}
      onCancel={() => setShowModal(false)}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={onCreate}>
        <Form.Item name="title" label="Title" rules={[{ required: true }]}>
          <Input placeholder="Document title" />
        </Form.Item>
        <Form.Item name="doc_type" label="Type" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'POLICY', label: 'Policy' },
              { value: 'RBI_CIRCULAR', label: 'RBI Circular' },
              { value: 'AUDIT_REPORT', label: 'Audit Report' },
              { value: 'KYC_SAMPLE', label: 'KYC Sample' },
            ]}
          />
        </Form.Item>
        <Form.Item name="status" label="Status" initialValue="ACTIVE" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'ACTIVE', label: 'Active' },
              { value: 'ARCHIVED', label: 'Archived' },
              { value: 'DRAFT', label: 'Draft' },
            ]}
          />
        </Form.Item>
        <Form.Item name="due_date" label="Due Date">
          <DatePicker style={{ width: '100%' }} />
        </Form.Item>
        <Form.Item name="tags" label="Tags (comma-separated)">
          <Input placeholder="e.g. PCI, renewal" />
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
