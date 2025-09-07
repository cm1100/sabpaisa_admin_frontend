'use client';

import React, { useEffect, useState } from 'react';
import CentralPageContainer from '@/components/ui/CentralPageContainer';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { builderService } from '@/services/api/BuilderApiService';
import WidgetRenderer from '@/components/dashboards/WidgetRenderer';
import { StyledSpace, CentralButton, message } from '@/components/ui';
import { useParams } from 'next/navigation';

const ViewCustomDashboardPage: React.FC = () => {
  const params = useParams();
  const id = params?.id as string;
  const [rendered, setRendered] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const data = await builderService.renderDashboard(id);
      setRendered(data);
    } catch (e: any) {
      message.error(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (id) load(); }, [id]);

  const slots = (rendered?.slots || []).slice(0, 4);

  return (
    <CentralPageContainer withBackground title={rendered?.title || 'Custom Dashboard'}
      extra={<StyledSpace><CentralButton onClick={load} loading={loading}>Refresh</CentralButton></StyledSpace>}
    >
      <ResponsiveRow gutter={12}>
        {slots.slice(0,2).map((s: any, idx: number) => (
          <ResponsiveCol key={s.id || idx} {...LAYOUT_CONFIG.halfWidth}>
            <WidgetRenderer slot={s} />
          </ResponsiveCol>
        ))}
      </ResponsiveRow>
      <ResponsiveRow gutter={12}>
        {slots.slice(2,4).map((s: any, idx: number) => (
          <ResponsiveCol key={s.id || idx} {...LAYOUT_CONFIG.halfWidth}>
            <WidgetRenderer slot={s} />
          </ResponsiveCol>
        ))}
      </ResponsiveRow>
    </CentralPageContainer>
  );
};

export default ViewCustomDashboardPage;

