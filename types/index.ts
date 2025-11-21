// Restaurant types
export interface Restaurant {
  id: string;
  name: string;
  nameKana: string;
  categories: string[];
  tags: string[];
  address: string;
  latitude?: number;
  longitude?: number;
  nearestStation?: string;
  railway?: string;
  phoneNumber?: string;
  businessHours?: BusinessHours[];
  closedDays?: string[];
  seatingCapacity?: SeatingCapacity;
  parking?: ParkingInfo;
  website?: string;
  socialLinks?: SocialLinks;
  notes?: string;
  profileDescription?: string;
  averageScore: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessHours {
  dayOfWeek: string;
  openTime: string;
  closeTime: string;
}

export interface SeatingCapacity {
  counter?: number;
  table?: number;
}

export interface ParkingInfo {
  available: boolean;
  capacity?: number;
  notes?: string;
}

export interface SocialLinks {
  twitter?: string;
  instagram?: string;
  facebook?: string;
}

// Review types
export interface Review {
  id: string;
  restaurantId: string;
  userId: string;
  score: number;
  comment: string;
  visitDate?: string;
  images?: string[];
  createdAt: string;
  updatedAt: string;
}

// User types
export interface User {
  id: string;
  username: string;
  email: string;
  displayName?: string;
  avatarUrl?: string;
  reviewerScore?: number;
  createdAt: string;
  updatedAt: string;
}

// Category/Tag types
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
}

export interface Tag {
  id: string;
  name: string;
  slug: string;
  description?: string;
}
