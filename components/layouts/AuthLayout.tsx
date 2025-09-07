/**
 * Centralized Auth Layout
 * Shared, responsive layout for Login/Signup screens using Ant Design via UI hub
 */
'use client';

import React from 'react';
import { Card, Row, Col, StyledSpace as Space, theme } from '@/components/ui';
import Surface from '@/components/theme/Surface';
import { CentralTitle, CentralText } from '@/components/ui';

interface FeatureItem {
  icon?: React.ReactNode;
  text: React.ReactNode;
}

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  features?: FeatureItem[];
  showHero?: boolean;
}

const AuthLayout: React.FC<AuthLayoutProps> = ({ title, subtitle, children, features = [], showHero = true }) => {
  const { token } = theme.useToken();

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        // Use primary app background for consistency with the rest of the UI
        background: 'var(--color-bg-primary)',
        padding: token.paddingLG,
      }}
    >
      <div style={{ width: '100%', maxWidth: 1000, margin: '0 auto' }}>
        <Card styles={{ body: { padding: token.paddingXL } }} style={{ borderRadius: 20 }}>
          <Row gutter={[token.paddingLG, token.paddingLG]} align="middle" wrap>
            {showHero && (
              <Col xs={24} lg={12}>
                <Surface type="default" padded radius={20}>
                  <Space direction="vertical" size="large" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: token.padding }}>
                      <div
                        style={{
                          width: 56,
                          height: 56,
                          borderRadius: 16,
                          background: 'var(--color-gradient-primary)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <span style={{ fontWeight: 700, fontSize: 22 }}>SP</span>
                      </div>
                      <div>
                        <CentralTitle level={2} style={{ margin: 0 }}>{title}</CentralTitle>
                        {subtitle && <CentralText>{subtitle}</CentralText>}
                      </div>
                    </div>
                    {!!features.length && (
                      <Space direction="vertical" size="small">
                        {features.map((f, i) => (
                          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: token.paddingSM }}>
                            {f.icon}
                            <CentralText>{f.text}</CentralText>
                          </div>
                        ))}
                      </Space>
                    )}
                  </Space>
                </Surface>
              </Col>
            )}

            <Col xs={24} lg={showHero ? 12 : 24}>
              <Card style={{ borderRadius: 16 }} styles={{ body: { padding: token.paddingLG } }}>
                {children}
              </Card>
            </Col>
          </Row>
        </Card>
      </div>
    </div>
  );
};

export default AuthLayout;
