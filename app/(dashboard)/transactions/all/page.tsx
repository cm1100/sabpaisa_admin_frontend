/**
 * All Transactions Page
 * Following SOLID principles and Next.js 15 best practices
 * Single Responsibility: Display all transactions with filtering
 */

'use client';

import React from 'react';
import { CentralTitle, CentralText, StyledSpace } from '@/components/ui';
import { ResponsiveContainer, ResponsiveGrid } from '@/components/layouts/ResponsiveGrid';
import TransactionTableWrapper from './client-wrapper';

// Using centralized typography components

/**
 * Interface for page props (for future extensibility)
 */
interface AllTransactionsPageProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

/**
 * All Transactions Page Component
 * Displays comprehensive transaction list with all features
 */
const AllTransactionsPage: React.FC<AllTransactionsPageProps> = ({ searchParams }) => {
  return (
    <ResponsiveContainer maxWidth="full" padding background="none" animate>
      <ResponsiveGrid layout="dashboard" background="none">
        <StyledSpace direction="vertical" size="large" style={{ width: '100%' }}>
          <CentralTitle level={2}>All Transactions</CentralTitle>
          <CentralText type="secondary">Complete transaction history with advanced filtering</CentralText>
          <TransactionTableWrapper />
        </StyledSpace>
      </ResponsiveGrid>
    </ResponsiveContainer>
  );
};

export default AllTransactionsPage;
