import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useAuth as useClerkAuth } from '@clerk/clerk-react';

interface AuthContextType {
  token: string | null;
  isAuthenticated: boolean;
  login: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { getToken, isLoaded, isSignedIn, signOut } = useClerkAuth();
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      getToken().then(t => setToken(t));
    } else if (isLoaded && !isSignedIn) {
      setToken(null);
    }
  }, [isLoaded, isSignedIn, getToken]);

  const login = (newToken: string) => {
    // Compatibility stub: login is handled by Clerk UI.
  };

  const logout = () => {
    signOut();
  };

  const isAuthenticated = !!token && isSignedIn;

  return (
    <AuthContext.Provider value={{ token, isAuthenticated, login, logout, loading: !isLoaded }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
