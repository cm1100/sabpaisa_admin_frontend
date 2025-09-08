'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { CentralPageContainer, CentralProTable, ProColumns, StyledCard, StyledSpace, CentralButton as Button, Modal, Form, Input, Switch, App, InputNumber, Dropdown, Segmented, Empty, CentralText } from '@/components/ui';
import RoutingApiService, { RoutingPolicy } from '@/services/api/RoutingApiService';

const RoutingPoliciesPage: React.FC = () => {
  const { message } = App.useApp();
  const actionRef = useRef<any>(null);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<RoutingPolicy | null>(null);
  const [form] = Form.useForm();
  const [viewMode, setViewMode] = useState<'table' | 'cards'>(() => (typeof window !== 'undefined' && window.innerWidth < 768 ? 'cards' : 'table'));
  const [cardRows, setCardRows] = useState<RoutingPolicy[]>([]);
  const [cardsLoading, setCardsLoading] = useState(false);

  const columns: ProColumns<RoutingPolicy>[] = [
    { title: 'Name', dataIndex: 'name', key: 'name' },
    { title: 'Active', dataIndex: 'is_active', key: 'is_active', render: (val, record) => (
      <Switch checked={!!val} onChange={async (v) => {
        try { v ? await RoutingApiService.activate(record.id) : await RoutingApiService.deactivate(record.id); actionRef.current?.reload(); }
        catch (e:any) { message.error(e?.message || 'Failed to update'); }
      }} />
    )},
    { title: 'Conditions', dataIndex: 'conditions_json', key: 'conditions_json', ellipsis: true, render: (val) => <code>{JSON.stringify(val)}</code> },
    { title: 'Weights', dataIndex: 'weights_json', key: 'weights_json', ellipsis: true, render: (val) => <code>{JSON.stringify(val)}</code> },
    { title: 'Updated', dataIndex: 'updated_at', key: 'updated_at' },
  ];

  const onSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        name: values.name,
        is_active: !!values.is_active,
        // parse JSON inputs safely
        conditions_json: safeParse(values.conditions_json) || {},
        weights_json: safeParse(values.weights_json) || {},
      } as any;
      if (editing) await RoutingApiService.update(editing.id, payload);
      else await RoutingApiService.create(payload);
      setOpen(false); setEditing(null); form.resetFields();
      actionRef.current?.reload();
      message.success('Saved');
    } catch (e:any) {
      if (e?.errorFields) return; // form errors
      message.error(e?.message || 'Failed to save');
    }
  };

  const safeParse = (s: any) => {
    if (!s) return undefined; if (typeof s === 'object') return s; try { return JSON.parse(String(s)); } catch { return undefined; }
  };

  return (
    <CentralPageContainer title="Routing Policies">
      <StyledCard>
        {typeof window !== 'undefined' && window.innerWidth < 768 ? (
          <StyledSpace direction="vertical" style={{ width: '100%' }}>
            <Segmented
              options={[{ label: 'Cards', value: 'cards' }, { label: 'Table', value: 'table' }]}
              value={viewMode}
              onChange={(v:any)=>{
                setViewMode(v);
                if (v === 'cards') {
                  (async () => { try { setCardsLoading(true); const list = await RoutingApiService.list(); setCardRows(list||[]); } catch { setCardRows([]);} finally { setCardsLoading(false);} })();
                }
              }}
              block
            />
            {viewMode === 'cards' ? (
              cardsLoading ? (
                <CentralText>Loading…</CentralText>
              ) : cardRows.length === 0 ? (
                <Empty description="No routing policies" />
              ) : (
                <StyledSpace direction="vertical" size="small" style={{ width: '100%' }}>
                  {cardRows.map((r) => (
                    <StyledCard key={r.id} hoverable>
                      <StyledSpace direction="vertical" size={6} style={{ width: '100%' }}>
                        <StyledSpace style={{ justifyContent: 'space-between', width: '100%' }}>
                          <strong>{r.name}</strong>
                          <Switch checked={!!(r as any).is_active} onChange={async (v)=>{ try { v ? await RoutingApiService.activate(r.id) : await RoutingApiService.deactivate(r.id); const list=await RoutingApiService.list(); setCardRows(list||[]);} catch(e:any){ message.error(e?.message||'Failed'); } }} />
                        </StyledSpace>
                        <code style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{JSON.stringify((r as any).conditions_json || {})}</code>
                        <code style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{JSON.stringify((r as any).weights_json || {})}</code>
                        <StyledSpace style={{ justifyContent: 'flex-end', width: '100%' }}>
                          <Button type="link" onClick={() => { setEditing(r); form.setFieldsValue({ name: r.name, is_active: (r as any).is_active, conditions_json: JSON.stringify((r as any).conditions_json||{}), weights_json: JSON.stringify((r as any).weights_json||{}) }); setOpen(true); }}>Edit</Button>
                        </StyledSpace>
                      </StyledSpace>
                    </StyledCard>
                  ))}
                </StyledSpace>
              )
            ) : (
              <CentralProTable<RoutingPolicy>
                id="routing-policies"
                columns={columns}
                actionRef={actionRef}
                request={async () => {
                  try { const data = await RoutingApiService.list(); return { data, success: true, total: data.length }; }
                  catch (e:any) { message.error(e?.message || 'Failed to load'); return { data: [], success: false, total: 0 }; }
                }}
                toolBarRender={() => [
                  <Button key="add" type="primary" onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>New Policy</Button>
                ]}
                rowKey="id"
                className="transaction-table"
              />
            )}
          </StyledSpace>
        ) : (
          <CentralProTable<RoutingPolicy>
            id="routing-policies"
            columns={columns}
            actionRef={actionRef}
            request={async () => {
              try { const data = await RoutingApiService.list(); return { data, success: true, total: data.length }; }
              catch (e:any) { message.error(e?.message || 'Failed to load'); return { data: [], success: false, total: 0 }; }
            }}
            toolBarRender={() => [
              <Button key="add" type="primary" onClick={() => { setEditing(null); form.resetFields(); setOpen(true); }}>New Policy</Button>
            ]}
            rowKey="id"
            className="transaction-table"
          />
        )}
      </StyledCard>

      <Modal
        title={editing ? 'Edit Routing Policy' : 'New Routing Policy'}
        open={open}
        onOk={onSubmit}
        onCancel={() => { setOpen(false); setEditing(null); }}
        width={720}
        okText={editing ? 'Update' : 'Create'}
      >
        <Form form={form} layout="vertical" initialValues={{ is_active: true }}>
          <Form.Item name="name" label="Name" rules={[{ required: true, message: 'Please enter a name' }]}>
            <Input placeholder="e.g., Default UPI Card Routing" />
          </Form.Item>
          <Form.Item name="is_active" label="Active" valuePropName="checked">
            <Switch />
          </Form.Item>
          <Form.Item name="conditions_json" label="Conditions JSON" extra={'e.g., { "payment_mode": "UPI", "client_segment": "enterprise" }'}>
            <Input.TextArea rows={6} placeholder={'{ "payment_mode": "UPI" }'} />
          </Form.Item>
          <Form.Item name="weights_json" label="Weights JSON" extra={'e.g., { "GatewayA": 70, "GatewayB": 30 }'}>
            <Input.TextArea rows={6} placeholder={'{ "GatewayA": 70, "GatewayB": 30 }'} />
          </Form.Item>
        </Form>
      </Modal>
    </CentralPageContainer>
  );
};

export default RoutingPoliciesPage;
