import React, { createContext, useContext, ReactNode } from 'react';

interface AuthContextType {
  user: { id: string; name: string; roles: string[] } | null;
  login: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const user = { id: 'user-123', name: 'John Doe', roles: ['user'] };

  const login = () => console.log('Login');
  const logout = () => console.log('Logout');

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
