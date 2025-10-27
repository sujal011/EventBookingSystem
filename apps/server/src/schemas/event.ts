import { z } from "zod";

// Base event schema for validation
export const createEventSchema = z.object({
  name: z.string()
    .min(1, "Event name is required")
    .max(255, "Event name must be less than 255 characters")
    .trim(),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),
  eventDate: z.string()
    .datetime("Invalid date format. Use ISO 8601 format")
    .refine((date) => new Date(date) > new Date(), {
      message: "Event date must be in the future"
    }),
  seatCapacity: z.number()
    .int("Seat capacity must be an integer")
    .min(1, "Seat capacity must be at least 1")
    .max(10000, "Seat capacity cannot exceed 10,000")
});

// Update event schema (allows partial updates)
export const updateEventSchema = z.object({
  name: z.string()
    .min(1, "Event name is required")
    .max(255, "Event name must be less than 255 characters")
    .trim()
    .optional(),
  description: z.string()
    .max(1000, "Description must be less than 1000 characters")
    .optional()
    .nullable(),
  eventDate: z.string()
    .datetime("Invalid date format. Use ISO 8601 format")
    .refine((date) => new Date(date) > new Date(), {
      message: "Event date must be in the future"
    })
    .optional(),
  seatCapacity: z.number()
    .int("Seat capacity must be an integer")
    .min(1, "Seat capacity must be at least 1")
    .max(10000, "Seat capacity cannot exceed 10,000")
    .optional()
});

// Event query parameters schema
export const eventQuerySchema = z.object({
  limit: z.string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 50)
    .refine((val) => val > 0 && val <= 100, {
      message: "Limit must be between 1 and 100"
    }),
  offset: z.string()
    .optional()
    .transform((val) => val ? parseInt(val, 10) : 0)
    .refine((val) => val >= 0, {
      message: "Offset must be non-negative"
    }),
  upcoming: z.string()
    .optional()
    .transform((val) => val === "true")
});

// Event ID parameter schema
export const eventIdSchema = z.object({
  id: z.string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Event ID must be a positive integer"
    })
});

// Type exports
export type CreateEventData = z.infer<typeof createEventSchema>;
export type UpdateEventData = z.infer<typeof updateEventSchema>;
export type EventQueryParams = z.infer<typeof eventQuerySchema>;
export type EventIdParams = z.infer<typeof eventIdSchema>;