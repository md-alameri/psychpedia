#!/usr/bin/env tsx
/**
 * Recreate Development Database
 * 
 * Safely drops and recreates the development database to resolve schema ambiguity.
 * 
 * WARNING: This will delete all data in the database!
 * 
 * Usage:
 *   npm run recreate:dev-db
 */

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Pool } from 'pg';

async function recreateDatabase() {
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
  
  console.log('🔄 Recreating development database...\n');
  console.log(`Database: ${dbName}`);
  console.log(`Host: ${host}:${port}\n`);
  
  const pool = new Pool({
    connectionString: adminUrl,
    max: 1,
    connectionTimeoutMillis: 5000,
  });
  
  try {
    const client = await pool.connect();
    
    // Terminate existing connections
    console.log('1. Terminating existing connections...');
    await client.query(`
      SELECT pg_terminate_backend(pg_stat_activity.pid)
      FROM pg_stat_activity
      WHERE pg_stat_activity.datname = $1
      AND pid <> pg_backend_pid();
    `, [dbName]);
    console.log('   ✅ Connections terminated\n');
    
    // Drop database
    console.log('2. Dropping database...');
    await client.query(`DROP DATABASE IF EXISTS ${dbName};`);
    console.log(`   ✅ Database ${dbName} dropped\n`);
    
    // Create database
    console.log('3. Creating fresh database...');
    await client.query(`CREATE DATABASE ${dbName};`);
    console.log(`   ✅ Database ${dbName} created\n`);
    
    client.release();
    await pool.end();
    
    console.log('✅ Database recreated successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Run migrations: npm run payload:migrate');
    console.log('   2. Start dev server: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error recreating database:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

recreateDatabase();

