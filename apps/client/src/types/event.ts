export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  totalSeats: number;
  bookedSeats: number;
  category: 'webinar' | 'training' | 'workshop' | 'conference';
  imageUrl?: string;
}

export interface Booking {
  bookingId: string;
  eventId: number;
  status: 'confirmed' | 'cancelled';
  createdAt: string;
  cancelledAt: string | null;
  event?: {
    id: number;
    name: string;
    eventDate: string;
    seatCapacity: number;
    availableSeats: number;
  };
  user?: {
    id: number;
    name: string;
    email: string;
  };
}
