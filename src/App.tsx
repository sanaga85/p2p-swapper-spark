
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import Layout from "./components/layout/Layout";

// Pages
import HomePage from "./pages/HomePage";
import SignupPage from "./pages/SignupPage";
import LoginPage from "./pages/LoginPage";
import ProfilePage from "./pages/ProfilePage";
import CreateRequestPage from "./pages/ShoppingRequests/CreateRequestPage";
import MyRequestsPage from "./pages/ShoppingRequests/MyRequestsPage";
import BrowseRequestsPage from "./pages/ShoppingRequests/BrowseRequestsPage";
import CreateTravelPage from "./pages/TravelItineraries/CreateTravelPage";
import MyTravelsPage from "./pages/TravelItineraries/MyTravelsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Layout><HomePage /></Layout>} />
            <Route path="/signup" element={<Layout><SignupPage /></Layout>} />
            <Route path="/login" element={<Layout><LoginPage /></Layout>} />
            <Route path="/browse-requests" element={<Layout><BrowseRequestsPage /></Layout>} />

            {/* Protected routes */}
            <Route path="/profile" element={<Layout requireAuth={true}><ProfilePage /></Layout>} />
            <Route path="/my-requests" element={<Layout requireAuth={true}><MyRequestsPage /></Layout>} />
            <Route path="/my-requests/new" element={<Layout requireAuth={true}><CreateRequestPage /></Layout>} />
            <Route path="/my-travels" element={<Layout requireAuth={true}><MyTravelsPage /></Layout>} />
            <Route path="/my-travels/new" element={<Layout requireAuth={true}><CreateTravelPage /></Layout>} />

            {/* Catch-all route */}
            <Route path="*" element={<Layout><NotFound /></Layout>} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
