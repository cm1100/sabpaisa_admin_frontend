import '@/lib/antd-patch'; // Must be first - React 19 compatibility
import type { Metadata } from "next";
import "./globals.css";
import 'antd/dist/reset.css';
// Removed custom CSS - using only Ant Design
import { ThemeProvider } from '@/components/theme/ThemeProvider';
import QueryProvider from '@/providers/QueryProvider';
import { Inter, JetBrains_Mono } from 'next/font/google';
import ErrorBoundary from '@/components/ErrorBoundary';

export const metadata: Metadata = {
  title: "SabPaisa Admin | Payment Gateway Management",
  description: "Administrative dashboard for SabPaisa payment gateway - Managing 1.5M+ daily transactions",
  themeColor: 'var(--app-colorPrimary)',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
};

import ClientInit from './client-init';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const jetBrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', display: 'swap' });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="theme-color" content="var(--app-colorPrimary)" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="format-detection" content="telephone=no" />
      </head>
      <body className={`${inter.variable} ${jetBrainsMono.variable}`}>
        <QueryProvider>
          <ThemeProvider>
            <ClientInit />
            <ErrorBoundary>
              {children}
            </ErrorBoundary>
          </ThemeProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
