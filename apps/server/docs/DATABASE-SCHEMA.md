# Database Schema Documentation

## Overview

The Event Booking System uses PostgreSQL as its database with Drizzle ORM for type-safe database operations. The schema is designed to support event management, user authentication, booking operations, and comprehensive audit logging.

## Database Diagram

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ email (UNIQUE)  │
│ name            │
│ password_hash   │
│ role            │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ created_by
         │
┌────────▼────────┐         ┌─────────────────┐
│     events      │         │    bookings     │
├─────────────────┤         ├─────────────────┤
│ id (PK)         │◄────────┤ id (PK)         │
│ name            │ event_id│ booking_id (UK) │
│ description     │         │ user_id (FK)    │
│ event_date      │         │ event_id (FK)   │
│ seat_capacity   │         │ status          │
│ available_seats │         │ created_at      │
│ created_by (FK) │         │ cancelled_at    │
│ created_at      │         └────────┬────────┘
│ updated_at      │                  │
└─────────────────┘                  │
                                     │
                            ┌────────▼────────┐
                            │  booking_logs   │
                            ├─────────────────┤
                            │ id (PK)         │
                            │ booking_id      │
                            │ action          │
                            │ user_id         │
                            │ event_id        │
                            │ details (JSONB) │
                            │ timestamp       │
                            └─────────────────┘

Legend:
PK = Primary Key
FK = Foreign Key
UK = Unique Key
```

## Tables

### users

Stores user account information and authentication credentials.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique user identifier |
| email | VARCHAR(255) | NOT NULL, UNIQUE | User's email address (used for login) |
| name | VARCHAR(255) | NOT NULL | User's full name |
| password_hash | VARCHAR(255) | NOT NULL | Bcrypt hashed password |
| role | VARCHAR(50) | DEFAULT 'user' | User role: 'user' or 'admin' |
| created_at | TIMESTAMP | DEFAULT NOW() | Account creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_users_email` - Fast email lookup for authentication
- `idx_users_role` - Efficient role-based queries

**Business Rules:**
- Email must be unique across all users
- Password is hashed with bcrypt (12 salt rounds)
- Role defaults to 'user' if not specified
- Admin users have elevated permissions

**Example:**
```sql
INSERT INTO users (email, name, password_hash, role)
VALUES ('admin@example.com', 'Admin User', '$2b$12$...', 'admin');
```

---

### events

Stores event information including scheduling and capacity management.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique event identifier |
| name | VARCHAR(255) | NOT NULL | Event name/title |
| description | TEXT | NULL | Detailed event description |
| event_date | TIMESTAMP | NOT NULL | Date and time of the event |
| seat_capacity | INTEGER | NOT NULL, CHECK > 0 | Total number of seats available |
| available_seats | INTEGER | NOT NULL, CHECK >= 0 | Current number of available seats |
| created_by | INTEGER | FOREIGN KEY (users.id) | User who created the event |
| created_at | TIMESTAMP | DEFAULT NOW() | Event creation timestamp |
| updated_at | TIMESTAMP | DEFAULT NOW() | Last update timestamp |

**Indexes:**
- `idx_events_event_date` - Efficient date-based queries
- `idx_events_available_seats` - Fast availability checks (WHERE available_seats > 0)
- `idx_events_created_by` - Quick lookup of user's events

**Constraints:**
- `check_seat_capacity`: seat_capacity > 0
- `check_available_seats`: available_seats >= 0 AND available_seats <= seat_capacity

**Business Rules:**
- Event date must be in the future for new events
- Available seats cannot exceed seat capacity
- Available seats cannot be negative
- Seat capacity must be at least 1
- Events with bookings cannot be deleted

**Example:**
```sql
INSERT INTO events (name, description, event_date, seat_capacity, available_seats, created_by)
VALUES ('Tech Conference 2025', 'Annual tech conference', '2025-12-15 10:00:00', 500, 500, 1);
```

---

### bookings

Stores individual booking records linking users to events.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique booking record identifier |
| booking_id | VARCHAR(50) | NOT NULL, UNIQUE | User-facing booking ID (e.g., BK-1K2L3M4N5O-ABC123) |
| user_id | INTEGER | FOREIGN KEY (users.id) ON DELETE CASCADE | User who made the booking |
| event_id | INTEGER | FOREIGN KEY (events.id) ON DELETE CASCADE | Event being booked |
| status | VARCHAR(20) | DEFAULT 'confirmed' | Booking status: 'confirmed' or 'cancelled' |
| created_at | TIMESTAMP | DEFAULT NOW() | Booking creation timestamp |
| cancelled_at | TIMESTAMP | NULL | Cancellation timestamp (NULL if not cancelled) |

