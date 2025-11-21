# Event Booking System - Complete API Documentation

## Overview

The Event Booking System provides a RESTful API for managing events, bookings, and user authentication. The API is built with Hono framework, uses JWT for authentication, and PostgreSQL for data persistence.

## Base URL

```
http://localhost:3000
```

For production, replace with your deployed domain.

## API Version

Current Version: **1.0.0**

## Quick Links

- [Authentication API](./auth-api.md) - User registration, login, and authentication
- [Events API](./api-events.md) - Event management and listing
- [Bookings API](./api-bookings.md) - Booking creation, cancellation, and management
- [WebSocket API](./websockets.md) - Real-time seat availability updates
- [Configuration Guide](./configuration.md) - Environment setup and configuration

## Authentication

Most API endpoints require authentication using JWT (JSON Web Tokens). Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### Getting a Token

1. **Register a new user:**
   ```bash
   POST /api/auth/register
   ```

2. **Login with credentials:**
   ```bash
   POST /api/auth/login
   ```

Both endpoints return a JWT token that expires in 24 hours (configurable).

## API Endpoints Summary

### Authentication Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/auth/register` | No | Register a new user |
| POST | `/api/auth/login` | No | Login and get JWT token |
| GET | `/api/auth/me` | Yes | Get current user info |

### Event Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| GET | `/api/events` | Optional | List all events with availability |
| GET | `/api/events/:id` | No | Get specific event details |
| POST | `/api/events` | Yes (Admin) | Create a new event |
| PUT | `/api/events/:id` | Yes (Admin/Creator) | Update event details |
| DELETE | `/api/events/:id` | Yes (Admin/Creator) | Delete an event |

### Booking Endpoints

| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| POST | `/api/bookings` | Yes | Create a new booking |
| GET | `/api/bookings/:id` | Yes (Owner/Admin) | Get booking details |
| DELETE | `/api/bookings/:id` | Yes (Owner/Admin) | Cancel a booking |
| GET | `/api/bookings/user/me` | Yes | Get current user's bookings |
| GET | `/api/bookings/admin/events/:id` | Yes (Admin/Creator) | Get all bookings for an event |

### WebSocket Endpoints

| Endpoint | Auth Required | Description |
|----------|---------------|-------------|
| `/ws` | Optional | WebSocket connection for real-time updates |

## Response Format

All API responses follow a consistent format:

### Success Response

```json
{
  "success": true,
  "data": {
    // Response data here
  }
}
```

### Error Response

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "timestamp": "2024-01-15T08:00:00.000Z"
  }
}
```

Or simplified:

```json
{
  "error": "Human readable error message"
}
```

## HTTP Status Codes

| Status Code | Description |
|-------------|-------------|
| 200 OK | Successful GET request |
| 201 Created | Successful resource creation |
| 400 Bad Request | Invalid input or validation error |
| 401 Unauthorized | Missing or invalid authentication |
| 403 Forbidden | Insufficient permissions |
| 404 Not Found | Resource not found |
| 409 Conflict | Business rule violation |
| 500 Internal Server Error | Server error |

## Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid input data |
| `UNAUTHORIZED` | 401 | Authentication required |
| `INVALID_TOKEN` | 401 | JWT token is invalid or expired |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Business rule violation |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

## Rate Limiting

Rate limiting is configured via environment variables:
- Default: 100 requests per minute per IP
- Configurable via `RATE_LIMIT_MAX` environment variable

When rate limit is exceeded:
```json
{
  "error": "Too many requests, please try again later"
}
```

## Pagination

List endpoints support pagination using offset-based pagination:

**Query Parameters:**
- `limit`: Number of items per page (default: 20, max: 100)
- `offset`: Number of items to skip (default: 0)

**Response includes:**
```json
{
  "data": {
    "items": [...],
    "total": 150,
    "hasMore": true
  }
}
```

## CORS

CORS is configured via the `CORS_ORIGIN` environment variable. By default, all origins are allowed in development. For production, specify allowed origins:

```env
CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
```

## Data Models

### User

```typescript
interface User {
  id: number;
  email: string;
  name: string;
  role: 'user' | 'admin';
  createdAt: Date;
  updatedAt: Date;
}
```

### Event

```typescript
interface Event {
  id: number;
  name: string;
  description: string | null;
  imageUrl: string | null;
  eventDate: Date;
  seatCapacity: number;
  availableSeats: number;
  createdBy: number | null;
  createdAt: Date;
  updatedAt: Date;
  creator?: {
    id: number;
    name: string;
    email: string;
  };
}
```

### Booking

```typescript
interface Booking {
  bookingId: string;
  eventId: number;
  userId: number;
  status: 'confirmed' | 'cancelled';
  createdAt: Date;
  cancelledAt: Date | null;
  event?: Event;
  user?: User;
}
```

## Quick Start Examples

### 1. Register and Login

```bash
# Register a new user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "name": "John Doe",
    "password": "securepassword123"
  }'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepassword123"
  }'
