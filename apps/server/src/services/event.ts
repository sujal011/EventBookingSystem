import { eq, asc, gte, and } from "drizzle-orm";
import { db, events, users, type Event, type NewEvent } from "../db";
import type { CreateEventData, UpdateEventData, EventQueryParams } from "../schemas/event";
import { WebSocketManager } from "./websocket";

export interface EventWithCreator extends Event {
  creator?: {
    id: number;
    name: string;
    email: string;
  } | null;
}

export interface EventListResponse {
  events: EventWithCreator[];
  total: number;
  hasMore: boolean;
}

export class EventService {
  /**
   * Create a new event
   */
  static async createEvent(
    eventData: CreateEventData,
    createdBy: number
  ): Promise<EventWithCreator> {
    // Validate that the event date is in the future
    const eventDate = new Date(eventData.eventDate);
    if (eventDate <= new Date()) {
      throw new Error("Event date must be in the future");
    }

    const newEvent: NewEvent = {
      name: eventData.name,
      description: eventData.description || null,
      eventDate: eventDate,
      seatCapacity: eventData.seatCapacity,
      availableSeats: eventData.seatCapacity, // Initially all seats are available
      createdBy: createdBy
    };

    const createdEvents = await db
      .insert(events)
      .values(newEvent)
      .returning();

    if (!createdEvents.length) {
      throw new Error("Failed to create event");
    }

    const createdEvent = createdEvents[0]!;

    // Get creator information
    const [creator] = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email
      })
      .from(users)
      .where(eq(users.id, createdBy))
      .limit(1);

    return {
      ...createdEvent,
      creator: creator || undefined
    };
  }

  /**
   * Get all events with optional filtering
   */
  static async getEvents(params: EventQueryParams): Promise<EventListResponse> {
    const { limit, offset, upcoming } = params;

    // Build query conditions
    const conditions = [];
    if (upcoming) {
      conditions.push(gte(events.eventDate, new Date()));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    // Get events with creator information
    const eventList = await db
      .select({
        id: events.id,
        name: events.name,
        description: events.description,
        eventDate: events.eventDate,
        seatCapacity: events.seatCapacity,
        availableSeats: events.availableSeats,
        createdBy: events.createdBy,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(events)
      .leftJoin(users, eq(events.createdBy, users.id))
      .where(whereClause)
      .orderBy(asc(events.eventDate))
      .limit(limit + 1) // Get one extra to check if there are more
      .offset(offset);

    // Check if there are more events
    const hasMore = eventList.length > limit;
    const eventsToReturn = hasMore ? eventList.slice(0, limit) : eventList;

    // Get total count for pagination
    const totalResult = await db
      .select({ count: events.id })
      .from(events)
      .where(whereClause);

    return {
      events: eventsToReturn.map(event => ({
        id: event.id,
        name: event.name,
        description: event.description,
        eventDate: event.eventDate,
        seatCapacity: event.seatCapacity,
        availableSeats: event.availableSeats,
        createdBy: event.createdBy,
        createdAt: event.createdAt,
        updatedAt: event.updatedAt,
        creator: event.creator || undefined
      })),
      total: totalResult.length,
      hasMore
    };
  }

  /**
   * Get a single event by ID
   */
  static async getEventById(id: number): Promise<EventWithCreator | null> {
    const result = await db
      .select({
        id: events.id,
        name: events.name,
        description: events.description,
        eventDate: events.eventDate,
        seatCapacity: events.seatCapacity,
        availableSeats: events.availableSeats,
        createdBy: events.createdBy,
        createdAt: events.createdAt,
        updatedAt: events.updatedAt,
        creator: {
          id: users.id,
          name: users.name,
          email: users.email
        }
      })
      .from(events)
      .leftJoin(users, eq(events.createdBy, users.id))
      .where(eq(events.id, id))
      .limit(1);

    if (!result.length) {
      return null;
    }

    const event = result[0]!;
    return {
      id: event.id,
      name: event.name,
      description: event.description,
      eventDate: event.eventDate,
      seatCapacity: event.seatCapacity,
      availableSeats: event.availableSeats,
      createdBy: event.createdBy,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
      creator: event.creator || undefined
    };
  }

  /**
   * Update an existing event
   */
  static async updateEvent(
    id: number,
    eventData: UpdateEventData,
    userId: number,
    userRole: string
  ): Promise<EventWithCreator> {
    // Get the existing event
    const existingEvent = await this.getEventById(id);
    if (!existingEvent) {
      throw new Error("Event not found");
    }

    // Check if user has permission to update (must be creator or admin)
    if (userRole !== "admin" && existingEvent.createdBy !== userId) {
      throw new Error("You don't have permission to update this event");
    }

    // Check if event has already occurred
    if (existingEvent.eventDate <= new Date()) {
      throw new Error("Cannot update events that have already occurred");
    }

    // Validate new event date if provided
    if (eventData.eventDate) {
      const newEventDate = new Date(eventData.eventDate);
      if (newEventDate <= new Date()) {
        throw new Error("Event date must be in the future");
      }
    }

    // Handle seat capacity changes
    let updateData: Partial<NewEvent> = {};
    
    if (eventData.name !== undefined) {
      updateData.name = eventData.name;
    }
    if (eventData.description !== undefined) {
      updateData.description = eventData.description;
    }
    if (eventData.eventDate !== undefined) {
      updateData.eventDate = new Date(eventData.eventDate);
    }
    if (eventData.seatCapacity !== undefined) {
      // Calculate how many seats are currently booked
      const bookedSeats = existingEvent.seatCapacity - existingEvent.availableSeats;
      
      // Ensure new capacity is not less than already booked seats
      if (eventData.seatCapacity < bookedSeats) {
        throw new Error(`Cannot reduce capacity below ${bookedSeats} (number of seats already booked)`);
      }
      
      updateData.seatCapacity = eventData.seatCapacity;
      updateData.availableSeats = eventData.seatCapacity - bookedSeats;
    }

    updateData.updatedAt = new Date();

    // Update the event
    const updatedEvents = await db
      .update(events)
      .set(updateData)
      .where(eq(events.id, id))
      .returning();

    if (!updatedEvents.length) {
      throw new Error("Failed to update event");
    }

    // Return the updated event with creator info
    const updatedEvent = await this.getEventById(id);
    if (!updatedEvent) {
      throw new Error("Failed to retrieve updated event");
    }

    // Broadcast seat update if capacity or available seats changed
    if (eventData.seatCapacity !== undefined) {
      WebSocketManager.broadcastSeatUpdate(
        id,
        updatedEvent.availableSeats,
        updatedEvent.seatCapacity
      );
    }

    return updatedEvent;
  }

  /**
   * Delete an event (admin only)
   */
  static async deleteEvent(
    id: number,
    userId: number,
    userRole: string
  ): Promise<void> {
    // Get the existing event
    const existingEvent = await this.getEventById(id);
    if (!existingEvent) {
      throw new Error("Event not found");
    }

    // Check if user has permission to delete (must be creator or admin)
    if (userRole !== "admin" && existingEvent.createdBy !== userId) {
      throw new Error("You don't have permission to delete this event");
    }

    // Check if event has bookings
    if (existingEvent.availableSeats < existingEvent.seatCapacity) {
      throw new Error("Cannot delete events with existing bookings");
    }

    // Delete the event
    await db.delete(events).where(eq(events.id, id));
  }

  /**
   * Check if an event exists and is bookable
   */
  static async isEventBookable(id: number): Promise<boolean> {
    const event = await this.getEventById(id);
    if (!event) {
      return false;
    }

    // Event must be in the future and have available seats
    return event.eventDate > new Date() && event.availableSeats > 0;
  }
}