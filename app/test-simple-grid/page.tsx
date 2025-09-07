'use client';

import { StyledCard as Card } from '@/components/ui';
import { SimpleResponsiveRow, SimpleResponsiveCol } from '@/components/layouts/ResponsiveGridSimple';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';

export default function TestSimpleGridPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Test Simple Grid Layout</h1>
      
      <h2>Using SimpleResponsiveCol with spread from LAYOUT_CONFIG</h2>
      <SimpleResponsiveRow gutter={[16, 16]}>
        <SimpleResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card className="on-primary" style={{ background: 'var(--color-gradient-primary)' }}>Card 1</Card>
        </SimpleResponsiveCol>
        <SimpleResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card style={{ background: 'var(--color-gradient-success)', color: 'var(--color-text-inverse)' }}>Card 2</Card>
        </SimpleResponsiveCol>
        <SimpleResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card style={{ background: 'var(--color-gradient-warning)', color: 'var(--color-text-inverse)' }}>Card 3</Card>
        </SimpleResponsiveCol>
        <SimpleResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card style={{ background: 'var(--color-bg-elevated)' }}>Card 4</Card>
        </SimpleResponsiveCol>
      </SimpleResponsiveRow>
      
      <h2 style={{ marginTop: 24 }}>Using LAYOUT_CONFIG patterns (no hardcoded spans)</h2>
      <SimpleResponsiveRow gutter={[16, 16]}>
        <SimpleResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <Card style={{ background: 'var(--glass-bg-card)' }}>Pattern 1</Card>
        </SimpleResponsiveCol>
        <SimpleResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <Card style={{ background: 'var(--color-bg-secondary)' }}>Pattern 2</Card>
        </SimpleResponsiveCol>
        <SimpleResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <Card className="on-primary" style={{ background: 'var(--color-gradient-primary)' }}>Pattern 3</Card>
        </SimpleResponsiveCol>
        <SimpleResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <Card style={{ background: 'var(--color-gradient-success)', color: 'var(--color-text-inverse)' }}>Pattern 4</Card>
        </SimpleResponsiveCol>
      </SimpleResponsiveRow>
    </div>
  );
}