```

### 2. Browse Events

```bash
# List upcoming events
curl -X GET "http://localhost:3000/api/events?upcoming=true&limit=10"

# Get event details
curl -X GET "http://localhost:3000/api/events/1"
```

### 3. Create a Booking

```bash
# Create booking (requires authentication)
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "eventId": 1
  }'
```

### 4. Manage Bookings

```bash
# View your bookings
curl -X GET http://localhost:3000/api/bookings/user/me \
  -H "Authorization: Bearer <your-jwt-token>"

# Cancel a booking
curl -X DELETE http://localhost:3000/api/bookings/BK-1K2L3M4N5O-ABC123 \
  -H "Authorization: Bearer <your-jwt-token>"
```

### 5. Admin Operations

```bash
# Create an event (admin only) - with FormData for image upload
curl -X POST http://localhost:3000/api/events \
  -H "Authorization: Bearer <admin-jwt-token>" \
  -F "name=Tech Conference 2024" \
  -F "description=Annual technology conference" \
  -F "eventDate=2024-12-15T10:00:00.000Z" \
  -F "seatCapacity=500" \
  -F "imageFile=@/path/to/image.jpg"

# View event bookings (admin only)
curl -X GET http://localhost:3000/api/bookings/admin/events/1 \
  -H "Authorization: Bearer <admin-jwt-token>"
```

## Real-Time Updates

The system supports real-time seat availability updates via WebSocket:

```javascript
// Connect to WebSocket
const ws = new WebSocket('ws://localhost:3000/ws');

// Listen for seat updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Seat update:', data);
};
```

See [WebSocket Documentation](./websockets.md) for details.

## Security Best Practices

1. **Always use HTTPS in production** - Protect tokens in transit
2. **Store JWT tokens securely** - Use httpOnly cookies or secure storage
3. **Implement token refresh** - Handle token expiration gracefully
4. **Validate all inputs** - Never trust client data
5. **Use strong passwords** - Enforce password policies
6. **Rotate JWT secrets** - Change secrets periodically
7. **Monitor API usage** - Implement logging and monitoring
8. **Rate limit endpoints** - Prevent abuse

## Testing the API

### Using cURL

All examples in this documentation use cURL. Replace `<your-jwt-token>` with actual tokens from login/register responses.

### Using Postman

1. Import the API endpoints into Postman
2. Set up environment variables for base URL and tokens
3. Use the Authorization tab to set Bearer tokens
4. Test each endpoint with sample data

### Using JavaScript/TypeScript

```typescript
// Example: Create a booking
const response = await fetch('http://localhost:3000/api/bookings', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ eventId: 1 })
});

const data = await response.json();
console.log(data);
```

## Error Handling

Always check the HTTP status code and handle errors appropriately:

```typescript
try {
  const response = await fetch(url, options);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || error.message);
  }
  
  const data = await response.json();
  return data;
} catch (error) {
  console.error('API Error:', error);
  // Handle error appropriately
}
```

## Troubleshooting

### Common Issues

**401 Unauthorized**
- Check if JWT token is included in Authorization header
- Verify token hasn't expired (24 hour default)
- Ensure token format is: `Bearer <token>`

**403 Forbidden**
- Verify user has required role (admin for admin endpoints)
- Check if user owns the resource (for owner-only operations)

**409 Conflict**
- Read error message for specific business rule violation
- Common causes: duplicate bookings, no seats available, past events

**500 Internal Server Error**
- Check server logs for details
- Verify database connection
- Ensure all environment variables are set correctly

## Support and Resources

- **GitHub Repository**: [Link to repository]
- **Issue Tracker**: [Link to issues]
- **API Status**: [Link to status page]
- **Documentation**: [Link to full docs]

## Changelog

### Version 1.0.0 (Current)
- Initial API release
- Authentication with JWT
- Event management
- Booking system with atomic operations
- Real-time WebSocket updates
- Comprehensive logging and auditing

## License

[Your License Here]
