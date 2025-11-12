/**
 * Database Reset Script
 * 
 * This script completely resets the database by:
 * 1. Dropping all tables
 * 2. Running migrations
 * 3. Optionally seeding with sample data
 * 
 * WARNING: This will delete ALL data in the database!
 */

import 'dotenv/config';
import { exec } from 'child_process';
import { promisify } from 'util';
import { db } from '../src/db/index';

const execAsync = promisify(exec);

async function resetDatabase() {
  console.log('⚠️  WARNING: This will delete ALL data in the database!\n');

  try {
    // Step 1: Drop all tables
    console.log('🗑️  Dropping all tables...');
    
    await db.execute('DROP TABLE IF EXISTS booking_logs CASCADE');
    await db.execute('DROP TABLE IF EXISTS bookings CASCADE');
    await db.execute('DROP TABLE IF EXISTS events CASCADE');
    await db.execute('DROP TABLE IF EXISTS users CASCADE');
    await db.execute('DROP FUNCTION IF EXISTS create_booking CASCADE');
    await db.execute('DROP FUNCTION IF EXISTS cancel_booking CASCADE');
    
    console.log('✅ All tables dropped\n');

    // Step 2: Run migrations
    console.log('📦 Running migrations...');
    const { stdout: migrateOutput } = await execAsync('bun run db:migrate');
    console.log(migrateOutput);
    console.log('✅ Migrations completed\n');

    // Step 3: Ask about seeding
    console.log('🎉 Database reset completed successfully!\n');
    console.log('Next steps:');
    console.log('  1. Seed with sample data: bun run db:seed');
    console.log('  2. Start the server: bun run dev\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database reset failed:', error);
    process.exit(1);
  }
}

resetDatabase();
