import { z } from "zod";

// Create booking schema
export const createBookingSchema = z.object({
  eventId: z.number()
    .int("Event ID must be an integer")
    .positive("Event ID must be positive")
});

// Booking ID parameter schema
export const bookingIdSchema = z.object({
  id: z.string()
    .min(1, "Booking ID is required")
    .max(50, "Booking ID is too long")
});

// Event ID parameter schema for admin endpoints
export const eventIdParamSchema = z.object({
  id: z.string()
    .transform((val) => parseInt(val, 10))
    .refine((val) => !isNaN(val) && val > 0, {
      message: "Event ID must be a positive integer"
    })
});

// Type exports
export type CreateBookingData = z.infer<typeof createBookingSchema>;
export type BookingIdParams = z.infer<typeof bookingIdSchema>;
export type EventIdParams = z.infer<typeof eventIdParamSchema>;
