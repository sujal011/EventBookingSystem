import { pgTable, serial, varchar, text, timestamp, integer, jsonb, unique } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// Users table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  name: varchar('name', { length: 255 }).notNull(),
  passwordHash: varchar('password_hash', { length: 255 }).notNull(),
  role: varchar('role', { length: 50 }).default('user'),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Events table
export const events = pgTable('events', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  eventDate: timestamp('event_date').notNull(),
  seatCapacity: integer('seat_capacity').notNull(),
  availableSeats: integer('available_seats').notNull(),
  createdBy: integer('created_by').references(() => users.id),
  createdAt: timestamp('created_at').defaultNow(),
  updatedAt: timestamp('updated_at').defaultNow()
});

// Bookings table
export const bookings = pgTable('bookings', {
  id: serial('id').primaryKey(),
  bookingId: varchar('booking_id', { length: 50 }).notNull().unique(),
  userId: integer('user_id').references(() => users.id, { onDelete: 'cascade' }),
  eventId: integer('event_id').references(() => events.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 20 }).default('confirmed'),
  createdAt: timestamp('created_at').defaultNow(),
  cancelledAt: timestamp('cancelled_at')
}, (table) => ({
  uniqueUserEvent: unique().on(table.userId, table.eventId)
}));

// Booking logs table
export const bookingLogs = pgTable('booking_logs', {
  id: serial('id').primaryKey(),
  bookingId: varchar('booking_id', { length: 50 }).notNull(),
  action: varchar('action', { length: 20 }).notNull(), // 'created', 'cancelled'
  userId: integer('user_id'),
  eventId: integer('event_id'),
  details: jsonb('details'),
  timestamp: timestamp('timestamp').defaultNow()
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  bookings: many(bookings),
  createdEvents: many(events)
}));

export const eventsRelations = relations(events, ({ one, many }) => ({
  creator: one(users, {
    fields: [events.createdBy],
    references: [users.id]
  }),
  bookings: many(bookings)
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id]
  }),
  event: one(events, {
    fields: [bookings.eventId],
    references: [events.id]
  })
}));

// Export types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Event = typeof events.$inferSelect;
export type NewEvent = typeof events.$inferInsert;
export type Booking = typeof bookings.$inferSelect;
export type NewBooking = typeof bookings.$inferInsert;
export type BookingLog = typeof bookingLogs.$inferSelect;
export type NewBookingLog = typeof bookingLogs.$inferInsert;