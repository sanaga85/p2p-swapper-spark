import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import HomePage from './HomePage';
import { useQuery } from '@tanstack/react-query';
import { userApi } from '@/services/api';
import { Helmet } from 'react-helmet-async'; // For SEO
import { useToast } from '@/components/ui/use-toast';

const Index: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user, setUser } = useAuth();
  const { toast } = useToast();

  // Fetch user profile if authenticated to ensure user data is up-to-date
  const { data: userProfile, error } = useQuery({
    queryKey: ['userProfile', user?.user_id],
    queryFn: async () => {
      if (!user) throw new Error('User not authenticated');
      return await userApi.getUserProfile(user.user_id);
    },
    enabled: !!user && isAuthenticated,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: 1,
  });

  // Update user context with latest profile data
  useEffect(() => {
    if (userProfile) {
      setUser({
        user_id: userProfile.id,
        email: userProfile.email,
        full_name: userProfile.full_name,
      });
    }
  }, [userProfile, setUser]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load user profile. Some features may be limited.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Redirect only if the current path is not the root and not a valid subpath
  useEffect(() => {
    const validPaths = ['/', '/home', '/index'];
    if (!validPaths.includes(location.pathname.toLowerCase())) {
      navigate('/', { replace: true });
    }
  }, [location.pathname, navigate]);

  // Redirect authenticated users to a dashboard if needed (mimicking Grabr.io behavior)
  useEffect(() => {
    if (isAuthenticated && location.pathname === '/' && userProfile) {
      // Optionally redirect to a dashboard for authenticated users
      // Grabr.io often keeps users on the homepage but personalizes it
      // navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, location.pathname, userProfile, navigate]);

  return (
    <>
      {/* SEO Optimization for the root route */}
      <Helmet>
        <title>Grabr.io - Shop Globally, Deliver Locally</title>
        <meta
          name="description"
          content="Connect with travelers to shop globally or earn money by delivering items. Join Grabr.io to access unique products from around the world!"
        />
        <meta
          name="keywords"
          content="peer-to-peer delivery, global shopping, travel delivery, Grabr.io, international shopping"
        />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content="Grabr.io - Shop Globally, Deliver Locally" />
        <meta
          property="og:description"
          content="Connect with travelers to shop globally or earn money by delivering items. Join Grabr.io today!"
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://www.grabr.io/" />
        <meta property="og:image" content="https://www.grabr.io/og-image.jpg" />
        <link rel="canonical" href="https://www.grabr.io/" />
      </Helmet>

      <HomePage />
    </>
  );
};

export default Index;