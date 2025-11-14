import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { bookingsApi, eventsApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, MapPin, Clock, Trash2, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BookingWithEvent {
  bookingId: string;
  eventId: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  cancelledAt?: string | null;
  event: {
    id: number;
    name: string;
    eventDate: string;
    seatCapacity: number;
    availableSeats: number;
  };
}

const MyBookings = () => {
  const [bookings, setBookings] = useState<BookingWithEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingsApi.getUserBookings();
        if (response.success) {
          setBookings(response.data.bookings);
        }
      } catch (error: any) {
        toast({
          title: "Error loading bookings",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user, toast]);

  const handleCancelBooking = async (bookingId: string) => {
    try {
      const response = await bookingsApi.cancel(bookingId);
      if (response.success) {
        // Update local state
        setBookings(bookings.map(b => 
          b.bookingId === bookingId 
            ? { ...b, status: 'cancelled' as const, cancelledAt: new Date().toISOString() } 
            : b
        ));
        
        toast({
          title: "Booking Cancelled",
          description: "Your booking has been successfully cancelled.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error cancelling booking",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Events
        </Button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Manage your event reservations</p>
        </div>

        {bookings.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground mb-6">Start exploring events and make your first booking</p>
              <Button onClick={() => navigate("/")}>Browse Events</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {confirmedBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Active Bookings</h2>
                <div className="grid gap-4">
                  {confirmedBookings.map((booking) => (
                    <Card key={booking.bookingId} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{booking.event.name}</CardTitle>
                            <CardDescription>Booking ID: {booking.bookingId}</CardDescription>
                          </div>
                          <Badge variant="default">Confirmed</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(booking.event.eventDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(booking.event.eventDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>Online</span>
                          </div>
                          <div className="pt-4 flex gap-2">
                            <Button
                              variant="outline"
                              onClick={() => navigate(`/event/${booking.eventId}`)}
                            >
                              View Event
                            </Button>
                            <Button
                              variant="destructive"
                              onClick={() => handleCancelBooking(booking.bookingId)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Cancel Booking
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {cancelledBookings.length > 0 && (
              <div>
                <h2 className="text-2xl font-semibold mb-4">Cancelled Bookings</h2>
                <div className="grid gap-4">
                  {cancelledBookings.map((booking) => (
                    <Card key={booking.bookingId} className="opacity-60">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div>
                            <CardTitle className="text-xl">{booking.event.name}</CardTitle>
                            <CardDescription>Booking ID: {booking.bookingId}</CardDescription>
                          </div>
                          <Badge variant="secondary">Cancelled</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center text-sm">
                            <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(booking.event.eventDate).toLocaleDateString('en-US', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                          <div className="flex items-center text-sm">
                            <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
                            <span>
                              {new Date(booking.event.eventDate).toLocaleTimeString('en-US', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;
