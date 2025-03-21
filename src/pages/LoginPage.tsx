import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { FadeIn } from '@/components/ui/motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useAuth } from '@/contexts/AuthContext';
import { Facebook, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async'; // For SEO

const LoginPage: React.FC = () => {
  const { login, googleAuth, facebookAuth, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  // Get the redirect path from location state, or default to '/'
  const from = (location.state as any)?.from || '/';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: localStorage.getItem('rememberMe') === 'true',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Sanitize input to prevent XSS
    const sanitizedValue = value.replace(/[<>{}]/g, '');
    setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleCheckboxChange = useCallback((checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
  }, []);

  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    } else if (formData.email.length > 255) {
      newErrors.email = 'Email cannot exceed 255 characters';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters long';
    } else if (formData.password.length > 128) {
      newErrors.password = 'Password cannot exceed 128 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) return;

      try {
        setIsLoading(true);
        await login(formData.email, formData.password);

        // Handle "Remember Me" functionality
        if (formData.rememberMe) {
          localStorage.setItem('rememberMe', 'true');
        } else {
          localStorage.removeItem('rememberMe');
        }

        toast({
          title: 'Success',
          description: 'You have successfully logged in.',
        });

        navigate(from, { replace: true });
      } catch (error: any) {
        const errorMessage =
          error.message || 'Failed to log in. Please check your credentials and try again.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    },
    [formData, validateForm, login, navigate, from, toast]
  );

  const handleGoogleAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      await googleAuth();
      // Navigation is handled by the redirect from the backend
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to authenticate with Google.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [googleAuth, toast]);

  const handleFacebookAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      await facebookAuth();
      // Navigation is handled by the redirect from the backend
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to authenticate with Facebook.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [facebookAuth, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 pt-20">
      {/* SEO Optimization */}
      <Helmet>
        <title>Login - Grabr.io</title>
        <meta
          name="description"
          content="Log in to Grabr.io to connect with travelers, shop globally, or earn money by delivering items."
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.grabr.io/login" />
      </Helmet>

      <FadeIn className="w-full max-w-md">
        <Card className="w-full shadow-lg border-border/50 overflow-hidden glass-card">
          <CardHeader className="space-y-1 text-center">
            <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleAuth}
                disabled={isLoading}
              >
                <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Google
              </Button>

              <Button
                variant="outline"
                className="w-full"
                onClick={handleFacebookAuth}
                disabled={isLoading}
              >
                <Facebook className="mr-2 h-4 w-4 text-blue-600" />
                Facebook
              </Button>
            </div>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  className={errors.email ? 'border-red-500' : ''}
                  autoComplete="email"
                  maxLength={255}
                  disabled={isLoading}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.email}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-primary hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? 'border-red-500' : ''}
                  autoComplete="current-password"
                  maxLength={128}
                  disabled={isLoading}
                />
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    {errors.password}
                  </p>
                )}
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="rememberMe"
                  checked={formData.rememberMe}
                  onCheckedChange={handleCheckboxChange}
                  disabled={isLoading}
                />
                <Label htmlFor="rememberMe" className="text-sm font-normal">
                  Remember me for 30 days
                </Label>
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Logging in...
                  </>
                ) : (
                  'Log In'
                )}
              </Button>
            </form>
          </CardContent>

          <CardFooter>
            <div className="text-center w-full text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-primary hover:underline">
                Sign up
              </Link>
            </div>
          </CardFooter>
        </Card>
      </FadeIn>
    </div>
  );
};

export default LoginPage;