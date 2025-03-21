import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/contexts/AuthContext';
import { shoppingRequestsApi, ShoppingRequest } from '@/services/api';
import { FadeIn } from '@/components/ui/motion';
import { CalendarIcon, Loader2, Upload, AlertCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';

// Constants for validation and categories
const categories = [
  'Electronics',
  'Clothing',
  'Books',
  'Beauty & Health',
  'Toys & Games',
  'Sports & Outdoors',
  'Home & Kitchen',
  'Other',
];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB limit
const MIN_DATE = new Date(); // Prevent selecting past dates

const CreateRequestPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // State management
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    price: '',
    seller_location: '',
    description: '',
    product_url: '',
    required_by: null as Date | null,
    delivery_instructions: '',
    reward: '',
    image: null as File | null,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Abort controller for API requests to prevent memory leaks
  const abortController = useMemo(() => new AbortController(), []);

  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      abortController.abort();
    };
  }, [abortController]);

  // Check if user has completed KYC (required for posting requests, similar to Grabr.io)
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

  // Handle input changes with sanitization
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
    },
    [errors]
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        if (file.size > MAX_FILE_SIZE) {
          setErrors((prev) => ({ ...prev, image: 'File size must be less than 5MB' }));
          return;
        }
        if (!file.type.startsWith('image/')) {
          setErrors((prev) => ({ ...prev, image: 'File must be an image' }));
          return;
        }
        setFormData((prev) => ({ ...prev, image: file }));
        if (errors.image) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.image;
            return newErrors;
          });
        }
      }
    },
    [errors]
  );

  const handleSelectChange = useCallback(
    (value: string) => {
      setFormData((prev) => ({ ...prev, category: value }));
      if (errors.category) {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.category;
          return newErrors;
        });
      }
    },
    [errors]
  );

  const handleDateChange = useCallback(
    (date: Date | undefined) => {
      if (date) {
        setFormData((prev) => ({ ...prev, required_by: date }));
        if (errors.required_by) {
          setErrors((prev) => {
            const newErrors = { ...prev };
            delete newErrors.required_by;
            return newErrors;
          });
        }
      }
    },
    [errors]
  );

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors: Record<string, string> = {};

    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    } else if (formData.product_name.length > 100) {
      newErrors.product_name = 'Product name cannot exceed 100 characters';
    }

    if (!formData.category) {
      newErrors.category = 'Category is required';
    }

    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else {
      const priceNum = Number(formData.price);
      if (isNaN(priceNum) || priceNum <= 0) {
        newErrors.price = 'Price must be a positive number';
      } else if (priceNum > 10000) {
        newErrors.price = 'Price cannot exceed $10,000';
      }
    }

    if (!formData.seller_location.trim()) {
      newErrors.seller_location = 'Seller location is required';
    } else if (formData.seller_location.length > 100) {
      newErrors.seller_location = 'Seller location cannot exceed 100 characters';
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = 'Description cannot exceed 500 characters';
    }

    if (formData.product_url) {
      const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+)(\/[\w-./?%&=]*)?$/;
      if (!urlPattern.test(formData.product_url)) {
        newErrors.product_url = 'Please enter a valid URL';
      } else if (formData.product_url.length > 200) {
        newErrors.product_url = 'Product URL cannot exceed 200 characters';
      }
    }

    if (!formData.required_by) {
      newErrors.required_by = 'Required by date is required';
    } else if (formData.required_by < MIN_DATE) {
      newErrors.required_by = 'Required by date must be in the future';
    }

    if (formData.delivery_instructions && formData.delivery_instructions.length > 500) {
      newErrors.delivery_instructions = 'Delivery instructions cannot exceed 500 characters';
    }

    if (!formData.reward.trim()) {
      newErrors.reward = 'Reward is required';
    } else {
      const rewardNum = Number(formData.reward);
      if (isNaN(rewardNum) || rewardNum <= 0) {
        newErrors.reward = 'Reward must be a positive number';
      } else if (rewardNum > 1000) {
        newErrors.reward = 'Reward cannot exceed $1,000';
      }
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
          description: 'You must be logged in to create a shopping request.',
          variant: 'destructive',
        });
        navigate('/login');
        return;
      }

      if (!userProfile?.kyc_document_url) {
        toast({
          title: 'KYC Required',
          description: 'Please complete KYC verification to create shopping requests.',
          variant: 'destructive',
        });
        navigate('/profile');
        return;
      }

      if (!validateForm()) return;

      try {
        setIsSubmitting(true);

        let imageUrl = '';
        if (formData.image) {
          const formDataImage = new FormData();
          formDataImage.append('file', formData.image);
          const uploadResponse = await shoppingRequestsApi.uploadImage(formDataImage, abortController.signal);
          imageUrl = uploadResponse.url;
        }

        const requestData: Partial<ShoppingRequest> = {
          requester_id: user.user_id, // Updated to match schema
          product_name: formData.product_name,
          category: formData.category,
          price: Number(formData.price),
          seller_location: formData.seller_location,
          required_by: formData.required_by?.toISOString() || new Date().toISOString(),
          description: formData.description || undefined,
          product_url: formData.product_url || undefined,
          delivery_instructions: formData.delivery_instructions || undefined,
          reward: Number(formData.reward),
          image_url: imageUrl || undefined,
          status: 'pending', // Ensure status is set
        };

        await shoppingRequestsApi.create(requestData as any, abortController.signal);

        toast({
          title: 'Request Created',
          description: 'Your shopping request has been successfully created.',
        });

        navigate('/my-requests');
      } catch (error: any) {
        if (error.name === 'AbortError') return;

        const errorMessage = error.message || 'Failed to create shopping request. Please try again.';
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
        <p className="text-muted-foreground">Please log in to create a shopping request.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <FadeIn>
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">Create Shopping Request</h1>
            <p className="text-muted-foreground">Find someone to bring you an item from abroad.</p>
          </div>
          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>Provide information about the item you want to be delivered.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="product_name">Product Name *</Label>
                      <Input
                        id="product_name"
                        name="product_name"
                        placeholder="e.g., Apple AirPods Pro"
                        value={formData.product_name}
                        onChange={handleChange}
                        className={cn(errors.product_name && 'border-red-500')}
                        maxLength={100}
                        aria-invalid={!!errors.product_name}
                        aria-describedby={errors.product_name ? 'product_name-error' : undefined}
                      />
                      {errors.product_name && (
                        <p id="product_name-error" className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                          {errors.product_name}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select value={formData.category} onValueChange={handleSelectChange}>
                        <SelectTrigger
                          id="category"
                          className={cn(errors.category && 'border-red-500')}
                          aria-invalid={!!errors.category}
                          aria-describedby={errors.category ? 'category-error' : undefined}
                        >
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {errors.category && (
                        <p id="category-error" className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                          {errors.category}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="description">Description (optional)</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Provide a detailed description of the item"
                        value={formData.description}
                        onChange={handleChange}
                        className="min-h-32 resize-none"
                        maxLength={500}
                        aria-describedby={errors.description ? 'description-error' : undefined}
                      />
                      {errors.description && (
                        <p id="description-error" className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                          {errors.description}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="product_url">Product URL (optional)</Label>
                      <Input
                        id="product_url"
                        name="product_url"
                        placeholder="e.g., https://www.amazon.com/product"
                        value={formData.product_url}
                        onChange={handleChange}
                        maxLength={200}
                        aria-invalid={!!errors.product_url}
                        aria-describedby={errors.product_url ? 'product_url-error' : undefined}
                      />
                      {errors.product_url && (
                        <p id="product_url-error" className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                          {errors.product_url}
                        </p>
                      )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Product Price ($) *</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          min="0"
                          max="10000"
                          step="0.01"
                          placeholder="e.g., 199.99"
                          value={formData.price}
                          onChange={handleChange}
                          className={cn(errors.price && 'border-red-500')}
                          aria-invalid={!!errors.price}
                          aria-describedby={errors.price ? 'price-error' : undefined}
                        />
                        {errors.price && (
                          <p id="price-error" className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                            {errors.price}
                          </p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reward">Reward for Traveler ($) *</Label>
                        <Input
                          id="reward"
                          name="reward"
                          type="number"
                          min="0"
                          max="1000"
                          step="0.01"
                          placeholder="e.g., 20.00"
                          value={formData.reward}
                          onChange={handleChange}
                          className={cn(errors.reward && 'border-red-500')}
                          aria-invalid={!!errors.reward}
                          aria-describedby={errors.reward ? 'reward-error' : undefined}
                        />
                        {errors.reward && (
                          <p id="reward-error" className="text-red-500 text-xs mt-1 flex items-center">
                            <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                            {errors.reward}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="seller_location">Seller Location *</Label>
                      <Input
                        id="seller_location"
                        name="seller_location"
                        placeholder="e.g., Tokyo, Japan"
                        value={formData.seller_location}
                        onChange={handleChange}
                        className={cn(errors.seller_location && 'border-red-500')}
                        maxLength={100}
                        aria-invalid={!!errors.seller_location}
                        aria-describedby={errors.seller_location ? 'seller_location-error' : undefined}
                      />
                      {errors.seller_location && (
                        <p id="seller_location-error" className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                          {errors.seller_location}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="required_by">Required By *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              'w-full justify-start text-left font-normal',
                              !formData.required_by && 'text-muted-foreground',
                              errors.required_by && 'border-red-500'
                            )}
                            aria-invalid={!!errors.required_by}
                            aria-describedby={errors.required_by ? 'required_by-error' : undefined}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                            {formData.required_by ? format(formData.required_by, 'PPP') : 'Pick a date'}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={formData.required_by || undefined}
                            onSelect={handleDateChange}
                            initialFocus
                            disabled={(date) => date < MIN_DATE}
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.required_by && (
                        <p id="required_by-error" className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                          {errors.required_by}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="delivery_instructions">Delivery Instructions (optional)</Label>
                      <Textarea
                        id="delivery_instructions"
                        name="delivery_instructions"
                        placeholder="e.g., Please deliver to my office address"
                        value={formData.delivery_instructions}
                        onChange={handleChange}
                        className="min-h-32 resize-none"
                        maxLength={500}
                        aria-describedby={errors.delivery_instructions ? 'delivery_instructions-error' : undefined}
                      />
                      {errors.delivery_instructions && (
                        <p id="delivery_instructions-error" className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                          {errors.delivery_instructions}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="image">Upload Item Image (optional)</Label>
                      <div className="flex items-center space-x-2">
                        <Input
                          id="image"
                          type="file"
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          aria-describedby={errors.image ? 'image-error' : undefined}
                        />
                        <Button
                          variant="outline"
                          asChild
                          className="w-full"
                        >
                          <label htmlFor="image" className="cursor-pointer flex items-center">
                            <Upload className="mr-2 h-4 w-4" aria-hidden="true" />
                            {formData.image ? formData.image.name : 'Choose Image'}
                          </label>
                        </Button>
                      </div>
                      {errors.image && (
                        <p id="image-error" className="text-red-500 text-xs mt-1 flex items-center">
                          <AlertCircle className="h-4 w-4 mr-1" aria-hidden="true" />
                          {errors.image}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => navigate('/my-requests')}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                        Creating...
                      </>
                    ) : (
                      'Create Request'
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

export default CreateRequestPage;