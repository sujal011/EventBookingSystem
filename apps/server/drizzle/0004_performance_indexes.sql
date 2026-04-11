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