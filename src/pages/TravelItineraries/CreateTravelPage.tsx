import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { travelItinerariesApi, TravelItinerary } from '@/services/api';
import { FadeIn } from '@/components/ui/motion';
import { CalendarIcon, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import debounce from 'lodash/debounce';

// Constants for validation and categories
const MAX_SPACE = 10000; // Maximum allowed space in cubic inches
const MIN_DATE = new Date(); // Prevent selecting past dates
const preferredCategories = [
  'Electronics',
  'Clothing',
  'Books',
  'Beauty & Health',
  'Toys & Games',
  'Sports & Outdoors',
  'Home & Kitchen',
  'Other',
];

// Interface for location suggestions
interface LocationSuggestion {
  name: string;
  country: string;
}

const CreateTravelPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [formData, setFormData] = useState({
    from_location: '',
    to_location: '',
    departure_date: null as Date | null,
    arrival_date: null as Date | null,
    available_space: '',
    preferred_items: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fromSuggestions, setFromSuggestions] = useState<LocationSuggestion[]>([]);
  const [toSuggestions, setToSuggestions] = useState<LocationSuggestion[]>([]);

  // Abort controller for API requests to prevent memory leaks
  const abortController = useMemo(() => new AbortController(), []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      abortController.abort();
    };
  }, [abortController]);

  // Check if user has completed KYC (required for posting travel plans, similar to Grabr.io)
  const { data: userProfile, isLoading: isProfileLoading } = useQuery({
    queryKey: ['userProfile', user?.user_id],
    queryFn: async () => {
      if (!user?.user_id) throw new Error('User not authenticated');
      return await authApi.getUserProfile(user.user_id, abortController.signal);
    },
    enabled: !!user?.user_id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    retry: (failureCount, error: any) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 2;
    },
  });

  // Debounced function for fetching location suggestions using Google Places API
  // Inside CreateTravelPage.tsx
