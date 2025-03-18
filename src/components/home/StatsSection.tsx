
import React from 'react';
import { FadeIn } from '@/components/ui/motion';

// Sample stats
const stats = [
  { value: '100,000+', label: 'Users' },
  { value: '150+', label: 'Countries' },
  { value: '500,000+', label: 'Successful Deliveries' },
  { value: '$25M+', label: 'Saved on Shipping' },
];

export const StatsSection: React.FC = () => {
  return (
    <section className="py-12 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((stat, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <div className="text-center">
                <p className="text-3xl md:text-4xl font-bold text-primary">{stat.value}</p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
