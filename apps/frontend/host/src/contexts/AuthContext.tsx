import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  user: { id: string; name: string; roles: string[] } | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<{ id: string; name: string; roles: string[] } | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('auth_token'));

  useEffect(() => {
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.sub || payload.username || 'user',
          name: payload.name || payload.sub || 'User',
          roles: payload.roles || ['user']
        });
      } catch {
        localStorage.removeItem('auth_token');
        setToken(null);
      }
    }
  }, [token]);

  const login = async (username: string, password: string) => {
    const response = await fetch(`${process.env.NX_API_URL || 'http://localhost:8000'}/auth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}&grant_type=password`
    });
    if (!response.ok) throw new Error('Login failed');
    const data = await response.json();
    setToken(data.access_token);
    localStorage.setItem('auth_token', data.access_token);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('auth_token');
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
