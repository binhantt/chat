"use client";

import { useEffect, useMemo, useState } from "react";

interface UsePaginationOptions {
  pageSize: number;
  resetKeys?: unknown[];
}

export function usePagination<T>(
  items: T[],
  { pageSize, resetKeys = [] }: UsePaginationOptions,
) {
  const [page, setPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;

  useEffect(() => {
    setPage(1);
  }, resetKeys);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const pageItems = useMemo(
    () => items.slice(pageStart, pageStart + pageSize),
    [items, pageSize, pageStart],
  );

  return {
    currentPage,
    page,
    pageItems,
    pageSize,
    pageStart,
    setPage,
    showingFrom: items.length === 0 ? 0 : pageStart + 1,
    showingTo: Math.min(pageStart + pageSize, items.length),
    totalItems: items.length,
    totalPages,
  };
}
