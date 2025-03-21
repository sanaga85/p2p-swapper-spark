// src/components/home/TestimonialsSection.tsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { reviewsApi } from '@/services/api';
import { Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

interface Testimonial {
  id: string;
  user_name: string;
  user_avatar?: string;
  rating: number;
  comment: string;
  created_at: string;
}

export const TestimonialsSection: React.FC = () => {
  const { toast } = useToast();

  const { data: testimonials, isLoading, error } = useQuery<Testimonial[]>({
    queryKey: ['testimonials'],
    queryFn: async () => {
      const response = await reviewsApi.getRecentReviews(3); // Fetch 3 recent reviews
      return response.reviews || [];
    },
    staleTime: 10 * 60 * 1000, // Cache for 10 minutes
  });

  if (isLoading) {
    return (
      <section className="py-16">
        <div className="container mx-auto px-4 flex justify-center">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
        </div>
      </section>
    );
  }

  if (error) {
    toast({
      title: 'Error',
      description: 'Failed to load testimonials.',
      variant: 'destructive',
    });
    return null;
  }

  if (!testimonials || testimonials.length === 0) {
    return null;
  }

  return (
    <section className="py-16 bg-gray-100">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-12">What Our Users Say</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <img
                  src={testimonial.user_avatar || '/default-avatar.png'}
                  alt={testimonial.user_name}
                  className="h-12 w-12 rounded-full mr-4"
                  loading="lazy"
                />
                <div>
                  <h3 className="text-lg font-semibold">{testimonial.user_name}</h3>
                  <div className="flex">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400">★</span>
                    ))}
                  </div>
                </div>
              </div>
              <p className="text-muted-foreground line-clamp-3">{testimonial.comment}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};