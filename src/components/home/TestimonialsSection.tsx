
import React from 'react';
import { FadeIn } from '@/components/ui/motion';

// Sample testimonials
const testimonials = [
  {
    quote: "I finally got the limited edition sneakers that weren't available in my country. My traveler was professional and the delivery was smooth!",
    author: "Sarah T.",
    location: "London, UK"
  },
  {
    quote: "As a frequent flyer, I've made over $2,000 just by delivering items during my regular business trips. It's a no-brainer!",
    author: "Michael K.",
    location: "Singapore"
  },
  {
    quote: "I needed a specific medication that was much cheaper abroad. Sparrow connected me with a traveler who brought it to me, saving me hundreds of dollars.",
    author: "Elena R.",
    location: "Toronto, Canada"
  },
];

export const TestimonialsSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <FadeIn>
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Users Say</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Read about the experiences of shoppers and travelers on our platform.
            </p>
          </div>
        </FadeIn>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <FadeIn key={index} delay={index * 0.1}>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50">
                <div className="mb-4 text-primary">
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className="text-lg">★</span>
                  ))}
                </div>
                <p className="mb-4 italic">"{testimonial.quote}"</p>
                <div className="flex flex-col">
                  <span className="font-semibold">{testimonial.author}</span>
                  <span className="text-sm text-muted-foreground">{testimonial.location}</span>
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
};
