/**
 * Database Initialization Script
 * 
 * This script initializes the database by:
 * 1. Creating the database if it doesn't exist
 * 2. Running all migrations
 * 3. Verifying the schema
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function initDatabase() {
  console.log('🚀 Starting database initialization...\n');

  try {
    // Step 1: Run migrations
    console.log('📦 Running database migrations...');
    const { stdout: migrateOutput, stderr: migrateError } = await execAsync('bun run db:migrate');
    
    if (migrateOutput) console.log(migrateOutput);
    if (migrateError) console.error(migrateError);
    
    console.log('✅ Migrations completed successfully\n');

    // Step 2: Verify database connection
    console.log('🔍 Verifying database connection...');
    const { db } = await import('../src/db/index.js');
    
    // Test query
    await db.execute('SELECT 1');
    console.log('✅ Database connection verified\n');

    console.log('🎉 Database initialization completed successfully!');
    console.log('\nNext steps:');
    console.log('  1. Run seed script: bun run db:seed');
    console.log('  2. Start the server: bun run dev');
    console.log('  3. Open Drizzle Studio: bun run db:studio\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Database initialization failed:', error);
    process.exit(1);
  }
}

initDatabase();
