/**
 * Database Seeding Script
 * 
 * This script populates the database with sample data for development and testing.
 * It creates:
 * - Sample users (admin and regular users)
 * - Sample events (past, current, and future)
 * - Sample bookings
 */

import 'dotenv/config';
import { db } from '../src/db/index';
import { users, events, bookings } from '../src/db/schema';
import bcrypt from 'bcrypt';

async function seed() {
  console.log('🌱 Starting database seeding...\n');

  try {
    // Clear existing data (in reverse order of dependencies)
    console.log('🧹 Clearing existing data...');
    await db.delete(bookings);
    await db.delete(events);
    await db.delete(users);
    console.log('✅ Existing data cleared\n');

    // Create users
    console.log('👥 Creating users...');
    const hashedPassword = await bcrypt.hash('password123', 12);

    const adminUserResult = await db.insert(users).values({
      email: 'admin@example.com',
      name: 'Admin User',
      passwordHash: hashedPassword,
      role: 'admin'
    }).returning();
    const adminUser = adminUserResult[0]!;

    const user1Result = await db.insert(users).values({
      email: 'john@example.com',
      name: 'John Doe',
      passwordHash: hashedPassword,
      role: 'user'
    }).returning();
    const user1 = user1Result[0]!;

    const user2Result = await db.insert(users).values({
      email: 'jane@example.com',
      name: 'Jane Smith',
      passwordHash: hashedPassword,
      role: 'user'
    }).returning();
    const user2 = user2Result[0]!;

    const user3Result = await db.insert(users).values({
      email: 'bob@example.com',
      name: 'Bob Johnson',
      passwordHash: hashedPassword,
      role: 'user'
    }).returning();
    const user3 = user3Result[0]!;

    console.log(`✅ Created ${4} users`);
    console.log(`   - Admin: admin@example.com (password: password123)`);
    console.log(`   - User: john@example.com (password: password123)`);
    console.log(`   - User: jane@example.com (password: password123)`);
    console.log(`   - User: bob@example.com (password: password123)\n`);

    // Create events
    console.log('📅 Creating events...');
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(now);
    nextWeek.setDate(nextWeek.getDate() + 7);
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    const nextYear = new Date(now);
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const event1Result = await db.insert(events).values({
      name: 'Tech Conference 2025',
      description: 'Annual technology conference featuring the latest in software development, AI, and cloud computing.',
      eventDate: nextMonth,
      seatCapacity: 500,
      availableSeats: 500,
      createdBy: adminUser.id
    }).returning();
    const event1 = event1Result[0]!;

    const event2Result = await db.insert(events).values({
      name: 'Web Development Workshop',
      description: 'Hands-on workshop covering modern web development with React, TypeScript, and Node.js.',
      eventDate: nextWeek,
      seatCapacity: 50,
      availableSeats: 50,
      createdBy: adminUser.id
    }).returning();
    const event2 = event2Result[0]!;

    const event3Result = await db.insert(events).values({
      name: 'AI & Machine Learning Seminar',
      description: 'Deep dive into artificial intelligence and machine learning applications in business.',
      eventDate: tomorrow,
      seatCapacity: 100,
      availableSeats: 100,
      createdBy: adminUser.id
    }).returning();
    const event3 = event3Result[0]!;

    const event4Result = await db.insert(events).values({
      name: 'Cloud Architecture Masterclass',
      description: 'Advanced cloud architecture patterns and best practices for scalable applications.',
      eventDate: nextYear,
      seatCapacity: 200,
      availableSeats: 200,
      createdBy: adminUser.id
    }).returning();
    const event4 = event4Result[0]!;

    const event5Result = await db.insert(events).values({
      name: 'DevOps Best Practices',
      description: 'Learn modern DevOps practices including CI/CD, containerization, and infrastructure as code.',
      eventDate: new Date(nextMonth.getTime() + 7 * 24 * 60 * 60 * 1000), // Next month + 1 week
      seatCapacity: 75,
      availableSeats: 75,
      createdBy: adminUser.id
    }).returning();
    const event5 = event5Result[0]!;

    // Create a past event (for testing)
    const pastEventResult = await db.insert(events).values({
      name: 'Past Event - JavaScript Fundamentals',
      description: 'This event has already occurred.',
      eventDate: yesterday,
      seatCapacity: 30,
      availableSeats: 30,
      createdBy: adminUser.id
    }).returning();
    const pastEvent = pastEventResult[0]!;

    console.log(`✅ Created ${6} events`);
    console.log(`   - ${event1.name} (${event1.seatCapacity} seats)`);
    console.log(`   - ${event2.name} (${event2.seatCapacity} seats)`);
    console.log(`   - ${event3.name} (${event3.seatCapacity} seats)`);
    console.log(`   - ${event4.name} (${event4.seatCapacity} seats)`);
    console.log(`   - ${event5.name} (${event5.seatCapacity} seats)`);
    console.log(`   - ${pastEvent.name} (${pastEvent.seatCapacity} seats) [PAST]\n`);

    // Create sample bookings
    console.log('🎫 Creating sample bookings...');
    
    // Use the stored procedure for atomic booking creation
    await db.execute(`SELECT create_booking(${user1.id}, ${event1.id}, 'BK-SEED-001')`);
    await db.execute(`SELECT create_booking(${user2.id}, ${event1.id}, 'BK-SEED-002')`);
    await db.execute(`SELECT create_booking(${user3.id}, ${event2.id}, 'BK-SEED-003')`);
    await db.execute(`SELECT create_booking(${user1.id}, ${event3.id}, 'BK-SEED-004')`);
    await db.execute(`SELECT create_booking(${user2.id}, ${event4.id}, 'BK-SEED-005')`);

    console.log(`✅ Created ${5} sample bookings\n`);

    // Display summary
    console.log('📊 Database Seeding Summary:');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`Users:    ${4} (1 admin, 3 regular users)`);
    console.log(`Events:   ${6} (5 upcoming, 1 past)`);
    console.log(`Bookings: ${5}`);
    console.log('═══════════════════════════════════════════════════════════\n');

    console.log('🎉 Database seeding completed successfully!\n');
    console.log('📝 Login Credentials:');
    console.log('   Email: admin@example.com | Password: password123 (Admin)');
    console.log('   Email: john@example.com  | Password: password123 (User)');
    console.log('   Email: jane@example.com  | Password: password123 (User)');
    console.log('   Email: bob@example.com   | Password: password123 (User)\n');

    console.log('🚀 Next Steps:');
    console.log('   1. Start the server: bun run dev');
    console.log('   2. Login with any of the above credentials');
    console.log('   3. Test the API endpoints');
    console.log('   4. View database: bun run db:studio\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database seeding failed:', error);
    process.exit(1);
  }
}

seed();
