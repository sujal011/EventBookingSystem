-- Drop the existing unique constraint that prevents rebooking after cancellation
ALTER TABLE "bookings" DROP CONSTRAINT IF EXISTS "bookings_user_id_event_id_unique";

-- Create a partial unique index that only applies to confirmed bookings
-- This allows users to rebook after cancelling
CREATE UNIQUE INDEX "bookings_user_event_confirmed_unique" 
ON "bookings" (user_id, event_id) 
WHERE status = 'confirmed';

-- Add comment explaining the constraint
COMMENT ON INDEX "bookings_user_event_confirmed_unique" IS 
'Ensures a user can only have one confirmed booking per event, but allows rebooking after cancellation';
