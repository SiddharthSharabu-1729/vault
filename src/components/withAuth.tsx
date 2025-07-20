'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/authContext';
import { LoaderCircle } from 'lucide-react';

export default function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { currentUser, isInitialized } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (isInitialized && !currentUser) {
        router.push('/');
      }
    }, [currentUser, isInitialized, router]);

    if (!isInitialized || !currentUser) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}
