'use client';

import { StyledCard as Card } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';

export default function TestNativeAntDPage() {
  return (
    <div style={{ padding: 24 }}>
      <h1>Test Native Ant Design Grid</h1>
      
      <h2>Basic 4 Cards using LAYOUT_CONFIG</h2>
      <ResponsiveRow>
        <ResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card className="on-primary" style={{ background: 'var(--color-gradient-primary)', textAlign: 'center', height: 100 }}>Card 1</Card>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card className="on-primary" style={{ background: 'var(--color-gradient-success)', textAlign: 'center', height: 100 }}>Card 2</Card>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card className="on-primary" style={{ background: 'var(--color-gradient-warning)', textAlign: 'center', height: 100 }}>Card 3</Card>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.dashboard.metricCard}>
          <Card style={{ background: 'var(--color-bg-elevated)', textAlign: 'center', height: 100 }}>Card 4</Card>
        </ResponsiveCol>
      </ResponsiveRow>

      <h2 style={{ marginTop: 24 }}>Two-column layout with halfWidth</h2>
      <ResponsiveRow>
        <ResponsiveCol {...LAYOUT_CONFIG.common.halfWidth}>
          <Card style={{ background: 'var(--glass-bg-card)', textAlign: 'center', height: 100 }}>Half</Card>
        </ResponsiveCol>
        <ResponsiveCol {...LAYOUT_CONFIG.common.halfWidth}>
          <Card style={{ background: 'var(--color-bg-secondary)', textAlign: 'center', height: 100 }}>Half</Card>
        </ResponsiveCol>
      </ResponsiveRow>
    </div>
  );
}
