
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
    
    console.log("AuthProvider mounted, checking localStorage for user data");
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        console.log("Found user data in localStorage:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Failed to parse user data', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    } else {
      console.log("No user data found in localStorage");
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting login with email:", email);
      
      const loginData: LoginRequest = { email, password };
      console.log("Login data being sent:", loginData);
      
      const response = await authApi.login(loginData);
      console.log("Login response:", response);
      
      if (response.token && response.user_id) {
        localStorage.setItem('token', response.token);
        console.log("Token saved to localStorage");
        
        // Fetch user profile after successful login
        console.log("Fetching user profile for ID:", response.user_id);
        const userProfile = await authApi.getUserProfile(response.user_id);
        console.log("User profile:", userProfile);
        
        localStorage.setItem('user', JSON.stringify(userProfile));
        setUser(userProfile);
        
        toast({
          title: 'Success',
          description: 'You have successfully logged in.',
        });
      } else {
        console.error("Login response missing token or user_id:", response);
        throw new Error("Invalid login response from server");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'Please check your credentials and try again.',
        variant: 'destructive',
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (fullName: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      console.log("Starting signup process with:", { fullName, email });
      
      const signupData: SignupRequest = { full_name: fullName, email, password };
      console.log("Sending signup request with data:", signupData);
      
      const response = await authApi.signup(signupData);
      console.log("Signup response:", response);
      
      if (response.user_id) {
        console.log("Signup successful, proceeding to login");
        // After successful signup, login the user
        await login(email, password);
        
        toast({
          title: 'Account Created',
          description: 'Your account has been successfully created.',
        });
      } else {
        console.error("Signup response missing user_id:", response);
        throw new Error("Invalid signup response from server");
      }
    } catch (error) {
      console.error('Signup error details:', error);
      toast({
        title: 'Signup Failed',
        description: 'There was an error creating your account. Please try again.',
        variant: 'destructive',
      });
      throw error;
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
