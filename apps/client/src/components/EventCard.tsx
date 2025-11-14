import { Event } from '@/types/event';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

interface EventCardProps {
  event: Event;
}

export const EventCard = ({ event }: EventCardProps) => {
  const availableSeats = event.totalSeats - event.bookedSeats;
  const availabilityPercentage = (availableSeats / event.totalSeats) * 100;

  const getAvailabilityStatus = () => {
    if (availableSeats === 0) {
      return { label: 'Sold Out', variant: 'destructive' as const };
    }
    if (availabilityPercentage <= 20) {
      return { label: 'Almost Full', variant: 'default' as const };
    }
    return { label: 'Available', variant: 'secondary' as const };
  };

  const getCategoryColor = () => {
    const colors = {
      webinar: 'bg-primary/10 text-primary',
      training: 'bg-accent/10 text-accent',
      workshop: 'bg-success/10 text-success',
      conference: 'bg-muted text-muted-foreground',
    };
    return colors[event.category];
  };

  const status = getAvailabilityStatus();

  return (
    <Card className="group overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="space-y-3">
        <div className="flex items-start justify-between gap-2">
          <Badge className={getCategoryColor()}>{event.category}</Badge>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>
        <h3 className="text-xl font-semibold leading-tight group-hover:text-primary transition-colors">
          {event.title}
        </h3>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground line-clamp-2">{event.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Calendar className="h-4 w-4" />
            <span>{new Date(event.date).toLocaleDateString('en-US', { 
              weekday: 'short', 
              year: 'numeric', 
              month: 'short', 
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
          <div className="flex items-center gap-2 text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>
              {availableSeats} of {event.totalSeats} seats available
            </span>
          </div>
        </div>
        <div className="space-y-1">
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${((event.bookedSeats / event.totalSeats) * 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button asChild className="w-full" disabled={availableSeats === 0}>
          <Link to={`/event/${event.id}`}>
            {availableSeats === 0 ? 'Sold Out' : 'Book Now'}
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
};
