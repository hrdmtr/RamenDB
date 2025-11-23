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
  // SUUMOライク検索機能用フィールド
  priceRange?: '~700' | '700-900' | '900-1200' | '1200~'; // 価格帯
  isMorningRamen: boolean;                                 // 朝ラー対応フラグ
  thumbnailUrl?: string;                                   // サムネイル画像URL
  avgFlavorRichness?: number;                              // 味の濃さ平均（0-10）
  features?: Feature[];                                    // 店舗特徴（券売機、駐車場など）
  reviews?: Review[];                                      // レビュー（画像取得用）
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
  score: number; // 5軸の平均（自動計算）

  // レビュータイプ
  reviewType: 'quick' | 'detailed'; // 簡易評価 or 本気レビュー

  // 5軸評価（必須）
  scoreTaste: number;        // 味（0.0〜10.0）
  scorePortion: number;      // 量（0.0〜10.0）
  scorePrice: number;        // 価格/コスパ（0.0〜10.0）
  scoreService: number;      // 接客（0.0〜10.0）
  scoreCleanliness: number;  // 衛生（0.0〜10.0）

  // コメント（簡易評価=任意、本気レビュー=必須）
  comment?: string;

  // 本気レビューのみ
  visitDate?: string;
  images?: string[];
  review_images?: ReviewImage[];     // レビュー画像（Supabaseリレーション用）

  createdAt: string;
  updatedAt: string;
}

// Review Image types
export interface ReviewImage {
  id: string;
  reviewId: string;
  imageUrl: string;
  caption?: string;
  createdAt: string;
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

// Feature types (店舗特徴)
export interface Feature {
  id: string;
  name: string;
  category: 'service' | 'facility' | 'atmosphere';
  description?: string;
  createdAt: string;
  updatedAt: string;
}
