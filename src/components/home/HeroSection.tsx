
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SlideIn } from '@/components/ui/motion';

interface HeroSectionProps {
  isAuthenticated: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isAuthenticated }) => {
  return (
    <section className="relative py-20 md:py-28 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-secondary/50 to-background -z-10"></div>
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <SlideIn>
            <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              Global Peer-to-Peer Delivery
            </span>
          </SlideIn>
          
          <SlideIn delay={0.1}>
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
              Shop Globally, Delivered Personally
            </h1>
          </SlideIn>
          
          <SlideIn delay={0.2}>
            <p className="text-lg md:text-xl text-muted-foreground mb-8">
              Connect with travelers heading your way and get items you can't find locally. 
              Or earn extra as a traveler by delivering items along your route.
            </p>
          </SlideIn>
          
          <SlideIn delay={0.3}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-base group">
                <Link to={isAuthenticated ? "/browse-requests" : "/signup"}>
                  {isAuthenticated ? "Browse Requests" : "Get Started"}
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-base">
                <Link to="/how-it-works">
                  How It Works
                </Link>
              </Button>
            </div>
          </SlideIn>
        </div>
      </div>
    </section>
  );
};
