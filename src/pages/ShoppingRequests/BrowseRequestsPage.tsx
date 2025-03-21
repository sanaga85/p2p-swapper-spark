import React, { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ShoppingRequest, shoppingRequestsApi } from '@/services/api';
import { FadeIn, StaggerContainer } from '@/components/ui/motion';
import { Calendar, DollarSign, MapPin, Search, PackageSearch, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { useToast } from '@/components/ui/use-toast';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'react-use';
import { useInView } from 'react-intersection-observer';

// Constants
const PAGE_SIZE = 12;

const BrowseRequestsPage: React.FC = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [originFilter, setOriginFilter] = useState('');
  const [destinationFilter, setDestinationFilter] = useState('');
  const [page, setPage] = useState(1);
  const [allRequests, setAllRequests] = useState<ShoppingRequest[]>([]);

  // Debounce search term
  useDebounce(() => setDebouncedSearchTerm(searchTerm), 300, [searchTerm]);

  // Infinite scroll observer
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0,
    rootMargin: '200px',
  });

  // Fetch shopping requests using React Query
  const { data, isLoading, error, isFetching } = useQuery({
    queryKey: ['shoppingRequests', debouncedSearchTerm, originFilter, destinationFilter, page],
    queryFn: async () => {
      const response = await shoppingRequestsApi.getAll({
        search: debouncedSearchTerm,
        origin: originFilter,
        destination: destinationFilter,
        page,
        pageSize: PAGE_SIZE,
      });
      return response.shopping_requests || [];
    },
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

  // Reset page when filters change
  React.useEffect(() => {
    setPage(1);
    setAllRequests([]);
  }, [debouncedSearchTerm, originFilter, destinationFilter]);

  // Handle errors
  React.useEffect(() => {
    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to load shopping requests. Please try again.',
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Memoized requests
  const requests = useMemo(() => allRequests || [], [allRequests]);

  const formatDate = useCallback((dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy');
    } catch {
      return 'Invalid Date';
    }
  }, []);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/[<>{}]/g, ''); // Sanitize input
    setSearchTerm(sanitizedValue);
  }, []);

  const handleOriginFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/[<>{}]/g, '');
    setOriginFilter(sanitizedValue);
  }, []);

  const handleDestinationFilterChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const sanitizedValue = e.target.value.replace(/[<>{}]/g, '');
    setDestinationFilter(sanitizedValue);
  }, []);

  const renderRequestCard = useCallback(
    (request: ShoppingRequest) => (
      <FadeIn key={request.id}>
        <Card className="h-full card-hover">
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <CardTitle className="text-lg font-semibold">{request.product_name}</CardTitle>
              <Badge variant="secondary">${request.reward.toFixed(2)} Reward</Badge>
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
    ),
    [formatDate]
  );

  const renderEmptyState = useCallback(
    () => (
      <div className="text-center py-12">
        <PackageSearch className="h-12 w-12 mx-auto text-muted-foreground mb-4" aria-hidden="true" />
        <p className="text-muted-foreground mb-4">No matching requests found. Try adjusting your search criteria.</p>
        <Button asChild>
          <Link to="/my-travels/new">Post Your Travel</Link>
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
          <p className="text-muted-foreground">Loading shopping requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Shopping Requests</h1>
        <p className="text-muted-foreground">
          Find shopping requests that match your travel plans and earn rewards.
        </p>
      </div>
      <div className="bg-secondary/50 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="search" className="mb-2 block">
              Search
            </Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                id="search"
                placeholder="Search by product name or category"
                value={searchTerm}
                onChange={handleSearchChange}
                className="pl-10"
                maxLength={100}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="origin" className="mb-2 block">
              Origin
            </Label>
            <Input
              id="origin"
              placeholder="e.g., Tokyo, Japan"
              value={originFilter}
              onChange={handleOriginFilterChange}
              maxLength={100}
            />
          </div>
          <div>
            <Label htmlFor="destination" className="mb-2 block">
              Your Location
            </Label>
            <Input
              id="destination"
              placeholder="e.g., London, UK"
              value={destinationFilter}
              onChange={handleDestinationFilterChange}
              maxLength={100}
            />
          </div>
        </div>
      </div>
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
    </div>
  );
};

export default BrowseRequestsPage;