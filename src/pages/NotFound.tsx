import React, { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Helmet } from 'react-helmet-async'; // For SEO
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi } from '@/services/api'; // For tracking 404 errors

const NotFound: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();

  // Track the 404 error
  useEffect(() => {
    const track404Error = async () => {
      try {
        // Log the 404 error to the console for development
        console.error(
          '404 Error: User attempted to access non-existent route:',
          location.pathname
        );

        // Send the 404 error to the backend for analytics
        await analyticsApi.trackEvent({
          event_type: '404_error',
          user_id: isAuthenticated ? (localStorage.getItem('user_id') || null) : null,
          details: {
            path: location.pathname,
            timestamp: new Date().toISOString(),
          },
        });

        // Notify the user
        toast({
          title: 'Page Not Found',
          description: 'The page you are looking for does not exist. Let’s get you back on track!',
          variant: 'destructive',
        });
      } catch (error) {
        console.error('Failed to track 404 error:', error);
      }
    };

    track404Error();
  }, [location.pathname, isAuthenticated, toast]);

  // Handle navigation
  const handleGoHome = () => {
    navigate('/', { replace: true });
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      {/* SEO Optimization */}
      <Helmet>
        <title>404 - Page Not Found | Grabr.io</title>
        <meta
          name="description"
          content="The page you are looking for does not exist on Grabr.io. Return to the homepage or go back to continue your journey."
        />
        <meta name="robots" content="noindex, nofollow" />
        <link rel="canonical" href="https://www.grabr.io/404" />
      </Helmet>

      <div className="text-center max-w-md">
        <h1 className="text-6xl font-bold text-gray-800 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! The page you’re looking for doesn’t exist.</p>
        <p className="text-gray-500 mb-8">
          It looks like you’ve taken a wrong turn. Let’s get you back on track.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button onClick={handleGoHome} className="w-full sm:w-auto">
            Return to Home
          </Button>
          <Button onClick={handleGoBack} variant="outline" className="w-full sm:w-auto">
            Go Back
          </Button>
          {isAuthenticated ? (
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto"
            >
              <a href="/support">Contact Support</a>
            </Button>
          ) : (
            <Button
              asChild
              variant="outline"
              className="w-full sm:w-auto"
            >
              <a href="/login">Log In</a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotFound;