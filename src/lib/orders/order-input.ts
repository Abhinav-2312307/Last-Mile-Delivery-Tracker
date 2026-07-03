import { z } from "zod";

export const PARCEL_LIMITS = {
  minimumDimensionCm: 0.1,
  maximumDimensionCm: 200,
  minimumWeightKg: 0.1,
  maximumWeightKg: 100,
} as const;

const dimension = z.coerce
  .number()
  .min(PARCEL_LIMITS.minimumDimensionCm)
  .max(PARCEL_LIMITS.maximumDimensionCm);

export const parcelSchema = z.object({
  lengthCm: dimension,
  breadthCm: dimension,
  heightCm: dimension,
  actualWeightKg: z.coerce
    .number()
    .min(PARCEL_LIMITS.minimumWeightKg)
    .max(PARCEL_LIMITS.maximumWeightKg),
});

const phoneSchema = z
  .string()
  .trim()
  .regex(/^\+?[0-9][0-9\s-]{7,18}[0-9]$/, "Enter a valid phone number.");

export const orderInputSchema = z.object({
  pickupCountryCode: z.string().trim().length(2).toUpperCase(),
  pickupStateCode: z.string().trim().min(1).max(10),
  pickupCityName: z.string().trim().min(1).max(120),
  pickupAreaId: z.string().min(1),
  pickupLine1: z.string().trim().min(1).max(160),
  pickupLine2: z.string().trim().max(160).optional().default(""),
  pickupPostalCode: z.string().trim().min(3).max(20),
  pickupContactName: z.string().trim().min(1).max(80),
  pickupContactPhone: phoneSchema,
  dropCountryCode: z.string().trim().length(2).toUpperCase(),
  dropStateCode: z.string().trim().min(1).max(10),
  dropCityName: z.string().trim().min(1).max(120),
  dropAreaId: z.string().min(1),
  dropLine1: z.string().trim().min(1).max(160),
  dropLine2: z.string().trim().max(160).optional().default(""),
  dropPostalCode: z.string().trim().min(3).max(20),
  dropContactName: z.string().trim().min(1).max(80),
  dropContactPhone: phoneSchema,
  pickupLatitude: z.coerce.number().optional(),
  pickupLongitude: z.coerce.number().optional(),
  dropLatitude: z.coerce.number().optional(),
  dropLongitude: z.coerce.number().optional(),
  ...parcelSchema.shape,
  orderType: z.enum(["B2B", "B2C"]),
  paymentType: z.enum(["PREPAID", "COD"]),
});

export type OrderInput = z.infer<typeof orderInputSchema>;
