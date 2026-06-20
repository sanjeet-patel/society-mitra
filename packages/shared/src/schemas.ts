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
  category: z.enum([
    "plumber",
    "electrician",
    "carpenter",
    "ro_service",
    "water_tanker",
    "ac_repair",
    "gas_repair",
    "internet",
    "pest_control",
  ]),
  description: z.string().max(500).optional(),
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
  email: z.string().email(),
});

export const otpSchema = z.object({
  email: z.string().email(),
  token: z.string().length(6),
});

export type CreateSocietyInput = z.infer<typeof createSocietySchema>;
export type JoinSocietyInput = z.infer<typeof joinSocietySchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type AnnouncementInput = z.infer<typeof announcementSchema>;
export type EmergencyContactInput = z.infer<typeof emergencyContactSchema>;
export type ServiceProviderInput = z.infer<typeof serviceProviderSchema>;
