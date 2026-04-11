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