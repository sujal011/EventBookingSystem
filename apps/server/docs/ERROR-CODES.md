# Error Codes Reference

## Overview

This document provides a comprehensive reference of all error codes used in the Event Booking System API. Each error includes the HTTP status code, error code, description, and example scenarios.

## Error Response Format

All API errors follow this structure:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message",
    "timestamp": "2024-01-15T08:00:00.000Z"
  }
}
```

Or simplified format:

```json
{
  "error": "Human readable error message"
}
```

## Authentication Errors (401)

### MISSING_TOKEN

**HTTP Status:** 401 Unauthorized

**Description:** Authorization header is missing from the request

**Example Response:**
```json
{
  "error": {
    "code": "MISSING_TOKEN",
    "message": "Authorization header is required"
  }
}
```

**How to Fix:** Include the JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

---

### INVALID_TOKEN_FORMAT

**HTTP Status:** 401 Unauthorized

**Description:** Authorization header is not in the correct Bearer token format

**Example Response:**
```json
{
  "error": {
    "code": "INVALID_TOKEN_FORMAT",
    "message": "Authorization header must be in format: Bearer <token>"
  }
}
```

**How to Fix:** Ensure the header format is: `Bearer <token>` (note the space)

---

### INVALID_TOKEN

**HTTP Status:** 401 Unauthorized

**Description:** JWT token is invalid, expired, or malformed

**Example Response:**
```json
{
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired token"
  }
}
```

**How to Fix:** 
- Login again to get a new token
- Check if token has expired (default: 24 hours)
- Verify JWT_SECRET hasn't changed

---

### LOGIN_FAILED

**HTTP Status:** 401 Unauthorized

**Description:** Invalid email or password during login

**Example Response:**
```json
{
  "error": {
    "code": "LOGIN_FAILED",
    "message": "Invalid email or password"
  }
}
```

**How to Fix:** Verify credentials are correct

---

### UNAUTHORIZED

**HTTP Status:** 401 Unauthorized

**Description:** Authentication is required but not provided

**Example Response:**
```json
{
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**How to Fix:** Login and include JWT token in requests

## Authorization Errors (403)

### INSUFFICIENT_PERMISSIONS

**HTTP Status:** 403 Forbidden

**Description:** User doesn't have the required role or permissions

**Example Response:**
```json
{
  "error": {
    "code": "INSUFFICIENT_PERMISSIONS",
    "message": "You don't have permission to perform this action"
  }
}
```

**Common Scenarios:**
- Non-admin trying to create/update/delete events
- User trying to access another user's bookings
- Non-creator trying to modify someone else's event

**How to Fix:** 
- Ensure user has admin role for admin operations
- Only access your own resources
- Contact admin for permission changes

---

### FORBIDDEN

**HTTP Status:** 403 Forbidden

**Description:** Access to the resource is forbidden

**Example Response:**
```json
{
  "error": "You don't have permission to view this booking"
}
```

**How to Fix:** Verify you own the resource or have admin privileges

## Validation Errors (400)

### VALIDATION_ERROR

**HTTP Status:** 400 Bad Request

**Description:** Input data failed validation rules

**Example Responses:**

Invalid email format:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email format"
  }
}
```

Password too short:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Password must be at least 6 characters"
  }
}
```

Event date in past:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Event date must be in the future"
  }
}
```

Invalid seat capacity:
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Seat capacity must be between 1 and 10000"
  }
}
```

**How to Fix:** Review the error message and correct the input data according to validation rules

---

### REGISTRATION_FAILED

**HTTP Status:** 400 Bad Request

**Description:** User registration failed due to validation or duplicate email

**Example Response:**
```json
{
  "error": {
    "code": "REGISTRATION_FAILED",
    "message": "User with this email already exists"
  }
}
```

**How to Fix:** 
- Use a different email address
- Login if you already have an account
- Verify all required fields are provided

## Not Found Errors (404)

### NOT_FOUND

**HTTP Status:** 404 Not Found

**Description:** Requested resource doesn't exist

**Example Responses:**

Event not found:
```json
{
  "error": "Event not found"
}
```

Booking not found:
```json
{
  "error": "Booking not found"
}
```

User not found:
```json
{
  "error": "User not found"
}
```

**How to Fix:** 
- Verify the resource ID is correct
- Check if resource was deleted
- Ensure you have permission to access the resource

## Conflict Errors (409)

### CONFLICT

**HTTP Status:** 409 Conflict

**Description:** Request conflicts with current state or business rules

**Example Responses:**

No seats available:
```json
{
  "error": "No seats available for this event"
}
```

Duplicate booking:
```json
{
  "error": "You already have a booking for this event"
}
```

Cannot book past event:
```json
{
  "error": "Cannot book past events"
}
```

Cannot cancel past event booking:
```json
{
  "error": "Cannot cancel bookings for past events"
}
```

Booking already cancelled:
```json
{
  "error": "Booking is already cancelled"
}
```

Cannot delete event with bookings:
```json
{
  "error": "Cannot delete event with existing bookings"
}
```

Cannot reduce capacity below booked seats:
```json
{
  "error": "Cannot reduce capacity below 50 (number of seats already booked)"
}
```

Cannot update past event:
```json
{
  "error": "Cannot update events that have already occurred"
}
```

**How to Fix:** 
- Read the error message for specific business rule
- Check event availability before booking
- Cancel existing booking before creating new one
- Verify event date is in the future

## Server Errors (500)

