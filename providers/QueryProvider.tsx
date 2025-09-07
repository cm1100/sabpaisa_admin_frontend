"use client";

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

let queryClientSingleton: QueryClient | null = null;

const getClient = () => {
  if (!queryClientSingleton) {
    queryClientSingleton = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 1000 * 60 * 5, // 5 minutes
          gcTime: 1000 * 60 * 30,   // 30 minutes
          refetchOnWindowFocus: true,
          retry: 1,
        },
      },
    });
  }
  return queryClientSingleton;
};

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  const client = React.useMemo(getClient, []);
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

