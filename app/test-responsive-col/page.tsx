'use client';

import { StyledCard as Card } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';

export default function TestResponsiveColPage() {
  // Test what LAYOUT_CONFIG actually contains
  console.log('LAYOUT_CONFIG.dashboard.metricCard:', LAYOUT_CONFIG.dashboard.metricCard);
  
  return (
    <div style={{ padding: 24 }}>
      <h1>Test ResponsiveCol Layout</h1>
      
      <h2>Using ResponsiveCol with spread from LAYOUT_CONFIG</h2>
      <ResponsiveRow>
        <ResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card className="on-primary" style={{ background: 'var(--color-gradient-primary)' }}>ResponsiveCol with LAYOUT_CONFIG</Card>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card style={{ background: 'var(--color-gradient-success)', color: 'var(--color-text-inverse)' }}>ResponsiveCol with LAYOUT_CONFIG</Card>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card style={{ background: 'var(--color-gradient-warning)', color: 'var(--color-text-inverse)' }}>ResponsiveCol with LAYOUT_CONFIG</Card>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card style={{ background: 'var(--color-bg-elevated)' }}>ResponsiveCol with LAYOUT_CONFIG</Card>
        </ResponsiveCol>
      </ResponsiveRow>

      <h2 style={{ marginTop: 24 }}>Using standardized patterns (no hardcoded spans)</h2>
      <ResponsiveRow>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <Card style={{ background: 'var(--glass-bg-card)' }}>Pattern</Card>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <Card style={{ background: 'var(--color-bg-secondary)' }}>Pattern</Card>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <Card className="on-primary" style={{ background: 'var(--color-gradient-primary)' }}>Pattern</Card>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
          <Card style={{ background: 'var(--color-gradient-success)', color: 'var(--color-text-inverse)' }}>Pattern</Card>
        </ResponsiveCol>
      </ResponsiveRow>
    </div>
  );
}