**Indexes:**
- `idx_bookings_user_id` - Fast user booking lookups
- `idx_bookings_event_id` - Efficient event booking queries
- `idx_bookings_status` - Status-based filtering
- `idx_bookings_created_at` - Chronological sorting
- `bookings_user_event_confirmed_unique` (PARTIAL UNIQUE) - Ensures one confirmed booking per user per event

**Constraints:**
- Partial unique index on (user_id, event_id) WHERE status = 'confirmed'
- This allows users to rebook after cancellation

**Business Rules:**
- User can only have ONE confirmed booking per event
- User can rebook after cancelling
- Booking ID is automatically generated and unique
- Bookings cascade delete when user or event is deleted
- Cannot book past events
- Cannot book events with no available seats

**Example:**
```sql
INSERT INTO bookings (booking_id, user_id, event_id, status)
VALUES ('BK-1K2L3M4N5O-ABC123', 2, 1, 'confirmed');
```

---

### booking_logs

Audit log for all booking operations (creation and cancellation).

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| id | SERIAL | PRIMARY KEY | Unique log entry identifier |
| booking_id | VARCHAR(50) | NOT NULL | Booking ID being logged |
| action | VARCHAR(20) | NOT NULL | Action performed: 'created' or 'cancelled' |
| user_id | INTEGER | NULL | User who performed the action |
| event_id | INTEGER | NULL | Event associated with the action |
| details | JSONB | NULL | Additional details (e.g., seats remaining) |
| timestamp | TIMESTAMP | DEFAULT NOW() | When the action occurred |

**Indexes:**
- `idx_booking_logs_booking_id` - Fast booking history lookup
- `idx_booking_logs_action` - Action-based filtering
- `idx_booking_logs_timestamp` - Chronological queries
- `idx_booking_logs_user_event` - User/event activity tracking

**Business Rules:**
- Automatically populated by stored procedures
- Immutable (logs are never updated or deleted)
- Used for audit trail and analytics
- Details field stores JSON data for flexibility

**Example:**
```sql
INSERT INTO booking_logs (booking_id, action, user_id, event_id, details)
VALUES ('BK-1K2L3M4N5O-ABC123', 'created', 2, 1, '{"seats_remaining": 499}');
```

## Stored Procedures

### create_booking(p_user_id, p_event_id, p_booking_id)

Atomically creates a booking with seat validation and logging.

**Parameters:**
- `p_user_id` (INTEGER): User ID creating the booking
- `p_event_id` (INTEGER): Event ID to book
- `p_booking_id` (VARCHAR): Unique booking ID

**Returns:** BOOLEAN (TRUE if successful, FALSE if no seats available)

**Operations:**
1. Locks the event row for update (prevents race conditions)
2. Checks if seats are available
3. Creates booking record
4. Decrements available_seats
5. Logs the booking creation
6. Commits transaction

**Example:**
```sql
SELECT create_booking(2, 1, 'BK-1K2L3M4N5O-ABC123');
```

---

### cancel_booking(p_booking_id)

Atomically cancels a booking and releases the seat.

**Parameters:**
- `p_booking_id` (VARCHAR): Booking ID to cancel

**Returns:** BOOLEAN (TRUE if successful, FALSE if booking not found or already cancelled)

**Operations:**
1. Locks the booking and event rows
2. Verifies booking exists and is confirmed
3. Updates booking status to 'cancelled'
4. Sets cancelled_at timestamp
5. Increments available_seats
6. Logs the cancellation
7. Commits transaction

**Example:**
```sql
SELECT cancel_booking('BK-1K2L3M4N5O-ABC123');
```

## Relationships

### One-to-Many Relationships

1. **users → events** (created_by)
   - One user can create many events
   - Events track their creator

2. **users → bookings** (user_id)
   - One user can have many bookings
   - Bookings cascade delete when user is deleted

3. **events → bookings** (event_id)
   - One event can have many bookings
   - Bookings cascade delete when event is deleted

### Referential Integrity

All foreign keys enforce referential integrity:
- `events.created_by` → `users.id` (SET NULL on delete)
- `bookings.user_id` → `users.id` (CASCADE on delete)
- `bookings.event_id` → `events.id` (CASCADE on delete)

