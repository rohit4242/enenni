'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { ClientOnly } from '@/components/ClientOnly';
import useAuth from '@/hooks/use-auth';

interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: string | null;
  role: string;
  isTwoFactorEnabled: boolean;
  image: string | null;
  kycStatus: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isFetching: boolean;
  error: any;
  refetch: () => void;
}

// Create a default context value to prevent undefined errors
const defaultContextValue: AuthContextType = {
  user: null,
  isLoading: true,
  isFetching: false,
  error: null,
  refetch: () => {},
};

const AuthContext = createContext<AuthContextType>(defaultContextValue);

// Separate the provider content from the wrapper for cleaner hydration
function AuthProviderContent({ children }: { children: ReactNode }) {
  const { data, error, isLoading, isFetching, refetch } = useAuth();
  const user = data?.data?.user || null;

  return (
    <AuthContext.Provider
      value={{ user, error, isLoading, isFetching, refetch }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClientOnly fallback={
      <AuthContext.Provider value={defaultContextValue}>
        {children}
      </AuthContext.Provider>
    }>
      <AuthProviderContent>{children}</AuthProviderContent>
    </ClientOnly>
  );
}

export function useAuthContext() {
  const context = useContext(AuthContext);
  return context;
}