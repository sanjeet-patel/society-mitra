export type MemberRole =
  | "platform_admin"
  | "society_admin"
  | "block_admin"
  | "owner"
  | "tenant"
  | "vendor";

export type MemberStatus = "pending" | "approved" | "rejected";

export type SocietyPlan = "free" | "starter" | "professional" | "enterprise";

export type AnnouncementCategory =
  | "water"
  | "electricity"
  | "maintenance"
  | "security"
  | "events"
  | "general";

export type EmergencyContactType = "external" | "society";

export type LegacyServiceCategorySlug =
  | "plumber"
  | "electrician"
  | "carpenter"
  | "ro_service"
  | "water_tanker"
  | "ac_repair"
  | "gas_repair"
  | "internet"
  | "pest_control";

export interface Society {
  id: string;
  name: string;
  slug: string;
  city: string | null;
  plan: SocietyPlan;
  family_limit: number | null;
  modules_enabled: Record<string, boolean>;
  show_full_phone: boolean;
  created_at: string;
  updated_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  phone: string | null;
  email: string | null;
  blood_group: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface SocietyMember {
  id: string;
  society_id: string;
  profile_id: string;
  unit_id: string | null;
  block_id: string | null;
  role: MemberRole;
  status: MemberStatus;
  tags: string[];
  created_at: string;
  updated_at: string;
}

export interface Unit {
  id: string;
  society_id: string;
  block_id: string | null;
  unit_number: string;
  floor: string | null;
  created_at: string;
}

export interface Announcement {
  id: string;
  society_id: string;
  author_id: string;
  title: string;
  body: string;
  category: AnnouncementCategory;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmergencyContact {
  id: string;
  society_id: string;
  name: string;
  phone: string;
  contact_type: EmergencyContactType;
  role_label: string | null;
  whatsapp: string | null;
  sort_order: number;
  created_at: string;
}

export type ClassifiedAdType = "sale" | "rent" | "advertise";
export type ClassifiedAdStatus = "active" | "closed" | "sold";

export interface ServiceCategory {
  id: string;
  slug: string;
  label: string;
  society_id: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface ClassifiedAd {
  id: string;
  society_id: string;
  author_id: string;
  title: string;
  description: string;
  ad_type: ClassifiedAdType;
  price: number | null;
  contact_phone: string | null;
  status: ClassifiedAdStatus;
  created_at: string;
  updated_at: string;
}

export interface ServiceProvider {
  id: string;
  society_id: string;
  profile_id: string | null;
  name: string;
  phone: string;
  category: LegacyServiceCategorySlug;
  category_id: string | null;
  description: string | null;
  short_description: string | null;
  full_description: string | null;
  service_hours: string | null;
  services_offered: string[] | null;
  is_verified: boolean;
  avg_rating: number;
  review_count: number;
  created_at: string;
}

export interface ServiceReview {
  id: string;
  provider_id: string;
  reviewer_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ServiceInquiry {
  id: string;
  provider_id: string;
  requester_id: string;
  message: string;
  status: string;
  created_at: string;
}

export interface Tenant {
  id: string;
  unit_id: string;
  society_id: string;
  full_name: string;
  phone: string | null;
  occupation: string | null;
  police_verified: boolean;
  rental_start: string | null;
  rental_end: string | null;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  profile_id: string;
  name: string;
  relation: string | null;
  age: number | null;
  created_at: string;
}

export interface Vehicle {
  id: string;
  profile_id: string;
  plate_number: string;
  vehicle_type: string | null;
  created_at: string;
}

export interface PushSubscription {
  id: string;
  profile_id: string;
  endpoint: string;
  p256dh: string;
  auth: string;
  created_at: string;
}
