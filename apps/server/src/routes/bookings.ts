import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { BookingService } from "../services/booking";
import { createBookingSchema, bookingIdSchema, eventIdParamSchema } from "../schemas/booking";
import { authMiddleware } from "../middleware/auth";

type Variables = {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
  };
};

const bookings = new Hono<{ Variables: Variables }>();

// Apply authentication middleware to all booking routes
bookings.use("*", authMiddleware);

/**
 * POST /api/bookings
 * Create a new booking
 */
bookings.post(
  "/",
  zValidator("json", createBookingSchema),
  async (c) => {
    try {
      const bookingData = c.req.valid("json");
      const user = c.get("user");

      if (!user) {
        return c.json({ error: "Authentication required" }, 401);
      }

      // Validate booking data and business rules
      await BookingService.validateBookingData(bookingData, user.id);

      // Create the booking
      const booking = await BookingService.createBooking(bookingData, user.id);

      return c.json({
        success: true,
        data: {
          bookingId: booking.bookingId,
          eventId: booking.eventId,
          status: booking.status,
          createdAt: booking.createdAt,
          event: booking.event
        }
      }, 201);
    } catch (error: any) {
      console.error("Error creating booking:", error);
      
      // Handle specific error types
      if (error.message.includes("not found")) {
        return c.json({ error: error.message }, 404);
      }
      if (error.message.includes("already have a booking") || 
          error.message.includes("No seats available") ||
          error.message.includes("Cannot book past events")) {
        return c.json({ error: error.message }, 409);
      }
      
      return c.json({ error: "Failed to create booking" }, 500);
    }
  }
);

/**
 * GET /api/bookings/:id
 * Get booking details by booking ID
 */
bookings.get(
  "/:id",
  zValidator("param", bookingIdSchema),
  async (c) => {
    try {
      const { id: bookingId } = c.req.valid("param");
      const user = c.get("user");

      if (!user) {
        return c.json({ error: "Authentication required" }, 401);
      }

      const booking = await BookingService.getBookingByBookingId(bookingId);
      
      if (!booking) {
        return c.json({ error: "Booking not found" }, 404);
      }

      // Check if user has permission to view this booking (owner or admin)
      if (user.role !== "admin" && booking.userId !== user.id) {
        return c.json({ error: "You don't have permission to view this booking" }, 403);
      }

      return c.json({
        success: true,
        data: {
          bookingId: booking.bookingId,
          eventId: booking.eventId,
          status: booking.status,
          createdAt: booking.createdAt,
          cancelledAt: booking.cancelledAt,
          event: booking.event,
          user: user.role === "admin" ? booking.user : undefined
        }
      });
    } catch (error: any) {
      console.error("Error fetching booking:", error);
      return c.json({ error: "Failed to fetch booking" }, 500);
    }
  }
);

/**
 * DELETE /api/bookings/:id
 * Cancel a booking
 */
bookings.delete(
  "/:id",
  zValidator("param", bookingIdSchema),
  async (c) => {
    try {
      const { id: bookingId } = c.req.valid("param");
      const user = c.get("user");

      if (!user) {
        return c.json({ error: "Authentication required" }, 401);
      }

      await BookingService.cancelBooking(bookingId, user.id, user.role);

      return c.json({
        success: true,
        message: "Booking cancelled successfully"
      });
    } catch (error: any) {
      console.error("Error cancelling booking:", error);
      
      // Handle specific error types
      if (error.message.includes("not found")) {
        return c.json({ error: error.message }, 404);
      }
      if (error.message.includes("don't have permission")) {
        return c.json({ error: error.message }, 403);
      }
      if (error.message.includes("already cancelled") ||
          error.message.includes("Cannot cancel")) {
        return c.json({ error: error.message }, 409);
      }
      
      return c.json({ error: "Failed to cancel booking" }, 500);
    }
  }
);

/**
 * GET /api/bookings/user/me
 * Get current user's bookings
 */
bookings.get("/user/me", async (c) => {
  try {
    const user = c.get("user");

    if (!user) {
      return c.json({ error: "Authentication required" }, 401);
    }

    const result = await BookingService.getUserBookings(user.id);

    return c.json({
      success: true,
      data: {
        bookings: result.bookings,
        total: result.total
      }
    });
  } catch (error: any) {
    console.error("Error fetching user bookings:", error);
    return c.json({ error: "Failed to fetch bookings" }, 500);
  }
});

/**
 * GET /api/bookings/admin/events/:id
 * Get all bookings for a specific event (admin/creator only)
 */
bookings.get(
  "/admin/events/:id",
  zValidator("param", eventIdParamSchema),
  async (c) => {
    try {
      const { id: eventId } = c.req.valid("param");
      const user = c.get("user");

      if (!user) {
        return c.json({ error: "Authentication required" }, 401);
      }

      const result = await BookingService.getEventBookings(eventId, user.id, user.role);

      return c.json({
        success: true,
        data: {
          eventId,
          bookings: result.bookings,
          total: result.total
        }
      });
    } catch (error: any) {
      console.error("Error fetching event bookings:", error);
      
      if (error.message.includes("don't have permission")) {
        return c.json({ error: error.message }, 403);
      }
      
      return c.json({ error: "Failed to fetch event bookings" }, 500);
    }
  }
);

export default bookings;