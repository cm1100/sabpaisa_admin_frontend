/**
 * Main Layout Component using Ant Design ProLayout
 * Implements all navigation and layout requirements
 */
'use client';

import React, { useState, useEffect } from 'react';
import { ProLayout } from '@/components/ui';
import type { ProLayoutProps } from '@ant-design/pro-layout';
import { 
  CentralButton,
  CentralBadge,
  CentralAvatar,
  StyledSpace,
  Dropdown,
  Input,
  Tooltip
} from '@/components/ui';
import {
  SearchOutlined,
  BellOutlined,
  QuestionCircleOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  TranslationOutlined,
  SettingOutlined,
  LogoutOutlined,
  UserOutlined,
  SyncOutlined,
  SkinOutlined,
} from '@ant-design/icons';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { routes } from '@/config/routes';
import { themeConfig, proLayoutTheme } from '@/styles/theme';
import { theme } from '@/components/ui';
import { useResponsive } from '@/hooks/useResponsive';
import ThemePanel from '@/components/theme/ThemePanel';
import CommandPalette from '@/components/common/CommandPalette';
import { ThemeToggle } from '@/components/theme/ThemeProvider';
import { useDashboardStore } from '@/stores/dashboardStore';
import { authenticationService } from '@/services/api/AuthenticationApiService';
import NotificationsApiService from '@/services/api/NotificationsApiService';
import AssistantPanel from '@/components/assistant/AssistantPanel';
import { RobotOutlined } from '@ant-design/icons';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [isClient, setIsClient] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const { refreshDashboardData, isRefreshing } = useDashboardStore();
  const { token } = theme.useToken();
  const { isMobile, isTablet } = useResponsive();
  const [notifCount, setNotifCount] = useState<number>(0);
  const [healthStatus, setHealthStatus] = useState<string>('');
  const [themePanelOpen, setThemePanelOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Auto-collapse on mobile for better focus
    if (isMobile) setCollapsed(true);
    // Load user data from storage or API
    (async () => {
      // Prefer live profile; fall back to stored user
      try {
        const profile = await authenticationService.getProfile();
        if (profile) {
          setCurrentUser({
            name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.username,
            role: (profile as any).role || ((profile as any).is_superuser ? 'super_admin' : 'user'),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`,
            username: profile.username,
            email: profile.email,
          });
        }
      } catch {
        const storedUser = authenticationService.getStoredUser();
        if (storedUser) {
          setCurrentUser({
            name: `${storedUser.first_name || ''} ${storedUser.last_name || ''}`.trim() || storedUser.username,
            role: (storedUser as any).role || ((storedUser as any).is_superuser ? 'super_admin' : 'user'),
            avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${storedUser.username}`,
            username: storedUser.username,
            email: storedUser.email,
          });
        }
      }
      // Notifications count
      try {
        const feed = await NotificationsApiService.listAll();
        setNotifCount((feed.results || []).length);
      } catch {}
      // Health status
      try {
        const api = process.env.NEXT_PUBLIC_API_URL || '';
        const res = await fetch(`${api}/health/`, { headers: { 'Accept': 'application/json' } });
        const data = await res.json().catch(() => ({}));
        setHealthStatus(data?.status || '');
      } catch {}
    })();
  }, []);

  // Keyboard shortcut: Cmd/Ctrl + K for command palette
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'k')) {
        e.preventDefault();
        setPaletteOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      // Clear dashboard data first to prevent API calls
      useDashboardStore.getState().clearDashboardData?.();
      
      // Perform logout
      await authenticationService.logout();
      
      // Navigate to login
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      authenticationService.clearAuthTokens();
      router.push('/login');
    }
  };

  // Handle fullscreen toggle
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  // Handle global search
  const handleSearch = (value: string) => {
    console.log('Searching for:', value);
    // Implement global search functionality
  };

  // Right content (header actions)
  const rightContentRender = () => (
    <StyledSpace
      size={isMobile ? 'small' : 'normal'}
      align="center"
      wrap
      style={{ maxWidth: '100%', overflow: 'hidden' }}
    >
      {/* Global Search - Responsive */}
      {!isMobile && (
        <Input
          prefix={<SearchOutlined />}
          placeholder="Search transactions, clients..."
          className="header-search"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          onPressEnter={(e) => handleSearch(e.currentTarget.value)}
          allowClear
        />
      )}

      {/* Refresh Button */}
      <Tooltip title="Refresh Data">
        <CentralButton
          type="text"
          icon={<SyncOutlined spin={isRefreshing} />}
          onClick={() => refreshDashboardData()}
          loading={isRefreshing}
          aria-label="Refresh data"
        />
      </Tooltip>

      {/* Fullscreen Toggle */}
      {!isMobile && (
        <Tooltip title={fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}>
          <CentralButton
            type="text"
            icon={fullscreen ? <FullscreenExitOutlined /> : <FullscreenOutlined />}
            onClick={toggleFullscreen}
            aria-label={fullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          />
        </Tooltip>
      )}

      {/* Language Switcher */}
      {!isMobile && (
        <Tooltip title="Language">
          <Dropdown
            menu={{
              items: [
                { key: 'en', label: 'English' },
                { key: 'hi', label: 'हिन्दी' },
              ],
            }}
          >
            <CentralButton type="text" icon={<TranslationOutlined />} aria-label="Language" />
          </Dropdown>
        </Tooltip>
      )}

      {/* Help */}
      {!isMobile && (
        <Tooltip title="Help & Documentation">
          <CentralButton
            type="text"
            icon={<QuestionCircleOutlined />}
            onClick={() => window.open('/docs', '_blank')}
            aria-label="Help"
          />
        </Tooltip>
      )}

      {/* Theme / Appearance */}
      {!isMobile && (
        <Tooltip title="Appearance">
          <CentralButton
            type="text"
            icon={<SkinOutlined />}
            onClick={() => setThemePanelOpen(true)}
            aria-label="Appearance"
          />
        </Tooltip>
      )}

      {/* Command Palette */}
      {!isMobile && (
        <Tooltip title="Command palette (Cmd/Ctrl + K)">
          <CentralButton
            type="text"
            icon={<SearchOutlined />}
            onClick={() => setPaletteOpen(true)}
            aria-label="Open command palette"
          />
        </Tooltip>
      )}

      {/* Quick Theme Toggle (Light/Dark/Auto) */}
      {!isMobile && <ThemeToggle />}

      {/* Notifications */}
      <CentralBadge count={notifCount || 0} offset={[-10, 10]}>
        <CentralButton
          type="text"
          icon={<BellOutlined />}
          onClick={() => router.push('/notifications/all')}
        />
      </CentralBadge>

      {/* User Menu */}
      {currentUser && (
        <Dropdown
          menu={{
            items: [
              {
                key: 'profile',
                label: 'Profile',
                icon: <UserOutlined />,
                onClick: () => router.push('/account/profile'),
              },
              // Settings route omitted (no page yet)
              { type: 'divider' },
              {
                key: 'logout',
                label: 'Logout',
                icon: <LogoutOutlined />,
                danger: true,
                onClick: handleLogout,
              },
            ],
          }}
        >
          <StyledSpace style={{ cursor: 'pointer' }}>
            <CentralAvatar 
              src={currentUser.avatar} 
              alt={currentUser.name}
            >
              {currentUser.name?.[0] || 'U'}
            </CentralAvatar>
            {!isMobile && (
              <div style={{ lineHeight: token.lineHeight, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <div style={{ fontSize: token.fontSize, fontWeight: token.fontWeightStrong }}>{currentUser.name || 'User'}</div>
                <div style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>{currentUser.role || 'User'}</div>
              </div>
            )}
          </StyledSpace>
        </Dropdown>
      )}
    </StyledSpace>
  );

  const proLayoutProps: ProLayoutProps = {
    title: 'SabPaisa Admin',
    logo: '/logo.svg',
    collapsed,
    onCollapse: setCollapsed,
    location: { pathname },
    route: { routes },
    menu: {
      locale: false,
      defaultOpenAll: false,
      autoClose: false,
      ignoreFlatMenu: false,
    },
    // Mobile-first layout tuning
    layout: isMobile ? 'top' : 'mix',
    splitMenus: false,
    fixedHeader: !isMobile,
    fixSiderbar: !isMobile,
    navTheme: 'light',
    contentWidth: 'Fluid',
    colorPrimary: proLayoutTheme.primaryColor,
    siderWidth: isMobile ? 220 : 256,
    headerHeight: isMobile ? 56 : 64,
    rightContentRender,
    menuItemRender: (item, dom) => {
      const path = item.path || '/';
      const testId = `nav-${path.replace(/\/+$/,'').replace(/^\//,'').replace(/\//g,'-') || 'home'}`;
      return (
        <Link
          href={path}
          style={{ textDecoration: 'none' }}
          data-testid={testId}
          aria-label={`nav-${path}`}
        >
          {dom}
        </Link>
      );
    },
    breadcrumbRender: (routers = []) => [
      {
        path: '/',
        breadcrumbName: 'Home',
      },
      ...routers,
    ],
    footerRender: () => (
      <div style={{ textAlign: 'center', padding: `${token.paddingLG}px 0`, color: token.colorTextSecondary }}>
        <StyledSpace split="|" size="small">
          <span>SabPaisa Admin v1.0.0</span>
          <span>© 2024 SabPaisa</span>
          <a href="/terms" style={{ color: token.colorPrimary }}>Terms</a>
          <a href="/privacy" style={{ color: token.colorPrimary }}>Privacy</a>
          <a href="/support" style={{ color: token.colorPrimary }}>Support</a>
        </StyledSpace>
      </div>
    ),
    pageTitleRender: (props, defaultDom, info) => {
      const title = info?.title || 'SabPaisa Admin';
      return `${title} | Payment Gateway Admin`;
    },
    menuExtraRender: ({ collapsed }) =>
      !collapsed && (
        <div style={{ padding: token.paddingLG, borderTop: `${token.lineWidth}px solid ${token.colorBorder}` }}>
          <StyledSpace direction="vertical" style={{ width: '100%' }}>
            <div style={{ fontSize: token.fontSizeSM, color: token.colorTextSecondary }}>System Status</div>
            <StyledSpace>
              <CentralBadge status={healthStatus === 'healthy' ? 'success' : 'warning'} text={healthStatus || 'unknown'} />
            </StyledSpace>
          </StyledSpace>
        </div>
      ),
    token: proLayoutTheme.token,
    ...proLayoutTheme,
  };

  if (!isClient) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    );
  }

  return (
    <>
      <ProLayout {...proLayoutProps}>
        <div style={{ minHeight: `calc(100vh - ${token.paddingLG * 2 + 64}px)` }}>
          {children}
        </div>
        {/* Floating Assistant Button */}
        <div
          style={{
            position: 'fixed',
            right: 24,
            bottom: 24,
            zIndex: 1000,
            display: 'flex',
            gap: 8,
          }}
        >
          <CentralButton
            type="primary"
            icon={<RobotOutlined />}
            onClick={() => setAssistantOpen(true)}
            aria-label="Open Admin Assistant"
          >
            Assistant
          </CentralButton>
        </div>
      </ProLayout>
      <ThemePanel open={themePanelOpen} onClose={() => setThemePanelOpen(false)} />
      <CommandPalette open={paletteOpen} onClose={() => setPaletteOpen(false)} />
      <AssistantPanel open={assistantOpen} onClose={() => setAssistantOpen(false)} />
    </>
  );
};

export default MainLayout;
