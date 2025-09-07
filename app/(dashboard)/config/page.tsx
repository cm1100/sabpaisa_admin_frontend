'use client';

import React from 'react';
import { 
  StyledCard, 
  CentralTitle,
  CentralText,
  CentralParagraph,
  CentralButton, 
  StyledSpace, 
  StyledStatistic, 
  CentralProgress,
  theme
} from '@/components/ui';
import { ResponsiveRow, ResponsiveCol, ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';
import { useResponsive } from '@/hooks/useResponsive';
import {
  SettingOutlined,
  CalculatorOutlined,
  CreditCardOutlined,
  GlobalOutlined,
  FileTextOutlined,
  ExperimentOutlined,
  DollarOutlined,
  BankOutlined,
  SafetyOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';
import { useRouter } from 'next/navigation';


const ConfigurationOverview: React.FC = () => {
  const router = useRouter();
  const responsive = useResponsive();

  const configModules = [
    {
      id: 'fees',
      title: 'Fee Structure',
      description: 'Manage dynamic pricing, fee calculations, and promotional offers',
      icon: <CalculatorOutlined  />,
      path: '/fees/configuration',
      status: 'active',
      features: [
        'Dynamic fee structures (Flat, Percentage, Tiered)',
        'Payment method specific rates',
        'Volume-based pricing',
        'Promotional codes & discounts',
        'Real-time fee calculator',
        'Bulk configuration updates'
      ],
      stats: {
        configurations: 2,
        activeRules: 12,
        revenueImpact: '₹2.4L',
        completionPercent: 100
      }
    },
    {
      id: 'audits',
      title: 'Audits & Logs',
      description: 'Inspect API key changes, notifications and metadata',
      icon: <SafetyOutlined  />,
      path: '/admin/audits',
      status: 'active',
      features: [
        'API key rotation history',
        'Notification delivery logs',
        'Transaction metadata explorer',
        'JSON payload viewer',
        'Export & filters'
      ],
      stats: {
        configurations: 0,
        activeRules: 0,
        revenueImpact: '—',
        completionPercent: 100
      }
    },
    {
      id: 'routing-policies',
      title: 'Routing Policies',
      description: 'Define conditions and gateway weights for routing',
      icon: <GlobalOutlined  />,
      path: '/config/routing-policies',
      status: 'active',
      features: [
        'Policy-based routing',
        'Weighted load balancing',
        'Per-method and per-client rules',
        'Activate/deactivate policies',
        'Quick simulate endpoint'
      ],
      stats: {
        configurations: 2,
        activeRules: 2,
        revenueImpact: '₹1.1L',
        completionPercent: 70
      }
    },
    {
      id: 'payment-methods',
      title: 'Payment Methods',
      description: 'Configure payment methods, limits, and processing settings',
      icon: <CreditCardOutlined  />,
      path: '/config/payment-methods',
      status: 'active',
      features: [
        'UPI, Cards, Net Banking, Wallets',
        'Dynamic routing & failover',
        'Transaction limits & controls',
        'Gateway-specific settings',
        'Real-time monitoring',
        'Maintenance mode controls'
      ],
      stats: {
        configurations: 5,
        activeRules: 8,
        revenueImpact: '₹1.8L',
        completionPercent: 95
      }
    },
    {
      id: 'gateways',
      title: 'Payment Gateways',
      description: 'Manage gateway connections, credentials, and routing',
      icon: <BankOutlined  />,
      path: '/config/gateways',
      status: 'active',
      features: [
        'Multi-gateway integration',
        'Load balancing & routing',
        'Credential management',
        'Health monitoring',
        'Fallback configurations',
        'Performance analytics'
      ],
      stats: {
        configurations: 3,
        activeRules: 15,
        revenueImpact: '₹3.2L',
        completionPercent: 90
      }
    },
    {
      id: 'templates',
      title: 'Message Templates',
      description: 'Configure email, SMS, and notification templates',
      icon: <FileTextOutlined  />,
      path: '/config/templates',
      status: 'active',
      features: [
        'Email templates (Success, Failure, Refund)',
        'SMS notifications',
        'Webhook templates',
        'Multi-language support',
        'Dynamic placeholders',
        'A/B testing capabilities'
      ],
      stats: {
        configurations: 8,
        activeRules: 24,
        revenueImpact: '₹0.8L',
        completionPercent: 85
      }
    },
    {
      id: 'sandbox',
      title: 'Sandbox Environment',
      description: 'Test configurations and simulate transactions safely',
      icon: <ExperimentOutlined  />,
      path: '/config/sandbox',
      status: 'active',
      features: [
        'Isolated test environment',
        'Transaction simulation',
        'API testing tools',
        'Mock payment responses',
        'Load testing capabilities',
        'Debug mode & logging'
      ],
      stats: {
        configurations: 1,
        activeRules: 6,
        revenueImpact: '₹0L',
        completionPercent: 100
      }
    }
  ];

  return (
    <ResponsiveContainer maxWidth="full" padding background="none" animate>
      <ResponsiveGrid layout="dashboard" background="none">
        {/* Header */}
        <ResponsiveRow 
          animate
        >
          <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
            <div >
              <div >
                <CentralTitle level={1} >
                  <SettingOutlined  />
                  System Configuration
                </CentralTitle>
                <CentralParagraph >
                  Centralized management of payment processing, fees, gateways, and system settings
                </CentralParagraph>
              </div>
            </div>
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Configuration Modules */}
        <ResponsiveRow 
          animate
        >
          {configModules.map((module) => (
            <ResponsiveCol 
{...LAYOUT_CONFIG.dashboard.metricCard}
              key={module.id}
            >
              <StyledCard
                hoverable
                onClick={() => router.push(module.path)}
              >
                <div >
                  <div >
                    {module.icon}
                    <CentralTitle level={4} >
                      {module.title}
                    </CentralTitle>
                  </div>
                  <CentralText type="secondary" >
                    {module.description}
                  </CentralText>
                </div>

                <div >
                  <ResponsiveRow>
                    <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
                      <StyledStatistic title="Configurations" value={module.stats.configurations} />
                    </ResponsiveCol>
                    <ResponsiveCol {...LAYOUT_CONFIG.halfWidth}>
                      <StyledStatistic title="Active Rules" value={module.stats.activeRules} />
                    </ResponsiveCol>
                  </ResponsiveRow>
                </div>

                <div >
                  <div >
                    <CentralText strong>Revenue Impact</CentralText>
                    <CentralText >
                      {module.stats.revenueImpact}
                    </CentralText>
                  </div>
                  <CentralProgress percent={module.stats.completionPercent} />
                </div>

                <CentralButton
                  type="primary"
                  block
                  icon={<ArrowRightOutlined />}
                  onClick={(e) => {
                    e.stopPropagation();
                    router.push(module.path);
                  }}
                >
                  Configure
                </CentralButton>
              </StyledCard>
            </ResponsiveCol>
          ))}
        </ResponsiveRow>

        {/* Quick Stats */}
        <ResponsiveRow 
          animate
        >
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledCard>
              <StyledStatistic title="Total Configurations" value={19} />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledCard>
              <StyledStatistic title="Active Rules" value={65} />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledCard>
              <StyledStatistic title="Revenue Impact" value="₹8.2L" />
            </StyledCard>
          </ResponsiveCol>
          <ResponsiveCol {...LAYOUT_CONFIG.common.metricCard}>
            <StyledCard>
              <StyledStatistic title="System Health" value={98} suffix="%" />
            </StyledCard>
          </ResponsiveCol>
        </ResponsiveRow>
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
};

export default ConfigurationOverview;
