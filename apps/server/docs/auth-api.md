# Authentication API Documentation

## Overview

The Event Booking System authentication API provides secure user registration, login, and authorization functionality using JWT tokens and bcrypt password hashing.

## Base URL

```
/api/auth
```

## Authentication

Most endpoints require a valid JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Endpoints

### 1. User Registration

**POST** `/api/auth/register`

Register a new user account.

#### Request Body

```json
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "securepassword123",
  "role": "user" // optional, defaults to "user"
}
```

#### Request Validation

- `email`: Must be a valid email format
- `name`: 2-255 characters
- `password`: Minimum 6 characters
- `role`: Either "user" or "admin" (optional, defaults to "user")

#### Success Response (201)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**400 Bad Request** - Validation errors or user already exists
```json
{
  "success": false,
  "error": {
    "code": "REGISTRATION_FAILED",
    "message": "User with this email already exists"
  }
}
```

**500 Internal Server Error**
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

### 2. User Login

**POST** `/api/auth/login`

Authenticate a user and receive a JWT token.

#### Request Body

```json
{
  "email": "user@example.com",
  "password": "securepassword123"
}
```

#### Request Validation

- `email`: Must be a valid email format
- `password`: Required field

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### Error Responses

**401 Unauthorized** - Invalid credentials
```json
{
  "success": false,
  "error": {
    "code": "LOGIN_FAILED",
    "message": "Invalid email or password"
  }
}
```

### 3. Get Current User

**GET** `/api/auth/me`

Get the current authenticated user's information.

#### Headers Required

```
Authorization: Bearer <your-jwt-token>
```

#### Success Response (200)

```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    }
  }
}
```

#### Error Responses

**401 Unauthorized** - Missing or invalid token
```json
{
  "success": false,
  "error": {
    "code": "MISSING_TOKEN",
    "message": "Authorization header is required"
  }
}
```

```json
{
  "success": false,
  "error": {
    "code": "INVALID_TOKEN",
    "message": "Invalid or expired token"
  }
}
```

## Middleware

### Authentication Middleware

The `authMiddleware` can be applied to any route that requires authentication:

```typescript
import { authMiddleware } from '../middleware/auth';

app.get('/protected-route', authMiddleware, (c) => {
  const user = c.get('user'); // Access authenticated user
  // Route logic here
});
```

### Role-Based Authorization

#### Require Specific Role

```typescript
import { requireRole } from '../middleware/auth';

app.get('/admin-only', requireRole('admin'), (c) => {
  // Only admin users can access this route
});
```

#### Require Admin Role

```typescript
import { requireAdmin } from '../middleware/auth';

app.get('/admin-panel', requireAdmin, (c) => {
  // Only admin users can access this route
});
```

#### Optional Authentication

```typescript
import { optionalAuth } from '../middleware/auth';

app.get('/public-route', optionalAuth, (c) => {
  const user = c.get('user'); // May be undefined if not authenticated
  // Route logic here
});
```

## JWT Token Details

### Token Structure

The JWT token contains the following payload:

```json
{
  "id": 1,
  "email": "user@example.com",
  "name": "John Doe",
  "role": "user",
  "exp": 1640995200
}
```

### Token Expiration

- **Default**: 24 hours from issuance
- **Algorithm**: HS256
- **Secret**: Configured via `JWT_SECRET` environment variable

## Security Features

### Password Security

- **Hashing Algorithm**: bcrypt
- **Salt Rounds**: 12
- **Minimum Length**: 6 characters

### Token Security

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Expiration**: 24 hours
- **Secret Key**: Environment variable `JWT_SECRET`

### Input Validation

- **Library**: Zod
- **Email Validation**: RFC compliant email format
- **Password Requirements**: Minimum 6 characters
- **Name Requirements**: 2-255 characters

## Environment Variables

Required environment variables for authentication:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/event_booking
```

## Error Codes Reference

| Code | Description | HTTP Status |
|------|-------------|-------------|
| `REGISTRATION_FAILED` | User registration failed (validation or duplicate email) | 400 |
| `LOGIN_FAILED` | Invalid login credentials | 401 |
| `MISSING_TOKEN` | Authorization header not provided | 401 |
| `INVALID_TOKEN_FORMAT` | Token not in Bearer format | 401 |
| `INVALID_TOKEN` | Token is invalid or expired | 401 |
| `UNAUTHORIZED` | Authentication required but not provided | 401 |
| `INSUFFICIENT_PERMISSIONS` | User doesn't have required role | 403 |
| `USER_FETCH_FAILED` | Failed to fetch user information | 500 |
| `INTERNAL_ERROR` | Unexpected server error | 500 |

## Usage Examples

### Register a new user

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "name": "John Doe",
    "password": "securepassword123"
  }'
```

### Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "securepassword123"
  }'
```

### Access protected route

```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## Integration Notes

### Frontend Integration

1. Store the JWT token securely (e.g., httpOnly cookies or secure localStorage)
2. Include the token in the Authorization header for protected requests
3. Handle token expiration by redirecting to login or refreshing the token
4. Implement role-based UI components based on user role

### Backend Integration

1. Apply `authMiddleware` to routes requiring authentication
2. Use `requireRole()` or `requireAdmin` for role-based access control
3. Access user information via `c.get('user')` in protected routes
4. Handle authentication errors appropriately

## Security Best Practices

1. **Environment Variables**: Always use strong, unique JWT secrets in production
2. **HTTPS**: Use HTTPS in production to protect tokens in transit
3. **Token Storage**: Store tokens securely on the client side
4. **Token Expiration**: Implement token refresh mechanisms for better UX
5. **Rate Limiting**: Consider implementing rate limiting for auth endpoints
6. **Password Policy**: Enforce strong password requirements
7. **Account Lockout**: Consider implementing account lockout after failed attempts