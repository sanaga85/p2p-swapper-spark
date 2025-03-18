
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { ShoppingRequest, shoppingRequestsApi } from '@/services/api';
import { FadeIn, StaggerContainer } from '@/components/ui/motion';
import { Loader2, Plus, PackageSearch, Calendar, MapPin, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';

const MyRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [requests, setRequests] = useState<ShoppingRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchRequests = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const data = await shoppingRequestsApi.getByUserId(user.id);
        if (Array.isArray(data)) {
          setRequests(data);
        }
      } catch (error) {
        console.error('Error fetching requests:', error);
        toast({
          title: "Error",
          description: "Failed to load your requests. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchRequests();
  }, [user, toast]);
  
  // Get counts for different status
  const openRequests = requests.filter(req => req.status === 'open');
  const matchedRequests = requests.filter(req => req.status === 'matched' || req.status === 'in_progress');
  const completedRequests = requests.filter(req => req.status === 'completed');
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'open':
        return <Badge variant="secondary">Open</Badge>;
      case 'matched':
        return <Badge variant="info">Matched</Badge>;
      case 'in_progress':
        return <Badge variant="warning">In Progress</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  const formatDate = (dateString: string) => {
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  const renderRequestCard = (request: ShoppingRequest) => (
    <FadeIn key={request.id}>
      <Card className="h-full card-hover">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-lg font-semibold">{request.item_name}</CardTitle>
            {getStatusBadge(request.status)}
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
              <span>
                Item: ${request.item_price.toFixed(2)} | 
                Reward: ${request.reward_amount.toFixed(2)}
              </span>
            </div>
          </div>
        </CardContent>
        <CardFooter className="pt-0">
          <Button asChild variant="outline" className="w-full">
            <Link to={`/my-requests/${request.id}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>
    </FadeIn>
  );
  
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <PackageSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No requests found</h3>
      <p className="text-muted-foreground mb-6">
        You haven't created any shopping requests yet
      </p>
      <Button asChild>
        <Link to="/my-requests/new">
          <Plus className="h-4 w-4 mr-2" />
          Create a Request
        </Link>
      </Button>
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your requests...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Shopping Requests</h1>
          <p className="text-muted-foreground">
            Manage your requests for items you want delivered
          </p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link to="/my-requests/new">
            <Plus className="h-4 w-4 mr-2" />
            Create New Request
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">
            All ({requests.length})
          </TabsTrigger>
          <TabsTrigger value="open">
            Open ({openRequests.length})
          </TabsTrigger>
          <TabsTrigger value="matched">
            In Progress ({matchedRequests.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedRequests.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {requests.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {requests.map(renderRequestCard)}
            </StaggerContainer>
          ) : (
            renderEmptyState()
          )}
        </TabsContent>
        
        <TabsContent value="open">
          {openRequests.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {openRequests.map(renderRequestCard)}
            </StaggerContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No open requests</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="matched">
          {matchedRequests.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {matchedRequests.map(renderRequestCard)}
            </StaggerContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No requests in progress</p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="completed">
          {completedRequests.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedRequests.map(renderRequestCard)}
            </StaggerContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No completed requests</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyRequestsPage;
