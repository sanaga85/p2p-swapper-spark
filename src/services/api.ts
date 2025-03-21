import { toast } from "@/components/ui/use-toast";

// Define the API URL based on the environment
const API_URL = import.meta.env.VITE_API_URL;
if (!API_URL) {
  throw new Error("VITE_API_URL is not defined! Please set it in your .env file");
}

// Simple in-memory cache for frequently accessed data
const cache: { [key: string]: { data: any; timestamp: number; ttl: number } } = {};

// Helper function to manage cache
const getFromCache = (key: string) => {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  return null;
};

const setInCache = (key: string, data: any, ttl: number = 5 * 60 * 1000) => { // Default TTL: 5 minutes
  cache[key] = { data, timestamp: Date.now(), ttl };
};

// Types for API responses and requests
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

export interface SignupResponse {
  message: string;
  user_id: string;
}

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user_id: string;
  email: string;
}

export interface ShoppingRequest {
  $id: string;
  requester_id: string;
  product_name: string;
  category: string;
  price: number;
  seller_location: string;
  required_by: string;
  description?: string;
  product_url?: string;
  delivery_instructions?: string;
  reward: number;
  image_url?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  proof_of_purchase_url?: string;
  proof_photo_url?: string;
  traveler_id?: string;
}

export interface TravelItinerary {
  $id: string;
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
  $id: string;
  sender_id: string;
  receiver_id: string;
  content: string;
  created_at: string;
}

export interface Review {
  $id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment?: string;
  created_at: string;
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
  kyc_document: File;
}

export interface DeliveryProofUpload {
  request_id: string;
  proof_photo: File;
}

export interface ProofOfPurchaseUpload {
  request_id: string;
  proof_file: File;
}

export interface Dispute {
  $id: string;
  request_id: string;
  user_id: string;
  reason: string;
  status: 'open' | 'resolved';
  created_at: string;
  resolution_notes?: string;
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
  $id: string;
  user_id: string;
  message: string;
  created_at: string;
}

export interface Payment {
  $id: string;
  order_id: string;
  shopper_id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'captured';
}

export interface AnalyticsEvent {
  event_type: string;
  user_id: string | null;
  details: Record<string, any>;
  timestamp?: string;
}

export interface LocationSuggestion {
  name: string;
  country: string;
}

// Helper function to handle API errors
const handleApiError = (error: any): Promise<never> => {
  let message = 'Something went wrong. Please try again.';
  let status: number | undefined;

  if (error.status) {
    status = error.status;
    switch (status) {
      case 401:
        message = 'Unauthorized. Please log in again.';
        // Optionally trigger a logout or redirect to login
        break;
      case 403:
        message = 'Forbidden. You do not have permission to perform this action.';
        break;
      case 429:
        message = 'Too many requests. Please try again later.';
        break;
      case 400:
        message = error.message || 'Invalid request. Please check your input.';
        break;
      case 500:
      case 502:
      case 503:
      case 504:
        message = 'Server error. Please try again later.';
        break;
      default:
        message = error.message || 'An unexpected error occurred.';
    }
  } else if (error.name === 'AbortError') {
    message = 'Request timed out. Please try again.';
    status = 504;
  } else if (error.message) {
    message = error.message;
  }

  // Log the error for debugging (in production, this could be sent to a logging service)
  console.error(`API Error: ${message}`, { status, error });

  toast({
    title: "Error",
    description: message,
    variant: "destructive",
  });

  return Promise.reject({ status, message });
};

// API request handler with error handling, retries, and cookie-based authentication
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {},
  retries = 3,
  timeout = 10000
): Promise<T> => {
  const url = `${API_URL}${endpoint}`;
  const cacheKey = `${options.method || 'GET'}:${url}`;

  // Check cache for GET requests
  if (options.method === 'GET' || !options.method) {
    const cachedData = getFromCache(cacheKey);
    if (cachedData) {
      console.debug(`Cache hit for ${cacheKey}`);
      return cachedData;
    }
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include', // Include cookies for authentication
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      if (response.status === 429 && retries > 0) {
        // Rate limited, retry with exponential backoff
        const delay = 1000 * Math.pow(2, 3 - retries); // Exponential backoff: 1000ms, 2000ms, 4000ms
        console.debug(`Rate limited, retrying after ${delay}ms... (${retries} retries left)`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        return apiRequest<T>(endpoint, options, retries - 1, timeout);
      }

      let errorResponse;
      try {
        errorResponse = await response.json();
      } catch (e) {
        errorResponse = { error: response.statusText };
      }

      throw { status: response.status, message: errorResponse.error || response.statusText };
    }

    const data = await response.json();

    // Cache GET requests
    if (options.method === 'GET' || !options.method) {
      setInCache(cacheKey, data);
    }

    return data;
  } catch (error: any) {
    return handleApiError(error);
  }
};

