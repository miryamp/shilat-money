import React, { createContext, useContext, useEffect, useState } from 'react';
import { AuthResponse } from 'shared/entities/auth.interface';
import Cookies from 'js-cookie';

interface AuthContextType {
  isAuthenticated: boolean;
  user: AuthResponse['user'] | null;
  accessToken: string | null;
  login: (response: AuthResponse) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  accessToken: null,
  login: () => {},
  logout: () => {},
});

const AUTH_COOKIE_KEY = 'auth';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<{
    isAuthenticated: boolean;
    user: AuthResponse['user'] | null;
    accessToken: string | null;
  }>({
    isAuthenticated: false,
    user: null,
    accessToken: null,
  });

  useEffect(() => {
    // Check for existing auth data in cookies on mount
    const savedAuth = Cookies.get(AUTH_COOKIE_KEY);
    if (savedAuth) {
      try {
        const parsed = JSON.parse(savedAuth);
        setAuthState({
          isAuthenticated: true,
          user: parsed.user,
          accessToken: parsed.accessToken,
        });
      } catch (error) {
        console.error('Failed to parse auth data from cookie');
        Cookies.remove(AUTH_COOKIE_KEY);
      }
    }
  }, []);

  const login = (response: AuthResponse) => {
    setAuthState({
      isAuthenticated: true,
      user: response.user,
      accessToken: response.accessToken,
    });
    
    // Save to cookie
    Cookies.set(AUTH_COOKIE_KEY, JSON.stringify({
      user: response.user,
      accessToken: response.accessToken,
    }), { expires: 7 }); // Expires in 7 days
  };

  const logout = () => {
    setAuthState({
      isAuthenticated: false,
      user: null,
      accessToken: null,
    });
    Cookies.remove(AUTH_COOKIE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
