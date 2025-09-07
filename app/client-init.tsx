/**
 * Client-side initialization
 * Suppresses known warnings and applies patches
 */

'use client';

import { useEffect } from 'react';

// Suppress Ant Design React 19 compatibility warning
// We have the patch installed but the warning still appears
if (typeof window !== 'undefined' && typeof console !== 'undefined') {
  const originalWarn = console.warn;
  const originalError = console.error;
  
  // Override console.warn
  console.warn = function(...args) {
    // Suppress Ant Design React 19 warning
    if (typeof args[0] === 'string' && args[0].includes('antd v5 support React is 16 ~ 18')) {
      return;
    }
    // Suppress React 19 compatibility warnings
    if (typeof args[0] === 'string' && args[0].includes('compatible')) {
      return;
    }
    return originalWarn.apply(console, args);
  };
  
  // Override console.error for any error-level compatibility messages
  console.error = function(...args) {
    // Suppress specific error messages if needed
    if (typeof args[0] === 'string' && args[0].includes('antd v5 support React')) {
      return;
    }
    return originalError.apply(console, args);
  };
}

export default function ClientInit(): null {
  useEffect(() => {
    // Any other client-side initialization can go here
    console.log('Client initialized with React 19 compatibility patches');
    
    // Load auth test utility in development
    if (process.env.NODE_ENV === 'development') {
      import('@/utils/testAuth').then(() => {
        console.log('Auth test utility loaded. Run testAuth() in console to test authentication.');
      });
    }
  }, []);
  
  return null;
}
