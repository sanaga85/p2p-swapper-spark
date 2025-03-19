
import { toast } from "@/components/ui/use-toast";

const API_URL = "http://localhost:5000";

// Types for our API based on the OpenAPI specification
export interface User {
  id: string;
  full_name: string;
  email: string;
  phone_number?: string;
  created_at: string;
  available?: boolean;
  kyc_document_url?: string;
  avatar?: string;
  bio?: string;
  location?: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  full_name: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface ShoppingRequest {
  id?: string;
  shopper_id: string;
  product_name: string;
  category?: string;
  price: number;
  seller_location: string;
  required_by: string;
  proof_of_purchase_id?: string;
  proof_photo_id?: string;
  status?: 'pending' | 'accepted' | 'delivered' | 'completed' | 'paid';
  created_at?: string;
}

export interface TravelItinerary {
  id?: string;
  traveler_id: string;
  from_location: string;
  to_location: string;
  departure_date: string;
  arrival_date: string;
  available_space?: number;
  preferred_items?: string;
  created_at?: string;
  status?: 'active' | 'completed' | 'cancelled';
  available?: boolean;
}

export interface TravelItineraryWithScore extends TravelItinerary {
  match_score: number;
}

export interface Message {
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at?: string;
}

export interface Review {
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
}

export interface Match {
  request_id: string;
  traveler_id: string;
}

export interface AcceptRequest {
  request_id: string;
  traveler_id: string;
}

export interface DeliveryConfirmation {
  request_id: string;
  traveler_id: string;
  amount: number;
  currency?: string;
}

export interface PaymentRequest {
  amount: number;
  shopper_id: string;
  currency?: string;
}

export interface CapturePayment {
  payment_id: string;
  amount: number;
  currency?: string;
}

export interface ManualPaymentRelease {
  traveler_account_id: string;
  amount: number;
  currency?: string;
}

export interface KYCUpload {
  user_id: string;
  kyc_document_url: string;
}

export interface DeliveryProofUpload {
  request_id: string;
  proof_photo_url: string;
}

export interface ProofOfPurchaseUpload {
  request_id: string;
  proof_url: string;
}

export interface Dispute {
  request_id: string;
  user_id: string;
  reason: string;
  status?: 'open' | 'resolved';
}

export interface ResolveDispute {
  dispute_id: string;
  resolution_notes: string;
}

export interface SetAvailability {
  user_id: string;
  available: boolean;
}

export interface Notification {
  id?: string;
  user_id: string;
  message: string;
  created_at?: string;
  title?: string;
  read?: boolean;
  type?: string;
  related_id?: string;
}

export interface Payment {
  order_id: string;
  shopper_id: string;
  amount: number;
  currency: string;
  status?: 'pending' | 'captured' | 'released';
  created_at?: string;
  receipt?: string;
}

// Helper function to handle API errors
const handleApiError = (error: any) => {
  console.error('API Error:', error);
  const message = error.response?.data?.error || 'Something went wrong. Please try again.';
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
  signup: (data: SignupRequest) => 
    apiRequest('/signup', { method: 'POST', body: JSON.stringify(data) }),
  
  login: (data: LoginRequest) => 
    apiRequest('/login', { method: 'POST', body: JSON.stringify(data) }),
  
  googleAuth: () => apiRequest('/auth/google', { method: 'POST' }),
  
  facebookAuth: () => apiRequest('/auth/facebook', { method: 'POST' }),
  
  getUserProfile: (userId: string) => apiRequest(`/user-profile/${userId}`),
};

// Shopping Requests API calls
export const shoppingRequestsApi = {
  create: (data: Omit<ShoppingRequest, 'id' | 'status' | 'created_at' | 'proof_of_purchase_url' | 'proof_photo_url'>) => 
    apiRequest('/shopping-requests', { method: 'POST', body: JSON.stringify(data) }),
  
  getAll: (location?: string, category?: string) => {
    const queryParams = new URLSearchParams();
    if (location) queryParams.append('location', location);
    if (category) queryParams.append('category', category);
    
    const queryString = queryParams.toString();
    return apiRequest(`/shopping-requests${queryString ? `?${queryString}` : ''}`);
  },
  
  getByUserId: (userId: string) => apiRequest(`/my-shopping-requests/${userId}`),
  
  uploadProofOfPurchase: (data: ProofOfPurchaseUpload) => 
    apiRequest('/upload-proof-of-purchase', { method: 'POST', body: JSON.stringify(data) }),
    
  uploadDeliveryProof: (data: DeliveryProofUpload) => 
    apiRequest('/upload-delivery-proof', { method: 'POST', body: JSON.stringify(data) }),
};

// Travel Itineraries API calls
export const travelItinerariesApi = {
  create: (data: Omit<TravelItinerary, 'id' | 'status' | 'created_at'>) => 
    apiRequest('/travel-itineraries', { method: 'POST', body: JSON.stringify(data) }),
  
  getByUserId: (userId: string) => apiRequest(`/my-travel-itineraries/${userId}`),
  
  suggestTravelers: (requestId: string) => apiRequest(`/suggest-travelers/${requestId}`),
  
  setAvailability: (data: SetAvailability) => 
    apiRequest('/set-availability', { method: 'POST', body: JSON.stringify(data) }),
};

// Messages API calls
export const messagesApi = {
  send: (data: Omit<Message, 'created_at'>) => 
    apiRequest('/send-message', { method: 'POST', body: JSON.stringify(data) }),
  
  getChatHistory: (user1Id: string, user2Id: string) => 
    apiRequest(`/chat-history?user1=${user1Id}&user2=${user2Id}`),
};

// Reviews API calls
export const reviewsApi = {
  create: (data: Review) => 
    apiRequest('/post-review', { method: 'POST', body: JSON.stringify(data) }),
  
  getByUserId: (userId: string) => apiRequest(`/user-reviews/${userId}`),
  
  getTravelerRanking: (userId: string) => apiRequest(`/traveler-ranking/${userId}`),
};

// Matches API calls
export const matchesApi = {
  create: (data: Match) => 
    apiRequest('/matches', { method: 'POST', body: JSON.stringify(data) }),
  
  acceptRequest: (data: AcceptRequest) => 
    apiRequest('/accept-request', { method: 'POST', body: JSON.stringify(data) }),
  
  confirmDelivery: (data: DeliveryConfirmation) => 
    apiRequest('/confirm-delivery', { method: 'POST', body: JSON.stringify(data) }),
};

// Payments API calls
export const paymentsApi = {
  createPayment: (data: PaymentRequest) => 
    apiRequest('/create-payment', { method: 'POST', body: JSON.stringify(data) }),
  
  capturePayment: (data: CapturePayment) => 
    apiRequest('/capture-payment', { method: 'POST', body: JSON.stringify(data) }),
  
  manualReleasePayment: (data: ManualPaymentRelease) => 
    apiRequest('/auto-release-payment', { method: 'POST', body: JSON.stringify(data) }),
    
  getUserTransactions: (userId: string) => apiRequest(`/user-transactions/${userId}`),
};

// Notifications API calls
export const notificationsApi = {
  getByUserId: (userId: string) => apiRequest(`/notifications/${userId}`),
};

// KYC API calls
export const kycApi = {
  uploadKYC: (data: KYCUpload) => 
    apiRequest('/upload-kyc', { method: 'POST', body: JSON.stringify(data) }),
};

// Disputes API calls
export const disputesApi = {
  create: (data: Omit<Dispute, 'status'>) => 
    apiRequest('/raise-dispute', { method: 'POST', body: JSON.stringify(data) }),
};

// Admin API calls
export const adminApi = {
  getAllShoppingRequests: () => apiRequest('/admin/all-shopping-requests'),
  
  getIncompleteProfiles: () => apiRequest('/admin/incomplete-traveler-profiles'),
  
  getDisputes: () => apiRequest('/admin/disputes'),
  
  resolveDispute: (data: ResolveDispute) => 
    apiRequest('/admin/resolve-dispute', { method: 'POST', body: JSON.stringify(data) }),
};

export default {
  auth: authApi,
  shoppingRequests: shoppingRequestsApi,
  travelItineraries: travelItinerariesApi,
  messages: messagesApi,
  reviews: reviewsApi,
  matches: matchesApi,
  payments: paymentsApi,
  notifications: notificationsApi,
  kyc: kycApi,
  disputes: disputesApi,
  admin: adminApi,
};
