'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from "next/navigation";
import { getCurrentUser, loginUser, logoutUser, registerUser } from '@/lib/api/auth';
import { verifyTwoFactorSetup } from '@/lib/api/user';
import Cookies from 'js-cookie';
import { ClientOnly } from '@/components/ClientOnly';

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
  isAuthenticated: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<{ requiresTwoFactor?: boolean }>;
  verifyTwoFactor: (email: string, code: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Separate the provider content from the wrapper for cleaner hydration
function AuthProviderContent({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Set email verification status in cookie when user changes
  useEffect(() => {
    if (user) {
      const isVerified = !!user.emailVerified;
      Cookies.set('emailVerified', isVerified.toString());
    } else {
      Cookies.remove('emailVerified');
    }
  }, [user]);

  // Fetch current user on mount
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const { data, error, status } = await getCurrentUser();
        if (status === "success") {
          setUser(data.user);
        }
      } catch (err) {
        // Not authenticated - that's okay
      } finally {
        setIsLoading(false);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogin = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const { data, status } = await loginUser({ email, password });
      
      if (status === "success") {
        if (data.twoFactor) {
          // If two-factor is required, don't set the user yet
          return { requiresTwoFactor: true };
        }
        
        // Otherwise set the user and cookies
        setUser(data.user);
        
        // Handle redirect to dashboard or callback URL
        const callbackUrl = Cookies.get('loginCallbackUrl') || '/dashboard';
        Cookies.remove('loginCallbackUrl');
        window.location.href = callbackUrl;
      }
      
      return { requiresTwoFactor: false };
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to login");
      return { requiresTwoFactor: false };
    } finally {
      setIsLoading(false);
    }
  };

  const verifyTwoFactor = async (email: string, code: string) => {
    setError(null);
    try {
      const { data, error, status } = await verifyTwoFactorSetup(code);
      
      if (status === "success" && data?.user) {
        setUser(data.user);
        router.push('/dashboard');
      } else {
        setError(error || "Failed to verify two-factor code");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const register = async (name: string, email: string, password: string) => {
    setError(null);
    try {
      const { data, error, status } = await registerUser({ name, email, password });
      
      if (status === "success") {
        // Don't auto-login after registration, they need to verify email
        router.push('/auth/verify-email');
      } else {
        setError(error || "Failed to register");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    }
  };

  const logout = async () => {
    try {
      await logoutUser();
      setUser(null);
      // Hard refresh to clear all client state
      router.push('/auth/login');
      router.refresh();
    } catch (err) {
      setError("Failed to logout");
    }
  };

  const refreshUser = async () => {
    try {
      const { data, status } = await getCurrentUser();
      if (status === "success") {
        setUser(data.user);
      }
    } catch (err) {
      // Error fetching user
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        error,
        login: handleLogin,
        verifyTwoFactor,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function AuthProvider({ children }: { children: ReactNode }) {
  return (
    <ClientOnly>
      <AuthProviderContent>{children}</AuthProviderContent>
    </ClientOnly>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}