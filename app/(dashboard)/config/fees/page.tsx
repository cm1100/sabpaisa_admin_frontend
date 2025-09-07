'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Spin } from '@/components/ui';

const FeesConfigRedirect: React.FC = () => {
  const router = useRouter();

  useEffect(() => {
    // Redirect to the fees configuration page
    router.replace('/fees/configuration');
  }, [router]);

  return (
    <div >
      <Spin size="large" />
    </div>
  );
};

export default FeesConfigRedirect;