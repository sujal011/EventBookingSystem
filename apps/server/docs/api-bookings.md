# Bookings API Documentation

## Overview

The Bookings API provides endpoints for managing event bookings in the system. It supports creating bookings, cancelling bookings, and retrieving booking information with proper authentication and authorization. All booking operations are atomic and handle seat capacity management automatically.

## Base URL

```
http://localhost:3000/api/bookings
```

## Authentication

All booking endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. Create Booking

**POST** `/api/bookings`

Create a new booking for an event. This operation is atomic and automatically manages seat availability.

**Authentication:** Required

**Request Body:**
```json
{
  "eventId": 1
}
```

**Validation Rules:**
- `eventId`: Required, positive integer

**Business Rules:**
- Event must exist and be in the future
- Event must have available seats
- User cannot have multiple bookings for the same event
- Booking creation is atomic (uses database stored procedure)

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "eventId": 1
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "bookingId": "BK-1K2L3M4N5O-ABC123",
    "eventId": 1,
    "status": "confirmed",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "event": {
      "id": 1,
      "name": "Tech Conference 2024",
      "eventDate": "2024-12-15T10:00:00.000Z",
      "seatCapacity": 500,
      "availableSeats": 449
    }
  }
}
```

### 2. Get Booking Details

**GET** `/api/bookings/:id`

Retrieve details of a specific booking by booking ID.

**Authentication:** Required (Owner or Admin)

**Path Parameters:**
- `id`: Booking ID (string, e.g., "BK-1K2L3M4N5O-ABC123")

**Authorization:**
- Users can only view their own bookings
- Admins can view any booking

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/bookings/BK-1K2L3M4N5O-ABC123" \
  -H "Authorization: Bearer <jwt_token>"
```

**Example Response (User):**
```json
{
  "success": true,
  "data": {
    "bookingId": "BK-1K2L3M4N5O-ABC123",
    "eventId": 1,
    "status": "confirmed",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "cancelledAt": null,
    "event": {
      "id": 1,
      "name": "Tech Conference 2024",
      "eventDate": "2024-12-15T10:00:00.000Z",
      "seatCapacity": 500,
      "availableSeats": 449
    }
  }
}
```

**Example Response (Admin):**
```json
{
  "success": true,
  "data": {
    "bookingId": "BK-1K2L3M4N5O-ABC123",
    "eventId": 1,
    "status": "confirmed",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "cancelledAt": null,
    "event": {
      "id": 1,
      "name": "Tech Conference 2024",
      "eventDate": "2024-12-15T10:00:00.000Z",
      "seatCapacity": 500,
      "availableSeats": 449
    },
    "user": {
      "id": 2,
      "name": "John Doe",
      "email": "john@example.com"
    }
  }
}
```

### 3. Cancel Booking

**DELETE** `/api/bookings/:id`

Cancel an existing booking. This operation is atomic and automatically releases the seat back to the event.

**Authentication:** Required (Owner or Admin)

**Path Parameters:**
- `id`: Booking ID (string)

**Business Rules:**
- Only confirmed bookings can be cancelled
- Cannot cancel bookings for past events
- Booking owner or admin can cancel
- Cancellation is atomic (uses database stored procedure)
- Seat is automatically released back to the event

**Authorization:**
- Users can only cancel their own bookings
- Admins can cancel any booking

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/bookings/BK-1K2L3M4N5O-ABC123" \
  -H "Authorization: Bearer <jwt_token>"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Booking cancelled successfully"
}
```

### 4. Get User's Bookings

**GET** `/api/bookings/user/me`

Retrieve all bookings for the authenticated user.

**Authentication:** Required

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/bookings/user/me" \
  -H "Authorization: Bearer <jwt_token>"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "bookingId": "BK-1K2L3M4N5O-ABC123",
        "eventId": 1,
        "status": "confirmed",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "cancelledAt": null,
        "event": {
          "id": 1,
          "name": "Tech Conference 2024",
          "eventDate": "2024-12-15T10:00:00.000Z",
          "seatCapacity": 500,
          "availableSeats": 449
        }
      },
      {
        "bookingId": "BK-2M3N4O5P6Q-DEF456",
        "eventId": 2,
        "status": "cancelled",
        "createdAt": "2024-01-10T14:20:00.000Z",
        "cancelledAt": "2024-01-12T09:15:00.000Z",
        "event": {
          "id": 2,
          "name": "Workshop Series",
          "eventDate": "2024-11-20T14:00:00.000Z",
          "seatCapacity": 50,
          "availableSeats": 25
        }
      }
    ],
    "total": 2
  }
}
```

### 5. Get Event Bookings (Admin)

**GET** `/api/bookings/admin/events/:id`

Retrieve all bookings for a specific event. This endpoint is for administrative purposes.

**Authentication:** Required (Admin or Event Creator)

**Path Parameters:**
- `id`: Event ID (integer)

