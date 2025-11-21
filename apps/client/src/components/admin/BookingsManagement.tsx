import { useState, useEffect } from "react";
import { eventsApi, bookingsApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Calendar, TrendingUp, CheckCircle, XCircle, Loader2, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Booking } from "@/types/event";
import * as XLSX from 'xlsx';

const BookingsManagement = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [bookingsLoading, setBookingsLoading] = useState(false);
  const [stats, setStats] = useState({
    totalBookings: 0,
    confirmedBookings: 0,
    cancelledBookings: 0,
    attendanceRate: 0,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (selectedEventId) {
      fetchEventBookings(selectedEventId);
    }
  }, [selectedEventId]);

  const fetchEvents = async () => {
    try {
      const response = await eventsApi.list({});
      if (response.success) {
        setEvents(response.data.events);
        if (response.data.events.length > 0) {
          setSelectedEventId(response.data.events[0].id);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchEventBookings = async (eventId: number) => {
    setBookingsLoading(true);
    try {
      const response = await bookingsApi.getEventBookings(eventId);
      if (response.success) {
        const bookingsList = response.data.bookings || [];
        setBookings(bookingsList);
        
        // Calculate stats
        const confirmed = bookingsList.filter((b: Booking) => b.status === 'confirmed').length;
        const cancelled = bookingsList.filter((b: Booking) => b.status === 'cancelled').length;
        const total = bookingsList.length;
        
        setStats({
          totalBookings: total,
          confirmedBookings: confirmed,
          cancelledBookings: cancelled,
          attendanceRate: total > 0 ? Math.round((confirmed / total) * 100) : 0,
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setBookingsLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;

    try {
      const response = await bookingsApi.cancel(bookingId);
      if (response.success) {
        toast({
          title: "Booking Cancelled",
          description: "The booking has been successfully cancelled.",
        });
        if (selectedEventId) {
          fetchEventBookings(selectedEventId);
        }
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleExportToExcel = () => {
    if (bookings.length === 0) {
      toast({
        title: "No Data",
        description: "There are no bookings to export.",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for Excel
    const exportData = bookings.map((booking) => ({
      'Booking ID': booking.bookingId,
      'Name': booking.user?.name || 'N/A',
      'Email': booking.user?.email || 'N/A',
      'Status': booking.status,
      'Booked On': new Date(booking.createdAt).toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      'Cancelled On': booking.cancelledAt 
        ? new Date(booking.cancelledAt).toLocaleDateString() 
        : '',
    }));

    // Create worksheet
    const ws = XLSX.utils.json_to_sheet(exportData);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // Booking ID
      { wch: 20 }, // Name
      { wch: 30 }, // Email
      { wch: 12 }, // Status
      { wch: 20 }, // Booked On
      { wch: 15 }, // Cancelled On
    ];

    // Create workbook
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Bookings');

    // Generate filename with event name and date
    const eventName = selectedEvent?.name.replace(/[^a-z0-9]/gi, '_') || 'event';
    const date = new Date().toISOString().split('T')[0];
    const filename = `${eventName}_bookings_${date}.xlsx`;

    // Save file
    XLSX.writeFile(wb, filename);

    toast({
      title: "Export Successful",
      description: `Exported ${bookings.length} bookings to ${filename}`,
    });
  };

  const selectedEvent = events.find(e => e.id === selectedEventId);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
        <p className="text-muted-foreground">Create an event first to manage bookings.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Bookings Management</h2>
        <p className="text-muted-foreground">View and manage event bookings</p>
      </div>

      {/* Event Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Select Event</CardTitle>
          <CardDescription>Choose an event to view its bookings</CardDescription>
        </CardHeader>
        <CardContent>
          <Select
            value={selectedEventId?.toString()}
            onValueChange={(value) => setSelectedEventId(parseInt(value))}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an event" />
            </SelectTrigger>
            <SelectContent>
              {events.map((event) => (
                <SelectItem key={event.id} value={event.id.toString()}>
                  {event.name} - {new Date(event.eventDate).toLocaleDateString()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {selectedEvent && (
        <>
          {/* Stats Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalBookings}</div>
                <p className="text-xs text-muted-foreground">
                  {selectedEvent.seatCapacity - selectedEvent.availableSeats} / {selectedEvent.seatCapacity} seats
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Confirmed</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.confirmedBookings}</div>
                <p className="text-xs text-muted-foreground">Active bookings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Cancelled</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.cancelledBookings}</div>
                <p className="text-xs text-muted-foreground">Cancelled bookings</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Attendance Rate</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
                <p className="text-xs text-muted-foreground">Confirmed vs total</p>
              </CardContent>
            </Card>
          </div>

          {/* Bookings Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Booking Details</CardTitle>
                  <CardDescription>
                    All bookings for {selectedEvent.name}
                  </CardDescription>
                </div>
                <Button
                  onClick={handleExportToExcel}
                  disabled={bookings.length === 0 || bookingsLoading}
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export to Excel
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {bookingsLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : bookings.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No bookings found for this event.</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Booking ID</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Booked On</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookings.map((booking) => (
                        <TableRow key={booking.bookingId}>
                          <TableCell className="font-mono text-sm">
                            {booking.bookingId}
                          </TableCell>
                          <TableCell>{booking.user?.name || 'N/A'}</TableCell>
                          <TableCell>{booking.user?.email || 'N/A'}</TableCell>
                          <TableCell>
                            {new Date(booking.createdAt).toLocaleString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                            >
                              {booking.status}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {booking.status === 'confirmed' && (
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleCancelBooking(booking.bookingId)}
                              >
                                Cancel
                              </Button>
                            )}
                            {booking.status === 'cancelled' && booking.cancelledAt && (
                              <span className="text-xs text-muted-foreground">
                                Cancelled on {new Date(booking.cancelledAt).toLocaleDateString()}
                              </span>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BookingsManagement;
