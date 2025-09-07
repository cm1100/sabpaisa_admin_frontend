'use client';

import { useEffect } from 'react';
import { suppressAntdReact19Warning } from '@/utils/suppressWarnings';

export default function WarningSuppressor() {
  useEffect(() => {
    // Apply suppression after component mounts
    suppressAntdReact19Warning();
    
    // Re-apply periodically to catch any late warnings
    const interval = setInterval(suppressAntdReact19Warning, 1000);
    
    // Clean up after 5 seconds
    setTimeout(() => clearInterval(interval), 5000);
    
    return () => clearInterval(interval);
  }, []);
  
  return null;
}