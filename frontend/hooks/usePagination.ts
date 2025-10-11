/**
 * usePagination hook - Reusable pagination logic for carousels
 */

import { useState, useMemo } from 'react';

interface UsePaginationResult<T> {
  currentPage: number;
  totalPages: number;
  visibleItems: T[];
  canGoPrev: boolean;
  canGoNext: boolean;
  handlePrev: () => void;
  handleNext: () => void;
  setPage: (page: number) => void;
}

/**
 * Provides pagination state and controls for arrays
 * 
 * @param items Array of items to paginate
 * @param itemsPerPage Number of items to show per page
 * @returns Pagination state and controls
 */
export function usePagination<T>(
  items: T[],
  itemsPerPage: number
): UsePaginationResult<T> {
  const [currentPage, setCurrentPage] = useState(0);
  
  const totalPages = Math.ceil(items.length / itemsPerPage);
  
  const visibleItems = useMemo(() => {
    const start = currentPage * itemsPerPage;
    const end = start + itemsPerPage;
    return items.slice(start, end);
  }, [items, currentPage, itemsPerPage]);
  
  const canGoPrev = currentPage > 0;
  const canGoNext = currentPage < totalPages - 1;
  
  const handlePrev = () => {
    if (canGoPrev) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNext = () => {
    if (canGoNext) {
      setCurrentPage(currentPage + 1);
    }
  };
  
  return {
    currentPage,
    totalPages,
    visibleItems,
    canGoPrev,
    canGoNext,
    handlePrev,
    handleNext,
    setPage: setCurrentPage,
  };
}
