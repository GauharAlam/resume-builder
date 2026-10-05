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
  const [token, setToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem("authToken");
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      getToken()
        .then((t) => {
          setToken(t);
          if (t) {
            try {
              localStorage.setItem("authToken", t);
            } catch {}
          }
        })
        .catch((err) => {
          console.error("Failed to get Clerk token:", err);
          setToken(null);
        });
    } else if (isLoaded && !isSignedIn) {
      setToken(null);
      try {
        localStorage.removeItem("authToken");
      } catch {}
    }
  }, [isLoaded, isSignedIn, getToken]);

  const login = (newToken: string) => {
    setToken(newToken);
    try {
      localStorage.setItem("authToken", newToken);
    } catch {}
  };

  const logout = async () => {
    try {
      localStorage.removeItem("authToken");
    } catch {}
    setToken(null);
    await signOut();
  };

  const isAuthenticated = !!isSignedIn && isLoaded;

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
