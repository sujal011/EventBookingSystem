# Event Booking System - Setup and Deployment Guide

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Database Setup](#database-setup)
4. [Configuration](#configuration)
5. [Running the Application](#running-the-application)
6. [Testing](#testing)
7. [Production Deployment](#production-deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before setting up the Event Booking System, ensure you have the following installed:

### Required Software

- **Bun** (v1.0.0 or higher)
  ```bash
  # Install Bun
  curl -fsSL https://bun.sh/install | bash
  
  # Verify installation
  bun --version
  ```

- **PostgreSQL** (v14 or higher)
  ```bash
  # macOS (using Homebrew)
  brew install postgresql@14
  brew services start postgresql@14
  
  # Ubuntu/Debian
  sudo apt-get install postgresql-14
  sudo systemctl start postgresql
  
  # Windows
  # Download from https://www.postgresql.org/download/windows/
  ```

- **Git**
  ```bash
  git --version
  ```

### Optional Tools

- **Drizzle Studio** - Database GUI (included in dev dependencies)
- **Postman** or **cURL** - API testing
- **VS Code** - Recommended IDE

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd EventBookingSystem
```

### 2. Navigate to Server Directory

```bash
cd apps/server
```

### 3. Install Dependencies

```bash
bun install
```

This will install all required dependencies including:
- Hono (web framework)
- Drizzle ORM (database)
- Zod (validation)
- bcrypt (password hashing)
- And more...

### 4. Verify Installation

```bash
# Check if all dependencies are installed
bun run --version

# List available scripts
bun run
```

## Database Setup

### 1. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE event_booking;

# Create user (optional)
CREATE USER event_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE event_booking TO event_user;

# Exit psql
\q
```

### 2. Configure Database Connection

Create a `.env` file in `apps/server/`:

```bash
cp .env.example .env
```

Edit `.env` and update the database URL:

```env
DATABASE_URL=postgresql://event_user:your_password@localhost:5432/event_booking
```

### 3. Run Migrations

```bash
# Generate migration files (if schema changed)
bun run db:generate

# Apply migrations to database
bun run db:migrate
```

This will:
- Create all required tables (users, events, bookings, booking_logs)
- Set up foreign key relationships
- Create stored procedures for atomic operations
- Add performance indexes

### 4. Verify Database Setup

```bash
# Open Drizzle Studio to inspect database
bun run db:studio
```

Navigate to `https://local.drizzle.studio` to view your database schema.

## Configuration

### Environment Variables

The application requires several environment variables. Copy the example file and customize:

```bash
cp .env.example .env
```

### Required Configuration

Edit `.env` with your settings:

```env
# Database Configuration
DATABASE_URL=postgresql://username:password@localhost:5432/event_booking
DB_POOL_MIN=2
DB_POOL_MAX=10

# JWT Configuration (IMPORTANT: Change in production!)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# Server Configuration
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Logging Configuration
LOG_LEVEL=info
LOG_FORMAT=pretty
ENABLE_REQUEST_LOGGING=true

# WebSocket Configuration
WS_TIMEOUT=30000
WS_MAX_CONNECTIONS=5

# Security Configuration
BCRYPT_SALT_ROUNDS=12
RATE_LIMIT_MAX=100

# Application Configuration
MAX_BOOKING_ID_ATTEMPTS=5
BOOKING_ID_PREFIX=BK
DEFAULT_PAGE_LIMIT=20
MAX_PAGE_LIMIT=100
```

### Generate Secure JWT Secret

```bash
# Generate a secure random secret
openssl rand -base64 32
```

Copy the output and use it as your `JWT_SECRET`.

### Configuration Validation

The application validates all environment variables at startup. If any required variables are missing or invalid, you'll see detailed error messages.

See [Configuration Guide](./configuration.md) for detailed information about each variable.

## Running the Application

### Development Mode

Start the development server with hot reload:

```bash
bun run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

You should see:
```
✓ Environment configuration validated successfully
Server running on port 3000
```

### Production Mode

Build and run in production:

```bash
# Build the application
bun run build

# Start production server
bun run start
```

### Compile to Binary (Optional)

Create a standalone executable:

```bash
bun run compile
```

This creates a `server` binary that can run without Bun installed.

## Testing

### Manual API Testing

#### 1. Health Check

```bash
curl http://localhost:3000/
```

Expected response: `OK`

#### 2. Register a User

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "name": "Test User",
    "password": "password123"
  }'
```

#### 3. Login

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

Save the returned JWT token for subsequent requests.

#### 4. Create an Event (Admin)

First, register an admin user or update your user's role in the database:

```sql
UPDATE users SET role = 'admin' WHERE email = 'test@example.com';
```

Then create an event:

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "name": "Test Event",
    "description": "A test event",
    "eventDate": "2025-12-31T10:00:00.000Z",
    "seatCapacity": 100
  }'
```

#### 5. Create a Booking

```bash
curl -X POST http://localhost:3000/api/bookings \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-jwt-token>" \
  -d '{
    "eventId": 1
  }'
```

### WebSocket Testing

Open `apps/server/test-websocket.html` in a browser to test WebSocket connections and real-time updates.

### Using Postman

1. Import the API endpoints into Postman
2. Create an environment with:
   - `base_url`: `http://localhost:3000`
   - `token`: (set after login)
3. Test each endpoint following the [API Documentation](./API.md)

## Production Deployment

### Pre-Deployment Checklist

- [ ] Update `JWT_SECRET` with a strong random value
- [ ] Set `NODE_ENV=production`
- [ ] Configure `CORS_ORIGIN` with your frontend domain
- [ ] Set up production database with SSL
- [ ] Configure `LOG_FORMAT=json` for log aggregation
- [ ] Set appropriate `DB_POOL_MAX` for your server
- [ ] Enable HTTPS/SSL
- [ ] Set up database backups
- [ ] Configure monitoring and alerting
- [ ] Review and adjust rate limiting

### Deployment Options

#### Option 1: Traditional Server (VPS/Dedicated)

1. **Prepare the server:**
   ```bash
   # Install Bun
   curl -fsSL https://bun.sh/install | bash
   
   # Install PostgreSQL
   sudo apt-get install postgresql
   ```

2. **Clone and setup:**
   ```bash
   git clone <repository-url>
   cd EventBookingSystem/apps/server
   bun install --production
   ```

3. **Configure environment:**
   ```bash
   cp .env.example .env
   nano .env  # Edit with production values
   ```

4. **Run migrations:**
   ```bash
   bun run db:migrate
   ```

5. **Start with process manager:**
   ```bash
   # Using PM2
   npm install -g pm2
   pm2 start "bun run start" --name event-booking-api
   pm2 save
   pm2 startup
   ```

#### Option 2: Docker Deployment

Create `Dockerfile`:

```dockerfile
FROM oven/bun:1 as base
WORKDIR /app

# Install dependencies
COPY package.json bun.lock ./
RUN bun install --production

# Copy source
COPY . .

# Build
RUN bun run build

# Expose port
EXPOSE 3000

# Start
CMD ["bun", "run", "start"]
```

Create `docker-compose.yml`:

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:14
    environment:
      POSTGRES_DB: event_booking
      POSTGRES_USER: event_user
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  api:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://event_user:${DB_PASSWORD}@postgres:5432/event_booking
      JWT_SECRET: ${JWT_SECRET}
      NODE_ENV: production
    depends_on:
      - postgres

volumes:
  postgres_data:
```

Deploy:

```bash
docker-compose up -d
```

#### Option 3: Cloud Platforms

**Heroku:**
```bash
heroku create event-booking-api
heroku addons:create heroku-postgresql:hobby-dev
heroku config:set JWT_SECRET=$(openssl rand -base64 32)
git push heroku main
```

**Railway/Render:**
- Connect your GitHub repository
- Set environment variables in dashboard
- Deploy automatically on push

**AWS/GCP/Azure:**
- Use container services (ECS, Cloud Run, Container Apps)
- Set up managed PostgreSQL (RDS, Cloud SQL, Azure Database)
- Configure load balancer and auto-scaling

### Database Migration in Production

```bash
# Backup database first
pg_dump -U event_user event_booking > backup.sql

# Run migrations
bun run db:migrate

# Verify
bun run db:studio
```

### SSL/HTTPS Setup

Use a reverse proxy like Nginx:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name api.yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /ws {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
    }
}
```

### Monitoring

Set up monitoring for:
- Application logs
- Database performance
- API response times
- Error rates
- WebSocket connections
- Resource usage (CPU, memory, disk)

Recommended tools:
- **Logging**: Winston, Pino, or cloud provider logs
- **Monitoring**: Prometheus + Grafana, Datadog, New Relic
- **Error Tracking**: Sentry, Rollbar
- **Uptime**: UptimeRobot, Pingdom

## Troubleshooting

### Application Won't Start

**Problem:** Application exits immediately

**Solutions:**
1. Check environment variables:
   ```bash
   bun run dev
   # Look for validation errors
   ```

2. Verify database connection:
   ```bash
   psql $DATABASE_URL
   ```

3. Check port availability:
   ```bash
   lsof -i :3000
   ```

### Database Connection Errors

**Problem:** Cannot connect to database

**Solutions:**
1. Verify PostgreSQL is running:
   ```bash
   # macOS
   brew services list
   
   # Linux
   sudo systemctl status postgresql
   ```

2. Check connection string format:
   ```
   postgresql://username:password@host:port/database
   ```

3. Test connection:
   ```bash
   psql "postgresql://username:password@host:port/database"
   ```

### Migration Failures

**Problem:** Migrations fail to apply

**Solutions:**
1. Check database permissions
2. Verify migration files exist in `drizzle/` directory
3. Try manual migration:
   ```bash
   psql $DATABASE_URL < drizzle/0000_initial.sql
   ```

### JWT Token Issues

**Problem:** Authentication fails

**Solutions:**
1. Verify JWT_SECRET is set and at least 32 characters
2. Check token expiration (default 24h)
3. Ensure Authorization header format: `Bearer <token>`

### WebSocket Connection Issues

**Problem:** WebSocket connections fail

**Solutions:**
1. Check if reverse proxy supports WebSocket upgrade
2. Verify WS_TIMEOUT setting
3. Test direct connection without proxy
4. Check browser console for errors

### Performance Issues

**Problem:** Slow API responses

**Solutions:**
1. Check database indexes:
   ```bash
   bun run db:studio
   # Verify indexes exist
   ```

2. Increase connection pool:
   ```env
   DB_POOL_MAX=20
   ```

3. Enable query logging:
   ```env
   LOG_LEVEL=debug
   ```

4. Monitor database performance:
   ```sql
   SELECT * FROM pg_stat_activity;
   ```

### CORS Errors

**Problem:** Browser blocks requests

**Solutions:**
1. Add frontend URL to CORS_ORIGIN:
   ```env
   CORS_ORIGIN=https://yourdomain.com
   ```

2. Verify no trailing slashes in URLs
3. Check browser console for specific CORS error

## Additional Resources

- [API Documentation](./API.md)
- [Configuration Guide](./configuration.md)
- [Database Schema](../drizzle/README.md)
- [WebSocket Guide](./websockets.md)

## Getting Help

If you encounter issues not covered in this guide:

1. Check the [API Documentation](./API.md)
2. Review application logs
3. Search existing issues on GitHub
4. Create a new issue with:
   - Environment details (OS, Bun version, PostgreSQL version)
   - Error messages and logs
   - Steps to reproduce
   - Expected vs actual behavior

## Next Steps

After successful setup:

1. Review the [API Documentation](./API.md)
2. Test all endpoints using Postman or cURL
3. Set up your frontend application
4. Configure monitoring and logging
5. Plan your deployment strategy
6. Set up CI/CD pipeline
7. Configure backups and disaster recovery

## Security Reminders

- ✅ Change default JWT_SECRET
- ✅ Use HTTPS in production
- ✅ Enable database SSL
- ✅ Set up firewall rules
- ✅ Regular security updates
- ✅ Monitor for suspicious activity
- ✅ Implement rate limiting
- ✅ Regular database backups