const fetchLocationSuggestions = useCallback(
  debounce(async (query: string, type: 'from' | 'to') => {
    if (!query.trim()) {
      type === 'from' ? setFromSuggestions([]) : setToSuggestions([]);
      return;
    }

    try {
      const suggestions = await locationsApi.getSuggestions(query, abortController.signal);
      type === 'from' ? setFromSuggestions(suggestions) : setToSuggestions(suggestions);
    } catch (error: any) {
      if (error.name !== 'AbortError') {
        toast({
          title: 'Error',
          description: error.message || 'Failed to fetch location suggestions.',
          variant: 'destructive',
        });
      }
    }
  }, 300),
  [abortController, toast]
);

  // Handle input changes with sanitization
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const { name, value } = e.target;
      // Sanitize input to prevent XSS
      const sanitizedValue = value.replace(/[<>{}]/g, '');
      setFormData((prev) => ({ ...prev, [name]: sanitizedValue }));
      if (errors[name]) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors[name];
          return newErrors;
        });
      }

      // Fetch location suggestions
      if (name === 'from_location') {
        fetchLocationSuggestions(sanitizedValue, 'from');
      } else if (name === 'to_location') {
        fetchLocationSuggestions(sanitizedValue, 'to');
      }
    },
    [errors, fetchLocationSuggestions]
  );

  const handlePreferredItemsChange = useCallback((value: string) => {
    setFormData((prev) => ({ ...prev, preferred_items: value }));
    if (errors.preferred_items) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.preferred_items;
        return newErrors;
      });
    }
  }, [errors]);

  const handleDepartureDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, departure_date: date }));
      if (errors.departure_date) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.departure_date;
          return newErrors;
        });
      }
    }
  }, [errors]);

  const handleArrivalDateChange = useCallback((date: Date | undefined) => {
    if (date) {
      setFormData((prev) => ({ ...prev, arrival_date: date }));
      if (errors.arrival_date) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.arrival_date;
          return newErrors;
        });
      }
    }
  }, [errors]);

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.from_location.trim()) {
      newErrors.from_location = 'From location is required';
    } else if (formData.from_location.length > 100) {
      newErrors.from_location = 'From location cannot exceed 100 characters';
    }

    if (!formData.to_location.trim()) {
      newErrors.to_location = 'To location is required';
    } else if (formData.to_location.length > 100) {
      newErrors.to_location = 'To location cannot exceed 100 characters';
    }

    if (!formData.departure_date) {
      newErrors.departure_date = 'Departure date is required';
    }

    if (!formData.arrival_date) {
      newErrors.arrival_date = 'Arrival date is required';
    } else if (formData.departure_date && formData.arrival_date < formData.departure_date) {
      newErrors.arrival_date = 'Arrival date must be after departure date';
    }

    if (formData.available_space) {
      const spaceNum = Number(formData.available_space);
      if (isNaN(spaceNum)) {
        newErrors.available_space = 'Available space must be a number';
      } else if (spaceNum <= 0) {
        newErrors.available_space = 'Available space must be greater than 0';
      } else if (spaceNum > MAX_SPACE) {
        newErrors.available_space = `Available space cannot exceed ${MAX_SPACE} cubic inches`;
      }
    }

    if (formData.preferred_items && formData.preferred_items.length > 50) {
      newErrors.preferred_items = 'Preferred items cannot exceed 50 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  // Form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!user?.user_id) {
        toast({
          title: 'Error',
          description: 'You must be logged in to post a travel itinerary.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      if (!userProfile?.kyc_document_url) {
        toast({
          title: 'KYC Required',
          description: 'Please complete KYC verification to post travel plans.',
          variant: 'destructive',
        });
        navigate('/profile');
        return;
      }

      if (!validateForm()) return;

      try {
        setIsSubmitting(true);

        const itineraryData: Partial<TravelItinerary> = {
          traveler_id: user.user_id,
          from_location: formData.from_location,
          to_location: formData.to_location,
          departure_date: formData.departure_date?.toISOString() || new Date().toISOString(),
          arrival_date: formData.arrival_date?.toISOString() || new Date().toISOString(),
          available_space: formData.available_space ? Number(formData.available_space) : undefined,
          preferred_items: formData.preferred_items || undefined,
          available: true,
          status: 'active',
        };

        await travelItinerariesApi.create(itineraryData as any, abortController.signal);

        toast({
          title: 'Travel Posted',
          description: 'Your travel itinerary has been successfully posted.',
        });

        navigate('/my-travels');
      } catch (error: any) {
        if (error.name === 'AbortError') return;

        const errorMessage = error.message?.includes('duplicate')
          ? 'A similar travel itinerary already exists.'
          : error.message || 'Failed to post travel itinerary. Please try again.';
        toast({
          title: 'Error',
          description: errorMessage,
          variant: 'destructive',
        });
      } finally {
        setIsSubmitting(false);
      }
    },
    [user, userProfile, formData, validateForm, toast, navigate, abortController]
  );

  // Render loading state while fetching user profile
  if (isProfileLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" aria-label="Loading" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to post a travel itinerary.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <FadeIn>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Post Your Travel Plans</h1>
            <p className="text-muted-foreground">
              Let others know about your travel plans and earn by delivering items.
            </p>
          </div>

          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <CardTitle>Travel Details</CardTitle>
              <CardDescription>
                Provide information about your upcoming travel.
              </CardDescription>
            </CardHeader>

            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 relative">
                        <Label htmlFor="from_location">From Location *</Label>
                        <Input
                          id="from_location"
                          name="from_location"
                          placeholder="e.g., New York, USA"
                          value={formData.from_location}
                          onChange={handleChange}
                          className={cn(errors.from_location && 'border-red-500')}
                          autoComplete="off"
                          maxLength={100}
                          aria-invalid={!!errors.from_location}
                          aria-describedby={errors.from_location ? 'from_location-error' : undefined}
                        />
                        {fromSuggestions.length > 0 && (
                          <ul className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                            {fromSuggestions.map((suggestion, index) => (
                              <li
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    from_location: `${suggestion.name}, ${suggestion.country}`,
                                  }));
                                  setFromSuggestions([]);
                                }}
                                role="option"
                                aria-selected={false}
                              >
                                {suggestion.name}, {suggestion.country}
                              </li>
                            ))}
                          </ul>
                        )}
                        {errors.from_location && (
                          <p id="from_location-error" className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                            {errors.from_location}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2 relative">
                        <Label htmlFor="to_location">To Location *</Label>
                        <Input
                          id="to_location"
                          name="to_location"
                          placeholder="e.g., London, UK"
                          value={formData.to_location}
                          onChange={handleChange}
                          className={cn(errors.to_location && 'border-red-500')}
                          autoComplete="off"
                          maxLength={100}
                          aria-invalid={!!errors.to_location}
                          aria-describedby={errors.to_location ? 'to_location-error' : undefined}
                        />
                        {toSuggestions.length > 0 && (
                          <ul className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-40 overflow-y-auto">
                            {toSuggestions.map((suggestion, index) => (
                              <li
                                key={index}
                                className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                                onClick={() => {
                                  setFormData((prev) => ({
                                    ...prev,
                                    to_location: `${suggestion.name}, ${suggestion.country}`,
                                  }));
                                  setToSuggestions([]);
                                }}
                                role="option"
                                aria-selected={false}
                              >
                                {suggestion.name}, {suggestion.country}
                              </li>
                            ))}
                          </ul>
                        )}
                        {errors.to_location && (
                          <p id="to_location-error" className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                            {errors.to_location}
                          </p>
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
                                'w-full justify-start text-left font-normal',
                                !formData.departure_date && 'text-muted-foreground',
                                errors.departure_date && 'border-red-500'
                              )}
                              aria-invalid={!!errors.departure_date}
                              aria-describedby={errors.departure_date ? 'departure_date-error' : undefined}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                              {formData.departure_date ? (
                                format(formData.departure_date, 'PPP')
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
                              disabled={(date) => date < MIN_DATE}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.departure_date && (
                          <p id="departure_date-error" className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                            {errors.departure_date}
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="arrival_date">Arrival Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                'w-full justify-start text-left font-normal',
                                !formData.arrival_date && 'text-muted-foreground',
                                errors.arrival_date && 'border-red-500'
                              )}
                              aria-invalid={!!errors.arrival_date}
                              aria-describedby={errors.arrival_date ? 'arrival_date-error' : undefined}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                              {formData.arrival_date ? (
                                format(formData.arrival_date, 'PPP')
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
                                date < MIN_DATE ||
                                (formData.departure_date ? date < formData.departure_date : false)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.arrival_date && (
                          <p id="arrival_date-error" className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                            {errors.arrival_date}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="available_space">
                        Available Carrying Space (in cubic inches - optional)
                      </Label>
                      <Input
                        id="available_space"
                        name="available_space"
                        type="number"
                        placeholder="e.g., 100"
                        value={formData.available_space}
                        onChange={handleChange}
                        className={cn(errors.available_space && 'border-red-500')}
                        min="0"
                        max={MAX_SPACE}
                        step="1"
                        aria-invalid={!!errors.available_space}
                        aria-describedby={errors.available_space ? 'available_space-error' : undefined}
                      />
                      {errors.available_space && (
                        <p id="available_space-error" className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                          {errors.available_space}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="preferred_items">Preferred Item Category (optional)</Label>
                      <Select
                        value={formData.preferred_items}
                        onValueChange={handlePreferredItemsChange}
                      >
                        <SelectTrigger id="preferred_items">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {preferredCategories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.preferred_items && (
                        <p id="preferred_items-error" className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                          {errors.preferred_items}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/my-travels')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
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