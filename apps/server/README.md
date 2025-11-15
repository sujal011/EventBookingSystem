### Docker Image Build command 
```sh
docker build -t event-booking-system-server:latest -f apps/server/Dockerfile .
```

### Docker container run command
```sh
docker run -d -p 3000:3000 --name ebs-server-container event-booking-system-server:latest
```

# Event Booking System - Backend API

A robust, real-time event booking system built with Bun, Hono, PostgreSQL, and Drizzle ORM. Features JWT authentication, atomic booking operations, WebSocket updates, and comprehensive API documentation.

## Features

- 🔐 **JWT Authentication** - Secure user authentication with role-based access control
- 📅 **Event Management** - Create, update, and manage events with seat capacity tracking
- 🎫 **Atomic Bookings** - Race-condition-free booking system using database stored procedures
- 🔄 **Real-time Updates** - WebSocket support for live seat availability updates
- 📊 **Comprehensive Logging** - Full audit trail of all booking operations
- ✅ **Input Validation** - Zod-based schema validation for all endpoints
- 🚀 **High Performance** - Built with Bun runtime for optimal performance
- 📖 **Complete Documentation** - Extensive API and setup documentation

## Tech Stack

- **Runtime**: [Bun](https://bun.sh/) - Fast JavaScript runtime
- **Framework**: [Hono](https://hono.dev/) - Lightweight web framework
- **Database**: [PostgreSQL](https://www.postgresql.org/) - Reliable relational database
- **ORM**: [Drizzle ORM](https://orm.drizzle.team/) - Type-safe database operations
- **Validation**: [Zod](https://zod.dev/) - TypeScript-first schema validation
- **Authentication**: JWT with bcrypt password hashing
- **Real-time**: WebSocket for live updates

## Quick Start

### Prerequisites

- Bun v1.0.0 or higher
- PostgreSQL v14 or higher
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd EventBookingSystem/apps/server
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

4. **Initialize database**
   ```bash
   bun run db:init
   ```

5. **Seed with sample data** (optional)
   ```bash
   bun run db:seed
   ```

6. **Start the server**
   ```bash
   bun run dev
   ```

The server will start on `http://localhost:3000`

## Available Scripts

### Development

- `bun run dev` - Start development server with hot reload
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run compile` - Compile to standalone binary

### Database

- `bun run db:init` - Initialize database (run migrations)
- `bun run db:seed` - Seed database with sample data
- `bun run db:reset` - Reset database (⚠️ deletes all data)
- `bun run db:generate` - Generate new migration
- `bun run db:migrate` - Run pending migrations
- `bun run db:studio` - Open Drizzle Studio (database GUI)

### Type Checking

- `bun run check-types` - Run TypeScript type checking

## Project Structure

```
apps/server/
├── docs/                      # Documentation
│   ├── API.md                # Complete API reference
│   ├── SETUP.md              # Setup and deployment guide
│   ├── configuration.md      # Configuration guide
│   ├── DATABASE-SCHEMA.md    # Database schema documentation
│   ├── ERROR-CODES.md        # Error codes reference
│   ├── auth-api.md           # Authentication API docs
│   ├── api-events.md         # Events API docs
│   ├── api-bookings.md       # Bookings API docs
│   └── websockets.md         # WebSocket documentation
├── drizzle/                  # Database migrations
│   ├── 0000_*.sql           # Initial schema
│   ├── 0001_*.sql           # Stored procedures
│   ├── 0002_*.sql           # Constraints and indexes
│   └── README.md            # Migration documentation
├── scripts/                  # Database utility scripts
│   ├── init-db.ts           # Database initialization
│   ├── seed.ts              # Sample data seeding
│   ├── reset-db.ts          # Database reset
│   └── README.md            # Scripts documentation
├── src/
│   ├── config/              # Configuration and env validation
│   │   ├── env.ts          # Environment variable validation
│   │   └── index.ts        # Config exports
│   ├── db/                  # Database setup
│   │   ├── index.ts        # Database connection
│   │   └── schema.ts       # Drizzle schema definitions
│   ├── errors/              # Custom error classes
│   ├── middleware/          # Express middleware
│   │   └── auth.ts         # Authentication middleware
│   ├── routes/              # API route handlers
│   │   ├── auth.ts         # Authentication routes
│   │   ├── events.ts       # Event routes
│   │   ├── bookings.ts     # Booking routes
│   │   └── websocket.ts    # WebSocket routes
│   ├── schemas/             # Zod validation schemas
│   │   ├── event.ts        # Event schemas
│   │   └── booking.ts      # Booking schemas
│   ├── services/            # Business logic
│   │   ├── auth.ts         # Authentication service
│   │   ├── event.ts        # Event service
│   │   ├── booking.ts      # Booking service
│   │   └── websocket.ts    # WebSocket service
│   ├── validation/          # Additional validation
│   │   └── auth.ts         # Auth validation
│   └── index.ts             # Application entry point
├── .env.example             # Environment template
├── drizzle.config.ts        # Drizzle configuration
├── package.json             # Dependencies and scripts
├── tsconfig.json            # TypeScript configuration
└── README.md                # This file
```

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info

### Events

- `GET /api/events` - List all events
- `GET /api/events/:id` - Get event details
- `POST /api/events` - Create event (admin only)
- `PUT /api/events/:id` - Update event (admin/creator only)
- `DELETE /api/events/:id` - Delete event (admin/creator only)

### Bookings

- `POST /api/bookings` - Create booking
- `GET /api/bookings/:id` - Get booking details
- `DELETE /api/bookings/:id` - Cancel booking
- `GET /api/bookings/user/me` - Get user's bookings
- `GET /api/bookings/admin/events/:id` - Get event bookings (admin)

### WebSocket

- `WS /ws` - WebSocket connection for real-time updates

See [API Documentation](./docs/API.md) for complete details.

## Sample Data

After running `bun run db:seed`, you can login with:

**Admin Account:**
- Email: `admin@example.com`
- Password: `password123`

**User Accounts:**
- Email: `john@example.com` | Password: `password123`
- Email: `jane@example.com` | Password: `password123`
- Email: `bob@example.com` | Password: `password123`

## Configuration

The application uses environment variables for configuration. See [Configuration Guide](./docs/configuration.md) for details.

### Required Environment Variables

```env
DATABASE_URL=postgresql://username:password@localhost:5432/event_booking
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
PORT=3000
```

### Optional Environment Variables

See `.env.example` for all available configuration options.

## Database Schema

The system uses four main tables:

- **users** - User accounts and authentication
- **events** - Event information and capacity
- **bookings** - Booking records
- **booking_logs** - Audit trail

See [Database Schema Documentation](./docs/DATABASE-SCHEMA.md) for complete details.

## Testing

### Manual Testing

```bash
# Health check
curl http://localhost:3000/

# Register user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","name":"Test User","password":"password123"}'

# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

### WebSocket Testing

Open `test-websocket.html` in a browser to test WebSocket connections.

## Deployment

See [Setup and Deployment Guide](./docs/SETUP.md) for detailed deployment instructions.

### Production Checklist

- [ ] Update `JWT_SECRET` with strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` with your domain
- [ ] Set up SSL/HTTPS
- [ ] Configure database connection pooling
- [ ] Set up monitoring and logging
- [ ] Configure backups
- [ ] Review security settings

## Documentation

- [📖 Complete API Documentation](./docs/API.md)
- [🚀 Setup and Deployment Guide](./docs/SETUP.md)
- [⚙️ Configuration Guide](./docs/configuration.md)
- [🗄️ Database Schema](./docs/DATABASE-SCHEMA.md)
- [❌ Error Codes Reference](./docs/ERROR-CODES.md)
- [🔐 Authentication API](./docs/auth-api.md)
- [📅 Events API](./docs/api-events.md)
- [🎫 Bookings API](./docs/api-bookings.md)
- [🔄 WebSocket Guide](./docs/websockets.md)
- [📜 Database Scripts](./scripts/README.md)
- [🔄 Migrations](./drizzle/README.md)

## Architecture Highlights

### Atomic Operations

All booking operations use PostgreSQL stored procedures to ensure atomicity:
- Prevents race conditions
- Ensures data consistency
- Handles concurrent bookings safely

### Real-time Updates

WebSocket integration provides instant updates:
- Seat availability changes
- Booking confirmations
- Event updates

### Security

- JWT-based authentication
- Bcrypt password hashing (12 rounds)
- Role-based access control
- Input validation with Zod
- SQL injection prevention via ORM

### Performance

- Strategic database indexes
- Connection pooling
- Efficient query patterns
- Bun runtime optimization

## Troubleshooting

### Common Issues

**Application won't start:**
- Check environment variables
- Verify database connection
- Ensure port is available

**Database connection errors:**
- Verify PostgreSQL is running
- Check DATABASE_URL format
- Test connection manually

**Authentication issues:**
- Verify JWT_SECRET is set
- Check token expiration
- Ensure proper header format

See [Setup Guide](./docs/SETUP.md) for detailed troubleshooting.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run type checking: `bun run check-types`
5. Test your changes
6. Submit a pull request

## License

[Your License Here]

## Support

- 📧 Email: [your-email]
- 🐛 Issues: [GitHub Issues]
- 📖 Docs: [Documentation]

## Acknowledgments

Built with:
- [Bun](https://bun.sh/)
- [Hono](https://hono.dev/)
- [Drizzle ORM](https://orm.drizzle.team/)
- [PostgreSQL](https://www.postgresql.org/)
- [Zod](https://zod.dev/)
