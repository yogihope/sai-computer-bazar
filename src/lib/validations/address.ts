import { z } from "zod";

export const addressSchema = z.object({
  label: z
    .string()
    .min(1, "Label is required")
    .max(50, "Label must be less than 50 characters")
    .default("Home"),
  fullName: z
    .string()
    .min(1, "Full name is required")
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name must be less than 100 characters"),
  mobile: z
    .string()
    .min(1, "Mobile number is required")
    .regex(/^[6-9]\d{9}$/, "Please enter a valid 10-digit mobile number"),
  addressLine1: z
    .string()
    .min(1, "Address is required")
    .min(10, "Please enter a complete address")
    .max(200, "Address must be less than 200 characters"),
  addressLine2: z
    .string()
    .max(200, "Address line 2 must be less than 200 characters")
    .optional()
    .nullable(),
  landmark: z
    .string()
    .max(100, "Landmark must be less than 100 characters")
    .optional()
    .nullable(),
  city: z
    .string()
    .min(1, "City is required")
    .min(2, "City name must be at least 2 characters")
    .max(100, "City must be less than 100 characters"),
  state: z
    .string()
    .min(1, "State is required")
    .min(2, "State name must be at least 2 characters")
    .max(100, "State must be less than 100 characters"),
  pincode: z
    .string()
    .min(1, "Pincode is required")
    .regex(/^\d{6}$/, "Please enter a valid 6-digit pincode"),
  country: z.string().default("India"),
  isDefault: z.boolean().default(false),
});

export type AddressInput = z.infer<typeof addressSchema>;
