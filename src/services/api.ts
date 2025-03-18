
import { toast } from "@/components/ui/use-toast";

const API_URL = "http://localhost:5000";

// Types for our API
export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  location?: string;
  phone?: string;
}

export interface ShoppingRequest {
  id: string;
  user_id: string;
  item_name: string;
  item_description: string;
  item_url?: string;
  item_price: number;
  delivery_by_date: string;
  shipping_from: string;
  shipping_to: string;
  reward_amount: number;
  status: 'open' | 'matched' | 'in_progress' | 'completed' | 'cancelled';
  created_at: string;
}

export interface TravelItinerary {
  id: string;
  user_id: string;
  departure_location: string;
  arrival_location: string;
  departure_date: string;
  arrival_date: string;
  notes?: string;
  status: 'active' | 'completed' | 'cancelled';
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'match' | 'request' | 'payment' | 'system';
  related_id?: string;
  created_at: string;
}

export interface PaymentOrder {
  id: string;
  amount: number;
  currency: string;
  receipt?: string;
  order_id: string;
}

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  const message = error.response?.data?.message || 'Something went wrong. Please try again.';
  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });
  return Promise.reject(error);
};

// API request handler
const apiRequest = async (endpoint: string, options?: RequestInit) => {
  try {
    const token = localStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...(options?.headers || {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json();
      throw error;
    }

    return await response.json();
  } catch (error) {
    return handleApiError(error);
  }
};

// Auth API calls
export const authApi = {
  signup: (data: { name: string; email: string; password: string }) => 
    apiRequest('/signup', { method: 'POST', body: JSON.stringify(data) }),
  
  login: (data: { email: string; password: string }) => 
    apiRequest('/login', { method: 'POST', body: JSON.stringify(data) }),
  
  googleAuth: () => apiRequest('/auth/google', { method: 'POST' }),
  
  facebookAuth: () => apiRequest('/auth/facebook', { method: 'POST' }),
  
  getUserProfile: (userId: string) => apiRequest(`/user-profile/${userId}`),
};

// Shopping Requests API calls
export const shoppingRequestsApi = {
  create: (data: Omit<ShoppingRequest, 'id' | 'status' | 'created_at'>) => 
    apiRequest('/shopping-requests', { method: 'POST', body: JSON.stringify(data) }),
  
  getByUserId: (userId: string) => apiRequest(`/my-shopping-requests/${userId}`),
};

// Travel Itineraries API calls
export const travelItinerariesApi = {
  create: (data: Omit<TravelItinerary, 'id' | 'status' | 'created_at'>) => 
    apiRequest('/travel-itineraries', { method: 'POST', body: JSON.stringify(data) }),
  
  getByUserId: (userId: string) => apiRequest(`/my-travel-itineraries/${userId}`),
};

// Matches API calls
export const matchesApi = {
  create: (data: { request_id: string; itinerary_id: string }) => 
    apiRequest('/matches', { method: 'POST', body: JSON.stringify(data) }),
  
  acceptRequest: (data: { match_id: string; traveler_id: string }) => 
    apiRequest('/accept-request', { method: 'POST', body: JSON.stringify(data) }),
};

// Notifications API calls
export const notificationsApi = {
  getByUserId: (userId: string) => apiRequest(`/notifications/${userId}`),
};

// Payments API calls
export const paymentsApi = {
  createPayment: (data: { amount: number; currency: string; receipt?: string }) => 
    apiRequest('/create-payment', { method: 'POST', body: JSON.stringify(data) }),
  
  capturePayment: (data: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => 
    apiRequest('/capture-payment', { method: 'POST', body: JSON.stringify(data) }),
};

export default {
  auth: authApi,
  shoppingRequests: shoppingRequestsApi,
  travelItineraries: travelItinerariesApi,
  matches: matchesApi,
  notifications: notificationsApi,
  payments: paymentsApi,
};
