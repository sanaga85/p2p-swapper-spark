
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
      user_id: 'user1',
      item_name: 'Limited Edition Nike Sneakers',
      item_description: 'Looking for the 2023 limited edition Nike Air Jordan release only available in the US.',
      item_url: 'https://example.com/product',
      item_price: 199.99,
      delivery_by_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      shipping_from: 'New York, USA',
      shipping_to: 'London, UK',
      reward_amount: 50,
      status: 'open',
      created_at: new Date().toISOString(),
    },
    {
      id: '2',
      user_id: 'user2',
      item_name: 'Japanese Skincare Products',
      item_description: 'Need authentic Japanese SK-II facial treatment essence and Shiseido moisturizer.',
      item_price: 120,
      delivery_by_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(),
      shipping_from: 'Tokyo, Japan',
      shipping_to: 'Sydney, Australia',
      reward_amount: 30,
      status: 'open',
      created_at: new Date().toISOString(),
    },
    {
      id: '3',
      user_id: 'user3',
      item_name: 'German Chocolate Assortment',
      item_description: 'Looking for an assortment of German chocolates including Ritter Sport varieties not available internationally.',
      item_price: 50,
      delivery_by_date: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000).toISOString(),
      shipping_from: 'Berlin, Germany',
      shipping_to: 'Toronto, Canada',
      reward_amount: 25,
      status: 'open',
      created_at: new Date().toISOString(),
    },
    {
      id: '4',
      user_id: 'user4',
      item_name: 'Luxury Italian Leather Bag',
      item_description: 'Looking for a specific model of leather handbag only available in Milan boutiques.',
      item_price: 450,
      delivery_by_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      shipping_from: 'Milan, Italy',
      shipping_to: 'Dubai, UAE',
      reward_amount: 100,
      status: 'open',
      created_at: new Date().toISOString(),
    },
    {
      id: '5',
      user_id: 'user5',
      item_name: 'Limited Edition Scotch Whisky',
      item_description: 'Looking for a 25-year-old limited release Scotch only available at the distillery in Scotland.',
      item_price: 350,
      delivery_by_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString(),
      shipping_from: 'Edinburgh, Scotland',
      shipping_to: 'Singapore',
      reward_amount: 80,
      status: 'open',
      created_at: new Date().toISOString(),
    },
  ];
  
  const [searchTerm, setSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  
  // Filter requests based on search term and filters
  const filteredRequests = mockRequests.filter(request => {
    const matchesSearch = searchTerm === '' || 
      request.item_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.item_description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesOrigin = originFilter === '' || 
      request.shipping_from.toLowerCase().includes(originFilter.toLowerCase());
    
    const matchesDestination = destinationFilter === '' || 
      request.shipping_to.toLowerCase().includes(destinationFilter.toLowerCase());
    
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
            <CardTitle className="text-lg font-semibold">{request.item_name}</CardTitle>
            <Badge variant="secondary">
              ${request.reward_amount.toFixed(0)} Reward
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-4">
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
            {request.item_description}
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Needed by: {formatDate(request.delivery_by_date)}</span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>From {request.shipping_from} to {request.shipping_to}</span>
            </div>
            
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>Item value: ${request.item_price.toFixed(2)}</span>
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
                placeholder="Search by item name or description"
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
            <Label htmlFor="destination" className="mb-2 block">Destination</Label>
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
