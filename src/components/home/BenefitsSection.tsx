// src/components/home/BenefitsSection.tsx
import React from 'react';
import { Globe, Shield, Wallet } from 'lucide-react';

export const BenefitsSection: React.FC = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">Why Choose Us?</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <Globe className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Global Access</h3>
            <p className="text-muted-foreground">
              Shop unique products from anywhere in the world.
            </p>
          </div>
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Safe & Secure</h3>
            <p className="text-muted-foreground">
              KYC-verified travelers and secure payments with escrow.
            </p>
          </div>
          <div className="text-center">
            <Wallet className="h-12 w-12 mx-auto text-primary mb-4" />
            <h3 className="text-xl font-semibold mb-2">Save Money</h3>
            <p className="text-muted-foreground">
              Avoid high shipping costs and import fees.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};