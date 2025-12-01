import { useState, useEffect } from 'react';
import { Event, Booking } from '@/types/event';
import { bookingsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';
import { BookingConfirmation } from './BookingConfirmation';

interface BookingFormProps {
  event: Event;
  onSuccess: (bookingId: string) => void;
}

export const BookingForm = ({ event, onSuccess }: BookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [existingBooking, setExistingBooking] = useState<Booking | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const checkExistingBooking = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await bookingsApi.getUserBookings();
        if (response.success && response.data.bookings) {
          const booking = response.data.bookings.find(
            (b: Booking) => b.eventId === parseInt(event.id) && b.status === 'confirmed'
          );
          setExistingBooking(booking || null);
        }
      } catch (error) {
        console.error('Error checking existing booking:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingBooking();
  }, [user, event.id]);

  const handleBooking = async () => {
    if (!user) {
      toast.error('Please sign in to book this event');
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await bookingsApi.create(parseInt(event.id));
      
      if (response.success) {
        toast.success('Booking confirmed!', {
          description: `Your booking ID is ${response.data.bookingId}`,
          icon: <CheckCircle2 className="h-5 w-5" />,
        });
        onSuccess(response.data.bookingId);
      }
    } catch (error: any) {
      toast.error('Booking failed', {
        description: error.message || 'Could not complete booking',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
          <CardDescription>Checking your booking status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (existingBooking) {
    return (
      <BookingConfirmation 
        event={event}
        bookingId={existingBooking.bookingId}
      />
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Booking</CardTitle>
        <CardDescription>
          Reserve your seat for this event
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="p-4 bg-muted rounded-lg space-y-2">
            <p className="text-sm text-muted-foreground">Booking as</p>
            <p className="font-medium">{user?.name}</p>
            <p className="text-sm">{user?.email}</p>
          </div>

          <Button 
            onClick={handleBooking} 
            className="w-full" 
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
