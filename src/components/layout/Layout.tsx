
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import Navbar from './Navbar';
import Footer from './Footer';
import { Loader2 } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  requireAuth?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ children, requireAuth = false }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Handle redirects if authentication is required but user is not authenticated
    if (!isLoading && requireAuth && !isAuthenticated) {
      navigate('/login', { state: { from: location.pathname } });
      return;
    }

    // Simulate page loading for smooth transitions
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, requireAuth, navigate, location]);

  // Show loading state when checking authentication
  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-10 w-10 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-1 w-full page-transition">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
