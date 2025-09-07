'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, Descriptions, Spin } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol } from '@/components/layouts/ResponsiveGrid';
import { authenticationService } from '@/services/api/AuthenticationApiService';

export default function NotificationsSettingsPage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const profile = await authenticationService.getProfile();
        setUser(profile);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <ResponsiveRow gutter={16}>
      <ResponsiveCol span={24}>
        <StyledCard title="Notification Settings" data-testid="stub-notifications-settings">
          {loading && <Spin />}
          {user && (
            <Descriptions bordered column={1} size="small">
              <Descriptions.Item label="Username">{user.username}</Descriptions.Item>
              <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
              <Descriptions.Item label="Role">{user.is_superuser ? 'Super Admin' : 'User'}</Descriptions.Item>
              <Descriptions.Item label="Notifications">Enabled</Descriptions.Item>
            </Descriptions>
          )}
          {!loading && !user && (
            <CentralText type="secondary">Profile not available</CentralText>
          )}
        </StyledCard>
      </ResponsiveCol>
    </ResponsiveRow>
  );
}