**Authorization:**
- Admins can view bookings for any event
- Event creators can view bookings for their own events

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/bookings/admin/events/1" \
  -H "Authorization: Bearer <jwt_token>"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "eventId": 1,
    "bookings": [
      {
        "bookingId": "BK-1K2L3M4N5O-ABC123",
        "eventId": 1,
        "status": "confirmed",
        "createdAt": "2024-01-15T10:30:00.000Z",
        "cancelledAt": null,
        "user": {
          "id": 2,
          "name": "John Doe",
          "email": "john@example.com"
        }
      },
      {
        "bookingId": "BK-3P4Q5R6S7T-GHI789",
        "eventId": 1,
        "status": "confirmed",
        "createdAt": "2024-01-15T11:45:00.000Z",
        "cancelledAt": null,
        "user": {
          "id": 3,
          "name": "Jane Smith",
          "email": "jane@example.com"
        }
      }
    ],
    "total": 2
  }
}
```

## Error Responses

All endpoints return structured error responses:

```json
{
  "error": "Human readable error message"
}
```

### Common HTTP Status Codes

- `200 OK`: Successful GET request
- `201 Created`: Successful booking creation
- `400 Bad Request`: Invalid input data
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Booking or event not found
- `409 Conflict`: Business rule violation
- `500 Internal Server Error`: Server error

### Error Examples

**Event Not Found:**
```json
{
  "error": "Event not found"
}
```

**No Seats Available:**
```json
{
  "error": "No seats available for this event"
}
```

**Duplicate Booking:**
```json
{
  "error": "You already have a booking for this event"
}
```

**Past Event Booking:**
```json
{
  "error": "Cannot book past events"
}
```

**Unauthorized Access:**
```json
{
  "error": "You don't have permission to view this booking"
}
```

**Already Cancelled:**
```json
{
  "error": "Booking is already cancelled"
}
```

**Cannot Cancel Past Event:**
```json
{
  "error": "Cannot cancel bookings for past events"
}
```

## Data Models

### Booking Object

```typescript
interface Booking {
  bookingId: string;           // Unique booking identifier (e.g., "BK-1K2L3M4N5O-ABC123")
  eventId: number;             // ID of the booked event
  status: string;              // "confirmed" or "cancelled"
  createdAt: Date;             // When the booking was created
  cancelledAt: Date | null;    // When the booking was cancelled (null if not cancelled)
  event?: {                    // Event details (included in most responses)
    id: number;
    name: string;
    eventDate: Date;
    seatCapacity: number;
    availableSeats: number;
  };
  user?: {                     // User details (admin responses only)
    id: number;
    name: string;
    email: string;
  };
}
```

### Booking List Response

```typescript
interface BookingListResponse {
  bookings: Booking[];
  total: number;
}
```

### Create Booking Request

```typescript
interface CreateBookingRequest {
  eventId: number;
}
```

## Booking ID Format

Booking IDs are automatically generated using the format:
- `BK-{timestamp}-{random}`
- Example: `BK-1K2L3M4N5O-ABC123`
- Always unique across the system
- Case-insensitive for lookups

## Atomic Operations

All booking operations (create and cancel) use database stored procedures to ensure atomicity:

1. **Create Booking**: Checks seat availability, creates booking, and decrements available seats in a single transaction
2. **Cancel Booking**: Updates booking status and increments available seats in a single transaction

This prevents race conditions and ensures data consistency even under high concurrency.

## Business Logic

### Booking Creation Rules

1. User must be authenticated
2. Event must exist
3. Event must be in the future
4. Event must have available seats (> 0)
5. User cannot have multiple confirmed bookings for the same event
6. Booking ID must be unique (automatically generated)

### Booking Cancellation Rules

1. User must be authenticated
2. Booking must exist
3. User must own the booking (or be admin)
4. Booking must be in "confirmed" status
5. Event must not have occurred yet
6. Seat is automatically released back to the event

### Authorization Rules

- **Regular Users**: Can create, view, and cancel their own bookings
- **Admins**: Can view and cancel any booking, plus access admin endpoints
- **Event Creators**: Can view bookings for their own events via admin endpoint

## Logging and Auditing

All booking operations are logged in the `booking_logs` table with:
- Booking ID
- Action performed ("created" or "cancelled")
- User ID
- Event ID
- Timestamp
- Additional details (e.g., remaining seats)

## Security Considerations

1. **Authentication**: JWT tokens required for all endpoints
2. **Authorization**: Role-based and ownership-based access control
3. **Input Validation**: All inputs validated with Zod schemas
4. **SQL Injection**: Protected by Drizzle ORM parameterized queries
5. **Race Conditions**: Prevented by atomic stored procedures
6. **Business Logic**: Comprehensive validation of all business rules
7. **Data Integrity**: Database constraints ensure data consistency

## Performance Considerations

1. **Atomic Operations**: Stored procedures minimize database round trips
2. **Indexing**: Proper indexes on booking_id, user_id, and event_id
3. **Seat Locking**: Row-level locking prevents overselling
4. **Efficient Queries**: Optimized joins for booking details with event/user info

## Integration Examples

### Complete Booking Flow

```bash
# 1. List available events
curl -X GET "http://localhost:3000/api/events?upcoming=true"

# 2. Create a booking
curl -X POST "http://localhost:3000/api/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{"eventId": 1}'

# 3. View booking details
curl -X GET "http://localhost:3000/api/bookings/BK-1K2L3M4N5O-ABC123" \
  -H "Authorization: Bearer <jwt_token>"

# 4. Cancel booking if needed
curl -X DELETE "http://localhost:3000/api/bookings/BK-1K2L3M4N5O-ABC123" \
  -H "Authorization: Bearer <jwt_token>"
```

### Admin Management Flow

```bash
# 1. View all bookings for an event
curl -X GET "http://localhost:3000/api/bookings/admin/events/1" \
  -H "Authorization: Bearer <admin_jwt_token>"

# 2. View specific booking details (with user info)
curl -X GET "http://localhost:3000/api/bookings/BK-1K2L3M4N5O-ABC123" \
  -H "Authorization: Bearer <admin_jwt_token>"

# 3. Cancel user's booking (admin action)
curl -X DELETE "http://localhost:3000/api/bookings/BK-1K2L3M4N5O-ABC123" \
  -H "Authorization: Bearer <admin_jwt_token>"
```