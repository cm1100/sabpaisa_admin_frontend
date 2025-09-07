'use client';

import React from 'react';
import { StyledCard, StyledSpace, CentralProgress, CentralText } from '@/components/ui';
import { SettlementCycle } from '@/types';

const Text = CentralText;

interface SettlementCycleData {
  cycle: SettlementCycle;
  percentage: number;
  count: number;
}

interface SettlementCycleChartProps {
  data: SettlementCycleData[];
}

const SettlementCycleChart: React.FC<SettlementCycleChartProps> = React.memo(({ data }) => {
  const getCycleLabel = (cycle: SettlementCycle): string => {
    switch (cycle) {
      case SettlementCycle.T0:
        return 'T+0 (Same Day)';
      case SettlementCycle.T1:
        return 'T+1 (Next Day)';
      case SettlementCycle.T2:
        return 'T+2 (2 Days)';
      case SettlementCycle.T3:
        return 'T+3 (3 Days)';
      case SettlementCycle.WEEKLY:
        return 'Weekly';
      case SettlementCycle.MONTHLY:
        return 'Monthly';
      default:
        return cycle;
    }
  };

  return (
    <StyledCard title="Settlement Cycle Distribution" size="small">
      <StyledSpace direction="vertical" style={{ width: '100%' }}>
        {data.map((item) => (
          <div key={item.cycle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
              <Text>{getCycleLabel(item.cycle)}</Text>
              <Text type="secondary">({item.count})</Text>
            </div>
            <CentralProgress 
              percent={item.percentage} 
              status="active"
              strokeColor={{
                '0%': 'var(--color-info)',
                '100%': 'var(--color-success)',
              }}
            />
          </div>
        ))}
      </StyledSpace>
    </StyledCard>
  );
});

SettlementCycleChart.displayName = 'SettlementCycleChart';

export default SettlementCycleChart;
