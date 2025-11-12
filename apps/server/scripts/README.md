# Database Scripts

This directory contains utility scripts for database management, initialization, and seeding.

## Available Scripts

### 1. Initialize Database

**Command:** `bun run db:init`

**File:** `init-db.ts`

**Purpose:** Initialize a fresh database by running all migrations.

**What it does:**
- Runs all pending database migrations
- Verifies database connection
- Sets up all tables, constraints, and stored procedures

**When to use:**
- First-time setup of the database
- After cloning the repository
- When setting up a new environment

**Example:**
```bash
bun run db:init
```

**Output:**
```
🚀 Starting database initialization...

📦 Running database migrations...
✅ Migrations completed successfully

🔍 Verifying database connection...
✅ Database connection verified

🎉 Database initialization completed successfully!

Next steps:
  1. Run seed script: bun run db:seed
  2. Start the server: bun run dev
  3. Open Drizzle Studio: bun run db:studio
```

---

### 2. Seed Database

**Command:** `bun run db:seed`

**File:** `seed.ts`

**Purpose:** Populate the database with sample data for development and testing.

**What it creates:**
- **4 Users:**
  - 1 Admin user (admin@example.com)
  - 3 Regular users (john@example.com, jane@example.com, bob@example.com)
  - All passwords: `password123`

- **6 Events:**
  - Tech Conference 2025 (500 seats)
  - Web Development Workshop (50 seats)
  - AI & Machine Learning Seminar (100 seats)
  - Cloud Architecture Masterclass (200 seats)
  - DevOps Best Practices (75 seats)
  - Past Event - JavaScript Fundamentals (30 seats) [for testing]

- **5 Sample Bookings:**
  - Various bookings across different events and users

**When to use:**
- Development environment setup
- Testing the application
- Demonstrating features
- After resetting the database

**Example:**
```bash
bun run db:seed
```

**Output:**
```
🌱 Starting database seeding...

🧹 Clearing existing data...
✅ Existing data cleared

👥 Creating users...
✅ Created 4 users
   - Admin: admin@example.com (password: password123)
   - User: john@example.com (password: password123)
   - User: jane@example.com (password: password123)
   - User: bob@example.com (password: password123)

📅 Creating events...
✅ Created 6 events
   - Tech Conference 2025 (500 seats)
   - Web Development Workshop (50 seats)
   - AI & Machine Learning Seminar (100 seats)
   - Cloud Architecture Masterclass (200 seats)
   - DevOps Best Practices (75 seats)
   - Past Event - JavaScript Fundamentals (30 seats) [PAST]

🎫 Creating sample bookings...
✅ Created 5 sample bookings

📊 Database Seeding Summary:
═══════════════════════════════════════════════════════════
Users:    4 (1 admin, 3 regular users)
Events:   6 (5 upcoming, 1 past)
Bookings: 5
═══════════════════════════════════════════════════════════

🎉 Database seeding completed successfully!

📝 Login Credentials:
   Email: admin@example.com | Password: password123 (Admin)
   Email: john@example.com  | Password: password123 (User)
   Email: jane@example.com  | Password: password123 (User)
   Email: bob@example.com   | Password: password123 (User)

🚀 Next Steps:
   1. Start the server: bun run dev
   2. Login with any of the above credentials
   3. Test the API endpoints
   4. View database: bun run db:studio
```

---

### 3. Reset Database

**Command:** `bun run db:reset`

**File:** `reset-db.ts`

**Purpose:** Completely reset the database by dropping all tables and re-running migrations.

**⚠️ WARNING:** This will delete ALL data in the database!

**What it does:**
- Drops all tables (users, events, bookings, booking_logs)
- Drops all stored procedures
- Runs all migrations to recreate schema
- Does NOT seed data (run `db:seed` separately)

**When to use:**
- Starting fresh with a clean database
- After major schema changes
- Fixing database corruption issues
- Development environment cleanup

**Example:**
```bash
bun run db:reset
```

**Output:**
```
⚠️  WARNING: This will delete ALL data in the database!

🗑️  Dropping all tables...
✅ All tables dropped

📦 Running migrations...
✅ Migrations completed

🎉 Database reset completed successfully!

Next steps:
  1. Seed with sample data: bun run db:seed
  2. Start the server: bun run dev
```

---

## Typical Workflows

### First-Time Setup

```bash
# 1. Initialize database
bun run db:init

# 2. Seed with sample data
bun run db:seed

# 3. Start the server
bun run dev
```

### Development Reset

