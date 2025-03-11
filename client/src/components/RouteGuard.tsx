import { useRouter } from 'next/router';
import { useEffect } from 'react';
import { useAuthContext } from '@/context/AuthContext';

export const withAuth = (Component: React.ComponentType<any>) => {
  return function AuthGuard(props: any) {
    const { user, isLoading } = useAuthContext();
    const router = useRouter();

    useEffect(() => {
      if (!isLoading && !user) {
        router.push('/auth/login');
      }
    }, [user, isLoading]);

    if (isLoading) return <div>Loading...</div>;
    if (!user) return null;

    return <Component {...props} />;
  };
};