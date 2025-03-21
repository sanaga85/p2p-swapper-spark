import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { shoppingRequestsApi, ShoppingRequest } from '@/services/api';
import { FadeIn, StaggerContainer } from '@/components/ui/motion';
import { Loader2, Plus, PackageSearch, Calendar, MapPin, DollarSign } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

// Constants
const PAGE_SIZE = 10;

const MyRequestsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [page, setPage] = useState(1);
  const [allRequests, setAllRequests] = useState<ShoppingRequest[]>([]);

  // Infinite scroll observer
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  // Fetch shopping requests using React Query
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['myRequests', user?.user_id, page],
    queryFn: async () => {
      if (!user?.user_id) throw new Error('User not authenticated');
      const response = await shoppingRequestsApi.getByUserId(user.user_id, page, PAGE_SIZE);
      return response.shopping_requests || [];
    },
    enabled: !!user?.user_id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    keepPreviousData: true, // Keep previous data while fetching new page
    retry: (failureCount, error: any) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 2;
    },
  });

  // Update requests state when data changes
  React.useEffect(() => {
    if (data) {
      setAllRequests((prev) =>
        page === 1 ? data : [...prev, ...data]
      );
    }
  }, [data, page]);

  // Handle infinite scroll
  React.useEffect(() => {
    if (inView && data && data.length === PAGE_SIZE) {
      setPage((prev) => prev + 1);
    }
  }, [inView, data]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load your requests. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Memoized request filters
  const requests = useMemo(() => allRequests || [], [allRequests]);
  const pendingRequests = useMemo(
    () => requests.filter((req) => req.status === 'pending'),
    [requests]
  );
  const inProgressRequests = useMemo(
    () => requests.filter((req) => req.status === 'accepted' || req.status === 'delivered'),
    [requests]
  );
  const completedRequests = useMemo(
    () => requests.filter((req) => req.status === 'completed' || req.status === 'paid'),
    [requests]
  );

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'accepted':
        return <Badge variant="info">Accepted</Badge>;
      case 'delivered':
        return <Badge variant="warning">Delivered</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'paid':
        return <Badge variant="success">Paid</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }, []);

  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid Date';
    }
  }, []);

  const renderRequestCard = useCallback(
    (request: ShoppingRequest) => (
      <FadeIn key={request.id}>
        <Card className="h-full card-hover">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold">{request.product_name}</CardTitle>
              {getStatusBadge(request.status || 'pending')}
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{request.category}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden="true" />
                <span>Needed by: {formatDate(request.required_by)}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden="true" />
                <span>From {request.seller_location}</span>
              </div>
              <div className="flex items-center">
                <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden="true" />
                <span>Item: ${request.price.toFixed(2)}</span>
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
    ),
    [getStatusBadge, formatDate]
  );

  const renderEmptyState = useCallback(
    () => (
      <div className="text-center py-12">
        <PackageSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
        <h3 className="text-lg font-medium mb-2">No requests found</h3>
        <p className="text-muted-foreground mb-6">
          You haven't created any shopping requests yet.
        </p>
        <Button asChild>
          <Link to="/my-requests/new">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Create a Request
          </Link>
        </Button>
      </div>
    ),
    []
  );

  if (isLoading && page === 1) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" aria-label="Loading" />
          <p className="text-muted-foreground">Loading your requests...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view your shopping requests.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Shopping Requests</h1>
          <p className="text-muted-foreground">
            Manage your requests for items you want delivered.
          </p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link to="/my-requests/new">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Create New Request
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">All ({requests.length})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingRequests.length})</TabsTrigger>
          <TabsTrigger value="in-progress">In Progress ({inProgressRequests.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedRequests.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {requests.length > 0 ? (
            <>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {requests.map(renderRequestCard)}
              </StaggerContainer>
              {data && data.length === PAGE_SIZE && (
                <div ref={loadMoreRef} className="flex justify-center mt-8">
                  <Button disabled={isFetching} aria-label="Load more requests">
                    {isFetching ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                    ) : (
                      'Load More'
                    )}
                  </Button>
                </div>
              )}
            </>
          ) : (
            renderEmptyState()
          )}
        </TabsContent>

        <TabsContent value="pending">
          {pendingRequests.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pendingRequests.map(renderRequestCard)}
            </StaggerContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No pending requests.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="in-progress">
          {inProgressRequests.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {inProgressRequests.map(renderRequestCard)}
            </StaggerContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No requests in progress.</p>
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
              <p className="text-muted-foreground">No completed requests.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyRequestsPage;