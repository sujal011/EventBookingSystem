# Event Booking System - Backend

## Completed Work

### Task 2: Database Schema and Infrastructure ✅

**2.1 Project Structure Setup** ✅
- Examined the existing server structure in apps/server/
- Confirmed the Drizzle configuration and dependencies are properly set up
- Verified the project structure with Hono framework and database setup

**2.2 Database Schema Implementation** ✅
- Created comprehensive Drizzle schema definitions in apps/server/src/db/schema.ts
- Defined all required tables: users, events, bookings, and booking_logs
- Set up proper relationships and foreign key constraints
- Added TypeScript type exports for type safety

**2.3 Migration Scripts Creation** ✅
- Generated initial migration file using Drizzle Kit
- Created additional migration files for:
  - Stored procedures for atomic booking operations (create_booking and cancel_booking)
  - Check constraints for data integrity
  - Performance indexes for optimal query performance
- Set up database connection utilities and migration runner
- Added npm scripts for database operations

**Key Features Implemented:**
- Complete Database Schema - All tables with proper relationships and constraints
- Atomic Operations - Stored procedures prevent race conditions in booking scenarios
- Performance Optimization - Strategic indexes for efficient querying
- Type Safety - Full TypeScript integration with Drizzle ORM
- Migration Management - Proper version control and deployment of database changes

### Task 3: Authentication and Authorization System ✅

**3.1 Implement user model and password hashing** ✅
- Created `AuthService` class with bcrypt password hashing (12 salt rounds)
- Implemented user registration with email uniqueness validation
- Added user login with credential validation
- Implemented role-based user types (user/admin)
- Created Zod validation schemas for registration and login

**3.2 Build JWT authentication middleware** ✅
- Used Hono's built-in JWT utilities (`sign`, `verify`) instead of external libraries
- Created `authMiddleware` for JWT token validation
- Implemented `requireRole` and `requireAdmin` middleware for authorization
- Added `optionalAuth` middleware for optional authentication
- Created authentication routes (`/api/auth/register`, `/api/auth/login`, `/api/auth/me`)

**Key Features Implemented:**
- **Password Security**: bcrypt hashing with 12 salt rounds
- **JWT Authentication**: Using Hono's native JWT support with 24-hour expiration
- **Role-based Authorization**: Support for 'user' and 'admin' roles
- **Input Validation**: Zod schemas for request validation
- **Error Handling**: Comprehensive error responses with proper HTTP status codes
- **Type Safety**: Full TypeScript support with proper type definitions

The authentication system is now ready and integrated into the main server application. Users can register, login, and access protected routes based on their roles.




## Database Implementation Details

### Stored Procedures

```sql

-- Add check constraints for events table
ALTER TABLE "events" ADD CONSTRAINT "check_seat_capacity" CHECK (seat_capacity > 0);
ALTER TABLE "events" ADD CONSTRAINT "check_available_seats" CHECK (available_seats >= 0 AND available_seats <= seat_capacity);

-- Create stored procedure for atomic booking creation
CREATE OR REPLACE FUNCTION create_booking(
    p_user_id INTEGER,
    p_event_id INTEGER,
    p_booking_id VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    available_count INTEGER;
BEGIN
    -- Lock the event row for update
    SELECT available_seats INTO available_count
    FROM events 
    WHERE id = p_event_id 
    FOR UPDATE;
    
    -- Check if seats are available
    IF available_count <= 0 THEN
        RETURN FALSE;
    END IF;
    
    -- Create booking
    INSERT INTO bookings (booking_id, user_id, event_id)
    VALUES (p_booking_id, p_user_id, p_event_id);
    
    -- Decrease available seats
    UPDATE events 
    SET available_seats = available_seats - 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_event_id;
    
    -- Log the booking
    INSERT INTO booking_logs (booking_id, action, user_id, event_id, details)
    VALUES (p_booking_id, 'created', p_user_id, p_event_id, 
            json_build_object('seats_remaining', available_count - 1));
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Create stored procedure for atomic booking cancellation
CREATE OR REPLACE FUNCTION cancel_booking(p_booking_id VARCHAR(50)) 
RETURNS BOOLEAN AS $$
DECLARE
    booking_record RECORD;
BEGIN
    -- Get booking details and lock
    SELECT b.*, e.id as event_id INTO booking_record
    FROM bookings b
    JOIN events e ON b.event_id = e.id
    WHERE b.booking_id = p_booking_id AND b.status = 'confirmed'
    FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    -- Update booking status
    UPDATE bookings 
    SET status = 'cancelled', 
        cancelled_at = CURRENT_TIMESTAMP
    WHERE booking_id = p_booking_id;
    
    -- Increase available seats
    UPDATE events 
    SET available_seats = available_seats + 1,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = booking_record.event_id;
    
    -- Log the cancellation
    INSERT INTO booking_logs (booking_id, action, user_id, event_id)
    VALUES (p_booking_id, 'cancelled', booking_record.user_id, booking_record.event_id);
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

```

### Performance Indexes

```sql
-- Performance indexes for the event booking system

-- Index on events table for efficient event queries
CREATE INDEX idx_events_event_date ON events(event_date);
CREATE INDEX idx_events_available_seats ON events(available_seats) WHERE available_seats > 0;
CREATE INDEX idx_events_created_by ON events(created_by);

-- Index on bookings table for efficient booking queries
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_event_id ON bookings(event_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);

-- Index on booking_logs for efficient log queries
CREATE INDEX idx_booking_logs_booking_id ON booking_logs(booking_id);
CREATE INDEX idx_booking_logs_action ON booking_logs(action);
CREATE INDEX idx_booking_logs_timestamp ON booking_logs(timestamp);
CREATE INDEX idx_booking_logs_user_event ON booking_logs(user_id, event_id);

-- Index on users table for authentication
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

```