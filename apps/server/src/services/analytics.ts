import { db } from "../db";
import { events, bookings } from "../db/schema";
import { sql, and, eq, gte, lt, desc } from "drizzle-orm";

export class AnalyticsService {
  /**
   * Get dashboard statistics for admin analytics
   */
  static async getDashboardStats() {
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthEnd = currentMonthStart;

    // 1. Total Events
    const totalEventsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events);
    const totalEvents = totalEventsResult[0]?.count || 0;

    const currentMonthEventsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(events)
      .where(gte(events.createdAt, currentMonthStart));
    const currentMonthEvents = currentMonthEventsResult[0]?.count || 0;

    // 2. Total Bookings
    const totalBookingsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bookings)
      .where(eq(bookings.status, "confirmed"));
    const totalBookings = totalBookingsResult[0]?.count || 0;

    const currentMonthBookingsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bookings)
      .where(
        and(
          eq(bookings.status, "confirmed"),
          gte(bookings.createdAt, currentMonthStart)
        )
      );
    const currentMonthBookings = currentMonthBookingsResult[0]?.count || 0;

    const lastMonthBookingsResult = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(bookings)
      .where(
        and(
          eq(bookings.status, "confirmed"),
          gte(bookings.createdAt, lastMonthStart),
          lt(bookings.createdAt, lastMonthEnd)
        )
      );
    const lastMonthBookings = lastMonthBookingsResult[0]?.count || 0;

    // Calculate booking percentage change
    let bookingChange = "+0%";
    if (lastMonthBookings > 0) {
      const percentChange = Math.round(
        ((currentMonthBookings - lastMonthBookings) / lastMonthBookings) * 100
      );
      bookingChange = percentChange >= 0 ? `+${percentChange}%` : `${percentChange}%`;
    } else if (currentMonthBookings > 0) {
      bookingChange = "+100%";
    }

    // 3. Attendance Rate (for past events only)
    const pastEventsWithBookings = await db
      .select({
        totalCapacity: sql<number>`sum(${events.seatCapacity})::int`,
        totalBooked: sql<number>`sum(${events.seatCapacity} - ${events.availableSeats})::int`,
      })
      .from(events)
      .where(lt(events.eventDate, now));

    const currentMonthPastEvents = await db
      .select({
        totalCapacity: sql<number>`sum(${events.seatCapacity})::int`,
        totalBooked: sql<number>`sum(${events.seatCapacity} - ${events.availableSeats})::int`,
      })
      .from(events)
      .where(
        and(
          lt(events.eventDate, now),
          gte(events.eventDate, currentMonthStart)
        )
      );

    const lastMonthPastEvents = await db
      .select({
        totalCapacity: sql<number>`sum(${events.seatCapacity})::int`,
        totalBooked: sql<number>`sum(${events.seatCapacity} - ${events.availableSeats})::int`,
      })
      .from(events)
      .where(
        and(
          lt(events.eventDate, lastMonthEnd),
          gte(events.eventDate, lastMonthStart)
        )
      );

    const totalCapacity = pastEventsWithBookings[0]?.totalCapacity || 0;
    const totalBooked = pastEventsWithBookings[0]?.totalBooked || 0;
    const attendanceRate = totalCapacity > 0 
      ? Math.round((totalBooked / totalCapacity) * 100) 
      : 0;

    const currentMonthCapacity = currentMonthPastEvents[0]?.totalCapacity || 0;
    const currentMonthBooked = currentMonthPastEvents[0]?.totalBooked || 0;
    const currentMonthRate = currentMonthCapacity > 0
      ? Math.round((currentMonthBooked / currentMonthCapacity) * 100)
      : 0;

    const lastMonthCapacity = lastMonthPastEvents[0]?.totalCapacity || 0;
    const lastMonthBooked = lastMonthPastEvents[0]?.totalBooked || 0;
    const lastMonthRate = lastMonthCapacity > 0
      ? Math.round((lastMonthBooked / lastMonthCapacity) * 100)
      : 0;

    const attendanceChange = currentMonthRate - lastMonthRate;
    const attendanceChangeStr = attendanceChange >= 0 
      ? `+${attendanceChange}%` 
      : `${attendanceChange}%`;

    // 4. Popular Events (by booking count)
    const popularEventsResult = await db
      .select({
        id: events.id,
        name: events.name,
        bookingCount: sql<number>`count(${bookings.id})::int`,
        capacity: events.seatCapacity,
        eventDate: events.eventDate,
      })
      .from(events)
      .leftJoin(
        bookings,
        and(
          eq(bookings.eventId, events.id),
          eq(bookings.status, "confirmed")
        )
      )
      .groupBy(events.id)
      .orderBy(desc(sql`count(${bookings.id})`))
      .limit(5);

    const popularEvents = popularEventsResult.map((event) => ({
      name: event.name,
      bookings: event.bookingCount,
      capacity: event.capacity,
      date: event.eventDate.toISOString().split("T")[0],
      fillPercentage: Math.round((event.bookingCount / event.capacity) * 100),
    }));

    // 5. Recent Past Events Performance
    const recentPastEventsResult = await db
      .select({
        id: events.id,
        name: events.name,
        bookingCount: sql<number>`count(${bookings.id})::int`,
        capacity: events.seatCapacity,
        eventDate: events.eventDate,
      })
      .from(events)
      .leftJoin(
        bookings,
        and(
          eq(bookings.eventId, events.id),
          eq(bookings.status, "confirmed")
        )
      )
      .where(lt(events.eventDate, now))
      .groupBy(events.id)
      .orderBy(desc(events.eventDate))
      .limit(5);

    const recentEvents = recentPastEventsResult.map((event) => ({
      name: event.name,
      bookings: event.bookingCount,
      capacity: event.capacity,
      date: event.eventDate.toISOString().split("T")[0],
      fillPercentage: Math.round((event.bookingCount / event.capacity) * 100),
    }));

    return {
      stats: {
        totalEvents: {
          value: totalEvents,
          change: `+${currentMonthEvents} this month`,
        },
        totalBookings: {
          value: totalBookings,
          change: `${bookingChange} from last month`,
        },
        attendanceRate: {
          value: `${attendanceRate}%`,
          change: `${attendanceChangeStr} from last month`,
        },
      },
      popularEvents,
      recentEvents,
    };
  }
}
