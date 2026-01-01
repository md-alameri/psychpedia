#!/usr/bin/env tsx
/**
 * Create Development Database
 * 
 * Creates the development database if it doesn't exist.
 * 
 * Usage:
 *   npm run create:dev-db
 */

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Pool } from 'pg';

async function createDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }
  
  // Parse connection string
  const url = new URL(databaseUrl);
  const dbName = url.pathname.slice(1); // Remove leading /
  const username = url.username;
  const password = url.password;
  const host = url.hostname;
  const port = url.port || '5432';
  
  if (!dbName) {
    console.error('❌ Could not parse database name from DATABASE_URL');
    process.exit(1);
  }
  
  // Connect to postgres database (not the target database)
  const adminUrl = `postgresql://${username}${password ? ':' + password : ''}@${host}:${port}/postgres`;
  
  console.log('📦 Creating development database...\n');
  console.log(`Database: ${dbName}`);
  console.log(`Host: ${host}:${port}\n`);
  
  const pool = new Pool({
    connectionString: adminUrl,
    max: 1,
    connectionTimeoutMillis: 5000,
  });
  
  try {
    const client = await pool.connect();
    
    // Check if database exists
    const existsResult = await client.query(`
      SELECT EXISTS (
        SELECT FROM pg_database WHERE datname = $1
      );
    `, [dbName]);
    
    if (existsResult.rows[0].exists) {
      console.log(`✅ Database ${dbName} already exists\n`);
      client.release();
      await pool.end();
      process.exit(0);
    }
    
    // Create database
    console.log(`Creating database ${dbName}...`);
    await client.query(`CREATE DATABASE ${dbName};`);
    console.log(`✅ Database ${dbName} created successfully!\n`);
    
    client.release();
    await pool.end();
    
    console.log('📝 Next steps:');
    console.log('   1. Run migrations: npm run payload:migrate');
    console.log('   2. Start dev server: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating database:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    console.error('\n💡 If you get "permission denied", you may need to:');
    console.error('   - Run as a user with CREATEDB privilege');
    console.error('   - Or create the database manually: createdb payload');
    process.exit(1);
  }
}

createDatabase();

