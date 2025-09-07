'use client';

import React, { useEffect, useRef, useState } from 'react';
import { CentralPageContainer, CentralProTable, ProColumns, StyledCard, StyledSpace, CentralButton as Button, Modal, Form, Input, Switch, App, InputNumber } from '@/components/ui';
import ClientTemplatesApiService, { ClientTemplate } from '@/services/api/ClientTemplatesApiService';

const ClientTemplatesPage: React.FC = () => {
  const { message } = App.useApp();
  const actionRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<ClientTemplate | null>(null);
  const [form] = Form.useForm();

  const columns: ProColumns<ClientTemplate>[] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Base Client', dataIndex: 'base_client_code', key: 'base_client_code' },
    { title: 'Active', dataIndex: 'is_active', key: 'is_active', render: (val) => <span>{val ? 'Yes' : 'No'}</span> },
    { title: 'Updated', dataIndex: 'updated_at', key: 'updated_at' },
  ];

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        base_client_code: values.base_client_code || undefined,
        is_active: values.is_active,
        template_json: safeParse(values.template_json) || {},
      } as any;
      if (editing) await ClientTemplatesApiService.update(editing.id, payload);
      else await ClientTemplatesApiService.create(payload);
      setOpen(false); setEditing(null); form.resetFields();
      actionRef.current?.reload();
      message.success('Saved');
    } catch (e:any) {
      if (e?.errorFields) return; // form errors
      message.error(e?.message || 'Failed to save');
    }
  };

  const safeParse = (s: any) => { if (!s) return undefined; if (typeof s === 'object') return s; try { return JSON.parse(String(s)); } catch { return undefined; } };

  return (
    <CentralPageContainer title="Client Templates">
      <StyledCard>
        <CentralProTable<ClientTemplate>
          id="client-templates"
          columns={columns}
          actionRef={actionRef}
          request={async () => {
            try { const data = await ClientTemplatesApiService.list(); return { data, success: true, total: data.length }; }
            catch (e:any) { message.error(e?.message || 'Failed to load'); return { data: [], success: false, total: 0 }; }
          }}
          toolBarRender={() => [
            <Button key="add" type="primary" onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>New Template</Button>
          ]}
          rowKey="id"
          className="transaction-table"
        />
      </StyledCard>

      <Modal
        title={editing ? 'Edit Client Template' : 'New Client Template'}
        open={open}
        onOk={onSubmit}
        onCancel={() => { setOpen(false); setEditing(null); }}
        width={720}
        okText={editing ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" initialValues={{ is_active: true }}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter a name' }]}>
            <Input placeholder="e.g., Education Basic Client" />
          </Form.Item>
          <Form.Item name="base_client_code" label="Base Client Code">
            <Input placeholder="Optional: existing client code used for reference" />
          </Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="template_json" label="Template JSON" extra="Prefill keys like name, clientCode, industry, email, address, phone, website, tier, status, risk_category, settlementCycle, settlementAccount">
            <Input.TextArea rows={10} placeholder={'{ "name": "ABC University", "industry": "Education" }'} />
          </Form.Item>
        </Form>
      </Modal>
    </CentralPageContainer>
  );
};

export default ClientTemplatesPage;
