import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { EventService } from "../services/event";
import { authMiddleware, adminMiddleware, optionalAuthMiddleware } from "../middleware/auth";
import { 
  createEventSchema, 
  updateEventSchema, 
  eventQuerySchema, 
  eventIdSchema 
} from "../schemas/event";

// Extend Hono context to include user
type Variables = {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
};

const events = new Hono<{ Variables: Variables }>();

/**
 * GET /api/events - List all events with availability
 * Public endpoint with optional authentication for enhanced features
 */
events.get(
  "/",
  optionalAuthMiddleware,
  zValidator("query", eventQuerySchema),
  async (c) => {
    try {
      const queryParams = c.req.valid("query");
      const result = await EventService.getEvents(queryParams);

      return c.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error("Error fetching events:", error);
      return c.json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch events",
          timestamp: new Date().toISOString()
        }
      }, 500);
    }
  }
);

/**
 * GET /api/events/:id - Get specific event details
 * Public endpoint
 */
events.get(
  "/:id",
  zValidator("param", eventIdSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const event = await EventService.getEventById(id);

      if (!event) {
        return c.json({
          error: {
            code: "NOT_FOUND",
            message: "Event not found",
            timestamp: new Date().toISOString()
          }
        }, 404);
      }

      return c.json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error("Error fetching event:", error);
      return c.json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to fetch event",
          timestamp: new Date().toISOString()
        }
      }, 500);
    }
  }
);

/**
 * POST /api/events - Create new event (admin only)
 */
events.post(
  "/",
  authMiddleware,
  adminMiddleware,
  async (c) => {
    try {
      const user = c.get("user");
      
      // Parse FormData
      const formData = await c.req.formData();
      
      // Extract fields from FormData
      const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        eventDate: formData.get("eventDate"),
        seatCapacity: formData.get("seatCapacity")
      };

      // Validate with Zod
      const validationResult = createEventSchema.safeParse(rawData);
      
      if (!validationResult.success) {
        return c.json({
          success: false,
          error: validationResult.error
        }, 400);
      }

      // Handle image file
      let imageBuffer: Buffer | undefined;
      const imageFile = formData.get("imageFile");
      
      if (imageFile && imageFile instanceof File) {
        // Validate file type
        if (!imageFile.type.startsWith('image/')) {
          return c.json({
            error: {
              code: "INVALID_FILE_TYPE",
              message: "Only image files are allowed",
              timestamp: new Date().toISOString()
            }
          }, 400);
        }
        
        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024;
        if (imageFile.size > maxSize) {
          return c.json({
            error: {
              code: "FILE_TOO_LARGE",
              message: "File size cannot exceed 5MB",
              timestamp: new Date().toISOString()
            }
          }, 400);
        }
        
        // Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      }

      const eventData = validationResult.data;
      const event = await EventService.createEvent(eventData, user.id, imageBuffer);

      return c.json({
        success: true,
        data: event
      }, 201);
    } catch (error) {
      console.error("Error creating event:", error);
      
      if (error instanceof Error) {
        // Handle image upload errors
        if (error.message.includes("Image upload failed") || error.message.includes("upload") || error.message.includes("Cloudinary")) {
          return c.json({
            error: {
              code: "IMAGE_UPLOAD_FAILED",
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }, 400);
        }
        
        // Handle known business logic errors
        if (error.message.includes("future")) {
          return c.json({
            error: {
              code: "VALIDATION_ERROR",
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }, 400);
        }
      }

      return c.json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to create event",
          timestamp: new Date().toISOString()
        }
      }, 500);
    }
  }
);

/**
 * PUT /api/events/:id - Update event details (admin or creator only)
 */
events.put(
  "/:id",
  authMiddleware,
  zValidator("param", eventIdSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const user = c.get("user");
      
      // Parse FormData
      const formData = await c.req.formData();
      
      // Extract fields from FormData
      const rawData = {
        name: formData.get("name"),
        description: formData.get("description"),
        eventDate: formData.get("eventDate"),
        seatCapacity: formData.get("seatCapacity")
      };

      // Validate with Zod
      const validationResult = updateEventSchema.safeParse(rawData);
      
      if (!validationResult.success) {
        return c.json({
          success: false,
          error: validationResult.error
        }, 400);
      }

      // Handle image file
      let imageBuffer: Buffer | undefined;
      const imageFile = formData.get("imageFile");
      
      if (imageFile && imageFile instanceof File) {
        // Validate file type
        if (!imageFile.type.startsWith('image/')) {
          return c.json({
            error: {
              code: "INVALID_FILE_TYPE",
              message: "Only image files are allowed",
              timestamp: new Date().toISOString()
            }
          }, 400);
        }
        
        // Validate file size (5MB limit)
        const maxSize = 5 * 1024 * 1024;
        if (imageFile.size > maxSize) {
          return c.json({
            error: {
              code: "FILE_TOO_LARGE",
              message: "File size cannot exceed 5MB",
              timestamp: new Date().toISOString()
            }
          }, 400);
        }
        
        // Convert File to Buffer
        const arrayBuffer = await imageFile.arrayBuffer();
        imageBuffer = Buffer.from(arrayBuffer);
      }

      const eventData = validationResult.data;
      const event = await EventService.updateEvent(id, eventData, user.id, user.role, imageBuffer);

      return c.json({
        success: true,
        data: event
      });
    } catch (error) {
      console.error("Error updating event:", error);
      
      if (error instanceof Error) {
        // Handle image upload errors
        if (error.message.includes("Image upload failed") || error.message.includes("upload") || error.message.includes("Cloudinary")) {
          return c.json({
            error: {
              code: "IMAGE_UPLOAD_FAILED",
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }, 400);
        }
        
        // Handle known business logic errors
        if (error.message.includes("not found")) {
          return c.json({
            error: {
              code: "NOT_FOUND",
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }, 404);
        }
        
        if (error.message.includes("permission") || error.message.includes("occurred")) {
          return c.json({
            error: {
              code: "FORBIDDEN",
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }, 403);
        }

        if (error.message.includes("capacity") || error.message.includes("future")) {
          return c.json({
            error: {
              code: "VALIDATION_ERROR",
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }, 400);
        }
      }

      return c.json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to update event",
          timestamp: new Date().toISOString()
        }
      }, 500);
    }
  }
);

/**
 * DELETE /api/events/:id - Delete event (admin or creator only)
 */
events.delete(
  "/:id",
  authMiddleware,
  zValidator("param", eventIdSchema),
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const user = c.get("user");

      await EventService.deleteEvent(id, user.id, user.role);

      return c.json({
        success: true,
        message: "Event deleted successfully"
      });
    } catch (error) {
      console.error("Error deleting event:", error);
      
      if (error instanceof Error) {
        // Handle known business logic errors
        if (error.message.includes("not found")) {
          return c.json({
            error: {
              code: "NOT_FOUND",
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }, 404);
        }
        
        if (error.message.includes("permission")) {
          return c.json({
            error: {
              code: "FORBIDDEN",
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }, 403);
        }

        if (error.message.includes("bookings")) {
          return c.json({
            error: {
              code: "CONFLICT",
              message: error.message,
              timestamp: new Date().toISOString()
            }
          }, 409);
        }
      }

      return c.json({
        error: {
          code: "INTERNAL_ERROR",
          message: "Failed to delete event",
          timestamp: new Date().toISOString()
        }
      }, 500);
    }
  }
);

export default events;