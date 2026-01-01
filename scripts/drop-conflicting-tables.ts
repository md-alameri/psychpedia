#!/usr/bin/env tsx
/**
 * Drop Conflicting Tables
 * 
 * Drops tables that cause schema ambiguity (medications_rels, _medications_v_rels)
 * so that payload_kv can be created cleanly via migrations.
 * 
 * WARNING: This will delete these tables and their data!
 * 
 * Usage:
 *   npm run drop:conflicting-tables
 */

// Load environment variables
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });

import { Pool } from 'pg';

async function dropConflictingTables() {
  const databaseUrl = process.env.DATABASE_URL;
  
  if (!databaseUrl) {
    console.error('❌ DATABASE_URL is not set');
    process.exit(1);
  }
  
  console.log('🗑️  Dropping conflicting tables...\n');
  
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 1,
    connectionTimeoutMillis: 5000,
  });
  
  const tablesToDrop = ['medications_rels', '_medications_v_rels'];
  
  try {
    const client = await pool.connect();
    
    for (const tableName of tablesToDrop) {
      // Check if table exists
      const existsResult = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = $1
        );
      `, [tableName]);
      
      if (existsResult.rows[0].exists) {
        console.log(`Dropping table: ${tableName}...`);
        await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE;`);
        console.log(`  ✅ ${tableName} dropped\n`);
      } else {
        console.log(`  ⏭️  ${tableName} does not exist, skipping\n`);
      }
    }
    
    client.release();
    await pool.end();
    
    console.log('✅ Conflicting tables dropped successfully!\n');
    console.log('📝 Next steps:');
    console.log('   1. Run migrations: npm run payload:migrate');
    console.log('   2. Start dev server: npm run dev');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error dropping tables:', error instanceof Error ? error.message : error);
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
    process.exit(1);
  }
}

dropConflictingTables();

