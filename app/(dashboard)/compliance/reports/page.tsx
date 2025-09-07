'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, Form, DatePicker, Select, CentralButton as Button, List, Spin, App, CentralPageContainer, SmartLoader, Empty, Modal, StyledSpace } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import ComplianceApiService from '@/services/api/ComplianceApiService';

export default function ComplianceReportsPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [suspicious, setSuspicious] = useState<any[]>([]);
  const [reportResult, setReportResult] = useState<any | null>(null);
  // Use global App message instance

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await ComplianceApiService.getSuspiciousTransactions();
        const data: any = (resp as any).data ?? resp;
        setSuspicious(data?.results || data || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const onGenerate = async (values: any) => {
    try {
      setLoading(true);
      const payload = {
        report_type: values.report_type,
        period_start: values.period?.[0]?.format?.('YYYY-MM-DD') || undefined,
        period_end: values.period?.[1]?.format?.('YYYY-MM-DD') || undefined,
      };
      const resp = await ComplianceApiService.generateRBIReport(payload as any);
      setReportResult((resp as any).data ?? resp);
      message.success('Report generated');
    } catch (e: any) {
      message.error(e?.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const headerExtra = (
    <StyledSpace>
      <Button type="primary" onClick={() => setShowModal(true)}>Generate Report</Button>
    </StyledSpace>
  );

  return (
    <>
    <CentralPageContainer withBackground title="Compliance Reports" extra={headerExtra}>
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
      <ResponsiveRow gutter={16}>
        <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
        <StyledCard title="Compliance Reports" data-testid="stub-compliance-reports">
          
          {reportResult && (
            <div style={{ marginBottom: 16 }}>
              <CentralText strong>Report ID:</CentralText> <CentralText code>{reportResult.report_id}</CentralText>
              <div><CentralText strong>File:</CentralText> <CentralText>{reportResult.file_path}</CentralText></div>
            </div>
          )}

          <CentralTitle level={5}>Suspicious Transactions (recent)</CentralTitle>
          <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 6, title: true }}>
            {(!suspicious || suspicious.length === 0) ? (
              <Empty description={<CentralText type="secondary">No suspicious transactions</CentralText>} />)
              : (
                <List
                  size="small"
                  dataSource={suspicious}
                  renderItem={(item: any) => (
                    <List.Item>
                      <CentralText>
                        {item.txn_id} · ₹{item.paid_amount} · {item.payment_mode} · Risk {item.risk_score}
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
      title="Generate RBI Compliance Report"
      open={showModal}
      onCancel={() => setShowModal(false)}
      footer={null}
      destroyOnClose
    >
      <Form form={form} layout="vertical" onFinish={(vals) => { onGenerate(vals); setShowModal(false); }}>
        <Form.Item name="report_type" label="Type" initialValue="DAILY" rules={[{ required: true }]}>
          <Select
            options={[
              { value: 'DAILY', label: 'Daily' },
              { value: 'WEEKLY', label: 'Weekly' },
              { value: 'MONTHLY', label: 'Monthly' },
              { value: 'QUARTERLY', label: 'Quarterly' },
            ]}
          />
        </Form.Item>
        <Form.Item name="period" label="Period">
          <DatePicker.RangePicker />
        </Form.Item>
        <StyledSpace>
          <Button type="primary" htmlType="submit" loading={loading}>Generate</Button>
          <Button onClick={() => setShowModal(false)}>Cancel</Button>
        </StyledSpace>
      </Form>
    </Modal>
    </>
  );
}
