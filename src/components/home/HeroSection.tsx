// src/components/home/HeroSection.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface HeroSectionProps {
  isAuthenticated: boolean;
  personalizedMessage: string;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  isAuthenticated,
  personalizedMessage,
}) => {
  return (
    <section className="relative bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-20">
      <div className="container mx-auto px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Shop Globally, Deliver Locally
        </h1>
        <p className="text-lg md:text-xl mb-6">
          {personalizedMessage}
        </p>
        <div className="flex justify-center space-x-4">
          {!isAuthenticated ? (
            <>
              <Button asChild size="lg">
                <Link to="/signup">Get Started</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/login">Log In</Link>
              </Button>
            </>
          ) : (
            <>
              <Button asChild size="lg">
                <Link to="/my-requests/new">Request an Item</Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link to="/my-travels/new">Post a Travel</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
};