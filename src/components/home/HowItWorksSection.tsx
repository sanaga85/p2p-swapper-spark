
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { FadeIn } from '@/components/ui/motion';

export const HowItWorksSection: React.FC = () => {
  const steps = [
    {
      step: 1,
      title: "Post a Request",
      description: "Describe what you need, where it's from, and how much you're willing to reward the traveler."
    },
    {
      step: 2,
      title: "Match with a Traveler",
      description: "Get connected with a verified traveler who's already planning to visit your city."
    },
    {
      step: 3,
      title: "Receive & Pay",
      description: "Meet, verify your item, and release the payment. Both parties rate the experience."
    }
  ];

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform connects people who need items from abroad with travelers who can bring them.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">{step.step}</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>

        <div className="text-center mt-12">
          <Button asChild variant="outline">
            <Link to="/how-it-works">Learn More</Link>
          </Button>
        </div>
      </div>
    </section>
  );
};
