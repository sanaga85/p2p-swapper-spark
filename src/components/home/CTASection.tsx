
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { SlideIn } from '@/components/ui/motion';

interface CTASectionProps {
  isAuthenticated: boolean;
}

export const CTASection: React.FC<CTASectionProps> = ({ isAuthenticated }) => {
  return (
    <section className="py-20 bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 text-center">
        <SlideIn>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
        </SlideIn>
        <SlideIn delay={0.1}>
          <p className="max-w-2xl mx-auto mb-8 text-primary-foreground/80">
            Join thousands of people already using Sparrow to shop globally or earn while traveling.
          </p>
        </SlideIn>
        <SlideIn delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              asChild 
              size="lg" 
              variant="secondary" 
              className="text-base bg-white text-primary hover:bg-white/90"
            >
              <Link to={isAuthenticated ? "/my-requests/new" : "/signup"}>
                {isAuthenticated ? "Post a Request" : "Sign Up Now"}
              </Link>
            </Button>
            {isAuthenticated ? (
              <Button asChild variant="outline" size="lg" className="text-base border-white text-white hover:bg-white/10">
                <Link to="/my-travels/new">Post a Travel</Link>
              </Button>
            ) : (
              <Button asChild variant="outline" size="lg" className="text-base border-white text-white hover:bg-white/10">
                <Link to="/login">Log In</Link>
              </Button>
            )}
          </div>
        </SlideIn>
      </div>
    </section>
  );
};
