'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, List, Spin, Tag } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import NotificationsApiService from '@/services/api/NotificationsApiService';

export default function NotificationsAllPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const resp = await NotificationsApiService.listAll();
        setItems(resp.results || []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ResponsiveRow gutter={16}>
      <ResponsiveCol span={24}>
        <StyledCard title="Notifications" data-testid="stub-notifications-all">
          {loading && <Spin />}
          <CentralTitle level={5}>All Notifications</CentralTitle>
          <List
            size="small"
            dataSource={items}
            renderItem={(item: any) => (
              <List.Item>
                <CentralText>
                  <Tag>{item.type}</Tag>
                  {item.title} · {item.message} · {new Date(item.timestamp).toLocaleString()}
                </CentralText>
              </List.Item>
            )}
          />
        </StyledCard>
      </ResponsiveCol>
    </ResponsiveRow>
  );
}
