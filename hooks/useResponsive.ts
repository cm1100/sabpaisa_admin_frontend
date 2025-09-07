/**
 * Responsive Design Hook
 * Implements mobile-first responsive design with ResizeObserver
 * Following SOLID principles - Single Responsibility
 */
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// Enhanced breakpoints for perfect responsive design - mobile-first approach
export const breakpoints = {
  xs: 0,      // Mobile portrait: 0-479px
  sm: 480,    // Mobile landscape: 480-767px  
  md: 768,    // Tablet: 768-1023px
  lg: 1024,   // Desktop: 1024-1439px
  xl: 1440,   // Large desktop: 1440-1919px
  xxl: 1920   // Ultra-wide: 1920px+
} as const;

export type Breakpoint = keyof typeof breakpoints;

interface ResponsiveState {
  width: number;
  height: number;
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  isLargeDesktop: boolean;
  isUltraWide: boolean;
  orientation: 'portrait' | 'landscape';
  isTouchDevice: boolean;
  hasHover: boolean;
  prefersReducedMotion: boolean;
}

/**
 * Custom hook for responsive design
 * Uses ResizeObserver for better performance than window resize events
 */
export const useResponsive = (containerRef?: React.RefObject<HTMLElement>) => {
  const [state, setState] = useState<ResponsiveState>(() => {
    // Initialize with window dimensions on client side
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const hasHover = window.matchMedia('(hover: hover)').matches;
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      return {
        width,
        height,
        breakpoint: getBreakpoint(width),
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg && width < breakpoints.xl,
        isLargeDesktop: width >= breakpoints.xl && width < breakpoints.xxl,
        isUltraWide: width >= breakpoints.xxl,
        orientation: width > height ? 'landscape' : 'portrait',
        isTouchDevice,
        hasHover,
        prefersReducedMotion
      };
    }
    // Default state for SSR
    return {
      width: 1024,
      height: 768,
      breakpoint: 'lg',
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      isLargeDesktop: false,
      isUltraWide: false,
      orientation: 'landscape',
      isTouchDevice: false,
      hasHover: true,
      prefersReducedMotion: false
    };
  });

  const resizeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Helper function to determine current breakpoint
  function getBreakpoint(width: number): Breakpoint {
    if (width >= breakpoints.xxl) return 'xxl';
    if (width >= breakpoints.xl) return 'xl';
    if (width >= breakpoints.lg) return 'lg';
    if (width >= breakpoints.md) return 'md';
    if (width >= breakpoints.sm) return 'sm';
    return 'xs';
  }

  // Handle resize with debouncing
  const handleResize = useCallback((width: number, height: number) => {
    // Debounce resize events for performance
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }

    resizeTimeoutRef.current = setTimeout(() => {
      const isTouchDevice = typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
      const hasHover = typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches;
      const prefersReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      
      setState({
        width,
        height,
        breakpoint: getBreakpoint(width),
        isMobile: width < breakpoints.md,
        isTablet: width >= breakpoints.md && width < breakpoints.lg,
        isDesktop: width >= breakpoints.lg && width < breakpoints.xl,
        isLargeDesktop: width >= breakpoints.xl && width < breakpoints.xxl,
        isUltraWide: width >= breakpoints.xxl,
        orientation: width > height ? 'landscape' : 'portrait',
        isTouchDevice,
        hasHover,
        prefersReducedMotion
      });
    }, 100); // Reduced to 100ms for better responsiveness
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return () => {};

    let observer: ResizeObserver | null = null;

    if (containerRef?.current) {
      // Observe container element
      observer = new ResizeObserver((entries) => {
        const entry = entries[0];
        if (entry) {
          const { width, height } = entry.contentRect;
          handleResize(width, height);
        }
      });
      observer.observe(containerRef.current);
    } else {
      // Fallback to window resize
      const handleWindowResize = () => {
        handleResize(window.innerWidth, window.innerHeight);
      };
      
      window.addEventListener('resize', handleWindowResize);
      // Also listen for orientation change and media query changes
      window.addEventListener('orientationchange', handleWindowResize);
      
      // Listen for accessibility preference changes
      const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      const hoverQuery = window.matchMedia('(hover: hover)');
      
      const handleMediaChange = () => {
        handleWindowResize();
      };
      
      motionQuery.addEventListener('change', handleMediaChange);
      hoverQuery.addEventListener('change', handleMediaChange);
      
      // Initial call
      handleWindowResize();

      return () => {
        window.removeEventListener('resize', handleWindowResize);
        window.removeEventListener('orientationchange', handleWindowResize);
        
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        const hoverQuery = window.matchMedia('(hover: hover)');
        motionQuery.removeEventListener('change', handleMediaChange);
        hoverQuery.removeEventListener('change', handleMediaChange);
        
        if (resizeTimeoutRef.current) {
          clearTimeout(resizeTimeoutRef.current);
          resizeTimeoutRef.current = null;
        }
      };
    }

    return () => {
      if (observer) {
        observer.disconnect();
      }
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
        resizeTimeoutRef.current = null;
      }
    };
  }, [containerRef, handleResize]);

  return state;
};

/**
 * Hook to get responsive values based on current breakpoint
 * Follows mobile-first approach
 */
export const useResponsiveValue = <T,>(values: Partial<Record<Breakpoint, T>>, defaultValue: T): T => {
  const { breakpoint } = useResponsive();

  // Mobile-first: Start from current breakpoint and fall back to smaller ones
  const breakpointOrder: Breakpoint[] = ['xxl', 'xl', 'lg', 'md', 'sm', 'xs'];
  const currentIndex = breakpointOrder.indexOf(breakpoint);

  let result: T = defaultValue;
  for (let i = currentIndex; i < breakpointOrder.length; i++) {
    const bp = breakpointOrder[i];
    if (values[bp] !== undefined) {
      result = values[bp] as T;
      break;
    }
  }

  return result;
};

export default useResponsive;
