'use client';

import React, { useEffect, useState } from 'react';
import { StyledCard, CentralTitle, CentralText, Descriptions, Spin, CentralPageContainer, SmartLoader, Empty, StyledSpace, CentralButton as Button } from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import AdministrationApiService from '@/services/api/AdministrationApiService';

export default function AdminSystemPage() {
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const data = await AdministrationApiService.getSystemSettings();
        setSettings(data);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const headerExtra = (
    <StyledSpace>
      <Button onClick={() => window.location.reload()}>Refresh</Button>
    </StyledSpace>
  );

  return (
    <CentralPageContainer withBackground title="Administration - System Settings" extra={headerExtra}>
      <ResponsiveContainer maxWidth="full" padding background="gradient" animate>
        <ResponsiveGrid layout="dashboard" background="none">
          <ResponsiveRow gutter={16}>
            <ResponsiveCol mobile={24} tablet={24} desktop={24} wide={24} ultraWide={24}>
              <StyledCard data-testid="stub-admin-system">
                <SmartLoader loading={loading} skeleton skeletonProps={{ rows: 6, title: true }}>
                  {settings ? (
                    <Descriptions bordered column={1} size="small">
                      <Descriptions.Item label="Version">{settings.version}</Descriptions.Item>
                      <Descriptions.Item label="Time">{new Date(settings.time).toLocaleString()}</Descriptions.Item>
                      <Descriptions.Item label="MFA Enabled">{settings.mfa?.is_enabled ? 'Yes' : 'No'}</Descriptions.Item>
                      <Descriptions.Item label="MFA Login">{settings.mfa?.require_mfa_for_login ? 'Required' : 'Optional'}</Descriptions.Item>
                      <Descriptions.Item label="MFA Transactions">{settings.mfa?.require_mfa_for_transactions ? 'Required' : 'Optional'}</Descriptions.Item>
                      <Descriptions.Item label="MFA Settlements">{settings.mfa?.require_mfa_for_settlements ? 'Required' : 'Optional'}</Descriptions.Item>
                      <Descriptions.Item label="MFA Configuration">{settings.mfa?.require_mfa_for_configuration ? 'Required' : 'Optional'}</Descriptions.Item>
                      <Descriptions.Item label="Lockout Attempts">{settings.mfa?.max_attempts}</Descriptions.Item>
                      <Descriptions.Item label="Lockout Duration (min)">{settings.mfa?.lockout_duration}</Descriptions.Item>
                    </Descriptions>
                  ) : (
                    <CentralText type="secondary">No settings available</CentralText>
                  )}
                </SmartLoader>
              </StyledCard>
            </ResponsiveCol>
          </ResponsiveRow>
        </ResponsiveGrid>
      </ResponsiveContainer>
    </CentralPageContainer>
  );
}
