'use client';

import { LAYOUT_CONFIG } from '@/config/layoutConfig';

export default function TestSpreadPage() {
  const testSpread = { ...LAYOUT_CONFIG.dashboard.metricCard };
  
  console.log('Original LAYOUT_CONFIG.dashboard.metricCard:', LAYOUT_CONFIG.dashboard.metricCard);
  console.log('After spread:', testSpread);
  console.log('Type of spread result:', typeof testSpread);
  console.log('Keys:', Object.keys(testSpread));
  console.log('Values:', Object.values(testSpread));
  
  return (
    <div style={{ padding: 24 }}>
      <h1>Test Spread Operator</h1>
      <pre>{JSON.stringify(LAYOUT_CONFIG.dashboard.metricCard, null, 2)}</pre>
      <h2>After spread:</h2>
      <pre>{JSON.stringify(testSpread, null, 2)}</pre>
    </div>
  );
}