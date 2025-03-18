
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingBag, Plane } from 'lucide-react';
import { cn } from '@/lib/utils';

// Define our navigation items type
export interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  requireAuth?: boolean;
}

// Export a constant with our navigation items to reuse
export const navigationItems: NavItem[] = [
  { label: 'Home', href: '/', icon: <Home className="h-4 w-4 mr-2" /> },
  { label: 'Browse Requests', href: '/browse-requests', icon: <Search className="h-4 w-4 mr-2" /> },
  { 
    label: 'My Requests', 
    href: '/my-requests', 
    icon: <ShoppingBag className="h-4 w-4 mr-2" />,
    requireAuth: true 
  },
  { 
    label: 'My Travels', 
    href: '/my-travels', 
    icon: <Plane className="h-4 w-4 mr-2" />,
    requireAuth: true 
  },
];

interface NavItemsProps {
  isAuthenticated: boolean;
  isMobile?: boolean;
}

const NavItems: React.FC<NavItemsProps> = ({ isAuthenticated, isMobile = false }) => {
  const location = useLocation();

  const visibleItems = navigationItems.filter(
    item => !item.requireAuth || isAuthenticated
  );

  return (
    <>
      {visibleItems.map((item) => (
        <Link 
          key={item.href} 
          to={item.href}
          className={cn(
            isMobile ? "block px-3 py-2 rounded-md text-base font-medium flex items-center" 
                     : "px-3 py-2 rounded-md text-sm font-medium flex items-center",
            location.pathname === item.href
              ? "bg-primary/10 text-primary"
              : isMobile 
                ? "hover:bg-secondary hover:text-foreground" 
                : "text-foreground/80 hover:bg-secondary hover:text-foreground",
            "transition-all duration-200"
          )}
        >
          {item.icon}
          {item.label}
        </Link>
      ))}
    </>
  );
};

export default NavItems;
