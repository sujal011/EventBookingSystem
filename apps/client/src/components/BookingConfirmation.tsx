import { Event } from '@/types/event';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Calendar, Clock, MapPin, Download } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BookingConfirmationProps {
  event: Event;
  bookingId: string;
}

export const BookingConfirmation = ({ event, bookingId }: BookingConfirmationProps) => {
  return (
    <Card className="border-success">
      <CardHeader className="text-center space-y-4">
        <div className="mx-auto w-16 h-16 bg-success/10 rounded-full flex items-center justify-center">
          <CheckCircle2 className="h-10 w-10 text-success" />
        </div>
        <div>
          <CardTitle className="text-2xl">Booking Confirmed!</CardTitle>
          <CardDescription className="text-base mt-2">
            Your seat has been reserved successfully
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground mb-1">Booking ID</p>
          <p className="text-xl font-mono font-semibold">{bookingId}</p>
        </div>

        <div className="space-y-3">
          <h4 className="font-semibold">Event Details</h4>
          <div className="space-y-2 text-sm">
            <p className="font-medium">{event.title}</p>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{new Date(event.date).toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>{event.time}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{event.location}</span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-accent/10 border border-accent/20 rounded-lg">
          <p className="text-sm text-accent-foreground">
            <strong>Important:</strong> A confirmation email has been sent to your registered email address. Please save your booking ID for future reference.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button variant="outline" className="flex-1">
            <Download className="mr-2 h-4 w-4" />
            Download Ticket
          </Button>
          <Button asChild className="flex-1">
            <Link to="/">View All Events</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
