// src/components/home/CTASection.tsx
import React from 'react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface CTASectionProps {
  isAuthenticated: boolean;
}

export const CTASection: React.FC<CTASectionProps> = ({ isAuthenticated }) => {
  return (
    <section className="py-16 bg-primary text-white text-center">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold mb-4">
          {isAuthenticated ? 'Start Your Next Journey' : 'Ready to Get Started?'}
        </h2>
        <p className="text-lg mb-6">
          {isAuthenticated
            ? 'Post your travel plans or request an item today!'
            : 'Join thousands of users shopping and delivering globally.'}
        </p>
        <Button asChild size="lg" variant="secondary">
          {isAuthenticated ? (
            <Link to="/my-travels/new">Post a Travel</Link>
          ) : (
            <Link to="/signup">Sign Up Now</Link>
          )}
        </Button>
      </div>
    </section>
  );
};