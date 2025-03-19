import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { travelItinerariesApi, TravelItinerary } from '@/services/api';
import { FadeIn } from '@/components/ui/motion';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const CreateTravelPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    from_location: '',
    to_location: '',
    departure_date: null as Date | null,
    arrival_date: null as Date | null,
    available_space: '',
    preferred_items: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user types
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };
  
  const handleDepartureDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, departure_date: date }));
      // Clear error
      if (errors.departure_date) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.departure_date;
          return newErrors;
        });
      }
    }
  };
  
  const handleArrivalDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, arrival_date: date }));
      // Clear error
      if (errors.arrival_date) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.arrival_date;
          return newErrors;
        });
      }
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.from_location.trim()) {
      newErrors.from_location = 'From location is required';
    }
    
    if (!formData.to_location.trim()) {
      newErrors.to_location = 'To location is required';
    }
    
    if (!formData.departure_date) {
      newErrors.departure_date = 'Departure date is required';
    }
    
    if (!formData.arrival_date) {
      newErrors.arrival_date = 'Arrival date is required';
    } else if (formData.departure_date && formData.arrival_date < formData.departure_date) {
      newErrors.arrival_date = 'Arrival date must be after departure date';
    }
    
    if (formData.available_space && isNaN(Number(formData.available_space))) {
      newErrors.available_space = 'Available space must be a number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;
    
    try {
      setIsLoading(true);
      
      const itineraryData: Partial<TravelItinerary> = {
        traveler_id: user.id,
        from_location: formData.from_location,
        to_location: formData.to_location,
        departure_date: formData.departure_date?.toISOString() || new Date().toISOString(),
        arrival_date: formData.arrival_date?.toISOString() || new Date().toISOString(),
        available_space: formData.available_space ? Number(formData.available_space) : undefined,
        preferred_items: formData.preferred_items || undefined,
        available: true,
      };
      
      await travelItinerariesApi.create(itineraryData as any);
      
      toast({
        title: "Travel Posted",
        description: "Your travel itinerary has been successfully posted.",
      });
      
      navigate('/my-travels');
    } catch (error) {
      console.error('Error creating travel itinerary:', error);
      toast({
        title: "Error",
        description: "Failed to post travel itinerary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-24">
      <FadeIn>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Post Your Travel Plans</h1>
            <p className="text-muted-foreground">
              Let others know about your travel plans and earn by delivering items
            </p>
          </div>
          
          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <CardTitle>Travel Details</CardTitle>
              <CardDescription>
                Provide information about your upcoming travel
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="from_location">From Location *</Label>
                        <Input
                          id="from_location"
                          name="from_location"
                          placeholder="e.g., New York, USA"
                          value={formData.from_location}
                          onChange={handleChange}
                          className={errors.from_location ? 'border-red-500' : ''}
                        />
                        {errors.from_location && (
                          <p className="text-red-500 text-xs mt-1">{errors.from_location}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="to_location">To Location *</Label>
                        <Input
                          id="to_location"
                          name="to_location"
                          placeholder="e.g., London, UK"
                          value={formData.to_location}
                          onChange={handleChange}
                          className={errors.to_location ? 'border-red-500' : ''}
                        />
                        {errors.to_location && (
                          <p className="text-red-500 text-xs mt-1">{errors.to_location}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="departure_date">Departure Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.departure_date && "text-muted-foreground",
                                errors.departure_date ? 'border-red-500' : ''
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.departure_date ? (
                                format(formData.departure_date, "PPP")
                              ) : (
                                <span>Select date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.departure_date || undefined}
                              onSelect={handleDepartureDateChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.departure_date && (
                          <p className="text-red-500 text-xs mt-1">{errors.departure_date}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="arrival_date">Arrival Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.arrival_date && "text-muted-foreground",
                                errors.arrival_date ? 'border-red-500' : ''
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.arrival_date ? (
                                format(formData.arrival_date, "PPP")
                              ) : (
                                <span>Select date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.arrival_date || undefined}
                              onSelect={handleArrivalDateChange}
                              disabled={(date) => 
                                date < new Date() || 
                                (formData.departure_date ? date < formData.departure_date : false)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.arrival_date && (
                          <p className="text-red-500 text-xs mt-1">{errors.arrival_date}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="available_space">Available Carrying Space (in cubic inches - optional)</Label>
                      <Input
                        id="available_space"
                        name="available_space"
                        type="number"
                        placeholder="e.g., 100"
                        value={formData.available_space}
                        onChange={handleChange}
                        className={errors.available_space ? 'border-red-500' : ''}
                      />
                      {errors.available_space && (
                        <p className="text-red-500 text-xs mt-1">{errors.available_space}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="preferred_items">Preferred Items (optional)</Label>
                      <Textarea
                        id="preferred_items"
                        name="preferred_items"
                        placeholder="E.g., small electronics, clothing, books, etc."
                        value={formData.preferred_items}
                        onChange={handleChange}
                        className="min-h-32 resize-none"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/my-travels')}
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Posting...
                      </>
                    ) : (
                      'Post Travel'
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </FadeIn>
    </div>
  );
};

export default CreateTravelPage;
