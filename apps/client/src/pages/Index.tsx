import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { eventsApi } from '@/lib/api';
import { EventCard } from '@/components/EventCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Calendar, Search, User, Settings, LogOut } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const Index = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await eventsApi.list({ upcoming: true });
        if (response.success) {
          setEvents(response.data.events);
        }
      } catch (error: any) {
        toast({
          title: 'Error loading events',
          description: error.message,
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [toast]);

  const filteredEvents = events.filter((event) => {
    const matchesSearch = event.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         event.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  const handleLogout = () => {
    logout();
    toast({
      title: 'Logged out',
      description: 'You have been logged out successfully',
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary to-primary/80 text-primary-foreground">
        <div className="container max-w-6xl mx-auto px-4 py-20">
          <div className="flex items-start justify-between mb-8">
            <div className="max-w-3xl">
              <h1 className="text-5xl font-bold mb-4">
                Book Your Seat for Upcoming Events
              </h1>
              <p className="text-xl text-primary-foreground/90 mb-8">
                Discover webinars, training sessions, and workshops. Reserve your spot before seats run out!
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button size="lg" variant="secondary" className="shadow-lg">
                  Browse Events
                </Button>
                <Button size="lg" variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                  <Calendar className="mr-2 h-5 w-5" />
                  View Calendar
                </Button>
              </div>
            </div>
            <div className="flex flex-col gap-2">
              {user ? (
                <>
                  <Button
                    variant="outline"
                    className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={() => navigate('/my-bookings')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    My Bookings
                  </Button>
                  {user.role === 'admin' && (
                    <Button
                      variant="outline"
                      className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
                      onClick={() => navigate('/admin')}
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      Admin
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20"
                  onClick={() => navigate('/auth')}
                >
                  <User className="mr-2 h-4 w-4" />
                  Sign In
                </Button>
              )}
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent" />
      </section>

      {/* Events Section */}
      <section className="container max-w-6xl mx-auto px-4 py-12">
        {/* Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search events..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Event Grid */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : filteredEvents.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={{
                  id: event.id.toString(),
                  title: event.name,
                  description: event.description || '',
                  date: event.eventDate,
                  time: new Date(event.eventDate).toLocaleTimeString('en-US', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  }),
                  location: 'Online',
                  totalSeats: event.seatCapacity,
                  bookedSeats: event.seatCapacity - event.availableSeats,
                  category: 'conference',
                  imageUrl: event.imageUrl,
                }} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground text-lg">No events found matching your criteria.</p>
          </div>
        )}
      </section>
    </div>
  );
};

export default Index;
