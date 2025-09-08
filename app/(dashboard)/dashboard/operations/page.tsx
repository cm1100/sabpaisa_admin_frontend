'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, StyledSpace, CentralBadge, Tag, Empty, CentralProgress, StyledStatistic, CentralProTable } from '@/components/ui';
import CentralPageContainer from '@/components/ui/CentralPageContainer';
import { PremiumLoader } from '@/components/ui/PremiumLoader';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import GatewaySyncApiService from '@/services/api/GatewaySyncApiService';

export default function DashboardOperationsPage() {
  const [sync, setSync] = useState<any>(null);
  const [queueStats, setQueueStats] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const derived = (() => {
    const overall = queueStats?.overall_stats || {};
    const qs = sync?.queue_status || {};
    return {
      pending: qs.pending ?? overall.pending_items ?? 0,
      processing: qs.processing ?? overall.processing_items ?? 0,
      completed: qs.completed ?? overall.completed_items ?? 0,
      failed: qs.failed ?? overall.failed_items ?? qs.failed_ready_for_retry ?? 0,
    };
  })();
  const perf = sync?.performance || {};
  const webhook = sync?.webhook_stats || {};
  const recent = Array.isArray(sync?.recent_errors) ? sync.recent_errors : [];
  const typeBreakdown = queueStats?.type_breakdown || [];
  const priorityBreakdown = queueStats?.priority_breakdown || [];
  const total24h = perf.total_operations_24h ?? 0;
  const successRate = perf.success_rate_24h ?? 0;
  const slaCompliance = perf.sla_compliance ?? 0;
  const slaTarget = queueStats?.sla_target || '30s';
  const fmt = new Intl.NumberFormat('en-IN');
  // No segmented tabs; use two-column layout on desktop and stacked on mobile for clarity

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const [dash, q] = await Promise.all([
          GatewaySyncApiService.getDashboard().then((r: any): any => r.data).catch((): any => null),
          GatewaySyncApiService.getQueueStats().then((r: any): any => r.data).catch((): any => null),
        ]);
        setSync(dash);
        setQueueStats(q);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <CentralPageContainer withBackground title="Operations — Gateway Sync" extra={<CentralBadge status="processing" text="Live" /> }>
      {loading && (
        <div data-testid="dashboard-operations-loading">
          <PremiumLoader size="default" message="Loading operations..." variant="info" />
        </div>
      )}

      {sync && (
        <>
          <ResponsiveRow gutter={16}>
            <ResponsiveCol xs={24} sm={12} lg={6}>
              <StyledCard variant="stat" data-testid="dashboard-operations-stat-total24h">
                <StyledStatistic title="Total Ops (24h)" value={fmt.format(total24h)} />
              </StyledCard>
            </ResponsiveCol>
            <ResponsiveCol xs={24} sm={12} lg={6}>
              <StyledCard variant="stat" data-testid="dashboard-operations-stat-queue-total">
                <StyledStatistic title="Queue Items" value={fmt.format((queueStats?.overall_stats?.total_items) ?? 0)} />
              </StyledCard>
            </ResponsiveCol>
            <ResponsiveCol xs={24} sm={12} lg={6}>
              <StyledCard variant="stat" data-testid="dashboard-operations-stat-success">
                <CentralText type="secondary">Success Rate (24h)</CentralText>
                <CentralProgress percent={Math.round(successRate)} status={successRate > 95 ? 'success' : successRate > 80 ? 'active' : 'exception'} />
              </StyledCard>
            </ResponsiveCol>
            <ResponsiveCol xs={24} sm={12} lg={6}>
              <StyledCard variant="stat" data-testid="dashboard-operations-stat-sla">
                <CentralText type="secondary">SLA Compliance ({slaTarget})</CentralText>
                <CentralProgress percent={Math.round(slaCompliance)} status={slaCompliance > 95 ? 'success' : slaCompliance > 80 ? 'active' : 'exception'} />
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow gutter={16}>
            <ResponsiveCol xs={24} lg={16}>
              <StyledCard title="Gateway Stats" data-testid="dashboard-operations-gateway-stats">
                <StyledSpace size="small" wrap style={{ width: '100%' }}>
                  {((sync.gateway_stats || sync.gateway_status || []) as any[]).map((g: any, idx: number) => {
                    const name = g.name || g.code || g.sync_type || `Gateway ${idx + 1}`;
                    const total = g.total ?? g.count ?? 0;
                    const pending = g.pending ?? 0;
                    const failed = g.failed ?? 0;
                    const successRate = g.success_rate != null ? Math.round(g.success_rate) : null;
                    const status: string = g.status || (failed > 0 ? 'degraded' : 'healthy');
                    const statusColor = status === 'healthy' ? 'success' : status === 'degraded' ? 'warning' : 'error';
                    return (
                      <StyledCard key={`${name}-${idx}`} variant="bordered" padding="compact" style={{ minWidth: 260, flex: '1 1 260px' }}>
                        <StyledSpace direction="vertical" size={6} style={{ width: '100%' }}>
                          <StyledSpace style={{ justifyContent: 'space-between', width: '100%' }}>
                            <CentralText strong>{name}</CentralText>
                            <Tag color={statusColor as any}>{status}</Tag>
                          </StyledSpace>
                          <StyledSpace style={{ justifyContent: 'space-between', width: '100%' }}>
                            <CentralBadge status="processing" text={`Pending ${fmt.format(pending)}`} />
                            <CentralBadge status="error" text={`Failed ${fmt.format(failed)}`} />
                            <CentralBadge status="success" text={`Total ${fmt.format(total)}`} />
                          </StyledSpace>
                          <StyledSpace direction="vertical" size={2} style={{ width: '100%' }}>
                            <CentralText type="secondary">Success Rate</CentralText>
                            <CentralProgress percent={successRate ?? 0} status={successRate != null ? (successRate > 95 ? 'success' : successRate > 80 ? 'active' : 'exception') : 'normal'} />
                          </StyledSpace>
                        </StyledSpace>
                      </StyledCard>
                    );
                  })}
                </StyledSpace>
              </StyledCard>
            </ResponsiveCol>
            <ResponsiveCol xs={24} lg={8}>
              <StyledCard title="Queue Summary" padding="compact" data-testid="dashboard-operations-breakdown-summary">
                <StyledSpace size="small" wrap>
                  <CentralBadge status="processing" text={`Pending ${fmt.format(derived.pending)}`} />
                  <CentralBadge status="warning" text={`Processing ${fmt.format(derived.processing)}`} />
                  <CentralBadge status="success" text={`Completed ${fmt.format(derived.completed)}`} />
                  <CentralBadge status="error" text={`Failed ${fmt.format(derived.failed)}`} />
                </StyledSpace>
              </StyledCard>
              <StyledCard title="Type Breakdown" padding="compact" data-testid="dashboard-operations-type">
                <CentralProTable
                  rowKey={(r: any) => `${r.sync_type ?? 'type'}`}
                  search={false}
                  options={false}
                  pagination={false}
                  size="small"
                  className="transaction-table"
                  dataSource={typeBreakdown}
                  columns={[
                    { title: 'Type', dataIndex: 'sync_type' },
                    { title: 'Count', dataIndex: 'count', align: 'right' },
                    { title: 'Pending', dataIndex: 'pending', align: 'right' },
                    { title: 'Completed', dataIndex: 'completed', align: 'right' },
                    { title: 'Failed', dataIndex: 'failed', align: 'right' },
                  ]}
                />
              </StyledCard>
              <StyledCard title="Priority Breakdown" padding="compact" data-testid="dashboard-operations-priority">
                <CentralProTable
                  rowKey={(r: any) => `p-${r.priority ?? 'na'}`}
                  search={false}
                  options={false}
                  pagination={false}
                  size="small"
                  className="transaction-table"
                  dataSource={priorityBreakdown}
                  columns={[
                    { title: 'Priority', dataIndex: 'priority' },
                    { title: 'Count', dataIndex: 'count', align: 'right' },
                    { title: 'Pending', dataIndex: 'pending', align: 'right' },
                    { title: 'Failed', dataIndex: 'failed', align: 'right' },
                  ]}
                />
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>

          <ResponsiveRow gutter={16}>
            <ResponsiveCol xs={24} lg={12}>
              <StyledCard title="Webhooks" data-testid="dashboard-operations-webhooks">
                <StyledSpace>
                  <CentralBadge status="success" text={`Total ${fmt.format(webhook.total_webhooks ?? 0)}`} />
                  <CentralBadge status="processing" text={`Processed ${fmt.format(webhook.processed_webhooks ?? 0)}`} />
                  <CentralBadge status="warning" text={`Valid Sig ${fmt.format(webhook.valid_signatures ?? 0)}`} />
                </StyledSpace>
              </StyledCard>
            </ResponsiveCol>
            <ResponsiveCol xs={24} lg={12}>
              <StyledCard title="Recent Errors" data-testid="dashboard-operations-errors">
                {recent.length === 0 ? (
                  <Empty description="No recent errors" />
                ) : (
                  <div style={{ maxHeight: 280, overflowY: 'auto' }}>
                    <ul style={{ margin: 0, paddingLeft: 16 }}>
                      {recent.slice(0, 20).map((e: any, i: number) => (
                        <li key={i}>
                          <CentralText type="secondary">{e?.message || JSON.stringify(e)}</CentralText>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>
        </>
      )}

      {!loading && !sync && !queueStats && (
        <Empty description="No operations data" data-testid="dashboard-operations-empty" />
      )}
    </CentralPageContainer>
  );
}