// API Endpoints

// Locations API
export const locationsApi = {
  getSuggestions: (query: string, signal?: AbortSignal): Promise<LocationSuggestion[]> =>
    apiRequest(`/api/locations?query=${encodeURIComponent(query)}`, { method: 'GET', signal }),
};

// Auth API
export const authApi = {
  signup: (data: SignupRequest): Promise<SignupResponse> =>
    apiRequest('/signup', { method: 'POST', body: JSON.stringify(data) }),

  login: (data: LoginRequest): Promise<LoginResponse> =>
    apiRequest('/login', { method: 'POST', body: JSON.stringify(data) }),

  googleAuth: (): Promise<{ url: string }> =>
    apiRequest('/auth/google', { method: 'GET' }),

  facebookAuth: (): Promise<{ url: string }> =>
    apiRequest('/auth/facebook', { method: 'GET' }),

  getUserProfile: (userId: string, signal?: AbortSignal): Promise<User> =>
    apiRequest(`/user-profile/${userId}`, { method: 'GET', signal }),

  updateProfile: (userId: string, data: Partial<User>): Promise<User> =>
    apiRequest(`/user-profile/${userId}`, { method: 'PUT', body: JSON.stringify(data) }),

  uploadAvatar: (userId: string, avatar: File): Promise<{ avatar_url: string }> => {
    const formData = new FormData();
    formData.append('avatar', avatar);
    return apiRequest(`/user-profile/${userId}/avatar`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let the browser set the Content-Type with the correct boundary
    });
  },
};

