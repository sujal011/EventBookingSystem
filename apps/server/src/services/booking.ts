import { eq, and, sql } from "drizzle-orm";
import { db, bookings, events, users, type Booking } from "../db";
import type { CreateBookingData } from "../schemas/booking";
import { EventService } from "./event";
import { WebSocketManager } from "./websocket";

export interface BookingWithDetails extends Booking {
  event?: {
    id: number;
    name: string;
    eventDate: Date;
    seatCapacity: number;
    availableSeats: number;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}

export interface BookingListResponse {
  bookings: BookingWithDetails[];
  total: number;
}

export class BookingService {
  /**
   * Generate a unique booking ID
   */
  static generateBookingId(): string {
    const timestamp = Date.now().toString(36);
    const randomPart = Math.random().toString(36).substring(2, 8);
    return `BK-${timestamp}-${randomPart}`.toUpperCase();
  }

  /**
   * Create a new booking using stored procedure for atomicity
   */
  static async createBooking(
    bookingData: CreateBookingData,
    userId: number
  ): Promise<BookingWithDetails> {
    const { eventId } = bookingData;

    // First validate that the event exists and is bookable
    const event = await EventService.getEventById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if event is in the future
    if (event.eventDate <= new Date()) {
      throw new Error("Cannot book past events");
    }

    // Check if seats are available
    if (event.availableSeats <= 0) {
      throw new Error("No seats available for this event");
    }

    // Check if user already has a booking for this event
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, userId),
          eq(bookings.eventId, eventId),
          eq(bookings.status, "confirmed")
        )
      )
      .limit(1);

    if (existingBooking.length > 0) {
      throw new Error("You already have a booking for this event");
    }

    // Generate unique booking ID
    const bookingId = this.generateBookingId();

    // Use stored procedure for atomic booking creation
    try {
      const result = await db.execute(
        sql`SELECT create_booking(${userId}, ${eventId}, ${bookingId}) as success`
      );

      const success = (result.rows[0] as any)?.success;
      if (!success) {
        throw new Error("Failed to create booking - no seats available");
      }

      // Get the created booking with details
      const createdBooking = await this.getBookingByBookingId(bookingId);
      if (!createdBooking) {
        throw new Error("Failed to retrieve created booking");
      }

      // Broadcast booking creation and seat update via WebSocket
      if (createdBooking.event) {
        WebSocketManager.broadcastBookingCreated(
          eventId,
          createdBooking.event.availableSeats
        );
      }

      return createdBooking;
    } catch (error: any) {
      // Handle database errors
      if (error.message.includes("duplicate key")) {
        throw new Error("You already have a booking for this event");
      }
      throw error;
    }
  }

  /**
   * Cancel a booking using stored procedure for atomicity
   */
  static async cancelBooking(
    bookingId: string,
    userId: number,
    userRole: string
  ): Promise<void> {
    // Get the booking first to validate ownership
    const booking = await this.getBookingByBookingId(bookingId);
    if (!booking) {
      throw new Error("Booking not found");
    }

    // Check if user has permission to cancel (must be owner or admin)
    if (userRole !== "admin" && booking.userId !== userId) {
      throw new Error("You don't have permission to cancel this booking");
    }

    // Check if booking is already cancelled
    if (booking.status !== "confirmed") {
      throw new Error("Booking is already cancelled");
    }

    // Check if event is in the future (allow cancellation up to event time)
    if (booking.event && booking.event.eventDate <= new Date()) {
      throw new Error("Cannot cancel bookings for past events");
    }

    // Use stored procedure for atomic cancellation
    const result = await db.execute(
      sql`SELECT cancel_booking(${bookingId}) as success`
    );

    const success = (result.rows[0] as any)?.success;
    if (!success) {
      throw new Error("Failed to cancel booking - booking may already be cancelled");
    }

    // Get updated event data and broadcast cancellation via WebSocket
    if (booking.event) {
      const updatedEvent = await EventService.getEventById(booking.event.id);
      if (updatedEvent) {
        WebSocketManager.broadcastBookingCancelled(
          booking.event.id,
          updatedEvent.availableSeats
        );
      }
    }
  }

  /**
   * Get a booking by booking ID with full details
   */
  static async getBookingByBookingId(bookingId: string): Promise<BookingWithDetails | null> {
    const result = await db
      .select({
        id: bookings.id,
        bookingId: bookings.bookingId,
        userId: bookings.userId,
        eventId: bookings.eventId,
        status: bookings.status,
        createdAt: bookings.createdAt,
        cancelledAt: bookings.cancelledAt,
        event: {
          id: events.id,
          name: events.name,
          eventDate: events.eventDate,
          seatCapacity: events.seatCapacity,
          availableSeats: events.availableSeats
        },
        user: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(bookings)
      .leftJoin(events, eq(bookings.eventId, events.id))
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.bookingId, bookingId))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const booking = result[0]!;
    return {
      id: booking.id,
      bookingId: booking.bookingId,
      userId: booking.userId,
      eventId: booking.eventId,
      status: booking.status,
      createdAt: booking.createdAt,
      cancelledAt: booking.cancelledAt,
      event: booking.event || undefined,
      user: booking.user || undefined
    };
  }

  /**
   * Get all bookings for a specific event (admin only)
   */
  static async getEventBookings(
    eventId: number,
    userId: number,
    userRole: string
  ): Promise<BookingListResponse> {
    // Check if user has permission (must be admin or event creator)
    if (userRole !== "admin") {
      const event = await EventService.getEventById(eventId);
      if (!event || event.createdBy !== userId) {
        throw new Error("You don't have permission to view these bookings");
      }
    }

    const result = await db
      .select({
        id: bookings.id,
        bookingId: bookings.bookingId,
        userId: bookings.userId,
        eventId: bookings.eventId,
        status: bookings.status,
        createdAt: bookings.createdAt,
        cancelledAt: bookings.cancelledAt,
        user: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(bookings)
      .leftJoin(users, eq(bookings.userId, users.id))
      .where(eq(bookings.eventId, eventId));

    return {
      bookings: result.map(booking => ({
        id: booking.id,
        bookingId: booking.bookingId,
        userId: booking.userId,
        eventId: booking.eventId,
        status: booking.status,
        createdAt: booking.createdAt,
        cancelledAt: booking.cancelledAt,
        user: booking.user || undefined
      })),
      total: result.length
    };
  }

  /**
   * Get user's bookings
   */
  static async getUserBookings(userId: number): Promise<BookingListResponse> {
    const result = await db
      .select({
        id: bookings.id,
        bookingId: bookings.bookingId,
        userId: bookings.userId,
        eventId: bookings.eventId,
        status: bookings.status,
        createdAt: bookings.createdAt,
        cancelledAt: bookings.cancelledAt,
        event: {
          id: events.id,
          name: events.name,
          eventDate: events.eventDate,
          seatCapacity: events.seatCapacity,
          availableSeats: events.availableSeats
        }
      })
      .from(bookings)
      .leftJoin(events, eq(bookings.eventId, events.id))
      .where(eq(bookings.userId, userId));

    return {
      bookings: result.map(booking => ({
        id: booking.id,
        bookingId: booking.bookingId,
        userId: booking.userId,
        eventId: booking.eventId,
        status: booking.status,
        createdAt: booking.createdAt,
        cancelledAt: booking.cancelledAt,
        event: booking.event || undefined
      })),
      total: result.length
    };
  }

  /**
   * Validate booking data and business rules
   */
  static async validateBookingData(
    bookingData: CreateBookingData,
    userId: number
  ): Promise<void> {
    const { eventId } = bookingData;

    // Check if event exists
    const event = await EventService.getEventById(eventId);
    if (!event) {
      throw new Error("Event not found");
    }

    // Check if event is in the future
    if (event.eventDate <= new Date()) {
      throw new Error("Cannot book past events");
    }

    // Check if seats are available
    if (event.availableSeats <= 0) {
      throw new Error("No seats available for this event");
    }

    // Check for existing booking
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(
        and(
          eq(bookings.userId, userId),
          eq(bookings.eventId, eventId),
          eq(bookings.status, "confirmed")
        )
      )
      .limit(1);

    if (existingBooking.length > 0) {
      throw new Error("You already have a booking for this event");
    }
  }
}