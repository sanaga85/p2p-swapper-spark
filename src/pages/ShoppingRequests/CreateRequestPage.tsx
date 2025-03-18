
import React, { useState } from 'react';
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
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

// Sample categories
const categories = [
  "Electronics",
  "Clothing",
  "Books",
  "Beauty & Health",
  "Toys & Games",
  "Sports & Outdoors",
  "Home & Kitchen",
  "Other"
];

const CreateRequestPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    product_name: '',
    category: '',
    price: '',
    seller_location: '',
    description: '', // Not directly in API but useful for UI
    product_url: '', // Not directly in API but useful for UI
    required_by: null as Date | null,
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
  
  const handleSelectChange = (value: string) => {
    setFormData(prev => ({ ...prev, category: value }));
    
    // Clear error when user selects a category
    if (errors.category) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.category;
        return newErrors;
      });
    }
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, required_by: date }));
      // Clear error when user selects a date
      if (errors.required_by) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.required_by;
          return newErrors;
        });
      }
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.product_name.trim()) {
      newErrors.product_name = 'Product name is required';
    }
    
    if (!formData.category) {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.seller_location.trim()) {
      newErrors.seller_location = 'Seller location is required';
    }
    
    if (!formData.required_by) {
      newErrors.required_by = 'Required by date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;
    
    try {
      setIsLoading(true);
      
      const requestData: Partial<ShoppingRequest> = {
        shopper_id: user.id,
        product_name: formData.product_name,
        category: formData.category,
        price: Number(formData.price),
        seller_location: formData.seller_location,
        required_by: formData.required_by?.toISOString() || new Date().toISOString(),
      };
      
      await shoppingRequestsApi.create(requestData as any);
      
      toast({
        title: "Request Created",
        description: "Your shopping request has been successfully created.",
      });
      
      navigate('/my-requests');
    } catch (error) {
      console.error('Error creating shopping request:', error);
      toast({
        title: "Error",
        description: "Failed to create shopping request. Please try again.",
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
            <h1 className="text-3xl font-bold mb-2">Create Shopping Request</h1>
            <p className="text-muted-foreground">
              Find someone to bring you an item from abroad
            </p>
          </div>
          
          <Card className="shadow-lg border-border/50">
            <CardHeader>
              <CardTitle>Item Details</CardTitle>
              <CardDescription>
                Provide information about the item you want to be delivered
              </CardDescription>
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
                        className={errors.product_name ? 'border-red-500' : ''}
                      />
                      {errors.product_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.product_name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Category *</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={handleSelectChange}
                      >
                        <SelectTrigger 
                          id="category"
                          className={errors.category ? 'border-red-500' : ''}
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
                        <p className="text-red-500 text-xs mt-1">{errors.category}</p>
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
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="product_url">Product URL (optional)</Label>
                      <Input
                        id="product_url"
                        name="product_url"
                        placeholder="e.g., https://www.amazon.com/product"
                        value={formData.product_url}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price">Product Price ($) *</Label>
                        <Input
                          id="price"
                          name="price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g., 199.99"
                          value={formData.price}
                          onChange={handleChange}
                          className={errors.price ? 'border-red-500' : ''}
                        />
                        {errors.price && (
                          <p className="text-red-500 text-xs mt-1">{errors.price}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="seller_location">Seller Location *</Label>
                        <Input
                          id="seller_location"
                          name="seller_location"
                          placeholder="e.g., New York, USA"
                          value={formData.seller_location}
                          onChange={handleChange}
                          className={errors.seller_location ? 'border-red-500' : ''}
                        />
                        {errors.seller_location && (
                          <p className="text-red-500 text-xs mt-1">{errors.seller_location}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="required_by">Required By Date *</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={cn(
                                "w-full justify-start text-left font-normal",
                                !formData.required_by && "text-muted-foreground",
                                errors.required_by ? 'border-red-500' : ''
                              )}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {formData.required_by ? (
                                format(formData.required_by, "PPP")
                              ) : (
                                <span>Select a date</span>
                              )}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={formData.required_by || undefined}
                              onSelect={handleDateChange}
                              disabled={(date) => date < new Date()}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        {errors.required_by && (
                          <p className="text-red-500 text-xs mt-1">{errors.required_by}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 pt-4">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => navigate('/my-requests')}
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
