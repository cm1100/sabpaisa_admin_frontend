'use client';

import React, { useEffect } from 'react';
import { TransactionTable } from '@/components/tables/TransactionTable';
// Use centralized theming; avoid local ConfigProvider overrides

export default function TransactionTableWrapper() {
  useEffect(() => {
    // keep wrapper lightweight; no DOM mutations
  }, []);

  return <TransactionTable />;
}
