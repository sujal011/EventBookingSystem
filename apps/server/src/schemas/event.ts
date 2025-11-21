import { z } from "zod";

// Base event schema for validation (handles FormData)
export const createEventSchema = z.object({
  name: z.union([z.string(), z.null()])
    .transform(val => val || "")
    .pipe(
      z.string()
        .min(1, "Event name is required")
        .max(255, "Event name must be less than 255 characters")
        .trim()
    ),
  description: z.union([z.string(), z.null()])
    .transform(val => !val || val === "" ? null : val)
    .pipe(
      z.string()
        .max(1000, "Description must be less than 1000 characters")
        .nullable()
    ),
  imageFile: z.union([z.instanceof(File), z.null(), z.string()])
    .transform(val => {
      if (val instanceof File) return val;
      if (val === null || val === "") return null;
      return null;
    })
    .nullable(),
  eventDate: z.union([z.string(), z.null()])
    .transform(val => val || "")
    .pipe(
      z.string()
        .min(1, "Event date is required")
        .refine((date) => {
          const parsedDate = new Date(date);
          return !isNaN(parsedDate.getTime());
        }, {
          message: "Invalid date format. Use ISO 8601 format"
        })
        .refine((date) => new Date(date) > new Date(), {
          message: "Event date must be in the future"
        })
    ),
  seatCapacity: z.union([z.string(), z.number(), z.null()])
    .transform(val => {
      if (typeof val === "number") return val.toString();
      return val || "";
    })
    .pipe(
      z.string()
        .min(1, "Seat capacity is required")
        .transform((val) => parseInt(val, 10))
        .refine((val) => !isNaN(val) && Number.isInteger(val), {
          message: "Seat capacity must be an integer"
        })
        .refine((val) => val >= 1, {
          message: "Seat capacity must be at least 1"
        })
        .refine((val) => val <= 10000, {
          message: "Seat capacity cannot exceed 10,000"
        })
    )
});

// Update event schema (allows partial updates, handles FormData)
export const updateEventSchema = z.object({
  name: z.union([z.string(), z.null()])
    .transform(val => val || undefined)
    .pipe(
      z.string()
        .min(1, "Event name is required")
        .max(255, "Event name must be less than 255 characters")
        .trim()
        .optional()
    ),
  description: z.union([z.string(), z.null()])
    .transform(val => {
      if (val === null || val === "" || val === undefined) return undefined;
      return val;
    })
    .pipe(
      z.string()
        .max(1000, "Description must be less than 1000 characters")
        .optional()
    ),
  imageFile: z.union([z.instanceof(File), z.null(), z.string()])
    .transform(val => {
      if (val instanceof File) return val;
      if (val === null || val === "" || val === undefined) return undefined;
      return undefined;
    })
    .optional(),
  eventDate: z.union([z.string(), z.null()])
    .transform(val => val || undefined)
    .pipe(
      z.string()
        .refine((date) => {
          if (!date) return true; // Optional field
          const parsedDate = new Date(date);
          return !isNaN(parsedDate.getTime());
        }, {
          message: "Invalid date format. Use ISO 8601 format"
        })
        .refine((date) => {
          if (!date) return true; // Optional field
          return new Date(date) > new Date();
        }, {
          message: "Event date must be in the future"
        })
        .optional()
    ),
  seatCapacity: z.union([z.string(), z.number(), z.null()])
    .transform(val => {
      if (val === null || val === "" || val === undefined) return undefined;
      if (typeof val === "number") return val.toString();
      return val;
    })
    .pipe(
      z.string()
        .transform((val) => {
          if (!val) return undefined;
          return parseInt(val, 10);
        })
        .refine((val) => {
          if (val === undefined) return true; // Optional field
          return !isNaN(val) && Number.isInteger(val);
        }, {
          message: "Seat capacity must be an integer"
        })
        .refine((val) => {
          if (val === undefined) return true; // Optional field
          return val >= 1;
        }, {
          message: "Seat capacity must be at least 1"
        })
        .refine((val) => {
          if (val === undefined) return true; // Optional field
          return val <= 10000;
        }, {
          message: "Seat capacity cannot exceed 10,000"
        })
        .optional()
    )
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