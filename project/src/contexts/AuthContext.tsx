import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  phone?: string;
  tier: 'Bronze' | 'Silver' | 'Gold';
  points_balance: number;
  points_earned_last_12_months: number;
  total_spend: number;
  userType: 'customer' | 'admin';
  preferences?: string[];
  birthday?: string;
  created_at: string;
  last_activity: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, userType?: 'customer' | 'admin') => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for stored user data on app load
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string, userType: 'customer' | 'admin' = 'customer'): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call - replace with actual backend integration
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock user data based on userType
      const mockUser: User = userType === 'admin' ? {
        id: 'admin-1',
        email: email,
        tier: 'Gold',
        points_balance: 0,
        points_earned_last_12_months: 0,
        total_spend: 0,
        userType: 'admin',
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      } : {
        id: 'customer-1',
        email: email,
        phone: '+1234567890',
        tier: 'Silver',
        points_balance: 1250,
        points_earned_last_12_months: 3500,
        total_spend: 2500,
        userType: 'customer',
        preferences: ['electronics', 'apparel'],
        birthday: '1990-01-15',
        created_at: '2023-01-15T00:00:00Z',
        last_activity: new Date().toISOString()
      };

      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    setIsLoading(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newUser: User = {
        id: `customer-${Date.now()}`,
        email: userData.email,
        phone: userData.phone,
        tier: 'Bronze',
        points_balance: 100, // Welcome bonus
        points_earned_last_12_months: 100,
        total_spend: 0,
        userType: 'customer',
        preferences: userData.preferences || [],
        birthday: userData.birthday,
        created_at: new Date().toISOString(),
        last_activity: new Date().toISOString()
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const value = {
    user,
    login,
    signup,
    logout,
    updateUser,
    isLoading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};