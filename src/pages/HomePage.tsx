
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag, Plane, CreditCard, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { FadeIn, SlideIn, StaggerContainer } from '@/components/ui/motion';
import { useAuth } from '@/contexts/AuthContext';

const HomePage: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // Sample stats
  const stats = [
    { value: '100,000+', label: 'Users' },
    { value: '150+', label: 'Countries' },
    { value: '500,000+', label: 'Successful Deliveries' },
    { value: '$25M+', label: 'Saved on Shipping' },
  ];

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

  return (
    <div className="flex flex-col min-h-screen pt-20">
      {/* Hero Section */}
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

      {/* Stats Section */}
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

      {/* How It Works Section */}
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
            <FadeIn delay={0.1}>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">1</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Post a Request</h3>
                <p className="text-muted-foreground">
                  Describe what you need, where it's from, and how much you're willing to reward the traveler.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">2</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Match with a Traveler</h3>
                <p className="text-muted-foreground">
                  Get connected with a verified traveler who's already planning to visit your city.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.3}>
              <div className="bg-white rounded-xl p-6 shadow-sm border border-border/50 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <span className="text-primary font-bold">3</span>
                </div>
                <h3 className="text-xl font-semibold mb-3">Receive & Pay</h3>
                <p className="text-muted-foreground">
                  Meet, verify your item, and release the payment. Both parties rate the experience.
                </p>
              </div>
            </FadeIn>
          </div>

          <div className="text-center mt-12">
            <Button asChild variant="outline">
              <Link to="/how-it-works">Learn More</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
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

      {/* Testimonials */}
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

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <SlideIn>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
          </SlideIn>
          <SlideIn delay={0.1}>
            <p className="max-w-2xl mx-auto mb-8 text-primary-foreground/80">
              Join thousands of people already using Sparrow to shop globally or earn while traveling.
            </p>
          </SlideIn>
          <SlideIn delay={0.2}>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                asChild 
                size="lg" 
                variant="secondary" 
                className="text-base bg-white text-primary hover:bg-white/90"
              >
                <Link to={isAuthenticated ? "/my-requests/new" : "/signup"}>
                  {isAuthenticated ? "Post a Request" : "Sign Up Now"}
                </Link>
              </Button>
              {isAuthenticated ? (
                <Button asChild variant="outline" size="lg" className="text-base border-white text-white hover:bg-white/10">
                  <Link to="/my-travels/new">Post a Travel</Link>
                </Button>
              ) : (
                <Button asChild variant="outline" size="lg" className="text-base border-white text-white hover:bg-white/10">
                  <Link to="/login">Log In</Link>
                </Button>
              )}
            </div>
          </SlideIn>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
