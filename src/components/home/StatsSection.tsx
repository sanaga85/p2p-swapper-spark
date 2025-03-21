// src/components/home/StatsSection.tsx
import React from 'react';
import { Loader2 } from 'lucide-react';

interface StatsSectionProps {
  stats?: {
    totalUsers: number;
    totalDeliveries: number;
    totalCountries: number;
    totalSavings: number;
  };
}

export const StatsSection: React.FC<StatsSectionProps> = ({ stats }) => {
  if (!stats) {
    return (
      <section className="py-16 bg-gray-100">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
          <div>
            <h3 className="text-3xl font-bold text-primary">{stats.totalUsers.toLocaleString()}</h3>
            <p className="text-muted-foreground">Happy Users</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary">{stats.totalDeliveries.toLocaleString()}</h3>
            <p className="text-muted-foreground">Deliveries Made</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary">{stats.totalCountries}</h3>
            <p className="text-muted-foreground">Countries Covered</p>
          </div>
          <div>
            <h3 className="text-3xl font-bold text-primary">${stats.totalSavings.toLocaleString()}</h3>
            <p className="text-muted-foreground">Saved by Users</p>
          </div>
        </div>
      </div>
    </section>
  );
};