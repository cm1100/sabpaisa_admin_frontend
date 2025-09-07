'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { authenticationService } from '@/services/api/AuthenticationApiService';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is authenticated
    const tokens = authenticationService.getStoredTokens();
    const user = authenticationService.getStoredUser();
    
    if (tokens.access && user) {
      // User is authenticated, redirect to dashboard
      router.push('/dashboard');
    } else {
      // User is not authenticated, redirect to login
      router.push('/login');
    }
  }, [router]);

  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh' 
    }}>
      <div style={{ textAlign: 'center' }}>
        <h1 style={{ 
          fontSize: '24px', 
          fontWeight: 600, 
          marginBottom: '8px' 
        }}>
          SabPaisa Admin
        </h1>
        <p style={{ color: 'var(--app-colorTextTertiary)' }}>Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
