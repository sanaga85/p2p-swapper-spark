// src/components/home/HowItWorksSection.tsx
import React from 'react';
import { Plane, Package, DollarSign } from 'lucide-react';

export const HowItWorksSection: React.FC = () => {
  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <Plane className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Post Your Travel</h3>
            <p className="text-muted-foreground">
              Share your travel plans and let shoppers know you’re available to deliver.
            </p>
          </div>
          <div className="text-center">
            <Package className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Request an Item</h3>
            <p className="text-muted-foreground">
              Find a traveler going your way and request the items you need.
            </p>
          </div>
          <div className="text-center">
            <DollarSign className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Earn or Save</h3>
            <p className="text-muted-foreground">
              Travelers earn money by delivering, while shoppers save on global products.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};