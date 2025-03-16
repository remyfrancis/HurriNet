'use client'; // Mark as client component since we use browser APIs

import React, { createContext, useContext, useState, useEffect } from 'react';

// Define the shape of our User object
interface User {
  id: number;
  email: string;
  role: string;
  first_name?: string;
  last_name?: string;
}

// Define the shape of our authentication context
interface AuthContextType {
  user: User | null;        // Current user data or null if not authenticated
  token: string | null;     // JWT token or null if not authenticated
  login: (token: string, user: User) => void;  // Function to handle login
  logout: () => void;       // Function to handle logout
  isAuthenticated: boolean; // Whether the user is currently authenticated
}

// Create the context with undefined as initial value
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// AuthProvider component that wraps our app and provides authentication state
export function AuthProvider({ children }: { children: React.ReactNode }) {
  // State for storing user data and JWT token
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  // State to track if we've loaded auth data from localStorage
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // On component mount, try to load saved authentication data
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    
    if (storedToken && storedUser) {
      try {
        // If we have stored data, restore the auth state
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing stored user:', error);
        // If there's an error parsing the stored data, clear it
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    }
    // Mark that we've attempted to load auth data
    setIsHydrated(true);
  }, []);

  // Function to handle user login
  const login = (newToken: string, newUser: User) => {
    // Update state with new auth data
    setToken(newToken);
    setUser(newUser);
    // Persist auth data to localStorage
    localStorage.setItem('accessToken', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
  };

  // Function to handle user logout
  const logout = () => {
    // Clear auth state
    setToken(null);
    setUser(null);
    // Remove persisted auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
  };

  // Don't render children until we've checked localStorage for existing auth data
  // This prevents flash of incorrect auth state
  if (!isHydrated) {
    return null;
  }

  // Provide auth context to children components
  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      logout,
      isAuthenticated: !!token && !!user // User is authenticated if both token and user exist
    }}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 