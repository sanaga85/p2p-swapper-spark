
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
      
      if (response && response.token && response.user_id) {
        localStorage.setItem('token', response.token);
        console.log("Token saved to localStorage");
        
        // Fetch user profile after successful login
        console.log("Fetching user profile for ID:", response.user_id);
        try {
          const userProfile = await authApi.getUserProfile(response.user_id);
          console.log("User profile:", userProfile);
          
          localStorage.setItem('user', JSON.stringify(userProfile));
          setUser(userProfile);
          
          toast({
            title: 'Success',
            description: 'You have successfully logged in.',
          });
        } catch (profileError) {
          console.error("Error fetching user profile:", profileError);
          // Still consider login successful even if profile fetch fails
          toast({
            title: 'Partial Success',
            description: 'Logged in but could not fetch your profile.',
          });
        }
      } else {
        console.error("Login response invalid:", response);
        throw new Error("Invalid login response from server");
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: error instanceof Error ? error.message : 'Please check your credentials and try again.',
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
      
      // Test the API URL before making the request
      console.log("API URL being used:", import.meta.env.VITE_API_URL);
      
      const response = await authApi.signup(signupData);
      console.log("Signup response received:", response);
      
      if (response && response.user_id) {
        console.log("Signup successful with user_id:", response.user_id);
        
        // After successful signup, login the user
        console.log("Proceeding to login with:", email, password);
        try {
          await login(email, password);
          console.log("Login after signup successful");
          
          toast({
            title: 'Account Created',
            description: 'Your account has been successfully created.',
          });
        } catch (loginError) {
          console.error("Error logging in after signup:", loginError);
          // Still consider signup successful even if auto-login fails
          toast({
            title: 'Account Created',
            description: 'Your account was created but we could not log you in automatically. Please try logging in.',
          });
        }
      } else {
        console.error("Signup response missing user_id:", response);
        throw new Error("Invalid signup response from server");
      }
    } catch (error: any) {
      console.error('Signup error details:', error);
      let errorMessage = 'There was an error creating your account. Please try again.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      toast({
        title: 'Signup Failed',
        description: errorMessage,
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
      console.log("Initiating Google auth");
      const response = await authApi.googleAuth();
      console.log("Google auth response:", response);
      
      if (response && response.url) {
        console.log("Redirecting to Google auth URL:", response.url);
        window.location.href = response.url;
      } else {
        console.error("Invalid Google auth response:", response);
        throw new Error("Failed to get Google authentication URL");
      }
    } catch (error) {
      console.error('Google auth error:', error);
      toast({
        title: 'Authentication Failed',
        description: 'Google authentication failed. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const facebookAuth = async () => {
    try {
      console.log("Initiating Facebook auth");
      const response = await authApi.facebookAuth();
      console.log("Facebook auth response:", response);
      
      if (response && response.url) {
        console.log("Redirecting to Facebook auth URL:", response.url);
        window.location.href = response.url;
      } else {
        console.error("Invalid Facebook auth response:", response);
        throw new Error("Failed to get Facebook authentication URL");
      }
    } catch (error) {
      console.error('Facebook auth error:', error);
      toast({
        title: 'Authentication Failed',
        description: 'Facebook authentication failed. Please try again.',
        variant: 'destructive',
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
