
"use client";

import type { User } from '@/types';
import React, { createContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, passwordInput: string) => Promise<void>; // Updated signature
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
  const [isLoading, setIsLoading] = useState(true); // Start as true
  const router = useRouter();

  useEffect(() => {
    // This effect runs only on the client side after mount
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
      setIsLoading(false); // Set loading to false after attempting to load
    }
  }, []);

  const login = useCallback(async (usernameInput: string, passwordInput: string): Promise<void> => {
    setIsLoading(true); // Set loading true during login attempt
    // Simulate API call
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        let loggedInUser: User | null = null;
        let newToken: string | null = null;

        if (usernameInput === 'admin' && passwordInput === 'password') {
          newToken = 'mock-admin-token';
          loggedInUser = MOCK_ADMIN_USER;
        } else if (usernameInput === 'customer' && passwordInput === 'password') {
          newToken = 'mock-customer-token';
          loggedInUser = MOCK_CUSTOMER_USER;
        }

        if (loggedInUser && newToken) {
          try {
            localStorage.setItem('authToken', newToken);
            localStorage.setItem('authUser', JSON.stringify(loggedInUser));
            setToken(newToken);
            setUser(loggedInUser);
            resolve();
          } catch (error) {
            console.error("Failed to save auth state to localStorage", error);
            reject(new Error('Failed to save session. Please try again.'));
          }
        } else {
          reject(new Error('Invalid credentials'));
        }
        setIsLoading(false); // Set loading false after login attempt
      }, 1000);
    });
  }, []);
  
  const logout = useCallback(() => {
    try {
      localStorage.removeItem('authToken');
      localStorage.removeItem('authUser');
    } catch (error) {
      console.error("Failed to remove auth state from localStorage", error);
    }
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
