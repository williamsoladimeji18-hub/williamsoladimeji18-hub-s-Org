
export const WARDROBE_LIMIT_FREE = 20;

export type SubscriptionTier = 'Free' | 'Premium' | 'Pro';

export interface ClothingItem {
  id: string;
  image: string;
  category: string; 
  color: string;
  tags: string[];
  usage_categories: string[]; 
  is_starred?: boolean;
  created_at?: string;
  last_worn_at?: string;
  wear_count?: number;
  is_placeholder?: boolean;
  brand?: string;
  price?: number; 
}

export interface RotationSession {
  id: string;
  user_id?: string;
  name: string;
  start_date: string;
  duration_weeks: number;
  plan: Record<string, PlannedDay>;
  created_at: string;
}

export interface TrendReport {
  id: string;
  title: string;
  aesthetic: string;
  description: string;
  why: string;
  keyPieces: string[];
  visualUrl?: string;
  sourceUrl?: string;
  locationContext?: string;
  relevanceScore: number;
}

export interface ShoppingRecommendation {
  item: string;
  brandSuggestion: string;
  pricePoint: string;
  retailer: string;
  purchaseUrl: string; 
  isAffiliate?: boolean;
  ethicalScore?: string; 
}

export interface MarketItem {
  name: string;
  price: string;
  link: string;
  why: string;
}

export interface MarketSuggestion {
  outfit: string;
  items: MarketItem[];
  total_cost: string;
  weather_adjust: string;
}

export interface SuggestedItem {
  category: string;
  color: string;
  description: string;
  usageCategories: string[];
}

export interface Outfit {
  id: string;
  user_id?: string;
  name: string;
  description: string;
  justification?: string; 
  items: string[]; 
  new_suggested_items?: SuggestedItem[]; 
  shopping_recommendations?: ShoppingRecommendation[]; 
  occasion: string;
  event_description?: string; 
  visual_url?: string;
  saved_at?: string;
  day?: string; 
  feedback?: 'like' | 'dislike';
  weather_impact?: string;
}

export interface PlannedDay {
  date: string; 
  eventDescription?: string;
  selectedOutfitId: string | null;
  outfitOptions: Outfit[]; 
  reminderSet: boolean;
  reminderTime?: string; 
  isPackingMode?: boolean; 
  structuredDescription?: string;
  weather?: {
    temp: number;
    apparentTemp?: number;
    condition: string;
    icon: string;
    uvIndex?: number;
    humidity?: number;
  };
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  outfit?: Outfit;
  marketSuggestions?: MarketSuggestion[];
  isGeneratingImage?: boolean;
  mode?: 'wardrobe' | 'market';
  grounding?: any[];
}

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info';
}

export type Theme = 'light' | 'dark' | 'system';

export interface StyleIndexBreakdown {
  sustainability: number; 
  cohesion: number; 
  versatility: number; 
  innovation: number; 
  rotationEfficiency: number; 
  underusedItemsCount: number;
}

export interface ActiveSession {
  id: string;
  device: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  username: string; 
  gender: string; 
  nationality?: string; 
  email: string;
  subscription_tier: SubscriptionTier;
  is_email_verified?: boolean;
  auth_methods?: ('password' | 'google' | 'apple')[];
  active_sessions?: ActiveSession[];
  avatar?: string;
  style_preferences: string[];
  preferred_style?: string; 
  favorite_colors?: string[]; 
  shoe_size?: string; 
  custom_style_labels?: string[]; 
  body_type?: string;
  skin_tone?: string; 
  undertone?: string;
  face_shape?: string;
  eye_color?: string;
  hair_color?: string;
  preferred_colors?: string[];
  height?: string;
  size_preference?: string; 
  wardrobe_goal?: string; 
  location?: string; 
  state_or_city?: string; 
  lifestyle_focus?: string; 
  cultural_identity?: string; 
  sartorial_standing?: string; 
  is_elite?: boolean; 
  style_analytics?: StyleIndexBreakdown;
  last_synced_at?: string;
  last_refined_at?: string; 
  has_seen_profile_onboarding?: boolean; 
  age?: number;
  onboarding_steps_completed?: number;
  temperature_unit?: 'C' | 'F';
  is_notifications_enabled?: boolean;
  budget_range?: string;
  budget_level?: 'Cheap' | 'Normal' | 'Premium'; 
  sustainability_goal?: string;
  fit_preference?: string;
  aesthetic_season?: string;
  hybrid_aesthetic?: string;
  hybrid_aesthetic_description?: string;
  defining_archetypes?: string[];
  proportion_rules?: string[];
  key_pieces?: string[];
  maturity_impact?: string;
  style_rules?: string[];
  lifestyle_occasions?: string[];
  lifestyle_priorities?: string[];
  last_style_choice?: string;
  last_budget_choice?: string;
  auto_sync_outfits?: boolean;
  sync_wifi_only?: boolean;
  style_sensitivity?: number; 
  suggestion_frequency?: 'Realtime' | 'Daily' | 'Weekly';
  auto_save_suggestions?: boolean;
  notify_email?: boolean;
  notify_phone?: boolean;
  notify_outfit_tips?: boolean;
  notify_reminders?: boolean;
  notify_app_updates?: boolean;
  notify_alerts?: boolean;
  larger_type_scale?: 100 | 125 | 150;
  voice_guidance?: boolean;
  high_contrast?: boolean;
  is_calendar_synced?: boolean;
}

export type ViewState = 'chat' | 'wardrobe' | 'outfits' | 'settings' | 'style-dna' | 'help-centre' | 'auth' | 'terms' | 'privacy' | 'planner' | 'onboarding' | 'maison-link' | 'analytics' | 'design-brief' | 'dev-checklist' | 'runway' | 'rotation-detail';
