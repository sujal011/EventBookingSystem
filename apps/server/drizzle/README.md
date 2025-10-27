# Database Migrations

This directory contains the database migration files for the Event Booking System.

## Migration Files

1. **0000_overrated_magma.sql** - Initial schema creation
   - Creates users, events, bookings, and booking_logs tables
   - Sets up foreign key relationships
   - Adds unique constraints

2. **0001_stored_procedures.sql** - Stored procedures and constraints
   - Adds check constraints for seat capacity validation
   - Creates `create_booking()` function for atomic booking operations
   - Creates `cancel_booking()` function for atomic cancellation operations

3. **0002_performance_indexes.sql** - Performance optimization indexes
   - Adds indexes for efficient querying on all tables
   - Optimizes authentication and booking lookup operations

## Running Migrations

To run all migrations:

```bash
bun run db:migrate
```

To generate new migrations after schema changes:

```bash
bun run db:generate
```

To open Drizzle Studio for database inspection:

```bash
bun run db:studio
```

## Database Schema Overview

### Tables

- **users**: User accounts with authentication and role information
- **events**: Event definitions with seat capacity management
- **bookings**: Individual booking records linking users to events
- **booking_logs**: Audit trail for all booking operations

### Stored Procedures

- **create_booking(user_id, event_id, booking_id)**: Atomically creates a booking with seat validation
- **cancel_booking(booking_id)**: Atomically cancels a booking and releases the seat

### Key Features

- Atomic operations prevent race conditions in concurrent booking scenarios
- Check constraints ensure data integrity for seat capacity
- Comprehensive indexing for optimal query performance
- Audit logging for all booking operations