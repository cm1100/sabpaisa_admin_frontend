'use client';

import React, { useState, useEffect } from 'react';
import { StyledCard, CentralButton, Steps, CentralProgress, CentralAlert, CentralTitle, CentralText, StyledSpace, Timeline, CentralBadge } from '@/components/ui';
import { 
  SyncOutlined, 
  CheckCircleOutlined, 
  ClockCircleOutlined, 
  ExclamationCircleOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined 
} from '@ant-design/icons';
import { useSettlementStore } from '@/stores/settlementStore';
import { themeConfig } from '@/styles/theme';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { useResponsive } from '@/hooks/useResponsive';
import dayjs from 'dayjs';

// Using centralized typography components
const { Step } = Steps;

/**
 * Settlement Process Queue Page
 * Shows settlement processing status and queue
 */
const SettlementProcessPage: React.FC = () => {
  const responsive = useResponsive();
  const [autoProcess, setAutoProcess] = useState(true);
  const { 
    batches, 
    fetchBatches, 
    fetchStatistics, 
    statistics,
    processBatch,
    isProcessing 
  } = useSettlementStore();

  useEffect(() => {
    fetchBatches();
    fetchStatistics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      if (!isProcessing) {
        fetchBatches();
        fetchStatistics();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [isProcessing]);

  const pendingBatches = batches.filter(batch => batch.status === 'PENDING');
  const processingBatches = batches.filter(batch => batch.status === 'PROCESSING');
  const completedToday = batches.filter(batch => 
    batch.status === 'COMPLETED' && 
    batch.processed_at &&
    dayjs(batch.processed_at).format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
  );

  const processNext = async () => {
    const nextBatch = pendingBatches[0];
    if (nextBatch) {
      await processBatch(nextBatch.batch_id);
      fetchBatches();
    }
  };

  const getProcessingSteps = (status: string) => {
    const steps = [
      { title: 'Validation', status: 'process' },
      { title: 'Calculation', status: 'wait' },
      { title: 'Bank Transfer', status: 'wait' },
      { title: 'Confirmation', status: 'wait' },
    ];

    switch (status) {
      case 'PROCESSING':
        steps[0].status = 'process';
        break;
      case 'APPROVED':
        steps[0].status = 'finish';
        steps[1].status = 'process';
        break;
      case 'COMPLETED':
        steps.forEach(step => step.status = 'finish');
        break;
      case 'FAILED':
        steps[0].status = 'error';
        break;
    }

    return steps;
  };

  return (
    <div>
      <ResponsiveRow justify="space-between" align="middle">
        <ResponsiveCol {...LAYOUT_CONFIG.common.wideContent}>
          <CentralTitle level={2}>
            <SyncOutlined spin={isProcessing} /> Settlement Process Queue
          </CentralTitle>
          <CentralText type="secondary">
            Monitor and manage settlement processing queue
          </CentralText>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.compactSidebar}>
          <StyledSpace>
            <CentralButton
              type={autoProcess ? 'primary' : 'default'}
              icon={autoProcess ? <PlayCircleOutlined /> : <PauseCircleOutlined />}
              onClick={() => setAutoProcess(!autoProcess)}
            >
              {autoProcess ? 'Auto Process ON' : 'Auto Process OFF'}
            </CentralButton>
            <CentralButton
              type="primary"
              icon={<SyncOutlined />}
              loading={isProcessing}
              onClick={processNext}
              disabled={pendingBatches.length === 0}
            >
              Process Next
            </CentralButton>
          </StyledSpace>
        </ResponsiveCol>
      </ResponsiveRow>

      {/* Status Cards */}
      <ResponsiveRow>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <div>
              <div>
                <ClockCircleOutlined />
              </div>
              <div>
                {pendingBatches.length}
              </div>
              <div>Pending</div>
            </div>
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <div>
              <div>
                <SyncOutlined spin={processingBatches.length > 0} />
              </div>
              <div>
                {processingBatches.length}
              </div>
              <div>Processing</div>
            </div>
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <div>
              <div>
                <CheckCircleOutlined />
              </div>
              <div>
                {completedToday.length}
              </div>
              <div>Completed Today</div>
            </div>
          </StyledCard>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <StyledCard>
            <div>
              <div>
                <ExclamationCircleOutlined />
              </div>
              <div>
                {statistics?.failed_count || 0}
              </div>
              <div>Failed</div>
            </div>
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>

      <ResponsiveRow>
        {/* Processing Queue */}
        <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
          <StyledCard title="Processing Queue" extra={
            <CentralBadge count={pendingBatches.length} showZero />
          }>
            {pendingBatches.length > 0 ? (
              <div>
                {pendingBatches.slice(0, 10).map((batch, index) => (
                  <StyledCard
                    key={batch.batch_id}
                    size="small"
                  >
                    <ResponsiveRow justify="space-between" align="middle">
                      <ResponsiveCol {...LAYOUT_CONFIG.common.threeQuarters}>
                        <CentralText strong>#{index + 1} Batch {batch.batch_id}</CentralText>
                        <br />
                        <CentralText type="secondary">
                          {batch.total_transactions} txns • 
                          ₹{(batch.total_amount / 100000).toFixed(1)}L •
                          {dayjs(batch.batch_date).format('MMM DD')}
                        </CentralText>
                      </ResponsiveCol>
                      <ResponsiveCol {...LAYOUT_CONFIG.common.quarter}>
                        <CentralBadge status="processing" text="Queued" />
                      </ResponsiveCol>
                    </ResponsiveRow>
                  </StyledCard>
                ))}
                {pendingBatches.length > 10 && (
                  <CentralText type="secondary">
                    ... and {pendingBatches.length - 10} more batches
                  </CentralText>
                )}
              </div>
            ) : (
              <CentralAlert
                message="No pending batches"
                description="All batches are processed. Queue is empty."
                type="info"
                showIcon
              />
            )}
          </StyledCard>
        </ResponsiveCol>

        {/* Current Processing */}
        <ResponsiveCol {...LAYOUT_CONFIG.common.formField}>
          <StyledCard title="Current Processing">
            {processingBatches.length > 0 ? (
              <div>
                {processingBatches.map(batch => (
                  <StyledCard key={batch.batch_id} size="small">
                    <ResponsiveRow justify="space-between" align="middle">
                      <ResponsiveCol {...LAYOUT_CONFIG.common.threeQuarters}>
                        <CentralText strong>Batch {batch.batch_id}</CentralText>
                        <br />
                        <CentralText type="secondary">
                          ₹{batch.total_amount.toLocaleString('en-IN')} • 
                          {batch.total_transactions} transactions
                        </CentralText>
                      </ResponsiveCol>
                      <ResponsiveCol {...LAYOUT_CONFIG.common.quarter}>
                        <CentralBadge status="processing" text="Processing" />
                      </ResponsiveCol>
                    </ResponsiveRow>
                    
                    <Steps size="small" current={1}>
                      {getProcessingSteps(batch.status).map((step, index) => (
                        <Step key={index} title={step.title} status={step.status as any} />
                      ))}
                    </Steps>
                    
                    <CentralProgress 
                      percent={30} 
                      status="active" 
                      strokeColor={{
                        from: themeConfig.token.colorInfo,
                        to: themeConfig.token.colorSuccess,
                      }}
                    />
                  </StyledCard>
                ))}
              </div>
            ) : (
              <CentralAlert
                message="No active processing"
                description="No batches are currently being processed."
                type="info"
                showIcon
              />
            )}
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>

      {/* Recent Activity */}
      <ResponsiveRow>
        <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
          <StyledCard title="Recent Activity">
            <Timeline>
              {completedToday.slice(0, 5).map(batch => (
                <Timeline.Item 
                  key={batch.batch_id}
                  color={themeConfig.token.colorSuccess}
                  dot={<CheckCircleOutlined />}
                >
                  <CentralText>Batch {batch.batch_id} completed successfully</CentralText>
                  <br />
                  <CentralText type="secondary">
                    ₹{(batch.total_amount / 100000).toFixed(1)}L settled • 
                    {(() => {
                      const diff = dayjs().diff(dayjs(batch.processed_at), 'minute');
                      if (diff < 60) return `${diff} minutes ago`;
                      const hours = Math.floor(diff / 60);
                      if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
                      const days = Math.floor(hours / 24);
                      return `${days} day${days > 1 ? 's' : ''} ago`;
                    })()}
                  </CentralText>
                </Timeline.Item>
              ))}
              {completedToday.length === 0 && (
                <Timeline.Item color="gray">
                  <CentralText type="secondary">No activity today</CentralText>
                </Timeline.Item>
              )}
            </Timeline>
          </StyledCard>
        </ResponsiveCol>
      </ResponsiveRow>
    </div>
  );
};

export default SettlementProcessPage;