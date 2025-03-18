
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Menu, X, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { notificationsApi } from '@/services/api';
import NotificationsMenu from './navbar/NotificationsMenu';
import UserProfileMenu from './navbar/UserProfileMenu';
import NavItems from './navbar/NavItems';
import MobileMenu from './navbar/MobileMenu';

const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [scrolled, setScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch notifications
  useEffect(() => {
    if (isAuthenticated && user) {
      const fetchNotifications = async () => {
        try {
          const response = await notificationsApi.getByUserId(user.id);
          if (response && Array.isArray(response)) {
            setNotifications(response);
          }
        } catch (error) {
          console.error('Failed to fetch notifications', error);
        }
      };

      fetchNotifications();
    }
  }, [isAuthenticated, user]);

  // Handle mobile menu toggle
  const toggleMobileMenu = () => {
    setMobileMenuOpen(prev => !prev);
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled ? "bg-white/80 backdrop-blur-md shadow-sm" : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="bg-primary text-white p-2 rounded-md">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <span className="font-bold text-xl">Sparrow</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          <NavItems isAuthenticated={isAuthenticated} />
        </nav>

        {/* Right side - auth or profile */}
        <div className="flex items-center gap-2">
          {isAuthenticated ? (
            <>
              {/* Notifications */}
              <NotificationsMenu notifications={notifications} />

              {/* User profile */}
              <UserProfileMenu user={user} logout={logout} />
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost">
                <Link to="/login">Log in</Link>
              </Button>
              <Button asChild>
                <Link to="/signup">Sign up</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu button */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleMobileMenu}
            className="md:hidden"
          >
            {mobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <MobileMenu isOpen={mobileMenuOpen} isAuthenticated={isAuthenticated} />
    </header>
  );
};

export default Navbar;
