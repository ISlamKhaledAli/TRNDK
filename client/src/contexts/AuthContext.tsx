/**
 * client/src/contexts/AuthContext.tsx
 * 
 * Authentication context provider.
 * Manages user authentication state, login/logout functionality,
 * and provides authentication status checks throughout the application.
 */

import { createContext, useContext, useState, useEffect } from 'react';
import { apiClient } from "@/services/api";
import { useQuery } from "@tanstack/react-query";
import { RootFallback } from "@/components/layouts/RootLayout";

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'customer';
  isVip?: boolean;
  phone?: string;
  createdAt?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  updateUser: (user: User) => void;
  logout: () => Promise<void>;
  isAuthenticated: () => boolean;
  isAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data } = await apiClient.getProfile();
        setUser(data);
      } catch (error) {
        // Not authenticated
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    checkAuth();
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
  };

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser);
  };

  const logout = async () => {
    await apiClient.logout();
    setUser(null);
    window.location.href = "/"; // Force full reload to clear any client state if needed
  };

  const isAuthenticated = () => !!user;
  const isAdmin = () => user?.role === 'admin';

  return (
    <AuthContext.Provider value={{ user, isLoading, login, updateUser, logout, isAuthenticated, isAdmin }}>
      {!isLoading ? children : <RootFallback />}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
