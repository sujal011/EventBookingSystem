import { useState, useEffect } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { eventsApi } from '@/lib/api';
import { useWebSocket } from '@/hooks/useWebSocket';
import { BookingForm } from '@/components/BookingForm';
import { BookingConfirmation } from '@/components/BookingConfirmation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [event, setEvent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingId, setBookingId] = useState<string | null>(null);

  // WebSocket for real-time seat updates
  const token = localStorage.getItem('auth_token');
  const { lastMessage } = useWebSocket(event?.id, token);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await eventsApi.get(id!);
        if (response.success) {
          setEvent(response.data);
        }
      } catch (error: any) {
        toast({
          title: 'Error loading event',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id, toast]);

  // Update seats in real-time
  useEffect(() => {
    if (lastMessage) {
      if (lastMessage.type === 'seat_update' || 
          lastMessage.type === 'booking_created' || 
          lastMessage.type === 'booking_cancelled') {
        setEvent((prev: any) => {
          if (!prev) return prev;
          return {
            ...prev,
            availableSeats: lastMessage.availableSeats,
          };
        });
      }
    }
  }, [lastMessage]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!event) {
    return <Navigate to="/" replace />;
  }

  const availableSeats = event.availableSeats;
  const isSoldOut = availableSeats === 0;

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto px-4 py-8">
        <Button variant="ghost" asChild className="mb-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Events
          </Link>
        </Button>

        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <Badge className="bg-primary/10 text-primary">Event</Badge>
                {isSoldOut && <Badge variant="destructive">Sold Out</Badge>}
              </div>
              <h1 className="text-4xl font-bold mb-4">{event.name}</h1>
              <p className="text-lg text-muted-foreground">{event.description || 'No description available'}</p>
            </div>

            {event.imageUrl && (
              <div className="rounded-lg overflow-hidden">
                <img src={event.imageUrl} alt={event.name} className="w-full h-64 object-cover" />
              </div>
            )}

            <div className="space-y-4 p-6 bg-muted rounded-lg">
              <h3 className="font-semibold text-lg">Event Information</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Date</p>
                    <p className="font-medium">
                      {new Date(event.eventDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Time</p>
                    <p className="font-medium">
                      {new Date(event.eventDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Location</p>
                    <p className="font-medium">Online</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Availability</p>
                    <p className="font-medium">
                      {availableSeats} of {event.seatCapacity} seats available
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="pt-4">
                <div className="h-3 w-full bg-background rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all"
                    style={{ width: `${((event.seatCapacity - availableSeats) / event.seatCapacity) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {Math.round(((event.seatCapacity - availableSeats) / event.seatCapacity) * 100)}% booked
                </p>
              </div>
            </div>
          </div>

          <div>
            {!user ? (
              <div className="p-8 text-center bg-muted rounded-lg">
                <h3 className="text-xl font-semibold mb-2">Sign In Required</h3>
                <p className="text-muted-foreground mb-4">
                  You need to be signed in to book this event.
                </p>
                <Button onClick={() => navigate('/auth')}>
                  Sign In
                </Button>
              </div>
            ) : bookingId ? (
              <BookingConfirmation 
                event={{
                  id: event.id.toString(),
                  title: event.name,
                  description: event.description || '',
                  date: event.eventDate,
                  time: new Date(event.eventDate).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  }),
                  location: 'Online',
                  totalSeats: event.seatCapacity,
                  bookedSeats: event.seatCapacity - availableSeats,
                  category: 'conference',
                  imageUrl: event.imageUrl,
                }} 
                bookingId={bookingId} 
              />
            ) : (
              <>
                {isSoldOut ? (
                  <div className="p-8 text-center bg-muted rounded-lg">
                    <h3 className="text-xl font-semibold mb-2">Event Sold Out</h3>
                    <p className="text-muted-foreground">
                      Unfortunately, all seats for this event have been booked.
                    </p>
                  </div>
                ) : (
                  <BookingForm 
                    event={{
                      id: event.id.toString(),
                      title: event.name,
                      description: event.description || '',
                      date: event.eventDate,
                      time: new Date(event.eventDate).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                      }),
                      location: 'Online',
                      totalSeats: event.seatCapacity,
                      bookedSeats: event.seatCapacity - availableSeats,
                      category: 'conference',
                      imageUrl: event.imageUrl,
                    }} 
                    onSuccess={setBookingId} 
                  />
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetail;
