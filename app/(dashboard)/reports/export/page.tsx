'use client';

import React, { useState } from 'react';
import { StyledCard, CentralTitle, CentralText, CentralButton as Button, DatePicker, Form, App, CentralPageContainer, StyledSpace } from '@/components/ui';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { transactionService } from '@/services/api/TransactionApiService';
import RefundApiService from '@/services/api/RefundApiService';
import { settlementApiService } from '@/services/api/SettlementApiService';

export default function ReportsExportCenterPage() {
  const { message } = App.useApp();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const onExport = async (target: 'transactions' | 'refunds' | 'settlements') => {
    try {
      setLoading(true);
      const values = form.getFieldsValue();
      const dateFrom = values.period?.[0]?.toISOString?.();
      const dateTo = values.period?.[1]?.toISOString?.();
      if (target === 'transactions') {
        await transactionService.exportTransactions({ format: 'csv', dateFrom, dateTo });
        message.success('Transactions export started');
      } else if (target === 'refunds') {
        const blob = await RefundApiService.exportRefunds({ format: 'csv', date_from: dateFrom, date_to: dateTo });
        const url = window.URL.createObjectURL(blob as any);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'refunds.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      } else {
        const blob = await settlementApiService.exportSettlements({ format: 'csv', batch_date_from: dateFrom, batch_date_to: dateTo } as any);
        const url = window.URL.createObjectURL(blob as any);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'settlements.csv';
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (e: any) {
      message.error(e?.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  const headerExtra = (
    <Form form={form} layout="inline">
      <Form.Item name="period" label="Period" style={{ marginBottom: 0 }}>
        <DatePicker.RangePicker className="picker-md" />
      </Form.Item>
    </Form>
  );

  return (
    <CentralPageContainer withBackground title="Export Center" extra={headerExtra}>
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
      <ResponsiveGrid layout="dashboard" background="none">
      <ResponsiveRow gutter={16}>
        <ResponsiveCol mobile={24} tablet={12} desktop={8} wide={8} ultraWide={6}>
          <StyledCard title="Transactions" data-testid="export-transactions">
            <CentralText type="secondary">Export transactions as CSV for the selected period.</CentralText>
            <div style={{ marginTop: 12 }}>
              <Button type="primary" block loading={loading} onClick={() => onExport('transactions')}>Export Transactions (CSV)</Button>
            </div>
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol mobile={24} tablet={12} desktop={8} wide={8} ultraWide={6}>
          <StyledCard title="Refunds" data-testid="export-refunds">
            <CentralText type="secondary">Export refunds as CSV for the selected period.</CentralText>
            <div style={{ marginTop: 12 }}>
              <Button block loading={loading} onClick={() => onExport('refunds')}>Export Refunds (CSV)</Button>
            </div>
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol mobile={24} tablet={12} desktop={8} wide={8} ultraWide={6}>
          <StyledCard title="Settlements" data-testid="export-settlements">
            <CentralText type="secondary">Export settlements as CSV for the selected period.</CentralText>
            <div style={{ marginTop: 12 }}>
              <Button block loading={loading} onClick={() => onExport('settlements')}>Export Settlements (CSV)</Button>
            </div>
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>
      </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
  );
}
