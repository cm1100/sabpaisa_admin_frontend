'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, List, Spin, Tag } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import NotificationsApiService from '@/services/api/NotificationsApiService';

export default function NotificationsAlertsPage() {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await NotificationsApiService.listSystemAlerts();
        setAlerts(resp || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ResponsiveRow gutter={16}>
      <ResponsiveCol span={24}>
        <StyledCard title="System Alerts" data-testid="stub-notifications-alerts">
          {loading && <Spin />}
          <List
            size="small"
            dataSource={alerts}
            renderItem={(item: any) => (
              <List.Item>
                <CentralText>
                  <Tag color={item.severity === 'HIGH' ? 'red' : item.severity === 'MEDIUM' ? 'orange' : 'blue'}>{item.severity}</Tag>
                  {item.alert_type}: {item.description}
                </CentralText>
              </List.Item>
            )}
          />
        </StyledCard>
      </ResponsiveCol>
    </ResponsiveRow>
  );
}
