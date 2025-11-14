import { useState } from 'react';
import { Event } from '@/types/event';
import { bookingsApi } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

interface BookingFormProps {
  event: Event;
  onSuccess: (bookingId: string) => void;
}

export const BookingForm = ({ event, onSuccess }: BookingFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAuth();

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
