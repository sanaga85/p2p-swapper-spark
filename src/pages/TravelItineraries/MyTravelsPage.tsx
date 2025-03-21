import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { TravelItinerary, travelItinerariesApi } from '@/services/api';
import { FadeIn, StaggerContainer } from '@/components/ui/motion';
import { Loader2, Plus, Plane, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useInView } from 'react-intersection-observer';

// Constants
const PAGE_SIZE = 9;

const MyTravelsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [page, setPage] = useState(1);
  const [allItineraries, setAllItineraries] = useState<TravelItinerary[]>([]);

  // Infinite scroll observer
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  // Fetch itineraries using React Query
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['travelItineraries', user?.user_id, page],
    queryFn: async () => {
      if (!user?.user_id) throw new Error('User not authenticated');
      const response = await travelItinerariesApi.getByUserId(user.user_id);
      return response.travel_itineraries || [];
    },
    enabled: !!user?.user_id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
    keepPreviousData: true, // Keep previous data while fetching new page
    retry: (failureCount, error: any) => {
      if (error.status === 401 || error.status === 403) return false;
      return failureCount < 2;
    },
  });

  // Update itineraries state when data changes
  React.useEffect(() => {
    if (data) {
      setAllItineraries((prev) =>
        page === 1 ? data : [...prev, ...data.slice((page - 1) * PAGE_SIZE)]
      );
    }
  }, [data, page]);

  // Handle infinite scroll
  React.useEffect(() => {
    if (inView && data && data.length > page * PAGE_SIZE) {
      setPage((prev) => prev + 1);
    }
  }, [inView, data]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load your travel itineraries. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Mutation for cancelling an itinerary
  const cancelMutation = useMutation({
    mutationFn: async (itineraryId: string) => {
      // Note: This assumes an `update` method exists in travelItinerariesApi.
      // You'll need to add this to api.ts if it doesn't exist.
      await travelItinerariesApi.update(itineraryId, { status: 'cancelled' });
    },
    onSuccess: () => {
      toast({
        title: 'Itinerary Cancelled',
        description: 'Your travel itinerary has been cancelled.',
      });
      queryClient.invalidateQueries(['travelItineraries', user?.user_id]);
      setPage(1); // Reset to first page after cancellation
    },
    onError: (err: any) => {
      toast({
        title: 'Error',
        description: err.message || 'Failed to cancel itinerary.',
        variant: 'destructive',
      });
    },
  });

  const handleCancelItinerary = useCallback(
    (itineraryId: string) => {
      if (!itineraryId) return;
      cancelMutation.mutate(itineraryId);
    },
    [cancelMutation]
  );

  // Memoized itinerary filters
  const activeItineraries = useMemo(
    () => allItineraries.filter((it) => it.status === 'active'),
    [allItineraries]
  );
  const completedItineraries = useMemo(
    () => allItineraries.filter((it) => it.status === 'completed'),
    [allItineraries]
  );

  const getStatusBadge = useCallback((status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="info">Active</Badge>;
      case 'completed':
        return <Badge variant="success">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
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

  const renderItineraryCard = useCallback(
    (itinerary: TravelItinerary) => (
      <FadeIn key={itinerary.id}>
        <Card className="h-full card-hover">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold">
                {itinerary.from_location} to {itinerary.to_location}
              </CardTitle>
              {getStatusBadge(itinerary.status || 'active')}
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="space-y-2 text-sm mb-4">
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden="true" />
                <span>
                  {formatDate(itinerary.departure_date)} - {formatDate(itinerary.arrival_date)}
                </span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-muted-foreground" aria-hidden="true" />
                <span>
                  {itinerary.from_location} → {itinerary.to_location}
                </span>
              </div>
            </div>
            {itinerary.preferred_items && (
              <p className="text-sm text-muted-foreground line-clamp-2">
                Preferred Items: {itinerary.preferred_items}
              </p>
            )}
            {itinerary.available_space && (
              <p className="text-sm text-muted-foreground">
                Available Space: {itinerary.available_space} cubic inches
              </p>
            )}
          </CardContent>
          <CardFooter className="pt-0 flex space-x-2">
            <Button asChild variant="outline" className="flex-1">
              <Link to={`/my-travels/${itinerary.id}`}>View Details</Link>
            </Button>
            {itinerary.status === 'active' && (
              <Button
                variant="destructive"
                className="flex-1"
                onClick={() => handleCancelItinerary(itinerary.id!)}
                disabled={cancelMutation.isLoading}
                aria-label={`Cancel itinerary from ${itinerary.from_location} to ${itinerary.to_location}`}
              >
                {cancelMutation.isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" aria-hidden="true" />
                ) : null}
                Cancel
              </Button>
            )}
          </CardFooter>
        </Card>
      </FadeIn>
    ),
    [getStatusBadge, formatDate, handleCancelItinerary, cancelMutation.isLoading]
  );

  const renderEmptyState = useCallback(
    () => (
      <div className="text-center py-12">
        <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
        <h3 className="text-lg font-medium mb-2">No travels found</h3>
        <p className="text-muted-foreground mb-6">
          You haven't posted any travel itineraries yet.
        </p>
        <Button asChild>
          <Link to="/my-travels/new">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Post a Travel
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
          <p className="text-muted-foreground">Loading your travel plans...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <p className="text-muted-foreground">Please log in to view your travel plans.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Travel Plans</h1>
          <p className="text-muted-foreground">
            Manage your travel itineraries and delivery opportunities.
          </p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link to="/my-travels/new">
            <Plus className="h-4 w-4 mr-2" aria-hidden="true" />
            Post New Travel
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">All ({allItineraries.length})</TabsTrigger>
          <TabsTrigger value="active">Active ({activeItineraries.length})</TabsTrigger>
          <TabsTrigger value="completed">Completed ({completedItineraries.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          {allItineraries.length > 0 ? (
            <>
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {allItineraries.map(renderItineraryCard)}
              </StaggerContainer>
              {data && data.length > page * PAGE_SIZE && (
                <div ref={loadMoreRef} className="flex justify-center mt-8">
                  <Button disabled={isFetching} aria-label="Load more itineraries">
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

        <TabsContent value="active">
          {activeItineraries.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeItineraries.map(renderItineraryCard)}
            </StaggerContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No active travel plans.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed">
          {completedItineraries.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {completedItineraries.map(renderItineraryCard)}
            </StaggerContainer>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No completed travel plans.</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyTravelsPage;