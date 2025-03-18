
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/contexts/AuthContext';
import { shoppingRequestsApi } from '@/services/api';
import { FadeIn } from '@/components/ui/motion';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

const CreateRequestPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState({
    item_name: '',
    item_description: '',
    item_url: '',
    item_price: '',
    shipping_from: '',
    shipping_to: '',
    reward_amount: '',
    delivery_by: null as Date | null,
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
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, delivery_by: date }));
      // Clear error when user selects a date
      if (errors.delivery_by) {
        setErrors(prev => {
          const newErrors = { ...prev };
          delete newErrors.delivery_by;
          return newErrors;
        });
      }
    }
  };
  
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.item_name.trim()) {
      newErrors.item_name = 'Item name is required';
    }
    
    if (!formData.item_description.trim()) {
      newErrors.item_description = 'Item description is required';
    }
    
    if (!formData.item_price.trim()) {
      newErrors.item_price = 'Item price is required';
    } else if (isNaN(Number(formData.item_price)) || Number(formData.item_price) <= 0) {
      newErrors.item_price = 'Item price must be a positive number';
    }
    
    if (!formData.shipping_from.trim()) {
      newErrors.shipping_from = 'Source location is required';
    }
    
    if (!formData.shipping_to.trim()) {
      newErrors.shipping_to = 'Destination location is required';
    }
    
    if (!formData.reward_amount.trim()) {
      newErrors.reward_amount = 'Reward amount is required';
    } else if (isNaN(Number(formData.reward_amount)) || Number(formData.reward_amount) <= 0) {
      newErrors.reward_amount = 'Reward amount must be a positive number';
    }
    
    if (!formData.delivery_by) {
      newErrors.delivery_by = 'Delivery by date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !user) return;
    
    try {
      setIsLoading(true);
      
      const requestData = {
        user_id: user.id,
        item_name: formData.item_name,
        item_description: formData.item_description,
        item_url: formData.item_url,
        item_price: Number(formData.item_price),
        shipping_from: formData.shipping_from,
        shipping_to: formData.shipping_to,
        reward_amount: Number(formData.reward_amount),
        delivery_by_date: formData.delivery_by?.toISOString() || new Date().toISOString(),
      };
      
      await shoppingRequestsApi.create(requestData);
      
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
                      <Label htmlFor="item_name">Item Name *</Label>
                      <Input
                        id="item_name"
                        name="item_name"
                        placeholder="e.g., Apple AirPods Pro"
                        value={formData.item_name}
                        onChange={handleChange}
                        className={errors.item_name ? 'border-red-500' : ''}
                      />
                      {errors.item_name && (
                        <p className="text-red-500 text-xs mt-1">{errors.item_name}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="item_description">Description *</Label>
                      <Textarea
                        id="item_description"
                        name="item_description"
                        placeholder="Provide a detailed description of the item"
                        value={formData.item_description}
                        onChange={handleChange}
                        className={cn("min-h-32 resize-none", errors.item_description ? 'border-red-500' : '')}
                      />
                      {errors.item_description && (
                        <p className="text-red-500 text-xs mt-1">{errors.item_description}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="item_url">Item URL (optional)</Label>
                      <Input
                        id="item_url"
                        name="item_url"
                        placeholder="e.g., https://www.amazon.com/product"
                        value={formData.item_url}
                        onChange={handleChange}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="item_price">Item Price ($) *</Label>
                        <Input
                          id="item_price"
                          name="item_price"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g., 199.99"
                          value={formData.item_price}
                          onChange={handleChange}
                          className={errors.item_price ? 'border-red-500' : ''}
                        />
                        {errors.item_price && (
                          <p className="text-red-500 text-xs mt-1">{errors.item_price}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="reward_amount">Traveler Reward ($) *</Label>
                        <Input
                          id="reward_amount"
                          name="reward_amount"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="e.g., 30.00"
                          value={formData.reward_amount}
                          onChange={handleChange}
                          className={errors.reward_amount ? 'border-red-500' : ''}
                        />
                        {errors.reward_amount && (
                          <p className="text-red-500 text-xs mt-1">{errors.reward_amount}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-border/50 pt-6">
                  <h3 className="font-medium mb-4">Shipping Information</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="shipping_from">Buy From Location *</Label>
                      <Input
                        id="shipping_from"
                        name="shipping_from"
                        placeholder="e.g., New York, USA"
                        value={formData.shipping_from}
                        onChange={handleChange}
                        className={errors.shipping_from ? 'border-red-500' : ''}
                      />
                      {errors.shipping_from && (
                        <p className="text-red-500 text-xs mt-1">{errors.shipping_from}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="shipping_to">Deliver To Location *</Label>
                      <Input
                        id="shipping_to"
                        name="shipping_to"
                        placeholder="e.g., London, UK"
                        value={formData.shipping_to}
                        onChange={handleChange}
                        className={errors.shipping_to ? 'border-red-500' : ''}
                      />
                      {errors.shipping_to && (
                        <p className="text-red-500 text-xs mt-1">{errors.shipping_to}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="delivery_by">Need By Date *</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !formData.delivery_by && "text-muted-foreground",
                              errors.delivery_by ? 'border-red-500' : ''
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {formData.delivery_by ? (
                              format(formData.delivery_by, "PPP")
                            ) : (
                              <span>Select a date</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={formData.delivery_by || undefined}
                            onSelect={handleDateChange}
                            disabled={(date) => date < new Date()}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      {errors.delivery_by && (
                        <p className="text-red-500 text-xs mt-1">{errors.delivery_by}</p>
                      )}
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
