'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/authContext';
import { getCurrentUser } from '@/services/auth';
import { LoaderCircle } from 'lucide-react';
import type { User } from 'firebase/auth';

export default function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { currentUser: contextUser, isInitialized: contextInitialized } = useAuth();
    const router = useRouter();
    const [isVerified, setIsVerified] = useState(false);

    useEffect(() => {
      const verifyUser = async () => {
        const user = await getCurrentUser();
        if (user) {
          setIsVerified(true);
        } else {
          router.push('/');
        }
      };
      
      verifyUser();
    }, [router]);

    if (!isVerified) {
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