// Shopping Requests API
export const shoppingRequestsApi = {
  getAll: (params: {
    search?: string;
    origin?: string;
    destination?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ shopping_requests: ShoppingRequest[] }> => {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.origin) query.append('origin', params.origin);
    if (params.destination) query.append('destination', params.destination);
    if (params.page) query.append('page', params.page.toString());
    if (params.pageSize) query.append('pageSize', params.pageSize.toString());
    return apiRequest(`/shopping-requests?${query.toString()}`, { method: 'GET' });
  },

  create: (data: Omit<ShoppingRequest, '$id' | 'status' | 'created_at' | 'updated_at' | 'proof_of_purchase_url' | 'proof_photo_url' | 'traveler_id'>): Promise<{ message: string; request_id: string }> =>
    apiRequest('/shopping-requests', { method: 'POST', body: JSON.stringify(data) }),

  getByUserId: (userId: string): Promise<{ shopping_requests: ShoppingRequest[] }> =>
    apiRequest(`/my-shopping-requests/${userId}`, { method: 'GET' }),

  uploadProofOfPurchase: (data: ProofOfPurchaseUpload): Promise<{ message: string; file_url: string }> => {
    const formData = new FormData();
    formData.append('request_id', data.request_id);
    formData.append('proof_file', data.proof_file);
    return apiRequest('/upload-proof-of-purchase', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },

  uploadDeliveryProof: (data: DeliveryProofUpload): Promise<{ message: string; file_url: string }> => {
    const formData = new FormData();
    formData.append('request_id', data.request_id);
    formData.append('proof_photo', data.proof_photo);
    return apiRequest('/upload-delivery-proof', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
};

// Travel Itineraries API
export const travelItinerariesApi = {
  create: (data: Omit<TravelItinerary, '$id' | 'status' | 'created_at'>): Promise<{ message: string; itinerary: TravelItinerary }> =>
    apiRequest('/travel-itineraries', { method: 'POST', body: JSON.stringify(data) }),

  update: (itineraryId: string, data: Partial<TravelItinerary>): Promise<{ message: string; itinerary: TravelItinerary }> =>
    apiRequest(`/travel-itineraries/${itineraryId}`, { method: 'PATCH', body: JSON.stringify(data) }),

  getByUserId: (userId: string): Promise<{ travel_itineraries: TravelItinerary[] }> =>
    apiRequest(`/travel-itineraries/user/${userId}`, { method: 'GET' }),

  suggestTravelers: (requestId: string): Promise<{ suggested_travelers: TravelItineraryWithScore[] }> =>
    apiRequest(`/suggest-travelers/${requestId}`, { method: 'GET' }),

  setAvailability: (data: SetAvailability): Promise<{ message: string }> =>
    apiRequest('/set-availability', { method: 'POST', body: JSON.stringify(data) }),
};

// Messages API
export const messagesApi = {
  send: (data: Omit<Message, '$id' | 'created_at'>): Promise<{ message: string; data: Message }> =>
    apiRequest('/send-message', { method: 'POST', body: JSON.stringify(data) }),

  getChatHistory: (user1Id: string, user2Id: string): Promise<{ chat: Message[] }> =>
    apiRequest(`/chat-history?user1=${user1Id}&user2=${user2Id}`, { method: 'GET' }),
};

// Reviews API
export const reviewsApi = {
  create: (data: Review): Promise<{ message: string; review_id: string }> =>
    apiRequest('/post-review', { method: 'POST', body: JSON.stringify(data) }),

  getByUserId: (userId: string): Promise<{ reviews: Review[] }> =>
    apiRequest(`/user-reviews/${userId}`, { method: 'GET' }),

  getTravelerRanking: (userId: string): Promise<{ user_id: string; average_rating: number; review_count: number }> =>
    apiRequest(`/traveler-ranking/${userId}`, { method: 'GET' }),
};

// Matches API
export const matchesApi = {
  create: (data: Match): Promise<{ request_id: string; traveler_id: string }> =>
    apiRequest('/matches', { method: 'POST', body: JSON.stringify(data) }),

  acceptRequest: (data: AcceptRequest): Promise<{ message: string }> =>
    apiRequest('/accept-request', { method: 'POST', body: JSON.stringify(data) }),

  confirmDelivery: (data: DeliveryConfirmation): Promise<{ message: string }> =>
    apiRequest('/confirm-delivery', { method: 'POST', body: JSON.stringify(data) }),
};

// Payments API
export const paymentsApi = {
  createPayment: (data: PaymentRequest): Promise<{ order_id: string }> =>
    apiRequest('/create-payment', { method: 'POST', body: JSON.stringify(data) }),

  capturePayment: (data: CapturePayment): Promise<{ message: string }> =>
    apiRequest('/capture-payment', { method: 'POST', body: JSON.stringify(data) }),

  manualReleasePayment: (data: ManualPaymentRelease): Promise<{ message: string; transfer: any }> =>
    apiRequest('/auto-release-payment', { method: 'POST', body: JSON.stringify(data) }),

  getUserTransactions: (userId: string): Promise<{ transactions: Payment[] }> =>
    apiRequest(`/user-transactions/${userId}`, { method: 'GET' }),
};

// Notifications API
export const notificationsApi = {
  getByUserId: (userId: string): Promise<Notification[]> =>
    apiRequest(`/notifications/${userId}`, { method: 'GET' }),
};

// KYC API
export const kycApi = {
  uploadKYC: (data: KYCUpload): Promise<{ message: string; kyc_document_url: string }> => {
    const formData = new FormData();
    formData.append('user_id', data.user_id);
    formData.append('kyc_document', data.kyc_document);
    return apiRequest('/kyc', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
};

// Disputes API
export const disputesApi = {
  create: (data: Omit<Dispute, '$id' | 'status' | 'created_at' | 'resolution_notes'>): Promise<{ message: string; dispute_id: string }> =>
    apiRequest('/raise-dispute', { method: 'POST', body: JSON.stringify(data) }),
};

// Admin API
export const adminApi = {
  getAllShoppingRequests: (): Promise<{ all_requests: ShoppingRequest[] }> =>
    apiRequest('/admin/all-shopping-requests', { method: 'GET' }),

  getIncompleteProfiles: (): Promise<{ incomplete_profiles: { id: string; full_name: string; email: string }[] }> =>
    apiRequest('/admin/incomplete-traveler-profiles', { method: 'GET' }),

  getDisputes: (): Promise<{ disputes: Dispute[] }> =>
    apiRequest('/admin/disputes', { method: 'GET' }),

  resolveDispute: (data: ResolveDispute): Promise<{ message: string }> =>
    apiRequest('/admin/resolve-dispute', { method: 'POST', body: JSON.stringify(data) }),
};

// Analytics API
export const analyticsApi = {
  trackEvent: (data: Omit<AnalyticsEvent, 'timestamp'>): Promise<{ message: string }> =>
    apiRequest('/analytics/track', { method: 'POST', body: JSON.stringify(data) }),
};

// File Upload API
export const fileApi = {
  upload: (file: File): Promise<{ url: string }> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiRequest('/upload', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  },
};

export default {
  locations: locationsApi,
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
  analytics: analyticsApi,
  file: fileApi,
};