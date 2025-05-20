"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, token: string, role?: 'admin' | 'customer') => Promise<void>;
  logout: () => void;
  isAdmin: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock admin user for demonstration
const MOCK_ADMIN_USER: User = { id: 'admin-123', username: 'admin', role: 'admin' };
const MOCK_CUSTOMER_USER: User = { id: 'customer-123', username: 'customer', role: 'customer' };

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    try {
      const storedToken = localStorage.getItem('authToken');
      const storedUser = localStorage.getItem('authUser');
      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to load auth state from localStorage", error);
      // Clear potentially corrupted storage
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = useCallback(async (usernameInput: string, passwordInput: string): Promise<void> => {
    setIsLoading(true);
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (usernameInput === 'admin' && passwordInput === 'password') {
          const newToken = 'mock-admin-token';
          const loggedInUser = MOCK_ADMIN_USER;
          localStorage.setItem('authToken', newToken);
          localStorage.setItem('authUser', JSON.stringify(loggedInUser));
          setToken(newToken);
          setUser(loggedInUser);
          setIsLoading(false);
          resolve();
        } else if (usernameInput === 'customer' && passwordInput === 'password') {
          const newToken = 'mock-customer-token';
          const loggedInUser = MOCK_CUSTOMER_USER;
          localStorage.setItem('authToken', newToken);
          localStorage.setItem('authUser', JSON.stringify(loggedInUser));
          setToken(newToken);
          setUser(loggedInUser);
          setIsLoading(false);
          resolve();
        }
        else {
          setIsLoading(false);
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }, []);
  
  const logout = useCallback(() => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
    setToken(null);
    setUser(null);
    router.push('/login');
  }, [router]);

  const isAdmin = user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
