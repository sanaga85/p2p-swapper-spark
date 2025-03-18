
import React from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import NavItems from './NavItems';

interface MobileMenuProps {
  isOpen: boolean;
  isAuthenticated: boolean;
}

const MobileMenu: React.FC<MobileMenuProps> = ({ isOpen, isAuthenticated }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.3 }}
          className="md:hidden bg-background border-t"
        >
          <div className="px-4 py-3 space-y-1">
            <NavItems isAuthenticated={isAuthenticated} isMobile={true} />

            {!isAuthenticated && (
              <div className="pt-2 pb-3 border-t border-border mt-2">
                <Link
                  to="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium"
                >
                  Log in
                </Link>
                <Link
                  to="/signup"
                  className="block px-3 py-2 rounded-md text-base font-medium bg-primary text-white mt-2 text-center"
                >
                  Sign up
                </Link>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MobileMenu;
