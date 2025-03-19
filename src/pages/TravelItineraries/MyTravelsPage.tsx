import React, { useEffect, useState } from 'react';
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

const MyTravelsPage: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [itineraries, setItineraries] = useState<TravelItinerary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchItineraries = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        const data = await travelItinerariesApi.getByUserId(user.id);
        if (Array.isArray(data)) {
          setItineraries(data);
        }
      } catch (error) {
        console.error('Error fetching travel itineraries:', error);
        toast({
          title: "Error",
          description: "Failed to load your travel itineraries. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchItineraries();
  }, [user, toast]);
  
  const activeItineraries = itineraries.filter(it => it.status === 'active');
  const completedItineraries = itineraries.filter(it => it.status === 'completed');
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge variant="info">Active</Badge>;
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
  
  const renderItineraryCard = (itinerary: TravelItinerary) => (
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
              <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {formatDate(itinerary.departure_date)} - {formatDate(itinerary.arrival_date)}
              </span>
            </div>
            
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
              <span>
                {itinerary.from_location} → {itinerary.to_location}
              </span>
            </div>
          </div>
          
          {itinerary.preferred_items && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {itinerary.preferred_items}
            </p>
          )}
        </CardContent>
        <CardFooter className="pt-0">
          <Button asChild variant="outline" className="w-full">
            <Link to={`/my-travels/${itinerary.id}`}>View Details</Link>
          </Button>
        </CardFooter>
      </Card>
    </FadeIn>
  );
  
  const renderEmptyState = () => (
    <div className="text-center py-12">
      <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">No travels found</h3>
      <p className="text-muted-foreground mb-6">
        You haven't posted any travel itineraries yet
      </p>
      <Button asChild>
        <Link to="/my-travels/new">
          <Plus className="h-4 w-4 mr-2" />
          Post a Travel
        </Link>
      </Button>
    </div>
  );
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading your travel plans...</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">My Travel Plans</h1>
          <p className="text-muted-foreground">
            Manage your travel itineraries and delivery opportunities
          </p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link to="/my-travels/new">
            <Plus className="h-4 w-4 mr-2" />
            Post New Travel
          </Link>
        </Button>
      </div>
      
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="all">
            All ({itineraries.length})
          </TabsTrigger>
          <TabsTrigger value="active">
            Active ({activeItineraries.length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Completed ({completedItineraries.length})
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="all">
          {itineraries.length > 0 ? (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {itineraries.map(renderItineraryCard)}
            </StaggerContainer>
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
              <p className="text-muted-foreground">No active travel plans</p>
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
              <p className="text-muted-foreground">No completed travel plans</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MyTravelsPage;
