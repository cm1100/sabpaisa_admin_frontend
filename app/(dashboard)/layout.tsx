'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layouts/MainLayout';
import AntdConfigProvider from '@/providers/AntdConfigProvider';
import { ProConfigProvider, App } from '@/components/ui';
import { authenticationService } from '@/services/api/AuthenticationApiService';
// Removed heavy ProTable overrides; rely on AntD tokens centrally

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Check authentication on layout mount - TEMPORARILY DISABLED FOR TESTING
    // const tokens = authenticationService.getStoredTokens();
    // const user = authenticationService.getStoredUser();
    
    // if (!tokens.access || !user) {
    //   // User is not authenticated, redirect to login
    //   router.push('/login');
    //   return;
    // }
  }, [router]);

  return (
    <AntdConfigProvider>
      <App>
      <ProConfigProvider 
        dark={false}
        prefixCls="ant"
        token={
          {
            // Pull from centralized ProLayout theme tokens defined in styles/theme.ts
            colorPrimary: 'var(--color-primary)',
            bgLayout: 'var(--color-bg-primary)',
            sider: {
              colorMenuBackground: 'var(--color-bg-elevated)',
              colorBgMenuItemSelected: 'var(--color-primary-alpha-10)',
              colorTextMenuSelected: 'var(--color-primary)'
            },
            header: {
              colorBgHeader: 'var(--color-bg-elevated)'
            },
            pageContainer: {
              colorBgPageContainer: 'var(--color-bg-secondary)'
            }
          } as any
        } as any
      >
        <MainLayout>{children}</MainLayout>
      </ProConfigProvider>
      </App>
    </AntdConfigProvider>
  );
}
