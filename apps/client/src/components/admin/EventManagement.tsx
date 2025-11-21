import { useState, useEffect } from "react";
import { eventsApi } from "@/lib/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Edit, Trash2, Save, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface EventData {
  id?: number;
  name: string;
  description?: string;
  eventDate: string;
  seatCapacity: number;
  imageFile?: File | null;
  imageUrl?: string;
}

const EventManagement = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<EventData>>({
    name: '',
    description: '',
    seatCapacity: 50,
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await eventsApi.list({});
      if (response.success) {
        setEvents(response.data.events);
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

  const handleCreate = async () => {
    if (!formData.name || !formData.eventDate) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    const data = new FormData();
    data.append('name', formData.name);
    if (formData.description) data.append('description', formData.description);
    data.append('eventDate', formData.eventDate);
    data.append('seatCapacity', formData.seatCapacity?.toString() || '50');
    if (imageFile) data.append('imageFile', imageFile);

    try {
      const response = await eventsApi.create(data);
      if (response.success) {
        await fetchEvents();
        setFormData({ name: '', description: '', seatCapacity: 50 });
        setImageFile(null);
        setIsCreating(false);
        
        toast({
          title: "Event Created",
          description: "New event has been successfully created.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    
    const data = new FormData();
    if (formData.name) data.append('name', formData.name);
    if (formData.description) data.append('description', formData.description);
    if (formData.eventDate) data.append('eventDate', formData.eventDate);
    if (formData.seatCapacity) data.append('seatCapacity', formData.seatCapacity.toString());
    if (imageFile) data.append('imageFile', imageFile);

    try {
      const response = await eventsApi.update(editingId, data);
      if (response.success) {
        await fetchEvents();
        setEditingId(null);
        setFormData({ name: '', description: '', seatCapacity: 50 });
        setImageFile(null);
        
        toast({
          title: "Event Updated",
          description: "Event has been successfully updated.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const response = await eventsApi.delete(id);
      if (response.success) {
        await fetchEvents();
        toast({
          title: "Event Deleted",
          description: "Event has been successfully deleted.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const startEdit = (event: any) => {
    setEditingId(event.id);
    setFormData({
      name: event.name,
      description: event.description,
      eventDate: event.eventDate,
      seatCapacity: event.seatCapacity,
    });
    setIsCreating(false);
  };

  const cancelForm = () => {
    setIsCreating(false);
    setEditingId(null);
    setFormData({ name: '', description: '', seatCapacity: 50 });
    setImageFile(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-2">Event Management</h2>
          <p className="text-muted-foreground">Create, edit, and manage your events</p>
        </div>
        {!isCreating && !editingId && (
          <Button onClick={() => setIsCreating(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        )}
      </div>

      {(isCreating || editingId) && (
        <Card>
          <CardHeader>
            <CardTitle>{editingId ? 'Edit Event' : 'Create New Event'}</CardTitle>
            <CardDescription>
              Fill in the event details below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); editingId ? handleUpdate() : handleCreate(); }}>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Event Name *</Label>
                  <Input
                    id="name"
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eventDate">Event Date & Time *</Label>
                    <Input
                      id="eventDate"
                      type="datetime-local"
                      value={formData.eventDate ? new Date(formData.eventDate).toISOString().slice(0, 16) : ''}
                      onChange={(e) => setFormData({ ...formData, eventDate: new Date(e.target.value).toISOString() })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="seatCapacity">Seat Capacity *</Label>
                    <Input
                      id="seatCapacity"
                      type="number"
                      min="1"
                      max="10000"
                      value={formData.seatCapacity || 50}
                      onChange={(e) => setFormData({ ...formData, seatCapacity: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="image">Event Image</Label>
                  <Input
                    id="image"
                    type="file"
                    accept="image/*"
                    onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button type="submit">
                  <Save className="mr-2 h-4 w-4" />
                  {editingId ? 'Update Event' : 'Create Event'}
                </Button>
                <Button type="button" variant="outline" onClick={cancelForm}>
                  <X className="mr-2 h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4">
        {events.map((event) => (
          <Card key={event.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>{event.name}</CardTitle>
                  <CardDescription>
                    {new Date(event.eventDate).toLocaleString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => startEdit(event)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDelete(event.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">{event.description}</p>
                <div className="flex gap-4 text-sm">
                  <span>Capacity: {event.seatCapacity}</span>
                  <span>Available: {event.availableSeats}</span>
                  <span>Booked: {event.seatCapacity - event.availableSeats}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default EventManagement;
