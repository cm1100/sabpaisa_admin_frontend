/**
 * Client List Page
 * Dedicated route for /clients/list
 */
'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const ClientListPage: React.FC = () => {
  const router = useRouter();
  
  useEffect(() => {
    // Redirect to the main clients page
    router.push('/clients');
  }, [router]);

  return null;
};

export default ClientListPage;