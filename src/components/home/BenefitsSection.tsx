
import React from 'react';
import { ShoppingBag, Plane, CreditCard, Shield } from 'lucide-react';
import { FadeIn, StaggerContainer } from '@/components/ui/motion';

// Sample benefits
const benefits = [
  {
    icon: <ShoppingBag className="h-6 w-6 text-primary" />,
    title: 'Get Hard-to-Find Items',
    description: 'Access products that are unavailable or overpriced in your country.',
  },
  {
    icon: <Plane className="h-6 w-6 text-primary" />,
    title: 'Travel & Earn',
    description: 'Make extra money by delivering items during your travels.',
  },
  {
    icon: <CreditCard className="h-6 w-6 text-primary" />,
    title: 'Secure Payments',
    description: 'Your money is protected with our secure escrow system.',
  },
  {
    icon: <Shield className="h-6 w-6 text-primary" />,
    title: 'Safe & Trusted',
    description: 'Verified users and reviews ensure trust in every transaction.',
  },
];

export const BenefitsSection: React.FC = () => {
  return (
    <section className="py-20 bg-secondary/50">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose Sparrow</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We're revolutionizing the way people shop globally and travel with purpose.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <StaggerContainer>
            {benefits.map((benefit, index) => (
              <FadeIn key={index} delay={index * 0.1} className="flex flex-col items-center text-center p-6">
                <div className="mb-4 p-3 bg-white rounded-full shadow-sm border border-border/50">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                <p className="text-muted-foreground">{benefit.description}</p>
              </FadeIn>
            ))}
          </StaggerContainer>
        </div>
      </div>
    </section>
  );
};
