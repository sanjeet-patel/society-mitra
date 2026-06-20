export const MEMBER_ROLES = [
  "platform_admin",
  "society_admin",
  "block_admin",
  "owner",
  "tenant",
  "vendor",
] as const;

export const RESIDENT_ROLES = ["owner", "tenant", "vendor"] as const;

export const ADMIN_ROLES = ["society_admin", "block_admin"] as const;

export const ANNOUNCEMENT_CATEGORIES = [
  { value: "water", label: "Water Supply" },
  { value: "electricity", label: "Electricity" },
  { value: "maintenance", label: "Maintenance" },
  { value: "security", label: "Security Alert" },
  { value: "events", label: "Events" },
  { value: "general", label: "General Notice" },
] as const;

export const SERVICE_CATEGORIES = [
  { value: "plumber", label: "Plumber" },
  { value: "electrician", label: "Electrician" },
  { value: "carpenter", label: "Carpenter" },
  { value: "ro_service", label: "RO Service" },
  { value: "water_tanker", label: "Water Tanker" },
  { value: "ac_repair", label: "AC Repair" },
  { value: "gas_repair", label: "Gas Repair" },
  { value: "internet", label: "Internet Provider" },
  { value: "pest_control", label: "Pest Control" },
] as const;

export const SOCIETY_PLANS = [
  { value: "free", label: "Free", familyLimit: 100 },
  { value: "starter", label: "Starter", familyLimit: 500 },
  { value: "professional", label: "Professional", familyLimit: 2000 },
  { value: "enterprise", label: "Enterprise", familyLimit: null },
] as const;

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

export const RESERVED_SLUGS = [
  "admin",
  "api",
  "auth",
  "login",
  "signup",
  "join",
  "dashboard",
  "settings",
  "www",
  "app",
  "static",
  "sw.js",
  "manifest.json",
] as const;

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function maskPhone(phone: string): string {
  if (phone.length < 4) return phone;
  const visible = phone.slice(-4);
  return `${phone.slice(0, 2)}****${visible}`;
}

export function getPlanFamilyLimit(plan: string): number | null {
  const found = SOCIETY_PLANS.find((p) => p.value === plan);
  return found?.familyLimit ?? 100;
}
