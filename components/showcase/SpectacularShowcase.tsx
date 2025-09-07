/**
 * Spectacular Showcase Component
 * Designed to WOW non-technical judges with stunning visuals
 */
'use client';

import React from 'react';
import Surface from '@/components/theme/Surface';
import { Tag, CentralProgress } from '@/components/ui';
import { motion } from 'framer-motion';
import {
  ThunderboltOutlined,
  RiseOutlined,
  CrownOutlined,
  FireOutlined,
  RocketOutlined,
  StarOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import {
  SpectacularCard,
  SpectacularMetricCard,
  SpectacularHeader,
  SpectacularChartContainer,
  SpectacularLiveIndicator
} from '../visuals/SpectacularCard';
import { ResponsiveRow, ResponsiveCol } from '../layouts/ResponsiveGrid';
import { useResponsive } from '@/hooks/useResponsive';
import { LAYOUT_CONFIG } from '@/config/layoutConfig';

export const SpectacularShowcase: React.FC = () => {
  const responsive = useResponsive();
  // Mock data for spectacular display
  const spectacularMetrics = [
    {
      title: "Today's Revenue",
      value: "₹324.67 Cr",
      trend: 12.5,
      trendLabel: "vs yesterday",
      icon: <CrownOutlined />,
      color: 'primary' as const,
    },
    {
      title: "Success Rate",
      value: "99.94%",
      trend: 2.1,
      trendLabel: "this week",
      icon: <TrophyOutlined />,
      color: 'success' as const,
    },
    {
      title: "Active Users",
      value: "2.8M",
      trend: 18.7,
      trendLabel: "growth",
      icon: <RocketOutlined />,
      color: 'info' as const,
    },
    {
      title: "Peak TPS",
      value: "15,247",
      trend: 24.3,
      trendLabel: "new record",
      icon: <FireOutlined />,
      color: 'warning' as const,
    },
  ];

  const spectacularBadges = [
    { label: "Revenue Today", value: "₹324.67Cr", color: "primary" },
    { label: "Success Rate", value: "99.94%", color: "success" },
    { label: "Response Time", value: "89ms", color: "info" },
  ];

  return (
    <Surface type="gradient" padded>
      <div style={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden'
      }}>
      {/* Spectacular Floating Background Elements */}
      <motion.div
        animate={{
          x: [0, 100, -50, 0],
          y: [0, -80, 60, 0],
          rotate: [0, 180, 360],
          scale: [1, 1.2, 0.8, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          position: 'fixed',
          top: '5%',
          right: '5%',
          width: 400,
          height: 400,
          background: 'var(--color-bg-floating-1)',
          borderRadius: '50%',
          filter: 'blur(80px)',
          zIndex: 0
        }}
      />

      <motion.div
        animate={{
          x: [0, -120, 80, 0],
          y: [0, 100, -70, 0],
          rotate: [360, 180, 0],
          scale: [1, 0.6, 1.4, 1],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 8
        }}
        style={{
          position: 'fixed',
          bottom: '10%',
          left: '8%',
          width: 300,
          height: 300,
          background: 'var(--color-bg-floating-2)',
          borderRadius: '50%',
          filter: 'blur(60px)',
          zIndex: 0
        }}
      />

      <motion.div
        animate={{
          x: [0, 60, -90, 30, 0],
          y: [0, -40, 80, -60, 0],
          rotate: [0, 90, 270, 180, 360],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 15
        }}
        style={{
          position: 'fixed',
          top: '50%',
          right: '20%',
          width: 200,
          height: 200,
          background: 'var(--color-bg-floating-3)',
          borderRadius: '50%',
          filter: 'blur(50px)',
          zIndex: 0
        }}
      />

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 10 }}>
        {/* Spectacular Header */}
        <SpectacularHeader
          title="SabPaisa Command Center"
          subtitle="Real-time financial intelligence at your fingertips"
          badges={spectacularBadges}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
            <SpectacularLiveIndicator text="Live Data" />
            <motion.div
              className="on-primary"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
              style={{
                background: 'var(--color-gradient-primary)',
                borderRadius: '50%',
                padding: 'var(--spacing-md)',
                fontSize: 'var(--font-size-20)'
              }}
            >
              <ThunderboltOutlined />
            </motion.div>
          </div>
        </SpectacularHeader>

        {/* Spectacular Metrics Grid */}
        <ResponsiveRow mobileGutter={[16, 16]} tabletGutter={[20, 20]} desktopGutter={[24, 24]} style={{ marginBottom: 32 }}>
          {spectacularMetrics.map((metric, index) => (
            <ResponsiveCol {...LAYOUT_CONFIG.common.responsiveMetric} key={metric.title}>
              <motion.div
                initial={{ opacity: 0, y: 50, rotateX: -20 }}
                animate={{ opacity: 1, y: 0, rotateX: 0 }}
                transition={{ 
                  delay: index * 0.1, 
                  duration: 0.8,
                  type: "spring",
                  stiffness: 100
                }}
              >
                <SpectacularMetricCard {...metric} />
              </motion.div>
            </ResponsiveCol>
          ))}
        </ResponsiveRow>

        {/* Spectacular Chart Section */}
        <ResponsiveRow mobileGutter={[16, 16]} tabletGutter={[20, 20]} desktopGutter={[24, 24]} style={{ marginBottom: 32 }}>
          <ResponsiveCol {...LAYOUT_CONFIG.common.mainChart}>
            <SpectacularChartContainer title="Revenue Performance" icon="💰" height={400}>
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ delay: 0.5, duration: 1.2 }}
                style={{
                  height: '100%',
                  background: 'var(--color-bg-chart-gradient)',
                  borderRadius: 16,
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <motion.div
                  animate={{
                    backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'var(--color-bg-shine-effect)',
                    backgroundSize: '200% 200%'
                  }}
                />
                
                <div style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  textAlign: 'center'
                }}>
                  <motion.div
                    animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
                    transition={{ duration: 3, repeat: Infinity }}
                    style={{ fontSize: 'var(--font-size-48)', marginBottom: 'var(--spacing-lg)' }}
                  >
                    📈
                  </motion.div>
                  <motion.h3
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    style={{ 
                      color: 'var(--color-primary)', 
                      fontSize: 'var(--font-size-24)', 
                      fontWeight: 800,
                      margin: 0
                    }}
                  >
                    Revenue Trending Up 📊
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-16)' }}
                  >
                    +24.7% growth this quarter
                  </motion.p>
                </div>
              </motion.div>
            </SpectacularChartContainer>
          </ResponsiveCol>

          <ResponsiveCol {...LAYOUT_CONFIG.common.sideWidget}>
            <SpectacularChartContainer title="System Health" icon="🚀" height={400}>
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8, duration: 1, type: "spring", stiffness: 100 }}
                style={{ height: '100%', padding: 20 }}
              >
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-xxl)' }}>
                  <motion.div
                    animate={{ 
                      rotate: 360,
                      scale: [1, 1.2, 1],
                    }}
                    transition={{ 
                      rotate: { duration: 8, repeat: Infinity, ease: "linear" },
                      scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
                    }}
                    style={{
                      fontSize: 'var(--font-size-64)',
                      background: 'linear-gradient(135deg, var(--color-success), var(--color-success-700))',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      display: 'inline-block',
                      marginBottom: 'var(--spacing-lg)'
                    }}
                  >
                    ⚡
                  </motion.div>
                  <h3 style={{ color: 'var(--color-text-heading)', fontSize: 'var(--font-size-20)', fontWeight: 700 }}>
                    All Systems Optimal
                  </h3>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>API Response</span>
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>89ms</span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '92%' }}
                    transition={{ delay: 1, duration: 1.5, ease: "easeOut" }}
                  >
                    <CentralProgress 
                      percent={92} 
                      strokeColor={{
                        from: 'var(--color-success)',
                        to: 'var(--color-success-dark)',
                      }}
                      showInfo={false}
                                          />
                  </motion.div>
                </div>

                <div style={{ marginBottom: 24 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ color: 'var(--color-text-secondary)' }}>Uptime</span>
                    <span style={{ color: 'var(--color-success)', fontWeight: 600 }}>99.94%</span>
                  </div>
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '99.94%' }}
                    transition={{ delay: 1.5, duration: 1.5, ease: "easeOut" }}
                  >
                    <CentralProgress 
                      percent={99.94} 
                      strokeColor={{
                        from: 'var(--color-primary)',
                        to: 'var(--color-primary-dark)',
                      }}
                      showInfo={false}
                                          />
                  </motion.div>
                </div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 2 }}
                  style={{ textAlign: 'center' }}
                >
                  <Tag 
                    color="success" 
                    style={{
                      fontSize: 'var(--font-size-14)',
                      fontWeight: 600,
                      border: 'none',
                      background: 'var(--color-gradient-success)',
                      color: 'var(--color-text-inverse)',
                      borderRadius: 20
                    }}
                  >
                    <StarOutlined style={{ marginRight: 8 }} />
                    Peak Performance
                  </Tag>
                </motion.div>
              </motion.div>
            </SpectacularChartContainer>
          </ResponsiveCol>
        </ResponsiveRow>

        {/* Spectacular Bottom Section */}
        <ResponsiveRow mobileGutter={[16, 16]} tabletGutter={[20, 20]} desktopGutter={[24, 24]}>
          <ResponsiveCol {...LAYOUT_CONFIG.fullWidth}>
            <SpectacularCard>
              <div style={{ textAlign: 'center' }}>
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.5, duration: 1, type: "spring" }}
                  style={{ marginBottom: 'var(--spacing-xl)' }}
                >
                  <CrownOutlined style={{
                    fontSize: 'var(--font-size-72)',
                    background: 'var(--color-gradient-warning)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }} />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.8 }}
                  style={{ fontSize: 'var(--font-size-32)', marginBottom: 'var(--spacing-lg)' }}
                >
                  Dominating Payment Excellence
                </motion.h2>
                
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1, duration: 0.8 }}
                  style={{ 
                    fontSize: 'var(--font-size-18)', 
                    color: 'var(--color-text-secondary)',
                    maxWidth: 600,
                    margin: '0 auto',
                    lineHeight: 1.6
                  }}
                >
                  Processing <strong style={{ color: 'var(--color-primary)' }}>₹324.67 Crores</strong> daily 
                  with <strong style={{ color: 'var(--color-success)' }}>99.94% uptime</strong> and 
                  <strong style={{ color: 'var(--color-warning)' }}> 89ms response time</strong> - 
                  setting new industry standards! 🚀
                </motion.p>

                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 1.5, duration: 0.5, type: "spring" }}
                  style={{ marginTop: 'var(--spacing-xxl)', display: 'flex', justifyContent: 'center', gap: 'var(--spacing-lg)' }}
                >
                  {['🏆', '⭐', '🚀', '💎', '🔥'].map((emoji, index) => (
                    <motion.div
                      key={emoji}
                      animate={{ 
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.2, 1]
                      }}
                      transition={{
                        delay: 2 + (index * 0.1),
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      style={{ fontSize: 'var(--font-size-32)' }}
                    >
                      {emoji}
                    </motion.div>
                  ))}
                </motion.div>
              </div>
            </SpectacularCard>
          </ResponsiveCol>
        </ResponsiveRow>
      </div>
      </div>
    </Surface>
  );
};

export default SpectacularShowcase;
