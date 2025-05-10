import { createContext, useCallback, useEffect, useState, ReactNode } from 'react';
import { jwtDecode } from 'jwt-decode';
import { loginUser, registerUser, fetchUserInfo } from '../services/authService';

interface User {
  id: string;
  email: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => void;
  error: string | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  loading: true,
  login: async () => {},
  signup: async () => {},
  logout: () => {},
  checkAuth: () => {},
  error: null
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const checkTokenExpiration = useCallback((token: string) => {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp && decoded.exp < currentTime) {
        // Token expired
        localStorage.removeItem('token');
        return false;
      }
      return true;
    } catch (err) {
      // Invalid token
      localStorage.removeItem('token');
      return false;
    }
  }, []);
  
  const checkAuth = useCallback(async () => {
    setLoading(true);
    const token = localStorage.getItem('token');
    
    if (token && checkTokenExpiration(token)) {
      try {
        const userInfo = await fetchUserInfo();
        setUser(userInfo);
        setLoading(false);
      } catch (err) {
        localStorage.removeItem('token');
        setUser(null);
        setLoading(false);
      }
    } else {
      setUser(null);
      setLoading(false);
    }
  }, [checkTokenExpiration]);
  
  useEffect(() => {
    checkAuth();
  }, [checkAuth]);
  
  const login = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const { token, user } = await loginUser(email, password);
      localStorage.setItem('token', token);
      setUser(user);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };
  
  const signup = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await registerUser(email, password);
      setUser(result.user);
      
      // Auto login after signup
      await login(email, password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
      setLoading(false);
    }
  };
  
  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };
  
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        loading,
        login,
        signup,
        logout,
        checkAuth,
        error
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};