## Data Types

### Timestamps

All timestamps are stored in UTC and use PostgreSQL's `TIMESTAMP` type:
- `created_at`: Automatically set on record creation
- `updated_at`: Automatically updated on record modification
- `cancelled_at`: Set when booking is cancelled
- `event_date`: Event occurrence date/time

### JSONB

The `booking_logs.details` field uses JSONB for flexible data storage:
- Efficient indexing and querying
- Stores additional context (e.g., seats remaining)
- Allows schema evolution without migrations

## Performance Optimizations

### Indexes

Strategic indexes for common query patterns:
- Authentication: `users.email`
- Event listing: `events.event_date`, `events.available_seats`
- Booking lookups: `bookings.booking_id`, `bookings.user_id`, `bookings.event_id`
- Audit queries: `booking_logs.booking_id`, `booking_logs.timestamp`

### Partial Indexes

- `bookings_user_event_confirmed_unique`: Only indexes confirmed bookings, reducing index size

### Row-Level Locking

Stored procedures use `FOR UPDATE` to prevent race conditions:
- Ensures atomic seat management
- Prevents overselling
- Maintains data consistency under high concurrency

## Migrations

### Migration Files

Located in `drizzle/` directory:

1. **0000_overrated_magma.sql** - Initial schema
   - Creates all tables
   - Sets up foreign keys
   - Adds basic constraints

2. **0001_stored_procedures.sql** - Atomic operations
   - Creates `create_booking()` function
   - Creates `cancel_booking()` function
   - Adds check constraints

3. **0002_fix_booking_constraint.sql** - Rebooking support
   - Drops unique constraint on (user_id, event_id)
   - Creates partial unique index for confirmed bookings only

4. **0002_performance_indexes.sql** - Performance optimization
   - Adds all performance indexes
   - Optimizes common query patterns

### Running Migrations

```bash
# Generate new migration after schema changes
bun run db:generate

# Apply migrations to database
bun run db:migrate

# View database in Drizzle Studio
bun run db:studio
```

## Database Scripts

### Initialization

```bash
# Initialize database (run migrations)
bun run scripts/init-db.ts
```

### Seeding

```bash
# Seed with sample data
bun run scripts/seed.ts
```

Creates:
- 4 users (1 admin, 3 regular)
- 6 events (5 upcoming, 1 past)
- 5 sample bookings

### Reset

```bash
# Reset database (WARNING: Deletes all data!)
bun run scripts/reset-db.ts
```

## Backup and Restore

### Backup

```bash
# Full database backup
pg_dump -U username -d event_booking > backup.sql

# Schema only
pg_dump -U username -d event_booking --schema-only > schema.sql

# Data only
pg_dump -U username -d event_booking --data-only > data.sql
```

### Restore

```bash
# Restore from backup
psql -U username -d event_booking < backup.sql
```

## Security Considerations

### Password Storage

- Passwords are hashed with bcrypt (12 salt rounds)
- Never store plain text passwords
- Password hashes are 60 characters

### SQL Injection Prevention

- All queries use parameterized statements via Drizzle ORM
- Stored procedures use proper parameter binding
- No string concatenation in queries

### Data Access Control

- Row-level security can be added for multi-tenancy
- Application-level authorization enforced in API layer
- Audit logging tracks all booking operations

## Monitoring and Maintenance

### Query Performance

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY mean_exec_time DESC 
LIMIT 10;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan ASC;
```

### Database Size

```sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Connection Pool

Monitor connection pool usage:
- Min connections: 2 (configurable)
- Max connections: 10 (configurable)
- Adjust based on load

## Troubleshooting

### Common Issues

**Constraint Violations:**
- Check constraint error: Verify seat capacity and available seats
- Unique constraint error: User already has confirmed booking
- Foreign key error: Referenced user or event doesn't exist

**Deadlocks:**
- Stored procedures use consistent lock ordering
- Retry failed transactions
- Monitor with `pg_stat_activity`

**Performance:**
- Verify indexes exist: `\di` in psql
- Check query plans: `EXPLAIN ANALYZE`
- Monitor connection pool usage

## Related Documentation

- [Setup Guide](./SETUP.md) - Database setup instructions
- [API Documentation](./API.md) - API endpoints using this schema
- [Configuration Guide](./configuration.md) - Database configuration options
