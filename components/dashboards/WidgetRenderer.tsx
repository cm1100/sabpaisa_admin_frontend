/**
 * WidgetRenderer
 * Renders a single custom dashboard slot consistently with app UI.
 */
'use client';

import React from 'react';
import { StyledCard, StyledStatistic, CentralTable, Empty } from '@/components/ui';
import { ResponsiveChart } from '@/components/charts/ResponsiveChart';

type SlotData = {
  id: string;
  title: string;
  type: string; // metric | chart | table | note
  render?: any; // { kind: 'stat' | 'line' | 'bar' | 'pie' | 'table', ... }
  data?: any;
};

const asArray = (v: any): any[] => {
  if (!v) return [];
  if (Array.isArray(v)) return v;
  if (Array.isArray(v.data)) return v.data;
  if (Array.isArray(v.results)) return v.results;
  return [];
};

export const WidgetRenderer: React.FC<{ slot: SlotData }> = ({ slot }) => {
  const { title, type, render, data } = slot || {};
  const kind = render?.kind || type;

  if (kind === 'stat' || type === 'metric') {
    const key = render?.valueKey || 'value';
    const suffix = render?.suffix || undefined;
    const val = (data && typeof data === 'object') ? (data[key] ?? 0) : 0;
    return (
      <StyledCard variant="stat" title={title}>
        <StyledStatistic title={undefined} value={typeof val === 'number' ? val : String(val)} suffix={suffix} />
      </StyledCard>
    );
  }

  if (kind === 'line' || kind === 'bar' || kind === 'pie' || type === 'chart') {
    const rows = asArray(data);
    const xKey = render?.xKey || 'label';
    const yKey = render?.yKey || 'value';
    const nameKey = render?.nameKey || 'name';

    let option: any = {};
    if (kind === 'pie') {
      option = {
        tooltip: { trigger: 'item' },
        series: [{
          type: 'pie', radius: '65%',
          itemStyle: { borderColor: 'var(--app-colorBgElevated)', borderWidth: 2 },
          data: rows.map((r: any) => ({ name: r?.[nameKey] ?? r?.[xKey], value: r?.[yKey] ?? r?.value ?? 0 }))
        }],
      };
    } else if (kind === 'bar') {
      option = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: rows.map((r: any) => r?.[xKey]) },
        yAxis: { type: 'value' },
        series: [{ type: 'bar', data: rows.map((r: any) => r?.[yKey] ?? r?.value ?? 0) }],
      };
    } else {
      // line (default)
      option = {
        tooltip: { trigger: 'axis' },
        xAxis: { type: 'category', data: rows.map((r: any) => r?.[xKey]) },
        yAxis: { type: 'value' },
        series: [{ type: 'line', smooth: true, areaStyle: {}, data: rows.map((r: any) => r?.[yKey] ?? r?.value ?? 0) }],
      };
    }
    return (
      <StyledCard title={title}>
        {rows.length === 0 ? <Empty description="No data" /> : (
          <ResponsiveChart option={option as any} renderer="svg" height={{ xs: 200, sm: 240, md: 280, lg: 300, xl: 320 }} />
        )}
      </StyledCard>
    );
  }

  // Table (default)
  if (kind === 'table' || type === 'table') {
    const rows = asArray(data);
    const cols = Array.isArray(render?.columns) ? render.columns : [];
    const columns = (cols.length > 0 ? cols : Object.keys((rows[0] || {}))).slice(0, 8).map((key: string) => ({
      title: key.replace(/_/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
      dataIndex: key,
      key,
    }));
    const rowKey = (r: any, idx: number) => r?.id ?? r?.txn_id ?? r?.refund_id ?? idx;
    return (
      <StyledCard title={title}>
        {rows.length === 0 ? <Empty description="No data" /> : (
          <CentralTable dataSource={rows} columns={columns as any} rowKey={rowKey} pagination={false} size="small" />
        )}
      </StyledCard>
    );
  }

  // Note or unknown
  return (
    <StyledCard title={title}>
      <div style={{ color: 'var(--app-colorTextTertiary)' }}>Unsupported widget type.</div>
    </StyledCard>
  );
};

export default WidgetRenderer;

