import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner'; // Use sonner for toasts
import { TooltipProvider } from '@/components/ui/tooltip';
import { AuthProvider, useAuth } from '@/context/AuthContext'; // Updated context
import Layout from '@/components/layout/Layout';
import { HelmetProvider } from 'react-helmet-async';
import { Loader2 } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'));
const SignupPage = lazy(() => import('./pages/SignupPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const CreateRequestPage = lazy(() => import('./pages/ShoppingRequests/CreateRequestPage'));
const MyRequestsPage = lazy(() => import('./pages/ShoppingRequests/MyRequestsPage'));
const BrowseRequestsPage = lazy(() => import('./pages/ShoppingRequests/BrowseRequestsPage'));
const CreateTravelPage = lazy(() => import('./pages/TravelItineraries/CreateTravelPage'));
const MyTravelsPage = lazy(() => import('./pages/TravelItineraries/MyTravelsPage'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Index = lazy(() => import('./pages/Index'));

// Configure QueryClient with default options
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error: any) => {
        if (error.status === 401 || error.status === 403) return false;
        return failureCount < 3;
      },
      refetchOnWindowFocus: false,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: window.location.pathname }} />;
  }

  return <>{children}</>;
};

// Main App Component
const App: React.FC = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <ErrorBoundary>
              <Suspense
                fallback={
                  <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                  </div>
                }
              >
                <Routes>
                  <Route path="/" element={<Layout><Index /></Layout>} />
                  <Route path="/index" element={<Navigate to="/" replace />} />
                  <Route path="/home" element={<Layout><HomePage /></Layout>} />
                  <Route path="/signup" element={<Layout><SignupPage /></Layout>} />
                  <Route path="/login" element={<Layout><LoginPage /></Layout>} />
                  <Route path="/browse-requests" element={<Layout><BrowseRequestsPage /></Layout>} />
                  <Route
                    path="/profile"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <ProfilePage />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="/my-requests"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <MyRequestsPage />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="/my-requests/new"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <CreateRequestPage />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="/my-travels"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <MyTravelsPage />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route
                    path="/my-travels/new"
                    element={
                      <Layout>
                        <ProtectedRoute>
                          <CreateTravelPage />
                        </ProtectedRoute>
                      </Layout>
                    }
                  />
                  <Route path="*" element={<Layout><NotFound /></Layout>} />
                </Routes>
              </Suspense>
            </ErrorBoundary>
            <Toaster />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;