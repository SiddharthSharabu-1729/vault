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
      // If initialization is complete and there's no user, redirect to login.
      if (isInitialized && !currentUser) {
        router.push('/');
      }
    }, [currentUser, isInitialized, router]);

    // While Firebase is initializing, show a loader.
    if (!isInitialized || !currentUser) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <LoaderCircle className="w-12 h-12 animate-spin text-primary" />
        </div>
      );
    }

    // If initialization is complete and there is a user, render the component.
    return <WrappedComponent {...props} />;
  };

  WithAuthComponent.displayName = `withAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}
