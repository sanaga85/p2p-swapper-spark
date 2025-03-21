import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { User, authApi, SignupRequest, LoginRequest } from '@/services/api';
import { toast } from 'sonner'; // Use sonner directly
import { useNavigate } from 'react-router-dom';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string, rememberMe?: boolean) => Promise<void>;
  signup: (fullName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  googleAuth: () => Promise<void>;
  facebookAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const userData = localStorage.getItem('user');

      if (!userData) {
        setIsLoading(false);
        return;
      }

      try {
        const parsedUser = JSON.parse(userData);
        // Fetch user profile to verify the session (token is sent as HTTP-only cookie)
        const response = await authApi.getUserProfile(parsedUser.id);
        setUser(response);
        localStorage.setItem('user', JSON.stringify(response));
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        localStorage.removeItem('user');
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Handle OAuth callback
  useEffect(() => {
    const handleOAuthCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const success = urlParams.get('success'); // Appwrite may append ?success=true

      if (success === 'true') {
        try {
          // Since the token is an HTTP-only cookie, fetch the user profile directly
          const userData = localStorage.getItem('user');
          let userId: string | null = null;

          if (userData) {
            const parsedUser = JSON.parse(userData);
            userId = parsedUser.id;
          }

          if (!userId) {
            // If we don't have a user ID, we can't proceed
            throw new Error('User ID not found in localStorage');
          }

          const userProfile = await authApi.getUserProfile(userId);
          localStorage.setItem('user', JSON.stringify(userProfile));
          setUser(userProfile);
          toast({
            title: 'Success',
            description: 'Logged in successfully via OAuth.',
          });
          navigate('/'); // Redirect to home
        } catch (error) {
          console.error('OAuth callback error:', error);
          toast({
            title: 'Authentication Failed',
            description: 'Failed to authenticate via OAuth.',
            className: 'bg-destructive text-destructive-foreground',
          });
          localStorage.removeItem('user');
          setUser(null);
          navigate('/login');
        }
      }
    };

    handleOAuthCallback();
  }, [navigate]);

  const login = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      setIsLoading(true);
      const loginData: LoginRequest = { email, password, rememberMe };
      const response = await authApi.login(loginData);

      if (!response.user_id) {
        throw new Error('Invalid login response from server');
      }

      // Token is set as HTTP-only cookie by the backend, no need to store it
      const userProfile = await authApi.getUserProfile(response.user_id);
      localStorage.setItem('user', JSON.stringify(userProfile));
      setUser(userProfile);

      toast({
        title: 'Success',
        description: 'You have successfully logged in.',
      });
      navigate('/profile');
    } catch (error: any) {
      toast({
        title: 'Login Failed',
        description: error.message || 'Please check your credentials and try again.',
        className: 'bg-destructive text-destructive-foreground',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      const signupData: SignupRequest = { full_name: fullName, email, password };
      const response = await authApi.signup(signupData);

      if (!response.user_id) {
        throw new Error('Invalid signup response from server');
      }

      await login(email, password);
      toast({
        title: 'Account Created',
        description: 'Your account has been successfully created.',
      });
    } catch (error: any) {
      toast({
        title: 'Signup Failed',
        description: error.message || 'There was an error creating your account. Please try again.',
        className: 'bg-destructive text-destructive-foreground',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      localStorage.removeItem('user');
      setUser(null);
      // Clear the HTTP-only cookie by setting an expired cookie
      document.cookie = 'auth_token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/';
      toast({
        title: 'Logged Out',
        description: 'You have been successfully logged out.',
      });
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: 'Logout Failed',
        description: 'There was an error logging out. Please try again.',
        className: 'bg-destructive text-destructive-foreground',
      });
    }
  };

  const googleAuth = async () => {
    try {
      const response = await authApi.googleAuth();
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('Failed to get Google authentication URL');
      }
    } catch (error) {
      toast({
        title: 'Authentication Failed',
        description: 'Google authentication failed. Please try again.',
        className: 'bg-destructive text-destructive-foreground',
      });
      throw error;
    }
  };

  const facebookAuth = async () => {
    try {
      const response = await authApi.facebookAuth();
      if (response.url) {
        window.location.href = response.url;
      } else {
        throw new Error('Failed to get Facebook authentication URL');
      }
    } catch (error) {
      toast({
        title: 'Authentication Failed',
        description: 'Facebook authentication failed. Please try again.',
        className: 'bg-destructive text-destructive-foreground',
      });
      throw error;
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

  return <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};