# Events API Documentation

## Overview

The Events API provides endpoints for managing events in the booking system. It supports creating, reading, updating, and deleting events with proper authentication and authorization.

## Base URL

```
http://localhost:3000/api/events
```

## Authentication

Most endpoints require authentication via JWT token in the Authorization header:

```
Authorization: Bearer <jwt_token>
```

## Endpoints

### 1. List Events

**GET** `/api/events`

Retrieve a list of events with optional filtering and pagination.

**Authentication:** Optional (enhanced features with auth)

**Query Parameters:**
- `limit` (optional): Number of events to return (1-100, default: 50)
- `offset` (optional): Number of events to skip (default: 0)
- `upcoming` (optional): Filter for upcoming events only (`true`/`false`)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/events?limit=10&upcoming=true"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "events": [
      {
        "id": 1,
        "name": "Tech Conference 2024",
        "description": "Annual technology conference",
        "eventDate": "2024-12-15T10:00:00.000Z",
        "seatCapacity": 500,
        "availableSeats": 450,
        "createdBy": 1,
        "createdAt": "2024-01-15T08:00:00.000Z",
        "updatedAt": "2024-01-15T08:00:00.000Z",
        "creator": {
          "id": 1,
          "name": "Admin User",
          "email": "admin@example.com"
        }
      }
    ],
    "total": 1,
    "hasMore": false
  }
}
```

### 2. Get Event Details

**GET** `/api/events/:id`

Retrieve details of a specific event.

**Authentication:** None required

**Path Parameters:**
- `id`: Event ID (integer)

**Example Request:**
```bash
curl -X GET "http://localhost:3000/api/events/1"
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tech Conference 2024",
    "description": "Annual technology conference",
    "eventDate": "2024-12-15T10:00:00.000Z",
    "seatCapacity": 500,
    "availableSeats": 450,
    "createdBy": 1,
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z",
    "creator": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

### 3. Create Event

**POST** `/api/events`

Create a new event.

**Authentication:** Required (Admin only)

**Request Body:**
```json
{
  "name": "Tech Conference 2024",
  "description": "Annual technology conference",
  "eventDate": "2024-12-15T10:00:00.000Z",
  "seatCapacity": 500
}
```

**Validation Rules:**
- `name`: Required, 1-255 characters
- `description`: Optional, max 1000 characters
- `eventDate`: Required, must be in the future, ISO 8601 format
- `seatCapacity`: Required, integer between 1-10,000

**Example Request:**
```bash
curl -X POST "http://localhost:3000/api/events" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "name": "Tech Conference 2024",
    "description": "Annual technology conference",
    "eventDate": "2024-12-15T10:00:00.000Z",
    "seatCapacity": 500
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Tech Conference 2024",
    "description": "Annual technology conference",
    "eventDate": "2024-12-15T10:00:00.000Z",
    "seatCapacity": 500,
    "availableSeats": 500,
    "createdBy": 1,
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T08:00:00.000Z",
    "creator": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

### 4. Update Event

**PUT** `/api/events/:id`

Update an existing event.

**Authentication:** Required (Admin or Event Creator)

**Path Parameters:**
- `id`: Event ID (integer)

**Request Body:** (All fields optional for partial updates)
```json
{
  "name": "Updated Tech Conference 2024",
  "description": "Updated description",
  "eventDate": "2024-12-16T10:00:00.000Z",
  "seatCapacity": 600
}
```

**Business Rules:**
- Cannot update events that have already occurred
- Cannot reduce seat capacity below already booked seats
- Event date must be in the future
- Only admin or event creator can update

**Example Request:**
```bash
curl -X PUT "http://localhost:3000/api/events/1" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt_token>" \
  -d '{
    "name": "Updated Tech Conference 2024",
    "seatCapacity": 600
  }'
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Updated Tech Conference 2024",
    "description": "Annual technology conference",
    "eventDate": "2024-12-15T10:00:00.000Z",
    "seatCapacity": 600,
    "availableSeats": 550,
    "createdBy": 1,
    "createdAt": "2024-01-15T08:00:00.000Z",
    "updatedAt": "2024-01-15T09:00:00.000Z",
    "creator": {
      "id": 1,
      "name": "Admin User",
      "email": "admin@example.com"
    }
  }
}
```

### 5. Delete Event

**DELETE** `/api/events/:id`

Delete an event.

**Authentication:** Required (Admin or Event Creator)

**Path Parameters:**
- `id`: Event ID (integer)

**Business Rules:**
- Cannot delete events with existing bookings
- Only admin or event creator can delete

**Example Request:**
```bash
curl -X DELETE "http://localhost:3000/api/events/1" \
  -H "Authorization: Bearer <jwt_token>"
```

**Example Response:**
```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

## Error Responses

All endpoints return structured error responses:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "timestamp": "2024-01-15T08:00:00.000Z"
  }
}
```

### Common Error Codes

- `UNAUTHORIZED` (401): Missing or invalid authentication
- `FORBIDDEN` (403): Insufficient permissions
- `NOT_FOUND` (404): Event not found
- `VALIDATION_ERROR` (400): Invalid input data
- `CONFLICT` (409): Business rule violation (e.g., deleting event with bookings)
- `INTERNAL_ERROR` (500): Server error

### Validation Error Examples

**Invalid Event Date:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Event date must be in the future",
    "timestamp": "2024-01-15T08:00:00.000Z"
  }
}
```

**Capacity Reduction Error:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Cannot reduce capacity below 50 (number of seats already booked)",
    "timestamp": "2024-01-15T08:00:00.000Z"
  }
}
```

## Data Models

### Event Object

```typescript
interface Event {
  id: number;
  name: string;
  description: string | null;
  eventDate: Date;
  seatCapacity: number;
  availableSeats: number;
  createdBy: number | null;
  createdAt: Date | null;
  updatedAt: Date | null;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}
```

### Event List Response

```typescript
interface EventListResponse {
  events: Event[];
  total: number;
  hasMore: boolean;
}
```

## Rate Limiting

Currently, no rate limiting is implemented. Consider implementing rate limiting for production use.

## Pagination

The list events endpoint supports offset-based pagination:
- Use `limit` to control page size (max 100)
- Use `offset` to skip records
- Check `hasMore` in response to determine if more records exist

## Security Considerations

1. **Authentication**: JWT tokens expire after 24 hours
2. **Authorization**: Role-based access control enforced
3. **Input Validation**: All inputs validated with Zod schemas
4. **SQL Injection**: Protected by Drizzle ORM parameterized queries
5. **Business Logic**: Proper validation of business rules (dates, capacities, etc.)