### INTERNAL_ERROR

**HTTP Status:** 500 Internal Server Error

**Description:** Unexpected server error occurred

**Example Response:**
```json
{
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

**Common Causes:**
- Database connection failure
- Unhandled exception
- Configuration error
- External service failure

**How to Fix:** 
- Check server logs for details
- Verify database is running
- Contact system administrator
- Try again later

---

### USER_FETCH_FAILED

**HTTP Status:** 500 Internal Server Error

**Description:** Failed to fetch user information from database

**Example Response:**
```json
{
  "error": {
    "code": "USER_FETCH_FAILED",
    "message": "Failed to fetch user information"
  }
}
```

**How to Fix:** 
- Check database connection
- Verify user exists
- Contact system administrator

---

### DATABASE_ERROR

**HTTP Status:** 500 Internal Server Error

**Description:** Database operation failed

**Example Response:**
```json
{
  "error": "Database operation failed"
}
```

**Common Causes:**
- Connection pool exhausted
- Query timeout
- Constraint violation
- Deadlock

**How to Fix:** 
- Check database status
- Review database logs
- Verify connection pool settings
- Contact system administrator

## Booking-Specific Errors

### Booking Creation Errors

| Error Message | Status | Cause | Solution |
|--------------|--------|-------|----------|
| Event not found | 404 | Invalid event ID | Verify event exists |
| No seats available | 409 | Event is full | Choose different event |
| You already have a booking | 409 | Duplicate booking | Cancel existing booking first |
| Cannot book past events | 409 | Event date passed | Choose future event |
| Failed to create booking | 500 | Database error | Try again or contact admin |

### Booking Cancellation Errors

| Error Message | Status | Cause | Solution |
|--------------|--------|-------|----------|
| Booking not found | 404 | Invalid booking ID | Verify booking ID |
| Booking is already cancelled | 409 | Already cancelled | No action needed |
| Cannot cancel past event | 409 | Event date passed | Cannot cancel |
| You don't have permission | 403 | Not owner/admin | Only owner can cancel |

## Event-Specific Errors

### Event Creation Errors

| Error Message | Status | Cause | Solution |
|--------------|--------|-------|----------|
| Insufficient permissions | 403 | Not admin | Admin role required |
| Event date must be in future | 400 | Past date | Use future date |
| Seat capacity must be between 1-10000 | 400 | Invalid capacity | Use valid range |
| Name is required | 400 | Missing name | Provide event name |

### Event Update Errors

| Error Message | Status | Cause | Solution |
|--------------|--------|-------|----------|
| Event not found | 404 | Invalid event ID | Verify event exists |
| Cannot update past events | 409 | Event occurred | Cannot modify |
| Cannot reduce capacity below booked | 409 | Too many bookings | Increase capacity or cancel bookings |
| Insufficient permissions | 403 | Not admin/creator | Only admin/creator can update |

### Event Deletion Errors

| Error Message | Status | Cause | Solution |
|--------------|--------|-------|----------|
| Event not found | 404 | Invalid event ID | Verify event exists |
| Cannot delete event with bookings | 409 | Has bookings | Cancel all bookings first |
| Insufficient permissions | 403 | Not admin/creator | Only admin/creator can delete |

## WebSocket Errors

### Connection Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Connection refused | Server not running | Start server |
| Connection timeout | Network issue | Check network/firewall |
| Upgrade failed | Proxy misconfiguration | Configure WebSocket support |
| Authentication failed | Invalid token | Provide valid JWT token |

### Message Errors

| Error | Cause | Solution |
|-------|-------|----------|
| Invalid message format | Malformed JSON | Send valid JSON |
| Unknown message type | Invalid type | Use supported message types |
| Rate limit exceeded | Too many messages | Slow down message rate |

## Rate Limiting Errors

**HTTP Status:** 429 Too Many Requests

**Description:** Too many requests from the same IP address

**Example Response:**
```json
{
  "error": "Too many requests, please try again later"
}
```

**How to Fix:** 
- Wait before making more requests
- Implement exponential backoff
- Contact admin to increase rate limit

## Error Handling Best Practices

### Client-Side

```typescript
async function makeRequest(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);
    
    if (!response.ok) {
      const error = await response.json();
      
      // Handle specific error codes
      switch (error.code) {
        case 'INVALID_TOKEN':
          // Redirect to login
          window.location.href = '/login';
          break;
        case 'INSUFFICIENT_PERMISSIONS':
          // Show permission error
          alert('You don\'t have permission');
          break;
        case 'VALIDATION_ERROR':
          // Show validation errors
          showValidationError(error.message);
          break;
        default:
          // Generic error handling
          showError(error.message || 'An error occurred');
      }
      
      throw new Error(error.message);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Request failed:', error);
    throw error;
  }
}
```

### Server-Side Logging

All errors are logged with:
- Timestamp
- Error code
- Error message
- Request details (method, path, user)
- Stack trace (for 500 errors)

Check server logs for detailed error information.

## Getting Help

If you encounter an error not documented here:

1. Check the error message for specific details
2. Review server logs for more information
3. Verify your request format and data
4. Check the [API Documentation](./API.md)
5. Search existing issues on GitHub
6. Create a new issue with error details

## Related Documentation

- [API Documentation](./API.md)
- [Setup Guide](./SETUP.md)
- [Configuration Guide](./configuration.md)
- [Authentication API](./auth-api.md)
- [Events API](./api-events.md)
- [Bookings API](./api-bookings.md)
