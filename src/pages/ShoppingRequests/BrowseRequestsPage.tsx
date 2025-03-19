
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingRequest } from '@/services/api';
import { FadeIn, StaggerContainer } from '@/components/ui/motion';
import { Calendar, DollarSign, MapPin, Search } from 'lucide-react';
import { format } from 'date-fns';

const BrowseRequestsPage: React.FC = () => {
  // Mock data for demonstration
  const mockRequests: ShoppingRequest[] = [
    {
      id: '1',
      shopper_id: 'user1',
      product_name: 'Limited Edition Nike Sneakers',
      category: 'Clothing & Accessories',
      price: 199.99,
      required_by: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      seller_location: 'New York, USA',
      status: 'pending',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      shopper_id: 'user2',
      product_name: 'Japanese Skincare Products',
      category: 'Beauty & Health',
      price: 120,
      required_by: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      seller_location: 'Tokyo, Japan',
      status: 'pending',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      shopper_id: 'user3',
      product_name: 'German Chocolate Assortment',
      category: 'Food & Beverages',
      price: 50,
      required_by: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      seller_location: 'Berlin, Germany',
      status: 'pending',
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      shopper_id: 'user4',
      product_name: 'Luxury Italian Leather Bag',
      category: 'Luxury Goods',
      price: 450,
      required_by: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      seller_location: 'Milan, Italy',
      status: 'pending',
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      shopper_id: 'user5',
      product_name: 'Limited Edition Scotch Whisky',
      category: 'Alcoholic Beverages',
      price: 350,
      required_by: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
      seller_location: 'Edinburgh, Scotland',
      status: 'pending',
      created_at: new Date().toISOString(),
    },
  ];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  
  // Filter requests based on search term and filters
  const filteredRequests = mockRequests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.category && request.category.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesOrigin = originFilter === '' || 
      request.seller_location.toLowerCase().includes(originFilter.toLowerCase());
    
    // Note: In the real implementation, we might need a destination field in the shopping request
    const matchesDestination = destinationFilter === '' || true;
    
    return matchesSearch && matchesOrigin && matchesDestination;
  });
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  const renderRequestCard = (request: ShoppingRequest) => (
    <FadeIn key={request.id}>
      <Card className="h-full card-hover">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{request.product_name}</CardTitle>
            <Badge variant="secondary">
              ${(request.price * 0.1).toFixed(0)} Reward
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {request.category}
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Needed by: {formatDate(request.required_by)}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>From {request.seller_location}</span>
            </div>
            
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Item value: ${request.price.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button asChild variant="outline" className="w-full">
            <Link to={`/requests/${request.id}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>
    </FadeIn>
  );
  
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Shopping Requests</h1>
        <p className="text-muted-foreground">
          Find shopping requests that match your travel plans and earn rewards
        </p>
      </div>
      
      <div className="bg-secondary/50 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <Label htmlFor="search" className="mb-2 block">Search</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Search by product name or category"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="origin" className="mb-2 block">Origin</Label>
            <Input
              id="origin"
              placeholder="e.g., Tokyo, Japan"
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="destination" className="mb-2 block">Your Location</Label>
            <Input
              id="destination"
              placeholder="e.g., London, UK"
              value={destinationFilter}
              onChange={(e) => setDestinationFilter(e.target.value)}
            />
          </div>
        </div>
      </div>
      
      {filteredRequests.length > 0 ? (
        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRequests.map(renderRequestCard)}
        </StaggerContainer>
      ) : (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">
            No matching requests found. Try adjusting your search criteria.
          </p>
          <Button asChild>
            <Link to="/my-travels/new">Post Your Travel</Link>
          </Button>
        </div>
      )}
    </div>
  );
};

export default BrowseRequestsPage;
