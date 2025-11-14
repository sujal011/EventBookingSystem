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
  id: string;
  eventId: string;
  userName: string;
  userEmail: string;
  bookingDate: string;
  status: 'confirmed' | 'cancelled';
}
