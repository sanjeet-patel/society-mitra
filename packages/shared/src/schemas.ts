import { z } from "zod";

export const createSocietySchema = z.object({
  name: z.string().min(2).max(100),
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  city: z.string().min(2).max(100).optional(),
  plan: z.enum(["free", "starter", "professional", "enterprise"]).default("free"),
});

export const updateSocietySchema = z.object({
  name: z.string().min(2).max(100),
  city: z.string().max(100).optional().or(z.literal("")),
  plan: z.enum(["free", "starter", "professional", "enterprise"]),
});

const mobileField = z
  .string()
  .min(1, "Mobile number is required")
  .refine((value) => {
    const normalized = value.replace(/\D/g, "");
    const mobile =
      normalized.length === 12 && normalized.startsWith("91")
        ? normalized.slice(2)
        : normalized.length === 10
          ? normalized
          : null;
    return mobile !== null && /^[6-9]\d{9}$/.test(mobile);
  }, "Enter a valid 10-digit mobile number");

export const provisionMemberSchema = z.object({
  mobile: mobileField,
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().min(2).max(100),
  unitNumber: z.string().max(20).optional().or(z.literal("")),
  role: z.enum(["society_admin", "block_admin", "owner", "tenant", "vendor"]).default("owner"),
  tags: z.preprocess(parseMemberTagsInput, z.array(z.string().min(1).max(50)).max(5)).optional(),
});

export function parseMemberTagsInput(value: unknown): string[] {
  if (value === null || value === undefined) return [];
  if (typeof value !== "string") return [];

  const trimmed = value.trim();
  if (!trimmed) return [];

  try {
    const parsed = JSON.parse(trimmed);
    if (Array.isArray(parsed)) {
      return parsed
        .filter((tag): tag is string => typeof tag === "string")
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0 && tag.length <= 50)
        .slice(0, 5);
    }
  } catch {
    return trimmed
      .split(",")
      .map((tag) => tag.trim())
      .filter((tag) => tag.length > 0 && tag.length <= 50)
      .slice(0, 5);
  }

  return [];
}

export const updateMemberSchema = z.object({
  role: z.enum(["society_admin", "block_admin", "owner", "tenant", "vendor"]),
  unitNumber: z.string().max(20).optional().or(z.literal("")),
  status: z.enum(["approved", "rejected", "pending"]).optional(),
  tags: z.preprocess(parseMemberTagsInput, z.array(z.string().min(1).max(50)).max(5)).optional(),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(6),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "Password must be at least 6 characters"),
});

export const joinSocietySchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15).optional(),
  unitNumber: z.string().min(1).max(20),
  role: z.enum(["owner", "tenant", "vendor"]).default("owner"),
});

export const profileSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15).optional(),
  email: z.string().email().optional().or(z.literal("")),
  bloodGroup: z.string().optional(),
});

export const announcementSchema = z.object({
  title: z.string().min(2).max(200),
  body: z.string().min(2).max(5000),
  category: z.enum([
    "water",
    "electricity",
    "maintenance",
    "security",
    "events",
    "general",
  ]),
  isPinned: z.boolean().default(false),
});

export const emergencyContactSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(5).max(20),
  contactType: z.enum(["external", "society"]),
  roleLabel: z.string().max(50).optional(),
  whatsapp: z.string().max(20).optional(),
  sortOrder: z.number().int().min(0).default(0),
});

export const serviceProviderSchema = z.object({
  name: z.string().min(2).max(100),
  phone: z.string().min(5).max(20),
  categoryId: z.string().uuid(),
  shortDescription: z.string().max(160).optional(),
  fullDescription: z.string().max(3000).optional(),
  serviceHours: z.string().max(200).optional(),
  servicesOffered: z.string().max(500).optional(),
});

export const serviceCategorySchema = z.object({
  slug: z
    .string()
    .min(2)
    .max(50)
    .regex(/^[a-z0-9_]+$/, "Use lowercase letters, numbers, and underscores"),
  label: z.string().min(2).max(100),
  sortOrder: z.number().int().min(0).default(0),
});

export const classifiedAdSchema = z.object({
  title: z.string().min(3).max(200),
  description: z.string().min(10).max(5000),
  adType: z.enum(["sale", "rent", "advertise"]),
  price: z.string().optional(),
  contactPhone: z.string().min(10).max(15).optional(),
});

export const serviceReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const serviceInquirySchema = z.object({
  message: z.string().min(5).max(500),
});

export const tenantSchema = z.object({
  fullName: z.string().min(2).max(100),
  phone: z.string().min(10).max(15).optional(),
  occupation: z.string().max(100).optional(),
  policeVerified: z.boolean().default(false),
  rentalStart: z.string().optional(),
  rentalEnd: z.string().optional(),
});

export const familyMemberSchema = z.object({
  name: z.string().min(1).max(100),
  relation: z.string().max(50).optional(),
  age: z.number().int().min(0).max(150).optional(),
});

export const vehicleSchema = z.object({
  plateNumber: z.string().min(2).max(20),
  vehicleType: z.string().max(50).optional(),
});

export const loginSchema = z.object({
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .refine((value) => {
      const normalized = value.replace(/\D/g, "");
      const mobile =
        normalized.length === 12 && normalized.startsWith("91")
          ? normalized.slice(2)
          : normalized.length === 10
            ? normalized
            : null;
      return mobile !== null && /^[6-9]\d{9}$/.test(mobile);
    }, "Enter a valid 10-digit mobile number"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const signupSchema = loginSchema.extend({
  fullName: z.string().min(2, "Name must be at least 2 characters").max(100),
  confirmPassword: z.string().min(6),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export type CreateSocietyInput = z.infer<typeof createSocietySchema>;
export type JoinSocietyInput = z.infer<typeof joinSocietySchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;
export type ServiceProviderInput = z.infer<typeof serviceProviderSchema>;
