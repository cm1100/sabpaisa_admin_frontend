'use client';

import { StyledCard as Card } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import Surface from '@/components/theme/Surface';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';

export default function TestGridPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Test Grid Layout</h1>
      
      <h2>Using ResponsiveRow/Col with LAYOUT_CONFIG</h2>
      <Surface type="gradient" padded radius={12}>
      <ResponsiveRow>
        <ResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card style={{ background: 'var(--color-gradient-primary)', color: 'var(--color-text-inverse)' }}>Metric Card</Card>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card style={{ background: 'var(--color-gradient-success)', color: 'var(--color-text-inverse)' }}>Metric Card</Card>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card style={{ background: 'var(--color-gradient-warning)', color: 'var(--color-text-inverse)' }}>Metric Card</Card>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card style={{ background: 'var(--color-bg-elevated)' }}>Metric Card</Card>
        </ResponsiveCol>
      </ResponsiveRow>
      </Surface>
    </div>
  );
}
