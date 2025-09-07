import { useState, useCallback, useMemo } from 'react';
import { PaginatedResponse, QueryParams } from '@/types';

interface UsePaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  defaultSortBy?: string;
  defaultSortOrder?: 'asc' | 'desc';
}

interface UsePaginationReturn {
  page: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  setSorting: (field: string, order: 'asc' | 'desc') => void;
  resetPagination: () => void;
  queryParams: QueryParams;
}

/**
 * Custom hook for managing pagination state
 */
export function usePagination(options: UsePaginationOptions = {}): UsePaginationReturn {
  const {
    initialPage = 1,
    initialPageSize = 20,
    defaultSortBy,
    defaultSortOrder = 'desc'
  } = options;

  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [sortBy, setSortBy] = useState(defaultSortBy);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>(defaultSortOrder);

  const handleSetPage = useCallback((newPage: number) => {
    setPage(Math.max(1, newPage));
  }, []);

  const handleSetPageSize = useCallback((newSize: number) => {
    setPageSize(Math.max(1, Math.min(100, newSize)));
    setPage(1); // Reset to first page when page size changes
  }, []);

  const handleSetSorting = useCallback((field: string, order: 'asc' | 'desc') => {
    setSortBy(field);
    setSortOrder(order);
    setPage(1); // Reset to first page when sorting changes
  }, []);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
    setSortBy(defaultSortBy);
    setSortOrder(defaultSortOrder);
  }, [initialPage, initialPageSize, defaultSortBy, defaultSortOrder]);

  const queryParams = useMemo<QueryParams>(() => ({
    page,
    pageSize,
    sortBy,
    sortOrder
  }), [page, pageSize, sortBy, sortOrder]);

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    setPage: handleSetPage,
    setPageSize: handleSetPageSize,
    setSorting: handleSetSorting,
    resetPagination,
    queryParams
  };
}