```bash
# 1. Reset database (clears all data)
bun run db:reset

# 2. Seed with fresh sample data
bun run db:seed

# 3. Continue development
bun run dev
```

### Production Setup

```bash
# 1. Initialize database only (no seeding)
bun run db:init

# 2. Create admin user manually or via API
# 3. Start the server
bun run start
```

### After Schema Changes

```bash
# 1. Generate new migration
bun run db:generate

# 2. Apply migration
bun run db:migrate

# 3. Optionally reset and reseed for development
bun run db:reset
bun run db:seed
```

## Script Details

### init-db.ts

**Dependencies:**
- `child_process` - For running migration commands
- `../src/db/index` - Database connection

**Process:**
1. Executes `bun run db:migrate` command
2. Verifies database connection with test query
3. Provides next steps guidance

**Error Handling:**
- Exits with code 1 on failure
- Displays detailed error messages
- Suggests troubleshooting steps

---

### seed.ts

**Dependencies:**
- `dotenv/config` - Environment variables
- `../src/db/index` - Database connection
- `../src/db/schema` - Table definitions
- `bcrypt` - Password hashing
- `drizzle-orm` - ORM operations

**Process:**
1. Clears existing data (in dependency order)
2. Creates users with hashed passwords
3. Creates events with various dates
4. Creates sample bookings using stored procedures
5. Displays comprehensive summary

**Data Characteristics:**
- All passwords are `password123` (hashed with bcrypt)
- Events span from past to future dates
- Bookings use atomic stored procedures
- Realistic event names and descriptions

**Error Handling:**
- Exits with code 1 on failure
- Rolls back on errors (transaction-based)
- Displays detailed error information

---

### reset-db.ts

**Dependencies:**
- `dotenv/config` - Environment variables
- `child_process` - For running migration commands
- `../src/db/index` - Database connection

**Process:**
1. Drops all tables in reverse dependency order
2. Drops all stored procedures
3. Runs migrations to recreate schema
4. Provides next steps guidance

**Safety:**
- Displays warning before execution
- Drops CASCADE to handle dependencies
- Verifies completion before exit

**Error Handling:**
- Exits with code 1 on failure
- Displays detailed error messages
- Suggests recovery steps

## Environment Requirements

All scripts require the following environment variables:

```env
DATABASE_URL=postgresql://username:password@host:port/database
```

Ensure your `.env` file is properly configured before running any scripts.

## Troubleshooting

### Script Fails to Run

**Problem:** Script exits with error

**Solutions:**
1. Verify database is running:
   ```bash
   psql $DATABASE_URL
   ```

2. Check environment variables:
   ```bash
   echo $DATABASE_URL
   ```

3. Verify database permissions:
   ```sql
   GRANT ALL PRIVILEGES ON DATABASE event_booking TO your_user;
   ```

### Migration Errors

**Problem:** Migrations fail to apply

**Solutions:**
1. Check migration files exist in `drizzle/` directory
2. Verify database connection
3. Try manual migration:
   ```bash
   psql $DATABASE_URL < drizzle/0000_initial.sql
   ```

### Seeding Errors

**Problem:** Seed script fails

**Solutions:**
1. Ensure migrations have been run first
2. Check for existing data conflicts
3. Try resetting first:
   ```bash
   bun run db:reset
   bun run db:seed
   ```

### Connection Errors

**Problem:** Cannot connect to database

**Solutions:**
1. Verify PostgreSQL is running
2. Check DATABASE_URL format
3. Test connection manually:
   ```bash
   psql "postgresql://user:pass@host:port/db"
   ```

## Best Practices

### Development

- Run `db:seed` after `db:reset` for consistent test data
- Use `db:studio` to inspect database state
- Keep sample data realistic and representative

### Production

- Never run `db:reset` in production
- Never run `db:seed` in production
- Only run `db:init` or `db:migrate` in production
- Always backup before running migrations

### Testing

- Use separate test database
- Reset database between test runs
- Seed with minimal required data
- Clean up after tests

## Related Documentation

- [Database Schema](../docs/DATABASE-SCHEMA.md) - Complete schema documentation
- [Setup Guide](../docs/SETUP.md) - Full setup instructions
- [Configuration Guide](../docs/configuration.md) - Environment configuration
- [Migration README](../drizzle/README.md) - Migration details

## Support

If you encounter issues with these scripts:

1. Check the error message carefully
2. Verify environment configuration
3. Review database logs
4. Check the troubleshooting section above
5. Create an issue with detailed error information
