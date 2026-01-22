'use client';

import { useEffect, useState } from 'react';

interface User {
  id: string;
  email: string | null;
  name: string | null;
  logtoId: string;
}

interface AuthState {
  authenticated: boolean;
  user: User | null;
  loading: boolean;
}

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    user: null,
    loading: true,
  });

  useEffect(() => {
    fetchAuthStatus();
  }, []);

  const fetchAuthStatus = async () => {
    try {
      const response = await fetch('/api/logto/user');
      const data = await response.json();

      setAuthState({
        authenticated: data.authenticated,
        user: data.user,
        loading: false,
      });
    } catch (error) {
      console.error('Error fetching auth status:', error);
      setAuthState({
        authenticated: false,
        user: null,
        loading: false,
      });
    }
  };

  const signIn = (redirectTo?: string) => {
    const url = redirectTo
      ? `/api/logto/sign-in?redirectTo=${encodeURIComponent(redirectTo)}`
      : '/api/logto/sign-in';
    window.location.href = url;
  };

  const signOut = () => {
    window.location.href = '/api/logto/sign-out';
  };

  return {
    ...authState,
    signIn,
    signOut,
    refresh: fetchAuthStatus,
  };
}
