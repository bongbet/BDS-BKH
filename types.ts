export enum UserRole {
  BUYER = 'buyer',
  AGENT = 'agent',
  ADMIN = 'admin', // Added for potential future expansion
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  avatarUrl: string;
  password?: string; // Only for internal use in auth service, not exposed in UI models
}

export enum ListingType {
  SALE = 'sale',
  RENT = 'rent',
}

export enum PropertyType {
  APARTMENT = 'apartment',
  HOUSE = 'house',
  LAND = 'land',
  OFFICE = 'office',
  SHOPHOUSE = 'shophouse',
  VILLA = 'villa',
}

export enum ListingStatus {
  ACTIVE = 'active',
  SOLD = 'sold',
  RENTED = 'rented',
  EXPIRED = 'expired',
}

export interface Coords {
  lat: number;
  lng: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  priceUnit: string; // E.g., 'VND', 'USD', '/tháng'
  type: ListingType; // sale / rent
  propertyType: PropertyType;
  area: number; // m2
  bedrooms: number;
  bathrooms: number;
  address: string;
  district: string;
  city: string;
  coords: Coords;
  images: string[]; // Array of image URLs (base64 encoded for simulation)
  postedByUserId: string;
  postedAt: string; // ISO date string
  status: ListingStatus;
  views: number;
  contactClicks: number;
  isHidden: boolean; // Added for admin moderation to hide/show listings
}

export interface Agent {
  id: string;
  name: string;
  phone: string;
  email: string;
  logoUrl: string; // Agent company logo
  agentUserId: string; // Link to User ID
  rating: number; // 0-5
  totalListings: number;
}

export interface Favorite {
  id: string;
  userId: string;
  listingId: string;
  createdAt: string; // ISO date string
}

export interface SavedSearch {
  id: string;
  userId: string;
  name: string;
  filters: ListingFilters; // JSON string or object for search criteria
  createdAt: string; // ISO date string
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  timestamp: string; // ISO date string
}

export interface Conversation {
  id: string; // conversationId
  participants: string[]; // Array of user IDs
  messages: Message[];
  lastMessageAt: string; // ISO date string of the last message
}

// Filters for listing search
export interface ListingFilters {
  type?: ListingType;
  propertyType?: PropertyType;
  minPrice?: number;
  maxPrice?: number;
  minArea?: number;
  maxArea?: number;
  bedrooms?: number;
  district?: string;
  city?: string;
  searchQuery?: string;
  includeHidden?: boolean; // Added filter to include hidden listings for admin
}

export interface PasswordResetToken {
  id: string; // Unique ID for the token entry
  userId: string;
  token: string; // The actual reset token (e.g., UUID)
  expiresAt: string; // ISO date string when the token expires
}

export interface AuthContextType {
  user: User | null;
  // FIX: Changed return types to Promise<User | null> for login and signup to match implementation
  login: (email: string, password: string) => Promise<User | null>;
  signup: (name: string, email: string, phone: string, password: string, role?: UserRole) => Promise<User | null>;
  logout: () => Promise<boolean>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<boolean>; // New: for changing user's password
  requestPasswordReset: (email: string) => Promise<{ success: boolean; message?: string }>; // New: for requesting password reset
  resetPassword: (token: string, newPassword: string) => Promise<{ success: boolean; message?: string }>; // New: for resetting password with token
  loading: boolean;
}

export interface ChatMessageDisplay {
  id: string;
  senderName: string;
  text: string;
  timestamp: string;
  isCurrentUser: boolean;
}

export interface ConversationDisplay {
  id: string;
  otherParticipantName: string;
  lastMessageText: string;
  lastMessageAt: string;
  otherParticipantAvatar: string;
}