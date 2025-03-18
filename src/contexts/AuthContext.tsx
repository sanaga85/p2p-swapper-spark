
import React, { createContext, useState, useContext, useEffect } from 'react';
import { User, authApi, SignupRequest, LoginRequest } from '@/services/api';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  googleAuth: () => Promise<void>;
  facebookAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is logged in on mount
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        setUser(JSON.parse(userData));
      } catch (error) {
        console.error('Failed to parse user data', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const loginData: LoginRequest = { email, password };
      const response = await authApi.login(loginData);
      
      if (response.token && response.message) {
        localStorage.setItem('token', response.token);
        
        // Fetch user profile after successful login
        if (response.user_id) {
          const userProfile = await authApi.getUserProfile(response.user_id);
          localStorage.setItem('user', JSON.stringify(userProfile));
          setUser(userProfile);
        }
        
        toast({
          title: 'Success',
          description: 'You have successfully logged in.',
        });
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const signupData: SignupRequest = { full_name: fullName, email, password };
      const response = await authApi.signup(signupData);
      
      if (response.user_id) {
        // After successful signup, login the user
        await login(email, password);
        
        toast({
          title: 'Account Created',
          description: 'Your account has been successfully created.',
        });
      }
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup Failed',
        description: 'There was an error creating your account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    
    toast({
      title: 'Logged Out',
      description: 'You have been successfully logged out.',
    });
  };

  const googleAuth = async () => {
    try {
      const response = await authApi.googleAuth();
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Google auth error:', error);
      toast({
        title: 'Authentication Failed',
        description: 'Google authentication failed. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const facebookAuth = async () => {
    try {
      const response = await authApi.facebookAuth();
      if (response.url) {
        window.location.href = response.url;
      }
    } catch (error) {
      console.error('Facebook auth error:', error);
      toast({
        title: 'Authentication Failed',
        description: 'Facebook authentication failed. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const contextValue: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    signup,
    logout,
    googleAuth,
    facebookAuth,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
