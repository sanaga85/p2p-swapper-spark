import React, { useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { FadeIn } from '@/components/ui/motion';
import { HeroSection } from '@/components/home/HeroSection';
import { StatsSection } from '@/components/home/StatsSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { BenefitsSection } from '@/components/home/BenefitsSection';
import { TestimonialsSection } from '@/components/home/TestimonialsSection';
import { CTASection } from '@/components/home/CTASection';
import { useQuery } from '@tanstack/react-query';
import { statsApi } from '@/services/api';
import { Helmet } from 'react-helmet-async'; // For SEO
import { useToast } from '@/components/ui/use-toast';

// Interface for stats data
interface PlatformStats {
  totalUsers: number;
  totalDeliveries: number;
  totalCountries: number;
  totalSavings: number;
}

const HomePage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();

  // Fetch platform stats using React Query
  const { data: stats, error } = useQuery<PlatformStats, Error>({
    queryKey: ['platformStats'],
    queryFn: async () => {
      const response = await statsApi.getPlatformStats();
      return response;
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
    retry: 2, // Retry failed requests twice
  });

  // Handle errors
  useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load platform stats. Some data may not be displayed.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Memoize personalized content
  const personalizedMessage = useMemo(() => {
    if (!isAuthenticated || !user) {
      return 'Join our community to start shopping or delivering globally!';
    }
    return `Welcome back, ${user.full_name || user.email}! Ready to shop or deliver?`;
  }, [isAuthenticated, user]);

  return (
    <div className="flex flex-col min-h-screen pt-20">
      {/* SEO Optimization */}
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
      </Helmet>

      <FadeIn>
        <HeroSection
          isAuthenticated={isAuthenticated}
          personalizedMessage={personalizedMessage}
        />
      </FadeIn>

      <FadeIn>
        <StatsSection stats={stats} />
      </FadeIn>

      <FadeIn>
        <HowItWorksSection />
      </FadeIn>

      <FadeIn>
        <BenefitsSection />
      </FadeIn>

      <FadeIn>
        <TestimonialsSection />
      </FadeIn>

      <FadeIn>
        <CTASection isAuthenticated={isAuthenticated} />
      </FadeIn>
    </div>
  );
};

export default HomePage;